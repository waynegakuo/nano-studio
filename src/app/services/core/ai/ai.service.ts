import {inject, Injectable, signal} from '@angular/core';
import {FirebaseApp} from '@angular/fire/app';
import {getFunctions, httpsCallable} from '@angular/fire/functions';
import { ErrorService } from '../error/error.service';

interface ImageGenerationOutput {
  base64ImageResult: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly errorService = inject(ErrorService);
  private firebaseApp = inject(FirebaseApp);
  private functions;

  error = signal<string | null>(null);
  resultImageURL = signal<string | null>(null);

  constructor() {
    this.functions = getFunctions(this.firebaseApp, 'africa-south1');
  }

  async generateContent(prompt: string, base64Img: string): Promise<string> {
    this.error.set(null); // Clear previous errors

    try {
      const generateImage = httpsCallable<{ prompt: string, base64Img: string }, ImageGenerationOutput>(this.functions, 'generateImageFlow');
      const response = await generateImage({ prompt, base64Img });

      const base64ImageResult = response.data.base64ImageResult;

      if(!base64ImageResult) {
        const msg = 'We could not create an image from that. Try a simpler prompt or a different photo.';
        this.error.set(msg);
        this.errorService.showError(msg);
        console.error("Firebase function response missing image data:", response);
        return "";
      }

      const imageURL = `data:image/png;base64,${base64ImageResult}`;
      this.resultImageURL.set(imageURL);
      return imageURL;

    }
    catch (e: any) {
      console.error('Firebase function call error: ', e);
      const msg = e.message || 'Failed to generate content. Please try again.';
      this.error.set(msg);
      this.errorService.showError(msg);
      return "";
    }
  }
}
