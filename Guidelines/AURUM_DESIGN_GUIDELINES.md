# Aurum Design System & UI Guidelines

The **Aurum** (Latin for "gold") aesthetic is the core design language for the Glow application. It aims to provide an immersive, luxurious, and highly professional user experience. It achieves this by combining stark contrasts (true blacks vs. amber accents), thin & spacious typography, and subtle, smooth animations.

This document serves as the UI framework reference for all future screen modifications and new feature development.

---

## 1. Core Color Palette (Gluestack Tokens)
All colors should be referenced using their gluestack-ui `$token` equivalents to maintain theme consistency. Avoid hardcoding hex values.

| Element | Token | Description |
| :--- | :--- | :--- |
| **App Background** | `$black` | True black creates contrast and saves battery on OLED screens. Used as the main screen wrapper. |
| **Card / Surface (Lv 1)** | `$backgroundDark900` | Slightly lighter than black, used for primary content cards, modals, and sticky headers. |
| **Card / Surface (Lv 2)** | `$backgroundDark950` | Very dark gray, used for nested inputs, inner boxes, or secondary data containers. |
| **Primary Accent** | `$amber400` | The signature "Aurum" gold. Used for primary buttons, active states, icons, and highlighting key data. |
| **Primary Text** | `$textLight50` | Bright white/off-white for all primary headings and body text. |
| **Secondary Text** | `$textDark400` | Muted gray for labels, subtitles, placeholder text, and non-critical data. |
| **Borders / Dividers**| `$borderDark800` | Subtle borders for separating sections and outlining cards. |
| **Destructive / Error**| `$red400` or `$red500` | Used sparingly for delete actions, error toasts, and critical warnings. |
| **Success** | `$green500` or `$lime400`| Used for success states, confirmations, and "Go" actions. |

---

## 2. Typography & Text Hierarchy
Aurum relies heavily on font weight and letter spacing rather than just size to establish hierarchy.

### Headings (The "Immersive" Look)
- **Main Titles (e.g., Dashboard, Manifest)**
  - Size: `size="3xl"` or `size="2xl"`
  - Weight: `$thin` or `$light`
  - Spacing: `letterSpacing={-1}` or normal
  - Color: `$textLight50`
- **Subtitles**
  - Size: `size="sm"` or `size="xs"`
  - Transformation: `textTransform="uppercase"`
  - Spacing: Wide (`letterSpacing={1}` or `{2}`)
  - Weight: `fontWeight="bold"`
  - Color: `$amber400` or `$textDark400`

### Body Text
- Standard readable size (`size="md"`).
- Keep it clean; use `$textSub` for descriptive text to avoid overwhelming the `$textLight50` elements.

---

## 3. UI Components & Layouts

### Cards & Containers
- **Border Radius**: Use rounded corners extensively. `$xl` or `$2xl` for big cards, `$lg` for standard inputs.
- **Borders**: Most cards should have a 1px border (`borderWidth={1}`, `borderColor={borderColor}`) to differentiate them from the absolute black background without relying purely on shadows.
- **Padding**: Generous padding (`p="$4"`, `p="$5"`, or `p="$6"`) to let content breathe.

### Buttons & Interactions
- **Primary Actions**: Solid background (`bg={accent}`), Text color mapped to `$black` for maximum contrast. Full rounded (`borderRadius="$full"`).
- **Secondary Actions**: Outline variants (`variant="outline"`, `borderColor={accent}`) with text matching the accent color.
- **Ghost/Link Actions**: Used for "Cancel" or "Back". Colored with `$textSub` or `$red500`.
- **Haptics**: Always couple major interactions (saving, deleting, toggling) with `expo-haptics` (e.g., `ImpactFeedbackStyle.Light` or `NotificationFeedbackType.Success`).

### Inputs
- **Background**: `$backgroundDark950`
- **Border Radius**: `$xl`
- **Height**: Generous touch targets (`size="xl"`, `h={56}` or `h={60}`).
- **Placeholder**: Colored with `$textDark400`.

---

## 4. The `AurumHeader` Component
The header dictates the "feel" of every screen. Import and use `src/components/AurumHeader`.

**Variant: `immersive`**
Use for top-level tabs (Dashboard). Features massive, thin typography and no back button. It establishes the screen's authority.

**Variant: `stack`**
Use for detail screens or settings (e.g., Profile, Restock).
- Features a circular back button with a thin border (`borderWidth={1}`, opacity 0.7).
- Combines a standard size Title with a small, tracked subtitle below it.

---

## 5. Motion & Animations
- **Library**: `moti` and `react-native-reanimated`.
- **Entrance**: Screens and cards should fade in and slide up slightly.
  - `from={{ opacity: 0, translateY: 10 }}`
  - `animate={{ opacity: 1, translateY: 0 }}`
  - `transition={{ type: 'timing', duration: 400, easing: Easing.out(Easing.exp) }}`
- No harsh, instant transitions. The app should feel fluid and responsive.

---

## 6. Boilerplate Screen Template

When creating a new screen, start with this skeleton to instantly achieve the Aurum look:

```tsx
import React from 'react';
import { Box, ScrollView, VStack, useToken } from '@gluestack-ui/themed';
import AurumHeader from '../src/components/AurumHeader';
import { useLanguage } from '../src/context/LanguageContext';

export default function NewFeatureScreen() {
    const { t } = useLanguage();
    
    // Tokens
    const screenBg = useToken('colors', 'black');
    const cardBg = useToken('colors', 'backgroundDark900');
    
    return (
        <Box flex={1} bg={screenBg}>
            <AurumHeader 
                title="Feature Title"
                subtitle="OPTIONAL SUBTITLE"
                variant="stack"
            />
            
            <ScrollView flex={1}>
                <VStack p="$4" space="lg">
                    {/* Content goes here */}
                </VStack>
            </ScrollView>
        </Box>
    );
}
```
