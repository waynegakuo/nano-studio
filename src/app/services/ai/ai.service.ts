import {inject, Injectable, signal} from '@angular/core';
import {getAI, GoogleAIBackend} from '@angular/fire/ai';
import {FirebaseApp} from '@angular/fire/app';
import {GenerativeModel, getGenerativeModel} from '@angular/fire/vertexai';
import {GenerateContentRequest, ResponseModality} from '@firebase/ai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly model: GenerativeModel;
  firebaseApp = inject(FirebaseApp);

  error = signal<string | null>(null);
  resultImageURL = signal<string | null>(null);

  constructor() {
    // Initialize Gemini Developer API/Vertex AI Gemini API Service
    const geminiAI = getAI(this.firebaseApp, {backend: new GoogleAIBackend()});

    this.model = getGenerativeModel(geminiAI, {
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        responseModalities: [ResponseModality.IMAGE],
        responseMimeType: 'image/jpeg',
      },
    });
  }

  async generateContent(prompt: string, base64Img: string): Promise<string> {

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

    const payload: GenerateContentRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: payloadText },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Img,
              }
            }
          ]
        }
      ],
      // Request image-only output for the visualizer
      generationConfig: {
        responseModalities: [ResponseModality.IMAGE],
      },
    };

    try {
      const response = await this.model.generateContent(payload); // Generating the content

      const base64ImageResult = response.response.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;

      if(!base64ImageResult) {
        this.error.set("AI failed to generate image. Try a simpler prompt or a different image.");
        console.error("API response missing image data:", response);
        return "";
      }

      const imageURL = `data:image/png;base64,${base64ImageResult}`;
      this.resultImageURL.set(imageURL);
      return imageURL;

    }
    catch (e) {
      console.log('Gemini API Error: ', e);
      this.error.set('Failed to generate content. Please try again.');
      return "";
    }

  }

}
