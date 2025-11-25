# Universal Patient System - Implementation Guide

## ✅ COMPLETED: Clean, Universal Patient System

### **Key Principles**

1. **"Patient is Patient"** - No type distinctions (no migrant/regular/emergency categories)
2. **Universal Fields** - Works for patients worldwide (India, USA, international)
3. **Flexible Requirements** - Only essential fields required, rest are optional
4. **QR Code Integration** - Every patient gets QR with ID → full record lookup

---

## **Required Fields (Minimum for Registration)**

```typescript
{
  firstName: string,        // Min 2, Max 50 chars
  lastName: string,         // Min 2, Max 50 chars
  gender: 'Male' | 'Female' | 'Other',
  dateOfBirth: Date,        // ISO 8601 format
  phone: string,            // 10 digits (India) or international
  bloodType: string,        // Default: 'Unknown', can be A+/A-/B+/B-/AB+/AB-/O+/O-/Unknown
  consentGiven: boolean     // Must be true for registration
}
```

---

## **Optional Fields**

### **Authentication**

- `email` (optional, but required for user login)

### **Identification (Country-Specific)**

- `aadhaarNumber` (India - 12 digits, encrypted)
- `ssn` (USA - format: XXX-XX-XXXX)
- `passportNumber` (International)
- `insuranceNumber` (Any country)

### **Address Information**

- `address` (current residential address)
- `nativeState` (optional - home state/region)
- `nativeDistrict` (optional - home district/city)

### **Medical Information (Helps Doctors)**

- `medicalHistory` (previous conditions)
- `allergies` (array of allergens)
- `currentMedication` (array of current medicines)

### **Other**

- `emergencyContact` (object with name, phone, relationship)
- `profileImage` (URL or base64)
- `tenantId` (for multi-hospital system)

---

## **API Endpoints**

### **1. Create Patient**

```http
POST /api/patients
Content-Type: application/json

{
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "gender": "Male",
  "dateOfBirth": "1990-05-15",
  "phone": "9876543210",
  "bloodType": "O+",
  "email": "rajesh.kumar@example.com",
  "address": "Room 12, ABC Complex, Kochi, Kerala",
  "aadhaarNumber": "123456789012",
  "nativeState": "Bihar",
  "nativeDistrict": "Patna",
  "allergies": ["Penicillin"],
  "consentGiven": true
}
```

**Response:**

- Auto-generated `patientId`: `PAT-1732567890123`
- QR code generated (base64 image)
- Sensitive fields encrypted (Aadhaar, SSN, medical history, allergies)

---

### **2. Search Patients**

```http
POST /api/patients/search
Content-Type: application/json

{
  "query": "Rajesh",           // Full-text search on name/phone
  "bloodType": "O+",            // Filter by blood type
  "nativeState": "Bihar",       // Filter by native state
  "phone": "9876543210",        // Search by phone
  "aadhaarNumber": "123456789012",  // Search by Aadhaar
  "tenantId": "hospital-id-123"     // Multi-tenant filter
}
```

---

### **3. Get Patient by Patient ID (QR Scan)**

```http
GET /api/patients/patient-id/PAT-1732567890123
```

Use this when scanning QR code - the QR contains patient ID, app fetches full record.

---

### **4. Get QR Code**

```http
GET /api/patients/qr/PAT-1732567890123
```

Returns:

```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGg...",
  "payload": {
    "id": "PAT-1732567890123",
    "name": "Rajesh Kumar",
    "phone": "9876543210",
    "bloodType": "O+"
  }
}
```

---

### **5. Get All Patients (Paginated)**

```http
GET /api/patients?page=1&limit=10
```

---

### **6. Get Patient by MongoDB ID**

```http
GET /api/patients/507f1f77bcf86cd799439011
```

---

### **7. Update Patient**

```http
PATCH /api/patients/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "address": "New Address, Mumbai",
  "bloodType": "A+"
}
```

---

### **8. Soft Delete Patient**

```http
DELETE /api/patients/507f1f77bcf86cd799439011
```

---

## **Security Features**

### **Field-Level Encryption (AES-256-GCM)**

Encrypted fields:

- `medicalHistory`
- `allergies`
- `currentMedication`
- `aadhaarNumber`
- `ssn`

### **Data Masking in Responses**

- Aadhaar: `****9012` (last 4 digits only)
- SSN: `***-**-6789` (last 4 digits only)

### **QR Code Security**

- QR contains **only Patient ID** (not sensitive data)
- Full record fetched from database using ID
- Requires authentication to access patient records

---

## **Database Schema Highlights**

### **Indexes for Performance**

- `patientId` (unique)
- `phone` (unique)
- `email` (unique, sparse)
- `aadhaarNumber` (unique, sparse)
- `ssn` (unique, sparse)
- Full-text search on `fullName` and `phone`
- Compound indexes for tenant isolation, blood type, native location

### **Soft Delete**

- `isDeleted` flag
- `deletedAt` timestamp
- `deletedBy` user ID
- `deletionReason` (audit trail)

### **Multi-Tenant Support**

- `tenantId` field for hospital/clinic isolation

---

## **Patient ID Format**

**Pattern:** `PAT-{timestamp}{random}`

**Example:** `PAT-17325678901231234`

- Universal prefix: `PAT-`
- Timestamp: `1732567890123` (milliseconds since epoch)
- Random: `1234` (4 digits for collision prevention)

---

## **Use Cases Supported**

### ✅ **New Patient (No History)**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "dateOfBirth": "1995-08-20",
  "phone": "9123456789",
  "bloodType": "Unknown",
  "consentGiven": true
}
```

### ✅ **Patient with Previous History**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "gender": "Female",
  "dateOfBirth": "1988-03-10",
  "phone": "9987654321",
  "bloodType": "B+",
  "email": "jane.smith@email.com",
  "medicalHistory": "Diabetes since 2015, managed with Metformin",
  "allergies": ["Sulfa drugs", "Latex"],
  "currentMedication": ["Metformin 500mg twice daily"],
  "consentGiven": true
}
```

### ✅ **International Patient**

```json
{
  "firstName": "Michael",
  "lastName": "Johnson",
  "gender": "Male",
  "dateOfBirth": "1980-12-05",
  "phone": "+1234567890",
  "bloodType": "A+",
  "email": "michael@email.com",
  "passportNumber": "A12345678",
  "ssn": "123-45-6789",
  "insuranceNumber": "INS987654",
  "consentGiven": true
}
```

### ✅ **Indian Patient**

```json
{
  "firstName": "Priya",
  "lastName": "Sharma",
  "gender": "Female",
  "dateOfBirth": "1992-07-22",
  "phone": "9876543210",
  "bloodType": "O-",
  "email": "priya.sharma@email.com",
  "address": "Flat 301, Green Apartments, Pune",
  "aadhaarNumber": "987654321098",
  "nativeState": "Maharashtra",
  "nativeDistrict": "Pune",
  "consentGiven": true
}
```

---

## **Testing with Postman**

1. **Import Collection:** Use `postman-collection.json` in root directory
2. **Set Environment Variables:**
   - `base_url`: `http://localhost:3000`
   - `auth_token`: JWT token from login

3. **Test Flow:**
   ```
   1. POST /auth/register (create user account)
   2. POST /auth/login (get JWT token)
   3. POST /api/patients (create patient with token)
   4. GET /api/patients/patient-id/{patientId} (verify)
   5. GET /api/patients/qr/{patientId} (get QR code)
   6. POST /api/patients/search (search patients)
   ```

---

## **Frontend Integration Guide**

### **React Native / Flutter - Patient Registration Form**

```javascript
// Minimum required fields
const requiredFields = {
  firstName: 'text',
  lastName: 'text',
  gender: 'select', // Male/Female/Other
  dateOfBirth: 'datepicker',
  phone: 'phone',
  bloodType: 'select', // A+/A-/.../Unknown
  consentGiven: 'checkbox',
};

// Optional fields (show based on user selection)
const optionalFields = {
  email: 'email',
  aadhaarNumber: 'number', // Show for Indian users
  ssn: 'text', // Show for USA users
  passportNumber: 'text',
  address: 'textarea',
  nativeState: 'text',
  allergies: 'tags',
  currentMedication: 'tags',
};
```

### **QR Code Scanning Flow**

```javascript
// 1. Scan QR code
const qrData = scanQRCode(); // Returns: {"id": "PAT-1732567890123", ...}

// 2. Fetch full patient record
const patient = await fetch(`/api/patients/patient-id/${qrData.id}`, {
  headers: { Authorization: `Bearer ${token}` },
}).then((res) => res.json());

// 3. Display patient info
showPatientDetails(patient);
```

---

## **Next Steps for Complete System**

### **Pending Modules:**

1. ✅ **Patient Module** - DONE
2. ⏳ **Appointment Module** - Schedule visits
3. ⏳ **Medical Record Module** - Store diagnoses, lab reports
4. ⏳ **Prescription Module** - Doctor prescriptions
5. ⏳ **Document Upload** - ID cards, reports (S3/local storage)
6. ⏳ **WebSocket** - Real-time notifications
7. ⏳ **Offline Sync** - Mobile app offline support

### **Electron Desktop App Integration:**

- Desktop app uses same REST API
- QR scanner integration via webcam
- Local database sync for offline clinics
- Print patient health cards with QR

### **Mobile App Features:**

- Patient self-registration
- QR code on patient's phone (digital health card)
- Appointment booking
- Prescription history
- Lab report viewing

---

## **Summary**

🎉 **You now have a truly universal patient system:**

- ✅ No patient type distinctions
- ✅ Works worldwide (India, USA, international)
- ✅ Flexible required/optional fields
- ✅ QR code for quick access
- ✅ Field-level encryption
- ✅ Multi-tenant support
- ✅ Soft delete & audit trails
- ✅ Full-text search
- ✅ Phone/Aadhaar/SSN lookup

**"Patient is Patient"** - Simple, clean, universal. 🌍
