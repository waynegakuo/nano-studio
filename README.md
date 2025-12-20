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
The application's core functionalities are encapsulated in several key services.

### 1. AI Service (`ai.service.ts`)
This service is responsible for initializing the Gemini model and generating images based on user prompts.

**Model Initialization:**
```typescript
// src/app/services/core/ai/ai.service.ts
constructor() {
  const geminiAI = getAI(this.firebaseApp, {backend: new GoogleAIBackend()});

  this.model = getGenerativeModel(geminiAI, {
    model: 'gemini-3-pro-image-preview',
    generationConfig: {
      responseModalities: [ResponseModality.IMAGE],
      responseMimeType: 'image/jpeg',
    },
  });
}
```

**Content Generation with System Prompt:**
The `generateContent` method constructs a detailed payload that includes a system prompt to guide the AI, the user's text prompt, and the uploaded image.

```typescript
// src/app/services/core/ai/ai.service.ts
async generateContent(prompt: string, base64Img: string): Promise<string> {
  const payloadText = `You are NanoViz, an expert AI visual stylist...`; // Full system prompt

  const payload: GenerateContentRequest = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: payloadText },
          { inlineData: { mimeType: 'image/jpeg', data: base64Img } }
        ]
      }
    ],
    // ...
  };
  const response = await this.model.generateContent(payload);
  
  const base64ImageResult = response.response.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;
  
  // ...
  
  return `data:image/png;base64,${base64ImageResult}`;
}
```

### 2. Authentication Service (`auth.service.ts`)
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

### 3. User Prompt Service (`user-prompt.service.ts`)
Manages the user's prompt history, persisting data to Firestore.

```typescript
// src/app/services/user-prompt/user-prompt.service.ts
export class UserPromptService {
  prompts = signal<HistoryPrompt[]>([]);

  constructor() {
    toObservable(this.auth.currentUser).pipe(
      switchMap((user) => {
        if (!user) {
          this.prompts.set([]);
          return of<HistoryPrompt[]>([]);
        }
        const q = query(
          collection(this.fs, 'historyPrompts'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        return collectionData(q, { idField: 'id' }) as Observable<HistoryPrompt[]>;
      }),
      // ...
    ).subscribe();
  }

  async addPrompt(prompt: string): Promise<string> {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('Not authenticated');
    const ref = await addDoc(collection(this.fs, 'historyPrompts'), {
      userId,
      prompt,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }
}
```

### 4. Frontend Integration (`home.ts` & `home.html`)
The `Home` component ties these services together to provide a seamless user experience.

**Component Logic:**
```typescript
// src/app/pages/home/home.ts
export class Home {
  aiService = inject(AiService);
  userPromptService = inject(UserPromptService);
  authService = inject(AuthService);

  async generate(): Promise<void> {
    const result = await this.aiService.generateContent(/* ... */);
    this.resultUrl.set(result);
    await this.userPromptService.addPrompt(/* ... */);
  }
}
```

**Template:**
```html
<!-- src/app/pages/home/home.html -->
<div class="result">
  @if (hasResult()) {
    <img [src]="resultUrl()!" alt="Generated image result" />
  }
</div>

<ol class="history">
  @for (item of history(); track item.timestamp) {
    <li class="history__item">{{ item.prompt }}</li>
  }
</ol>
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


## 🚀 Deployment and Running

### Step 9: Deploy and Run Your Application

1. **Run the application locally:**
   ```bash
   cd ..
   ng serve
   ```
   Your app will be available at `http://localhost:4200`. However, on Firebase Studio, hold Ctrl+Click on the localhost URL to open it in a new tab.

2. **Build for production (optional):**
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
- Prompt history shows your last 20 prompts and when they were generated
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
