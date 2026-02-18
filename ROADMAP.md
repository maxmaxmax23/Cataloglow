# Master Roadmap & Feature Tracker

This document tracks all implemented features, pending tasks, and future ideas for the Cataloglow project.

## ✅ Completed Features

### 1. Client-Side AI Description Generator (Admin Page)
-   **Groq API Integration**: ✅ Implemented in `src/services/ai.ts` using `llama-3.3-70b-versatile` (Free & Fast).
-   **Admin UI**: Created `src/pages/Admin.tsx` with skip logic (only generates for missing/short descriptions).
-   **Rate Limiting**: Automatic retry logic for API quotas.
-   **Batch Processing**: Generates descriptions sequentially.

### 2. Admin Authentication
-   **Firebase Auth**: Implemented Email/Password login.
-   **Security**: Restricted access to authenticated users only.
-   **Firestore Rules**: Secured `system/catalog_manifest` for authorized writes.

### 3. Deployment Fixes (Vercel)
-   **SPA Routing**: Added `vercel.json` to handle client-side routing (fixes 404s).
-   **Environment Variables**: Configured via Vercel Project Settings for production.

---

## 🚧 In Progress / Next Steps

### 4. High-End UI/UX Polish
*Goal: Transform the UI to match a "City Girl" / "Zatys" luxury aesthetic.*
-   [ ] **Analyze Reference Materials**: Review provided HTML files (Pending user upload).
-   [ ] **Global Theme Update**:
    -   Typography (Premium serif headings, clean sans-serif body).
    -   Color Palette (Refined black/gold/white balance).
    -   Spacing & Layout (More whitespace, cleaner grids).
-   [ ] **Component Polish**: Redesign buttons, cards, and navigation.
-   [ ] **Cohesion Check**: Ensure animations match the new look.

### 5. WhatsApp Integration (Level 2: Visual Ticket)
*Goal: Replace text-based messages with a premium "digital invoice" image.*
-   **Level 1 (Text)**: ✅ Implemented (Basic message generation).
-   **Level 2 (Visual Image)**: 🚧 Pending Implementation.
    -   [ ] **Configure Environment**: Add `VITE_WHATSAPP_NUMBER` to `.env.local`.
    -   [ ] **Image Generation**:
        -   Install `html2canvas`.
        -   Create `ReceiptComponent` (Hidden, print-styled visual invoice with branding).
        -   Implement `generateTicketImage()` function to capture the component.
    -   **Sharing Logic**:
        -   [ ] Use `navigator.share` API for native mobile sharing (iOS/Android).
        -   [ ] Fallback to "Download Image" for desktop users.

---

## 🔮 Future Ideas / Backlog

-   **Verify AI Quota**: Test if `gemini-2.0-flash-lite-001` consistently handles larger batches after daily reset.
-   **Cloud Function Migration**: If client-side rate limits become too restrictive, move AI generation to a Firebase Cloud Function.
