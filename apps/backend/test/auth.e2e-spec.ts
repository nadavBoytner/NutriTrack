import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('Auth + Profile + NutritionGoals (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('rejects signup with a short password', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send({ email, password: 'short' }).expect(400);
  });

  it('signs up a new user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/signup').send({ email, password }).expect(201);
    expect(res.body.accessToken).toBeTypeOf('string');
  });

  it('rejects duplicate signup', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send({ email, password }).expect(409);
  });

  it('rejects the profile fetch without a token', async () => {
    await request(app.getHttpServer()).get('/profile').expect(401);
  });

  it('logs in and returns an access token', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({ email, password }).expect(201);
    expect(res.body.accessToken).toBeTypeOf('string');
    accessToken = res.body.accessToken;
  });

  it('rejects login with the wrong password', async () => {
    await request(app.getHttpServer()).post('/auth/login').send({ email, password: 'wrong-password' }).expect(401);
  });

  it('fetches and updates the profile with a valid token', async () => {
    await request(app.getHttpServer()).get('/profile').set('Authorization', `Bearer ${accessToken}`).expect(200);

    const res = await request(app.getHttpServer())
      .put('/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ age: 30, heightCm: 180, weightKg: 80, goalType: 'cutting' })
      .expect(200);
    expect(res.body.goalType).toBe('cutting');
  });

  it('sets and fetches nutrition goals with a valid token', async () => {
    const res = await request(app.getHttpServer())
      .put('/nutrition-goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ dailyCalories: 2200, dailyCarbsG: 220, dailyFatG: 70, dailyProteinG: 150 })
      .expect(200);
    expect(res.body.dailyCalories).toBe(2200);

    await request(app.getHttpServer())
      .get('/nutrition-goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
