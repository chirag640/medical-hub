/**
 * Migration Guide - Authentication System Updates
 *
 * This guide explains the changes made to the authentication system
 * and provides steps to migrate existing data.
 */

// ============================================================================
// CHANGES SUMMARY
// ============================================================================

/**
 * PHASE 1: CRITICAL SECURITY FIXES
 *
 * 1.1 Added Authentication Guards to All Controllers
 *     - PatientController: Requires JWT + Roles (Admin, Receptionist, Doctor, Nurse)
 *     - DoctorController: Requires JWT + Roles (Admin for create/delete, Doctor for update)
 *     - AppointmentController: Requires JWT + Role-based access
 *
 * 1.2 Restricted Role Assignment
 *     - Self-registration now ONLY creates 'Patient' role
 *     - Removed 'roles' field from RegisterDto
 *     - Added admin endpoint: POST /auth/admin/create-user (Admin only)
 *     - Admins can create users with roles: Doctor, Nurse, Admin, Receptionist
 *
 * PHASE 2: STRUCTURAL FIXES
 *
 * 2.1 Added userId References
 *     - Patient schema: Added optional userId field (ObjectId ref to User)
 *     - Doctor schema: Added required userId field (ObjectId ref to User)
 *     - Creates proper relationship between User and Patient/Doctor
 *
 * 2.2 Auto-create Profiles
 *     - Patient profile automatically created on user registration
 *     - Minimal profile with placeholder data (user should complete)
 *     - QR code generated automatically
 *
 * 2.3 Audit Trail
 *     - Added createdBy, lastModifiedBy, deletedBy fields
 *     - All create/update/delete operations track the user
 *
 * PHASE 3: ENHANCEMENTS
 *
 * 3.1 Patient/Doctor Self-Service
 *     - GET /patients/me/profile - Patients can view their own profile
 *     - PATCH /patients/me/profile - Patients can update their own profile
 *     - GET /doctors/me/profile - Doctors can view their own profile
 *     - PATCH /doctors/me/profile - Doctors can update their own profile
 */

// ============================================================================
// BREAKING CHANGES
// ============================================================================

/**
 * 1. All patient/doctor/appointment endpoints now require authentication
 *    - Must include: Authorization: Bearer <jwt_token>
 *
 * 2. Self-registration always creates Patient role
 *    - Cannot create Admin/Doctor/Nurse via /auth/register
 *    - Use /auth/admin/create-user instead (requires Admin token)
 *
 * 3. Service method signatures changed
 *    - create(dto, createdBy)
 *    - update(id, dto, lastModifiedBy)
 *    - remove(id, deletedBy)
 */

// ============================================================================
// MIGRATION STEPS
// ============================================================================

/**
 * STEP 1: Create First Admin User (Run Once)
 *
 * Since self-registration only creates Patients, you need to manually
 * create the first admin user in the database.
 */

import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcryptjs';

async function createFirstAdmin() {
  const client = await MongoClient.connect(process.env.DATABASE_URL!);
  const db = client.db();

  // Check if admin exists
  const existingAdmin = await db.collection('users').findOne({
    roles: { $in: ['Admin'] },
  });

  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email);
    await client.close();
    return;
  }

  // Create first admin
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);

  const admin = {
    email: 'admin@medical-hub.com',
    password: hashedPassword,
    firstName: 'System',
    lastName: 'Administrator',
    roles: ['Admin'],
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection('users').insertOne(admin);
  console.log('✅ First admin user created:');
  console.log('   Email: admin@medical-hub.com');
  console.log('   Password: Admin@123456');
  console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');

  await client.close();
}

/**
 * STEP 2: Update Existing Patient Records
 *
 * Add userId field to existing patients who have user accounts
 */

async function linkExistingPatients() {
  const client = await MongoClient.connect(process.env.DATABASE_URL!);
  const db = client.db();

  const patients = await db
    .collection('patients')
    .find({ userId: { $exists: false } })
    .toArray();

  for (const patient of patients) {
    if (patient.email) {
      // Find matching user by email
      const user = await db.collection('users').findOne({
        email: patient.email,
        roles: { $in: ['Patient'] },
      });

      if (user) {
        await db
          .collection('patients')
          .updateOne({ _id: patient._id }, { $set: { userId: user._id } });
        console.log(`✅ Linked patient ${patient.patientId} to user ${user.email}`);
      }
    }
  }

  await client.close();
}

/**
 * STEP 3: Update Existing Doctor Records
 *
 * Add userId field to existing doctors who have user accounts
 */

async function linkExistingDoctors() {
  const client = await MongoClient.connect(process.env.DATABASE_URL!);
  const db = client.db();

  const doctors = await db
    .collection('doctors')
    .find({ userId: { $exists: false } })
    .toArray();

  for (const doctor of doctors) {
    if (doctor.email) {
      // Find matching user by email
      const user = await db.collection('users').findOne({
        email: doctor.email,
        roles: { $in: ['Doctor'] },
      });

      if (user) {
        await db
          .collection('doctors')
          .updateOne({ _id: doctor._id }, { $set: { userId: user._id } });
        console.log(`✅ Linked doctor ${doctor.email} to user account`);
      } else {
        console.log(`⚠️  No user account found for doctor ${doctor.email}`);
        console.log(`   Create one using: POST /auth/admin/create-user`);
      }
    }
  }

  await client.close();
}

/**
 * STEP 4: Run Migration
 */

async function runMigration() {
  console.log('🚀 Starting migration...\n');

  console.log('Step 1: Creating first admin user...');
  await createFirstAdmin();
  console.log('');

  console.log('Step 2: Linking existing patients...');
  await linkExistingPatients();
  console.log('');

  console.log('Step 3: Linking existing doctors...');
  await linkExistingDoctors();
  console.log('');

  console.log('✅ Migration completed!\n');
  console.log('Next steps:');
  console.log('1. Login as admin: POST /auth/login');
  console.log('   { "email": "admin@medical-hub.com", "password": "Admin@123456" }');
  console.log('');
  console.log('2. Change admin password immediately');
  console.log('');
  console.log('3. Create staff users: POST /auth/admin/create-user');
  console.log('   (Requires Admin JWT token)');
  console.log('');
  console.log('4. Test all endpoints with authentication');
}

// Run migration if executed directly
if (require.main === module) {
  runMigration().catch(console.error);
}

export { createFirstAdmin, linkExistingPatients, linkExistingDoctors, runMigration };
