import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalRecord, MedicalRecordSchema } from './schemas/medical-record.schema';
import { MedicalRecordController } from './medical-record.controller';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordRepository } from './medical-record.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: MedicalRecord.name, schema: MedicalRecordSchema }])],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService, MedicalRecordRepository],
  exports: [MedicalRecordService],
})
export class MedicalRecordModule {}
