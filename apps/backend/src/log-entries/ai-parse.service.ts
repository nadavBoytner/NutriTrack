import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const ExtractedItemSchema = z.object({
  name: z.string(),
  quantityG: z.number(),
  estimatedCalories: z.number(),
  estimatedCarbsG: z.number(),
  estimatedFatG: z.number(),
  estimatedProteinG: z.number(),
});

const ExtractionSchema = z.object({ items: z.array(ExtractedItemSchema) });

export type ExtractedItem = z.infer<typeof ExtractedItemSchema>;

const MODEL = 'gpt-5.4-mini';
const REQUEST_TIMEOUT_MS = 20_000;

const SYSTEM_PROMPT = [
  'You are a nutrition-logging assistant. The user describes, in Hebrew or English, what they ate.',
  'Break the description into distinct food items. For each item, give a short generic name suitable',
  "for searching a food database, written in the same language the user wrote, an estimated quantity in",
  "grams, and your own best estimate of that quantity's total calories, carbohydrates (g), fat (g), and",
  'protein (g). Estimate reasonable portion sizes when the user is vague (e.g. "a cup of rice" ~150g cooked).',
].join(' ');

@Injectable()
export class AiParseService {
  private client: OpenAI | null = null;

  constructor(private readonly config: ConfigService) {}

  private getClient(): OpenAI {
    this.client ??= new OpenAI({ apiKey: this.config.getOrThrow<string>('OPENAI_API_KEY') });
    return this.client;
  }

  async extractItems(text: string): Promise<ExtractedItem[]> {
    try {
      const response = await this.getClient().responses.parse(
        {
          model: MODEL,
          input: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text },
          ],
          text: { format: zodTextFormat(ExtractionSchema, 'meal_items') },
        },
        { timeout: REQUEST_TIMEOUT_MS },
      );

      return response.output_parsed?.items ?? [];
    } catch {
      throw new BadGatewayException('AI meal parsing is currently unavailable');
    }
  }
}
