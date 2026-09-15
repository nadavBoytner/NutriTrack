import { BadGatewayException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    proteins_100g?: number;
  };
}

interface OpenFoodFactsResponse {
  products?: OpenFoodFactsProduct[];
}

const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const PAGE_SIZE = 20;
const REQUEST_TIMEOUT_MS = 8000;
// Open Food Facts blocks requests with no descriptive User-Agent; see https://openfoodfacts.github.io/openfoodfacts-server/api/#requests
const USER_AGENT = 'NutriTrack/0.1 (+https://github.com/nutritrack)';

function hasCompleteNutriments(product: OpenFoodFactsProduct): boolean {
  return (
    !!product.code &&
    !!product.product_name &&
    typeof product.nutriments?.['energy-kcal_100g'] === 'number' &&
    typeof product.nutriments?.carbohydrates_100g === 'number' &&
    typeof product.nutriments?.fat_100g === 'number' &&
    typeof product.nutriments?.proteins_100g === 'number'
  );
}

@Injectable()
export class FoodItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string) {
    const url = new URL(SEARCH_URL);
    url.searchParams.set('search_terms', query);
    url.searchParams.set('search_simple', '1');
    url.searchParams.set('action', 'process');
    url.searchParams.set('json', '1');
    url.searchParams.set('page_size', String(PAGE_SIZE));
    url.searchParams.set('fields', 'code,product_name,nutriments');

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      throw new BadGatewayException('Open Food Facts search is currently unavailable');
    }

    const data = (await response.json()) as OpenFoodFactsResponse;
    const usableProducts = (data.products ?? []).filter(hasCompleteNutriments);

    return Promise.all(usableProducts.map((product) => this.upsertFromProduct(product)));
  }

  private upsertFromProduct(product: OpenFoodFactsProduct) {
    const externalId = product.code!;
    const fields = {
      name: product.product_name!,
      caloriesPer100g: product.nutriments!['energy-kcal_100g']!,
      carbsPer100g: product.nutriments!.carbohydrates_100g!,
      fatPer100g: product.nutriments!.fat_100g!,
      proteinPer100g: product.nutriments!.proteins_100g!,
    };

    return this.prisma.foodItem.upsert({
      where: { externalId },
      create: { externalId, barcode: externalId, ...fields },
      update: fields,
    });
  }
}
