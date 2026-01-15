# Burpee Tracker

A minimalist, high-performance Progressive Web App (PWA) for tracking burpee workouts. Precision-engineered for speed, privacy, and visual excellence.

## ✨ Features

- **Tap +10**: Increment your count in seconds.
- **Goal Pursuit**: Set daily targets and hit them.
- **Streaks**: Track Current and Longest streaks with automated 4 AM rollover.
- **History**: Detailed breakdown of every set you've ever done.
- **Privacy First**: All data stays on your device (IndexedDB). No cloud required.
- **Data Sovereignty**: Export and Import your data as JSON anytime.
- **PWA**: Install it on your phone for a native-like experience.

## 🛠 Tech Stack

- **Runtime**: Vite & TypeScript
- **View Engine**: lit-html (Lite and fast)
- **Styling**: TailwindCSS
- **Database**: IndexedDB (via `idb`)
- **PWA**: `vite-plugin-pwa` for offline capability

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

## 🧪 Quality Assurance

We maintain high code quality through rigorous testing and linting:

- **Tests**: `npm run test` (Vitest)
- **Linting**: `npm run lint` (ESLint + TypeScript)
- **Formatting**: `npm run format` (Prettier)

## ⚖️ License

MIT © 2026
