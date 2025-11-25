/**
 * Simple script to create the first admin user
 * Run: npm run create-admin
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserRepository } from '../modules/user/user.repository';
import * as bcrypt from 'bcryptjs';

async function createAdmin() {
  console.log('🚀 Creating first admin user...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get(UserRepository);

  try {
    // Check if admin exists
    const existingAdmin = await userRepository.findOne({ roles: { $in: ['Admin'] } });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Roles: ${existingAdmin.roles.join(', ')}`);
      console.log('\n✅ No action needed.\n');
      await app.close();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);

    await userRepository.create({
      email: 'admin@medical-hub.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      roles: ['Admin'],
      emailVerified: true,
    });

    console.log('✅ First admin user created successfully!\n');
    console.log('📧 Email:    admin@medical-hub.com');
    console.log('🔑 Password: Admin@123456');
    console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!\n');
    console.log('Login command:');
    console.log('POST /auth/login');
    console.log('{\n  "email": "admin@medical-hub.com",\n  "password": "Admin@123456"\n}\n');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await app.close();
  }
}

createAdmin();
