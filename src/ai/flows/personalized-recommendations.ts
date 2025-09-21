'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized product recommendations based on user purchase history.
 *
 * The flow takes a user ID and purchase history as input, and returns a list of recommended product IDs.
 * It uses an LLM to determine whether a recommendation will be valuable in the context of the user's past purchases.
 *
 * @exports {
 *   getPersonalizedRecommendations: (input: PersonalizedRecommendationsInput) => Promise<PersonalizedRecommendationsOutput>;
 *   PersonalizedRecommendationsInput: z.infer<typeof PersonalizedRecommendationsInputSchema>;
 *   PersonalizedRecommendationsOutput: z.infer<typeof PersonalizedRecommendationsOutputSchema>;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the personalized recommendations flow.
 */
const PersonalizedRecommendationsInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  purchaseHistory: z
    .array(z.string())
    .describe('An array of product IDs representing the user\'s purchase history.'),
});

export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

/**
 * Output schema for the personalized recommendations flow.
 */
const PersonalizedRecommendationsOutputSchema = z.object({
  recommendedProductIds: z
    .array(z.string())
    .describe('An array of product IDs recommended for the user.'),
});

export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

/**
 * Tool to fetch product details by ID.
 */
const getProductDetails = ai.defineTool({
  name: 'getProductDetails',
  description: 'Returns the details of a product given its ID.',
  inputSchema: z.object({
    productId: z.string().describe('The ID of the product.'),
  }),
  outputSchema: z.object({
    productId: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string(),
  }),
},
async (input) => {
    // TODO: Implement the actual product details fetching logic here
    // This is a placeholder implementation.
    return {
      productId: input.productId,
      name: `Product ${input.productId}`,
      description: `This is a sample product description for product ${input.productId}.`,      
      price: 99.99,
      imageUrl: 'https://example.com/sample-image.jpg',
    };
  }
);

/**
 * Prompt to generate personalized product recommendations.
 */
const personalizedRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  tools: [getProductDetails],
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are a personal shopping assistant. Given a user's purchase history, you will recommend products that the user might be interested in.

  User ID: {{{userId}}}
  Purchase History: {{#each purchaseHistory}}{{{this}}}, {{/each}}

  Instructions:
  1.  Consider the user's past purchases.
  2.  Recommend products that are related to the user's past purchases.
  3.  Only recommend products that the user is likely to be interested in.
  4.  Use the getProductDetails tool to get product details.

  Output the recommended product IDs in a JSON array.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

/**
 * Genkit flow to generate personalized product recommendations.
 */
const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedRecommendationsPrompt(input);
    return output!;
  }
);

/**
 * Wrapper function to call the personalized recommendations flow.
 */
export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}
