<div align="center">

# 🖼️ Nano Studio

### *AI-Powered Image Editing for Small and Medium-sized Enterprises*

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Google AI](https://img.shields.io/badge/Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

Nano Studio is a web app that enables users to transform simple smartphone product photos into professional, culturally rich, and visually compelling marketing assets instantly. It uses Google's Gemini 3 Pro's Image model, dubbed as Nano Banana Pro to combine an uploaded product image with a detailed, text-based background prompt, to produce a high-quality, visually compelling image for marketing needs.
</div>

## 🌟 About the App

Transform simple smartphone product photos into studio-quality, culturally rich marketing assets — instantly. 📸✨

Nano Studio aims to democratize high-quality product photography for Small and Medium-sized Enterprises (SMEs), particularly those selling authentic traditional goods (e.g., kanga, kikoy, Swahili crafts, local packaged foods). We provide a tool that transforms simple smartphone product snapshots into professional, culturally rich, and visually compelling marketing assets instantly.

---

## How it works 🧠🖼️
Nano Studio utilizes Google's "Nano Banana Pro" — the official Gemini 3 Pro's Image generation and editing model — to combine an uploaded product image with a detailed, text-based background prompt.

- You upload a product snapshot 📷
- You describe the desired background or vibe using natural language 📝
- The model composes a studio-grade image that blends your product with an authentic, evocative backdrop in seconds ⚡

"Nano Banana Pro" (Gemini 3 Pro's Image) uses conversational prompts to make consistent, high-quality edits to photos — changing colors, adding objects, altering textures, and more — while preserving realism and product integrity.

---

## Why it matters 💡
The core value proposition is the ability to generate studio-quality images with authentic, evocative backdrops in seconds, at minimal cost. This is especially impactful for SMEs and local artisans seeking:

- Professional-looking product photos without hiring a studio 💼
- Fast turnarounds for campaigns and catalogs ⏱️
- Context-rich visuals that reflect cultural authenticity 🌍

---

## Features ✨
- **AI-Powered Image Generation**: Utilizes Google's Gemini 3 Pro model to generate high-quality product images.
- **Prompt-Based Editing**: Users can describe the desired background and style using natural language.
- **Authentication**: Secure user authentication with Google, powered by Firebase Authentication.
- **Prompt History**: Saves and displays a history of user prompts, stored in Firestore.
- **Responsive UI**: Built with Angular, ensuring a seamless experience across devices.

---

## Code Highlights 👨🏾‍💻
The application's core logic is split between the frontend (Angular) and the backend (Firebase Functions with Genkit).

### 1. Backend: Genkit & Firebase Functions (`functions/src/index.ts`)
The backend uses Genkit to define an AI flow that generates images and exposes it as a callable Firebase Function.

**Genkit Flow Definition:**
The `_generateImageFlowLogic` defines the AI workflow. It takes a prompt and a base64-encoded image, uses the Gemini model to generate a new image, and returns the result.

```typescript
// functions/src/index.ts
export const _generateImageFlowLogic = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: ImageGenerationInputSchema,
    outputSchema: ImageGenerationOutputSchema,
  },
  async({ prompt, base64Img }) => {
    const payloadText = SYSTEM_PROMPT(prompt);

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
```

**Firebase Function Wrapper:**
The Genkit flow is wrapped in a callable Firebase Function, making it accessible to the frontend.

```typescript
// functions/src/index.ts
export const generateImageFlow = onCallGenkit(
  {
    secrets: [GEMINI_API_KEY],
    region: 'africa-south1',
    cors: isEmulated ? true : [/^https:\/\/nano-studios(--[a-z0-9-]+)?\.web\.app$/],
  },
  _generateImageFlowLogic
);
```

### 2. Frontend: Angular Services & Components

**AI Service (`src/app/services/core/ai/ai.service.ts`):**
This service calls the `generateImageFlow` Firebase Function.

```typescript
// src/app/services/core/ai/ai.service.ts
import { httpsCallable } from '@angular/fire/functions';

// ...

export class AiService {
  // ...
  async generateContent(prompt: string, base64Img: string): Promise<string> {
    try {
      const generateImage = httpsCallable<{ prompt: string, base64Img: string }, ImageGenerationOutput>(this.functions, 'generateImageFlow');
      const response = await generateImage({ prompt, base64Img });
      const base64ImageResult = response.data.base64ImageResult;
      // ...
      return `data:image/png;base64,${base64ImageResult}`;
    }
    // ...
  }
}
```

**Authentication Service (`src/app/services/core/auth/auth.service.ts`):**
Handles user authentication using Firebase, supporting sign-in with Google.

```typescript
// src/app/services/core/auth/auth.service.ts
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
    });
  }

  signInWithGoogle(): Observable<User> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap(result => of(result.user))
    );
  }
}
```

**Home Component (`src/app/pages/home/home.ts`):**
The `Home` component uses the `AiService` to trigger the image generation process.

```typescript
// src/app/pages/home/home.ts
export class Home {
  aiService = inject(AiService);
  // ...

  async generate(): Promise<void> {
    if (!this.canGenerate()) return;
    this.loading.set(true);

    this.aiService.generateContent(this.prompt(), this.base64Image()!)
      .then(async res => {
        this.resultUrl.set(res);
        // ...
      })
      .catch(error => {
        // ...
      })
  }
}
```

---

## Getting started 🛠️

### 🧪 Quick Start with Firebase Studio

**The fastest way to get Nano Studio running:**

<div align="center">

<a href="https://studio.firebase.google.com/import?url=https%3A%2F%2Fgithub.com%2Fwaynegakuo%2Fnano-studio">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://cdn.firebasestudio.dev/btn/try_dark_32.svg">
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://cdn.firebasestudio.dev/btn/try_light_32.svg">
    <img
      height="32"
      alt="Try in Firebase Studio"
      src="https://cdn.firebasestudio.dev/btn/try_blue_32.svg">
  </picture>
</a>

*Click above to launch Nano Studio in Firebase Studio*

</div>

**After launching:**

1. **📂 Open Terminal** - Navigate to the Terminal tab in Firebase Studio
2. **📦 Install Dependencies** - Run these commands one by one:
   ```bash
   npm install
   cd functions
   npm install
   cd ..
   ```

---

## ⚙️ Configuration Guide

> **💡 Complete Setup Guide** - Follow these steps to configure Firebase and required APIs for Nano Studio.


## 🏗️ Step 1: Create Firebase Project</b>

### Firebase Console Setup

1. **🌐 Open Firebase Console**
- Navigate to [Firebase Console](https://console.firebase.google.com/)

2. **➕ Create New Project**
- Click "Create a new Firebase project"
- Enter project name: `nano-studio-app` (or your preferred name)
- Google Analytics is optional, so no need to enable it

3. **💳 Upgrade to Blaze Plan** ⚠️ **Required for AI Features**
- Locate billing section in bottom-left sidebar
- Click "Upgrade" next to Spark plan
- Select "Pay as you Go - Blaze Plan"
- Choose "Google Cloud Platform Trial Billing Account"
- Set budget alert (e.g., $2 USD)
- Click "Link Cloud Billing Account"

### Step 2: Enable Required APIs ☁️

Your Firebase project needs certain Google Cloud APIs enabled:

1. **Go to Google Cloud Console:**
  - Visit the [Google Cloud Console](https://console.cloud.google.com/)
  - Make sure your Firebase project is selected in the project dropdown
  - Click on "Dashboard" to see the project's overview page
2. **Enable the Secret Manager API:**
  - In the left sidebar, go to "APIs & Services" > "Library"
  - Search for "Secret Manager API"
  - Click on it and press "Enable"

> **Note:** Other APIs (Cloud Functions, Vertex AI, etc.) are automatically enabled when you deploy Firebase Functions.

### Step 3: Install and Setup Firebase CLI 🛠️

> **📝 Note for Firebase Studio users:** Skip the CLI installation step and go directly to logging in.

1. **Install Firebase CLI** (skip if using Firebase Studio):
   ```bash
   npm install -g firebase-tools
   ```

2. **Log in to Firebase:**
   ```bash
   firebase login
   ```

3. In the terminal, you will be prompted to enter to visit a URL to authenticate using an authorization code.
4. Open the URL, select the same Google account you used to create the Firebase project.
5. Click the "Yes, I just ran this command" button.
6. The second step shows you a session code that should tally with the one seen back in your project's terminal. Click "Yes".
7. In Step 3, copy the code and paste it into the terminal.


### Step 4: Link Your Firebase Project 🔄

You need to make sure your project is linked correctly:

**Method 1: Using Firebase CLI (Recommended)**

Set your Firebase project as the default:
```bash
firebase use YOUR_PROJECT_ID
```
> Replace `YOUR_PROJECT_ID` with your actual Firebase project ID (you can find this in the Firebase Console URL or project settings).

**Method 2: Manual Configuration**

If the CLI method doesn't work, you can edit the `.firebaserc` file manually:

1. Open `.firebaserc` in your project root directory
2. Update it to match your project ID:
   ```json
   {
     "projects": {
       "default": "YOUR_PROJECT_ID"
     }
   }
   ```

> **💡 Tip:** You can verify your project is linked correctly by running `firebase projects:list` to see your available projects.


### Step 5: Configure Firebase Services
   ```bash
   firebase init
   ```
Configure Firebase services when prompted:
- **Select services:** Choose and "Firestore" (use space to select, enter to confirm)
- **Select a location for your Firestore database:** Choose a region closer to your users
- **Firestore Rules:** Accept the default `firestore.rules` file
- **Firestore Indexes:** Accept the default `firestore.indexes.json` file
- **Initialize or overwrite:** When asked to either initialize or overwrite the codebase, select "Overwrite"
- **⚠️ Important:** When asked to overwrite existing files, select "No" to preserve the project code
- **Install dependencies:** Choose "Yes"

### Step 6: Configure Firebase Web App 🔥

Now you need to register a web app in Firebase and get the configuration:

1. **Register your web app:**
  - Go to [Firebase Console](https://console.firebase.google.com/) and select your project
  - Click the gear icon (⚙️) next to "Project Overview" → "Project settings"
  - Scroll to "Your apps" section
  - If you don't have a web app yet, click "Add app" → Web icon (`</>`)
  - Give your app a name (e.g., "Nova Reel Web App")
  - Check the Firebase Hosting box
  - Click "Register app"

2. **Get your Firebase configuration:**
  - In the "Add Firebase SDK" step, copy the configuration object (it looks like this):
   ```javascript
   {
     apiKey: "your-api-key-here",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id",
     measurementId: "your-measurement-id"
   }
   ```

3. **Update your environment files:**

   Open both environment files and replace the `firebaseConfig` object with your own:

   **For `src/environments/environment.ts` (production):**
   ```typescript
   export const environment = {
     production: true,
     firebaseConfig: {
       // Paste your Firebase config here
       apiKey: "your-api-key-here",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id",
       measurementId: "your-measurement-id"
     }
   };
   ```

   **For `src/environments/environment.development.ts` (development):**
   ```typescript
   export const environment = {
     production: false,
     firebaseConfig: {
       // Same Firebase config as above
     }
   };
   ```
   Click "Continue to console" to continue.

## Firebase Authentication Setup

### Step 7: Enable Authentication
- Click the "Build" dropdown in the sidebar
- Select "Authentication"
- Click "Get started"
- Select "Google"
- Toggle the "Enable" switch
- Provide a support email address
- Click "Save"

##  Firebase Firestore Database

### Step 8: Enable Firestore Database
- Click the "Build" dropdown in the sidebar
- Select "Firestore Database"
- Click "Create database"
- Select "Standard Edition"
- You can leave the database ID as "default"
- Select the closest location to your users
- Click "Next"
- Select "Start in test mode"
- Click "Create"

## 🔐 API Keys Setup

### Step 9: Set Up API Keys as Firebase Secrets 🔑

1. **Set Gemini API Key:**
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```
   When prompted, paste your Gemini API key.

   > **📝 How to get Gemini API Key:** Go to [Google AI Studio](https://aistudio.google.com/app/apikey), create an API key by attaching to a project, and copy it. The input is masked, so you won't see the pasted key, but it will be there. Just paste ONCE!

2. **Create local environment file (for development):**
   ```bash
   echo "GEMINI_API_KEY=your_actual_gemini_api_key_here" > .env
   cd ..
   ```
   Replace `your_actual_gemini_api_key_here` with your actual Gemini API key.


## 🚀 Deployment and Running

### Step 10: Deploy and Run Your Application
1. **Deploy Firebase Functions:**
   ```bash
   firebase deploy --only functions
   ```
   This will deploy your backend functions to Firebase.

2. **Run the application locally:**
   ```bash
   cd ..
   ng serve
   ```
   Your app will be available at `http://localhost:4200`. However, on Firebase Studio, hold Ctrl+Click on the localhost URL to open it in a new tab.

3. **Build for production (optional):**
   ```bash
   ng build
   firebase deploy --only hosting
   ```

> **🎉 Congratulations!** Your Nano Studio app should now be running with full AI-powered image editing capabilities!


This project is built with Angular. If you’re setting it up locally:

1. Install dependencies
   ```bash
   npm install
   ```
2. Start the development server
   ```bash
   npm start
   # or
   ng serve
   ```
3. Open the app
  - Visit http://localhost:4200/ in your browser. The app reloads on file changes.

---

## Usage guide 👩🏽‍💻👨‍💻
- Upload a clear JPG or PNG (well‑lit, uncluttered works best)
- Try a quick prompt (Studio, Soft, Noir, Vibrant) or write your own, e.g.:
  - "Soft natural light, wooden tabletop, cozy morning scene"
  - "Vibrant kanga fabric backdrop, soft shadows, minimalist props"
- Click Generate
- Download or share the result; refine the prompt and iterate

Notes
- Large images may take longer to process
- Prompt history shows your last 20 prompts and and when they were generated
---

## Notes on the model 🧩
- "Nano Banana Pro" refers to Google's Gemini 3 Pro image generation and editing model.
- It enables conversational edits like color changes, adding objects, or texture adjustments.
- Ideal for single-image product scenarios where consistency and speed matter.

---

## Scripts 📜
Common Angular CLI scripts:

- Development server
  ```bash
  ng serve
  ```
- Build for production
  ```bash
  ng build
  ```
- Unit tests
  ```bash
  ng test
  ```

---

## Roadmap 🗺️ (ideas)
- Preset prompt templates for common product categories
- Batch processing for product catalogs
- Export presets for marketplaces (Shopify, Jumia, etc.)
- Fine-grained controls for lighting and shadow realism

---

---

## License 📄
This project is for educational and prototyping purposes. Consider reviewing licensing and API terms for any production deployment.
