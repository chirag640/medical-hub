# 🚀 Quick Start Guide - Authentication System

## ✅ Implementation Complete

All authentication and authorization features have been successfully implemented. This guide will help you get started quickly.

---

## 📋 **What Changed?**

1. ✅ **All endpoints now require authentication** (JWT tokens)
2. ✅ **Role-based access control** on all patient/doctor/appointment operations
3. ✅ **Self-registration creates Patient accounts only**
4. ✅ **Admin endpoint to create staff users** (Doctor, Nurse, Receptionist)
5. ✅ **Automatic patient profile creation** on registration
6. ✅ **Self-service endpoints** for patients and doctors

---

## 🏃 **Quick Start (5 Steps)**

### **Step 1: Create Admin User** (⏱️ 30 seconds)

```bash
npm run create-admin
```

This creates the first admin account:

- **Email:** admin@medical-hub.com
- **Password:** Admin@123456

---

### **Step 2: Start the Server** (⏱️ 10 seconds)

```bash
npm run start:dev
```

Server runs on: http://localhost:3000

---

### **Step 3: Login as Admin** (⏱️ 30 seconds)

**API Call:**

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@medical-hub.com",
  "password": "Admin@123456"
}
```

**Copy the `accessToken` from the response** - you'll need it for next steps!

---

### **Step 4: Create Staff Users** (⏱️ 1 minute)

Create a doctor account:

```http
POST http://localhost:3000/auth/admin/create-user
Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN
Content-Type: application/json

{
  "email": "dr.smith@hospital.com",
  "password": "Doctor@123",
  "firstName": "John",
  "lastName": "Smith",
  "roles": ["Doctor"]
}
```

Create a nurse account:

```http
POST http://localhost:3000/auth/admin/create-user
Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN
Content-Type: application/json

{
  "email": "nurse.mary@hospital.com",
  "password": "Nurse@123",
  "firstName": "Mary",
  "lastName": "Johnson",
  "roles": ["Nurse"]
}
```

---

### **Step 5: Test Patient Registration** (⏱️ 30 seconds)

Patients can self-register:

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "Patient@123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

This automatically:

- Creates a User account with Patient role
- Creates a Patient profile
- Generates a QR code
- Returns JWT tokens

---

## 🎯 **Common Operations**

### **Patient Self-Service**

```http
# Login as patient
POST /auth/login
{ "email": "patient@example.com", "password": "Patient@123" }

# View my profile
GET /patients/me/profile
Authorization: Bearer <patient-token>

# Update my profile
PATCH /patients/me/profile
Authorization: Bearer <patient-token>
{
  "phone": "9876543210",
  "dateOfBirth": "1990-05-15",
  "gender": "Female",
  "bloodType": "O+"
}
```

### **Doctor Operations**

```http
# Login as doctor
POST /auth/login
{ "email": "dr.smith@hospital.com", "password": "Doctor@123" }

# View my doctor profile
GET /doctors/me/profile
Authorization: Bearer <doctor-token>

# View all patients
GET /patients
Authorization: Bearer <doctor-token>

# Search patients
POST /patients/search
Authorization: Bearer <doctor-token>
{ "bloodType": "O+", "nativeState": "Maharashtra" }
```

### **Admin Operations**

```http
# Create receptionist
POST /auth/admin/create-user
Authorization: Bearer <admin-token>
{
  "email": "receptionist@hospital.com",
  "password": "Reception@123",
  "firstName": "Sarah",
  "lastName": "Williams",
  "roles": ["Receptionist"]
}

# Create new admin
POST /auth/admin/create-user
Authorization: Bearer <admin-token>
{
  "email": "admin2@hospital.com",
  "password": "Admin@123456",
  "firstName": "Admin",
  "lastName": "Two",
  "roles": ["Admin"]
}
```

---

## 🔐 **Authentication Flow**

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /auth/register or /auth/login
       │    { email, password }
       ▼
┌─────────────┐
│   Server    │
└──────┬──────┘
       │
       │ 2. Returns:
       │    { accessToken, refreshToken, user }
       ▼
┌─────────────┐
│   Client    │ Stores tokens
└──────┬──────┘
       │
       │ 3. All subsequent requests:
       │    Authorization: Bearer <accessToken>
       ▼
┌─────────────┐
│   Server    │ Validates token + checks roles
└─────────────┘
```

---

## 🛡️ **Role Permissions**

| Feature          | Admin | Doctor | Nurse | Receptionist | Patient  |
| ---------------- | ----- | ------ | ----- | ------------ | -------- |
| Create users     | ✅    | ❌     | ❌    | ❌           | ❌       |
| View patients    | ✅    | ✅     | ✅    | ✅           | Own only |
| Add patient      | ✅    | ✅     | ✅    | ✅           | ❌       |
| Update patient   | ✅    | ✅     | ✅    | ✅           | Own only |
| Delete patient   | ✅    | ❌     | ❌    | ✅           | ❌       |
| Add doctor       | ✅    | ❌     | ❌    | ❌           | ❌       |
| View doctors     | ✅    | ✅     | ❌    | ✅           | ❌       |
| Book appointment | ✅    | ✅     | ❌    | ✅           | ✅       |

---

## 📱 **Postman Collection**

1. Import `postman-collection.json`
2. Set environment variables:
   - `base_url`: http://localhost:3000
   - `admin_token`: (paste admin access token)
   - `doctor_token`: (paste doctor access token)
   - `patient_token`: (paste patient access token)

---

## 🔧 **Configuration**

Environment variables (`.env`):

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database
DATABASE_URL=mongodb://localhost:27017/medical-hub

# Email (for verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## ⚠️ **Important Security Notes**

1. **Change default admin password immediately!**

   ```http
   POST /auth/password-reset/request
   { "email": "admin@medical-hub.com" }
   ```

2. **Use strong passwords** - Requirements:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
   - At least 1 special character (@$!%\*?&)

3. **Store JWT tokens securely**
   - Use httpOnly cookies for web apps
   - Use secure storage for mobile apps
   - Never log or expose tokens

4. **Token expiry**
   - Access token: 15 minutes
   - Refresh token: 7 days
   - Use refresh endpoint to get new access tokens

---

## 🧪 **Testing Checklist**

- [ ] Admin can login
- [ ] Admin can create doctor/nurse/receptionist accounts
- [ ] Patient can self-register
- [ ] Patient automatically gets profile + QR code
- [ ] Patient can view/update own profile
- [ ] Doctor can view/update own profile
- [ ] Doctor can view patient list
- [ ] Doctor cannot access admin endpoints (403 error)
- [ ] Unauthenticated requests are rejected (401 error)
- [ ] Tokens expire and require refresh

---

## 📚 **Full Documentation**

For complete details, see:

- **AUTH_IMPLEMENTATION_GUIDE.md** - Complete implementation guide
- **README.md** - Project overview
- **PATIENT_SYSTEM_GUIDE.md** - Patient system specifics

---

## 🎉 **You're Ready!**

Your authentication system is fully configured and secure. Start building your medical hub application!

**Next Steps:**

1. Change admin password
2. Create staff accounts
3. Test all endpoints
4. Integrate with frontend
5. Deploy to production

---

## ❓ **Need Help?**

- API Documentation: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health
- Check logs: Server console output

**Happy coding! 🚀**
