import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> } };
  let jwt: { sign: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
    jwt = { sign: vi.fn().mockReturnValue('signed-token') };
    service = new AuthService(prisma as unknown as PrismaService, jwt as unknown as JwtService);
  });

  it('signs up a new user and returns an access token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'user-1', email: 'a@b.com', passwordHash: 'hash' });

    const result = await service.signup('a@b.com', 'password123');

    expect(prisma.user.create).toHaveBeenCalledOnce();
    expect(result).toEqual({ accessToken: 'signed-token' });
  });

  it('rejects signup when the email is already registered', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

    await expect(service.signup('a@b.com', 'password123')).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects login for an unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.login('a@b.com', 'password123')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
