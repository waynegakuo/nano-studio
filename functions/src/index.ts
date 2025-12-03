/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {HttpsError, onCallGenkit} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { logger as genkitLogger } from 'genkit/logging'; // Import Genkit's logger
import {defineSecret} from 'firebase-functions/params';
import {initializeApp} from 'firebase-admin/app';
import { genkit } from 'genkit'; // This is the core Genkit library itself
import { enableFirebaseTelemetry } from '@genkit-ai/firebase'; // <-- NEW IMPORT
import { z } from 'zod';
import googleAI from '@genkit-ai/googleai';

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY'); // *** NEW: Define Gemini API Key Secret ***

// Initialize Firebase Admin SDK
initializeApp();


enableFirebaseTelemetry();

// Configure Genkit
const ai = genkit({
  plugins: [
    googleAI({apiKey: process.env.GEMINI_API_KEY }),
  ],
  model: googleAI.model('gemini-1.5-flash'), // Specify your Gemini model
});

genkitLogger.setLogLevel('debug'); // Or 'info', 'warn', 'error'

const ImageGenerationInputSchema = z.object({
  prompt: z.string().describe('The prompt for the image generation'),
  base64Img: z.string().describe('The base64 encoded image data'),
})

const ImageGenerationOutputSchema = z.object({
  base64ImageResult: z.string().describe('The base64 encoded image data of the generated image'),
})

export const _generateImageFlowLogic = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: ImageGenerationInputSchema,
    outputSchema: ImageGenerationOutputSchema,
  },
  async({ prompt, base64Img }) => {
    const payloadText = `You are NanoViz, an expert AI visual stylist specializing in professional product photography.

  PRIMARY GOAL:
  Transform product images into high-end, market-ready visuals while maintaining brand integrity and enhancing market appeal.

  CORE CAPABILITIES:
  1. Product Enhancement
  - Maintain product as primary focal point with perfect clarity
  - Preserve exact: colors, textures, proportions, branding elements
  - Optimize lighting and contrast for product details

  2. Environmental Integration
  - Seamlessly composite products into authentic settings
  - Utilize contextual elements:
    * Local materials and textures
    * Architectural elements
    * Natural environment features
    * Cultural design elements when specified

  3. Lighting Expertise
  - Implement professional lighting:
    * Natural golden hour warmth
    * Soft diffused daylight
    * Balanced ambient illumination
  - Avoid: harsh shadows, unflattering artificial lighting

  4. Technical Requirements
  - Output Style: Professional product photography
  - Composition: Rule of thirds, leading lines
  - Focus: Sharp product, artistic background blur
  - Resolution: Maintain high detail clarity

  CONSTRAINTS:
  - Never alter core product characteristics
  - Maintain photorealistic quality
  - Preserve brand identity elements
  - Respect cultural authenticity when specified
  - Ensure the generated content is not explicit in nature.

  PROMPT HANDLING:
  When receiving a prompt from the user: ${prompt}, process it as follows:
  1. Extract the editing instructions from the prompt
  2. Apply the requested changes while adhering to all core capabilities and constraints
  3. Maintain the product's integrity as the primary focus
  4. Integrate the specific environmental and cultural elements as requested

  OUTPUT HANDLING:
  - Default: Provide visual output only
  - When JSON requested: Return structured visualization plan
  - If prompt unclear: Request specific clarification
  `;

    try {
      // Generate image using the AI model
      const response = await ai.generate([
        {media: { url: `data:image/jpeg;base64,${base64Img}`}},
        {text: payloadText}
      ]);

      const base64ImageResult = response.media?.url?.split(',')[1];

      if (!base64ImageResult) {
        throw new HttpsError('internal', 'Could not extract base64 image data from the response.');
      }

      return { base64ImageResult };

    } catch (e: any) {
      logger.error("Error generating image:", e);
      throw new HttpsError('internal', 'An error occurred while generating the image.', e.message);
    }
  }
);

export const generateImageFlow = onCallGenkit(
  {
    // Deployment options for the Cloud Function that wraps the Genkit flow
    secrets: [GEMINI_API_KEY],
    region: 'africa-south1', // Set your desired region
    cors: true, // Allow all origins for local development (or restrict for prod)
  },
  _generateImageFlowLogic
);
