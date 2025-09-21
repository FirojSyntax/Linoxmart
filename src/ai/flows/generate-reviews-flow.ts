'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating fake product reviews.
 * The flow takes a product name and description and returns a list of reviews in Bengali.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateReviewsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('The description of the product.'),
});

export type GenerateReviewsInput = z.infer<typeof GenerateReviewsInputSchema>;

const GenerateReviewsOutputSchema = z.object({
  reviews: z.array(z.object({
    author: z.string().describe("The reviewer's name."),
    rating: z.number().min(1).max(5).describe('The star rating from 1 to 5.'),
    comment: z.string().describe('The review text in Bengali.'),
  })).describe('An array of generated reviews.'),
});

export type GenerateReviewsOutput = z.infer<typeof GenerateReviewsOutputSchema>;


const generateReviewsPrompt = ai.definePrompt({
  name: 'generateReviewsPrompt',
  input: { schema: GenerateReviewsInputSchema },
  output: { schema: GenerateReviewsOutputSchema },
  prompt: `You are a product review generator. Your task is to create 3 realistic and varied product reviews in Bengali based on the provided product details.

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}

Instructions:
1. Generate exactly 3 reviews.
2. Write all reviews in Bengali.
3. Create natural-sounding Bengali names for the authors.
4. Assign a star rating between 4 and 5 for each review.
5. The reviews should sound authentic, like they are from real customers. Make them short and to the point. Some can be very positive, others can be positive with a minor suggestion.
`,
});

const generateReviewsFlow = ai.defineFlow(
  {
    name: 'generateReviewsFlow',
    inputSchema: GenerateReviewsInputSchema,
    outputSchema: GenerateReviewsOutputSchema,
  },
  async (input) => {
    const { output } = await generateReviewsPrompt(input);
    return output!;
  }
);


export async function generateReviews(
  input: GenerateReviewsInput
): Promise<GenerateReviewsOutput> {
  return generateReviewsFlow(input);
}
