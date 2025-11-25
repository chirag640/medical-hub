import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

describe('Department CRUD (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdDepartmentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register and login to get access token
    const authRes = await request(app.getHttpServer()).post('/auth/register').send({
      email: 'test-department@example.com',
      password: 'Test123!@#',
    });
    accessToken = authRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('//departments (POST)', () => {
    it('should create a new department', () => {
      return request(app.getHttpServer())
        .post('//departments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'test-name',
          description: 'test-description',
          location: 'test-location',
          phone: 'test-phone',
          budget: 123,
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('description');
          expect(res.body).toHaveProperty('location');
          expect(res.body).toHaveProperty('phone');
          expect(res.body).toHaveProperty('budget');
          expect(res.body).toHaveProperty('isActive');
          createdDepartmentId = res.body.id;
        });
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('//departments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          // Missing required fields
        })
        .expect(400);
    });

    it('should reject unauthenticated request', () => {
      return request(app.getHttpServer())
        .post('//departments')
        .send({
          name: 'test-name',
          location: 'test-location',
          phone: 'test-phone',
          budget: 123,
        })
        .expect(401);
    });
  });

  describe('//departments (GET)', () => {
    it('should get all departments', () => {
      return request(app.getHttpServer())
        .get('//departments')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('//departments?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('//departments/:id (GET)', () => {
    it('should get a single department by id', () => {
      return request(app.getHttpServer())
        .get(`//departments/${createdDepartmentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdDepartmentId);
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('//departments/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('//departments/:id (PATCH)', () => {
    it('should update a department', () => {
      return request(app.getHttpServer())
        .patch(`//departments/${createdDepartmentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'updated-name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdDepartmentId);
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .patch('//departments/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(404);
    });
  });

  describe('//departments/:id (DELETE)', () => {
    it('should delete a department', () => {
      return request(app.getHttpServer())
        .delete(`//departments/${createdDepartmentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should return 404 when deleting non-existent id', () => {
      return request(app.getHttpServer())
        .delete('//departments/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
