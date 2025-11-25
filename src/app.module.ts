import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './modules/logger/logger.module';
import { CacheModule } from './modules/cache/cache.module';
import { HealthModule } from './modules/health/health.module';
import { ThrottlerModule } from './modules/throttler/throttler.module';
import { EncryptionModule } from './common/encryption.module';
// Generated model modules
import { PatientModule } from './modules/patient/patient.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { MedicalRecordModule } from './modules/medical-record/medical-record.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { DepartmentModule } from './modules/department/department.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL!, {
      // Production-ready connection pool configuration
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections to maintain
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if no server available
      heartbeatFrequencyMS: 10000, // Check server health every 10s
      retryWrites: true, // Automatically retry write operations
      retryReads: true, // Automatically retry read operations
    }),
    LoggerModule,
    CacheModule,
    HealthModule,
    ThrottlerModule,
    EncryptionModule, // Global encryption layer (KMS + AES-GCM)
    AuthModule,
    // Generated modules
    PatientModule,
    DoctorModule,
    AppointmentModule,
    MedicalRecordModule,
    PrescriptionModule,
    DepartmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
