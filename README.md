# Nano Studio 🚀

Transform simple smartphone product photos into studio-quality, culturally rich marketing assets — instantly. 📸✨

Nano Studio aims to democratize high-quality product photography for Small and Medium-sized Enterprises (SMEs), particularly those selling authentic traditional goods (e.g., kanga, kikoy, Swahili crafts, local packaged foods). We provide a tool that transforms simple smartphone product snapshots into professional, culturally rich, and visually compelling marketing assets instantly.

---

## How it works 🧠🖼️
Nano Studio utilizes Google's "Nano Banana" — the official Gemini 2.5 Flash Image generation and editing model — to combine an uploaded product image with a detailed, text-based background prompt.

- You upload a product snapshot 📷
- You describe the desired background or vibe using natural language 📝
- The model composes a studio-grade image that blends your product with an authentic, evocative backdrop in seconds ⚡

"Nano Banana" (Gemini 2.5 Flash Image) uses conversational prompts to make consistent, high-quality edits to photos — changing colors, adding objects, altering textures, and more — while preserving realism and product integrity.

---

## Why it matters 💡
The core value proposition is the ability to generate studio-quality images with authentic, evocative backdrops in seconds, at minimal cost. This is especially impactful for SMEs and local artisans seeking:

- Professional-looking product photos without hiring a studio 💼
- Fast turnarounds for campaigns and catalogs ⏱️
- Context-rich visuals that reflect cultural authenticity 🌍

---

## Features ✨
- Single-image AI editing powered by Gemini 2.5 Flash Image ("Nano Banana")
- Natural language prompt-based editing
- Background generation and compositing
- Consistent, realistic outputs tailored to your style
- Built with Angular for a responsive, modern UI

---

## Getting started 🛠️

### 🧪 Quick Start with Firebase Studio

**The fastest way to get Nova Reel running:**

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

### Step 2: Enable Required APIs for Firebase AI Logic ☁️

Your Firebase project needs Gemini Developer API & Vertex AI Gemini API enabled. In your Firebase Project Dashboard:
1. **Enable Gemini Developer API**
- In the left sidebar, click 'AI'
- Click on 'AI Logic'. This brings up the Firebase AI Logic dashboard view
- Click on 'Get Started'
- On the sidebar that appears, on the 'Gemini Developer API' option, click 'Get Started with this API'
- When prompted with another pop-up, click 'Enable' and also enable AI Monitoring.
- No need to add the Firebase AI Logic SDK as this is already done for you in the project. Click 'Continue'.

NOTE: Enabling the Gemini Developer API will automatically generate for you the Gemini API Key that you need in executing AI actions in your project.

2. **Enable Vertex AI Gemini API**
- Back in the Firebase AI Logic dashboard view, click on 'Settings'
- You will notice that Vertex AI Gemini API is not enabled. For improved performance to our image generation needs, we will enable this API.
- Click on 'Enable required APIs'
- On the sidebar that appears, click 'Enable APIs'
- AI Monitoring should have been already enabled when enabling the Gemini AI API.
- Click 'Continue'.

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
- "Nano Banana" refers to Google's Gemini 2.5 Flash image generation and editing model.
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
