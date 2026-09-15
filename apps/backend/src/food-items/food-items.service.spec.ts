import { BadGatewayException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import { FoodItemsService } from './food-items.service.js';

describe('FoodItemsService', () => {
  let service: FoodItemsService;
  let prisma: { foodItem: { upsert: ReturnType<typeof vi.fn> } };

  beforeEach(() => {
    prisma = { foodItem: { upsert: vi.fn().mockImplementation(({ create }) => Promise.resolve(create)) } };
    service = new FoodItemsService(prisma as unknown as PrismaService);
  });

  it('upserts only products with complete nutriment data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json; charset=utf-8' }),
        json: () =>
          Promise.resolve({
            products: [
              {
                code: '123',
                product_name: 'Oats',
                nutriments: {
                  'energy-kcal_100g': 389,
                  carbohydrates_100g: 66,
                  fat_100g: 7,
                  proteins_100g: 17,
                },
              },
              { code: '456', product_name: 'Incomplete product', nutriments: {} },
            ],
          }),
      }),
    );

    const results = await service.search('oats');

    expect(results).toHaveLength(1);
    expect(prisma.foodItem.upsert).toHaveBeenCalledOnce();
    expect(results[0]).toMatchObject({
      externalId: '123',
      name: 'Oats',
      caloriesPer100g: 389,
      carbsPer100g: 66,
      fatPer100g: 7,
      proteinPer100g: 17,
    });

    vi.unstubAllGlobals();
  });

  it('raises a BadGatewayException instead of crashing when Open Food Facts returns a non-JSON response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      }),
    );

    await expect(service.search('oats')).rejects.toBeInstanceOf(BadGatewayException);

    vi.unstubAllGlobals();
  });
});
