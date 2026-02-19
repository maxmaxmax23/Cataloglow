# Master Roadmap & Feature Tracker
> **Version**: 1.0beta
> *Directive: Increment this version number with every significant update to this roadmap.*

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

### 3. Deployment & Infrastructure (Robustness)
-   **SPA Routing**: Added `vercel.json` to handle client-side routing (fixes 404s).
-   **Environment Variables**: Configured via Vercel Project Settings for production.
-   **Build Safety**: Added `tsc` type-checking to build pipeline to prevent silent failures.
-   **Tailwind Config**: Fixed `content` paths to include all component directories.
-   **Cleanup**: Removed temporary build files to ensure clean deployments.

### 4. High-End UI/UX Polish & AURUM Expansion
*Goal: Transform the UI to match a "Scientific Opulence" luxury aesthetic (Manrope, Gold/Black) and localize for the Spanish market.*
-   **Global Theme Update**:
    -   Typography: Manrope (Sans) & Cinzel (Serif).
    -   Color Palette: Refined Deep Black (#020202) & Gold (#d4af35).
    -   Spacing & Layout: Sharp corners, glassmorphism, responsive grids.
-   **Component Polish**: Navigation, Cart, Checkout, and Product Cards redesigned.
-   **Splash Screen**: "Lujo Redefinido" with parallax and gold branding.
-   **Spanish Localization**: Full UI translation (Home, Shop, Checkout, Admin).
-   **Product Detail Enhancements**: Trust badges added, accordions removed.

### 5. WhatsApp Integration & Digital Receipt
*Goal: Replace text-based messages with a premium "digital invoice" image.*
-   **Receipt Generation**: Created `ReceiptTicket` component with Marble texture and Gold/Black aesthetic.
-   **Image Conversion**: Integrated `html2canvas` to generate high-res PNGs of the receipt.
-   **Smart Sharing**: Implemented `navigator.share` (Mobile) and Download+Web fallback (Desktop).
    -   **Enhanced Details**: Added **Product SKUs/IDs**, **Full Address** (no truncation), and **Order Number**.
-   **Robustness**: Fixed image loading race conditions and cross-origin issues.

### 6. Admin Dashboard Overhaul
*Goal: Build a powerful, AURUM-styled "Command Center" for full catalog control.*
-   **Admin UI Redesign**: Applied the "Scientific Opulence" dark theme to the Admin panel.
-   **Product Management**:
    -   **Editor Form**: Edit Name, Price, SKU, Stock, Category, and Images.
    -   **Create/Delete**: Ability to add new items or remove obsolete ones.
-   **Category Management**: Integrated category creation into the Product Editor.
-   **Firebase Sync**:
    -   **Push**: Save local changes to the Cloud Manifest.
    -   **Pull**: Force refresh data from the Cloud.

### 7. Order System & Checkout Logic
-   **Order Numbering**: Implemented atomic counter in `src/services/orders.ts` (e.g., AURUM-0042).
    -   **Display**: Integrated into Receipt Header and WhatsApp message.
-   **Checkout Form**:
    -   User inputs for Name and Delivery Zone.
    -   Validation and Loading states.
    -   Seamless transition to WhatsApp with pre-filled message and image attachment.

---

## 🚧 In Progress / Next Steps

### 8. Analytics & Reporting (Planned)
*Goal: Track sales and user engagement.*
-   [ ] **Google Analytics**: Integration for page views and events.
-   [ ] **Order Logging**: Save order details to Firestore before redirecting to WhatsApp (currently client-side only).

### 9. Inventory Management (Planned)
*Goal: Real-time stock decrementing.*
-   [ ] **Stock Deduction**: Decrease stock count automatically when an order is generated.
-   [ ] **Low Stock Alerts**: Notify admin when products are running low.

## 🧪 QA & Fine-tuning (Updates to Existing Features)

### A. Localization & formatting
-   [ ] **Currency Format**: Replace `toFixed(2)` with `Intl.NumberFormat('es-AR')` for correct usage of commas/dots ($1.234,50).
-   [ ] **Date Locale**: Ensure all date displays use strict 'es-AR' configuration.

### B. Resilience & Validation
-   [ ] **Input Trimming**: Trim whitespace from Name/Address in `CheckoutForm` to prevent empty submissions.
-   [ ] **Office ID Collision**: Add random suffix to `orders.ts` offline fallback to technically eliminate collision risk.
-   [ ] **Image Pre-loading**: Ensure branded fonts (Manrope/Cinzel) are fully loaded before `html2canvas` runs to prevent "Flash of Unstyled Text" in receipts.

### C. UX Edge Cases
-   [ ] **Long Item Lists**: Verify `ReceiptTicket` behavior when order has 10+ items (does background scaling work?).
-   [ ] **Mobile Keyboard**: Ensure `CheckoutForm` modal doesn't get covered by the virtual keyboard on mobile devices.

---


