import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('WeightEntries + Reports (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const email = `test-reports-${Date.now()}@example.com`;
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

    await request(app.getHttpServer()).post('/auth/signup').send({ email, password }).expect(201);
    const login = await request(app.getHttpServer()).post('/auth/login').send({ email, password }).expect(201);
    accessToken = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  it('rejects weight entry endpoints without a token', async () => {
    await request(app.getHttpServer()).put('/weight-entries').send({ date: '2026-09-15', weightKg: 80 }).expect(401);
  });

  it('upserts a weight entry and updates it on a second call for the same date', async () => {
    const first = await request(app.getHttpServer())
      .put('/weight-entries')
      .set(auth())
      .send({ date: '2026-09-10', weightKg: 81.5 })
      .expect(200);
    expect(first.body.weightKg).toBe(81.5);

    const second = await request(app.getHttpServer())
      .put('/weight-entries')
      .set(auth())
      .send({ date: '2026-09-10', weightKg: 81.0 })
      .expect(200);
    expect(second.body.id).toBe(first.body.id);
    expect(second.body.weightKg).toBe(81.0);
  });

  it('lists weight entries within a date range', async () => {
    await request(app.getHttpServer()).put('/weight-entries').set(auth()).send({ date: '2026-09-12', weightKg: 80.5 }).expect(200);
    await request(app.getHttpServer()).put('/weight-entries').set(auth()).send({ date: '2026-09-14', weightKg: 80.0 }).expect(200);

    const res = await request(app.getHttpServer())
      .get('/weight-entries')
      .set(auth())
      .query({ from: '2026-09-10', to: '2026-09-14' })
      .expect(200);

    expect(res.body.map((e: { date: string }) => e.date.slice(0, 10))).toEqual([
      '2026-09-10',
      '2026-09-12',
      '2026-09-14',
    ]);
  });

  it('deletes a weight entry and rejects deleting it again', async () => {
    const created = await request(app.getHttpServer())
      .put('/weight-entries')
      .set(auth())
      .send({ date: '2026-09-20', weightKg: 79.0 })
      .expect(200);

    await request(app.getHttpServer()).delete(`/weight-entries/${created.body.id}`).set(auth()).expect(200);
    await request(app.getHttpServer()).delete(`/weight-entries/${created.body.id}`).set(auth()).expect(404);
  });

  it('aggregates a macro report against seeded log entries and goal', async () => {
    await request(app.getHttpServer())
      .put('/nutrition-goals')
      .set(auth())
      .send({ dailyCalories: 2000, dailyCarbsG: 200, dailyFatG: 70, dailyProteinG: 150 })
      .expect(200);

    await request(app.getHttpServer())
      .post('/log-entries')
      .set(auth())
      .send({ date: '2026-09-15', quantityG: 200, customName: 'Chicken salad', calories: 400, carbsG: 20, fatG: 15, proteinG: 45 })
      .expect(201);
    await request(app.getHttpServer())
      .post('/log-entries')
      .set(auth())
      .send({ date: '2026-09-16', quantityG: 100, customName: 'Rice', calories: 130, carbsG: 28, fatG: 0.3, proteinG: 2.7 })
      .expect(201);

    const daily = await request(app.getHttpServer())
      .get('/reports/macros')
      .set(auth())
      .query({ period: 'daily', date: '2026-09-15' })
      .expect(200);
    expect(daily.body.totals).toEqual({ calories: 400, carbsG: 20, fatG: 15, proteinG: 45 });
    expect(daily.body.goal).toEqual({ calories: 2000, carbsG: 200, fatG: 70, proteinG: 150 });

    const weekly = await request(app.getHttpServer())
      .get('/reports/macros')
      .set(auth())
      .query({ period: 'weekly', date: '2026-09-15' })
      .expect(200);
    expect(weekly.body.from).toBe('2026-09-14');
    expect(weekly.body.to).toBe('2026-09-20');
    expect(weekly.body.totals.calories).toBe(530);
    expect(weekly.body.goal.calories).toBe(14000);
  });

  it('returns the weight-trend series scoped to the requesting user', async () => {
    const res = await request(app.getHttpServer())
      .get('/reports/weight-trend')
      .set(auth())
      .query({ from: '2026-09-10', to: '2026-09-14' })
      .expect(200);

    expect(res.body.map((e: { date: string }) => e.date.slice(0, 10))).toEqual(['2026-09-10', '2026-09-12', '2026-09-14']);
  });
});
