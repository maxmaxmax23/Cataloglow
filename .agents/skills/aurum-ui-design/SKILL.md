---
name: Aurum Design System
description: Core UI framework and design language for the Glow application. Use this skill when modifying or creating new UI screens and components.
---
# Aurum Design System & UI Guidelines

The **Aurum** (Latin for "gold") aesthetic aims to provide an immersive, luxurious, and highly professional user experience by combining stark contrasts (true blacks vs. amber accents), thin & spacious typography, and subtle, smooth animations.

## 1. Core Color Palette (Gluestack Tokens)
All colors should be referenced using their gluestack-ui `$token` equivalents. Avoid hardcoding hex values.

| Element | Token | Description |
| :--- | :--- | :--- |
| **App Background** | `$black` | True black creates contrast and saves battery on OLED screens. |
| **Card / Surface (Lv 1)** | `$backgroundDark900` | Slightly lighter than black, for primary content cards, modals, headers. |
| **Card / Surface (Lv 2)** | `$backgroundDark950` | Very dark gray, used for nested inputs, inner boxes. |
| **Primary Accent** | `$amber400` | Signature "Aurum" gold. Primary buttons, active states, highlights. |
| **Primary Text** | `$textLight50` | Bright white/off-white for primary headings and body text. |
| **Secondary Text** | `$textDark400` | Muted gray for labels, subtitles, placeholders. |
| **Borders / Dividers**| `$borderDark800` | Subtle borders for separating sections and outlining cards. |
| **Destructive / Error**| `$red400` or `$red500` | Delete actions, error toasts, critical warnings. |
| **Success** | `$green500` or `$lime400`| Success states, confirmations, "Go" actions. |

## 2. Typography & Text Hierarchy
Aurum relies heavily on font weight and letter spacing to establish hierarchy.

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
- Keep it clean; use `$textSub` for descriptive text to avoid overwhelming `$textLight50` elements.

## 3. UI Components & Layouts

### Cards & Containers
- **Border Radius**: `$xl` or `$2xl` for big cards, `$lg` for standard inputs.
- **Borders**: Most cards should have a 1px border (`borderWidth={1}`, `borderColor={borderColor}`).
- **Padding**: Generous padding (`p="$4"`, `p="$5"`, or `p="$6"`).

### Buttons & Interactions
- **Primary Actions**: Solid background (`bg={accent}`), Text color mapped to `$black`. Full rounded (`borderRadius="$full"`).
- **Secondary Actions**: Outline variants (`variant="outline"`, `borderColor={accent}`) with text matching accent.
- **Ghost/Link Actions**: Colored with `$textSub` or `$red500`.
- **Haptics**: Couple major interactions with `expo-haptics` (e.g., `ImpactFeedbackStyle.Light`).

### Inputs
- **Background**: `$backgroundDark950`
- **Border Radius**: `$xl`
- **Height**: Generous touch targets (`size="xl"`, `h={56}` or `h={60}`).
- **Placeholder**: Colored with `$textDark400`.

## 4. The `AurumHeader` Component
Import and use `src/components/AurumHeader`.

- **Variant: `immersive`**: For top-level tabs. Massive typography, no back button.
- **Variant: `stack`**: For detail screens. Circular back button, standard title with tracked subtitle.

## 5. Motion & Animations
- **Library**: `moti` and `react-native-reanimated`.
- **Entrance**: Fades in and slides up slightly (`translateY: 10` to `0`, opacity `0` to `1`).
- No harsh, instant transitions. Fluid and responsive.

## 6. Design with Intent (UX Strategy & Ethics)
When polishing UI/UX, structuring user flows, or making design decisions, you **MUST** consult the comprehensive UX strategy guidelines provided in the `references/intent/` repository.
Specifically, refer to:
- `references/intent/README.md` for the overarching UX principles and agent directives.
- `references/intent/intent/SKILL.md` (and related specialized skills like `journey` or `organize`) for structural guidance and the anti-pattern catalog to ensure ethical design choices.

## 7. Impeccable Design Standards
For extremely detailed UI/UX interaction standards, you **MUST** also reference the `impeccable` guidelines:
- `references/impeccable/README.md` for interaction design patterns and rules.

*See `examples/BoilerplateScreen.tsx` for a standard screen skeleton.*
