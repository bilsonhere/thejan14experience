# AFRAH20 - A Night For Afrah

## Overview

AFRAH20 is an interactive, cinematic birthday celebration experience designed as a story-driven mini-game. Built as a single-page application (SPA), it guides users through multiple scenes including a cosmic intro, midnight countdown, explorable room, ladder climbing game, cake slicing, candle blowing, and gift opening. The application emphasizes smooth animations, particle effects, and accessibility features to create an engaging, game-like experience that celebrates Afrah's 20th birthday.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for fast HMR and optimized production builds
- Client-side routing managed through a custom scene-based navigation system

**State Management:**
- Zustand stores for global state management (`useSceneStore` for scene navigation and settings)
- Local state management using React hooks for component-specific state
- LocalStorage integration for persisting game progress (ladder progress, opened gifts, etc.)

**Animation & Visual Effects:**
- GSAP (GreenSock Animation Platform) for timeline-based animations and scene transitions
- Custom particle system with canvas rendering for cosmic/ambient effects
- React Three Fiber and Drei for potential 3D elements
- Post-processing effects support via @react-three/postprocessing
- Smooth transitions between scenes with opacity and scale animations (~1.3 seconds per transition)

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components (dialogs, dropdowns, menus, etc.)
- Custom-styled components using Tailwind CSS with CSS custom properties for theming
- Dark theme with cosmic gradient aesthetics (indigo-purple-pink palette)
- Shadcn/ui component patterns with class-variance-authority for variant management

**Accessibility Features:**
- Full keyboard navigation support
- ARIA labels and semantic HTML
- Reduced motion support respecting `prefers-reduced-motion` media query
- High contrast mode toggle
- Screen reader friendly component structure

**Audio System:**
- Custom `AudioManager` class for centralized sound control
- Background ambient music with volume control
- Sound effects for interactions (success, hits, etc.)
- Mute/unmute functionality with persistent state

**Scene System:**
- Seven distinct scenes: intro, midnight, room, ladder, cake, candle, gifts
- `SceneRouter` component manages scene transitions with entry/exit animations
- Each scene is a self-contained React component with its own lifecycle
- Progress tracking across scenes with milestone achievements

### Backend Architecture

**Server Framework:**
- Express.js server with TypeScript
- Dual-mode operation: development (with Vite middleware) and production (static file serving)
- Custom logging middleware for API request tracking
- Session management capability via connect-pg-simple (configured but minimal usage)

**Database Layer:**
- Drizzle ORM configured for PostgreSQL via @neondatabase/serverless
- Schema defined in `shared/schema.ts` for type-safe database operations
- Migration support via drizzle-kit
- Storage interface abstraction (`IStorage`) with in-memory implementation for development

**API Design:**
- RESTful API structure with `/api` prefix routing
- Minimal backend requirements - primarily static asset serving
- CRUD operations abstracted through storage interface for future extensibility

### External Dependencies

**Core Libraries:**
- `gsap` - Professional-grade animation library for timeline control
- `react-query` (@tanstack/react-query) - Server state management and caching
- `zustand` - Lightweight state management
- `react-confetti` - Celebratory visual effects for milestones
- `react-day-picker` & `date-fns` - Date handling utilities

**Database & ORM:**
- `drizzle-orm` - TypeScript ORM for PostgreSQL
- `@neondatabase/serverless` - Serverless Postgres driver
- `drizzle-zod` - Zod schema validation integration

**UI & Styling:**
- `tailwindcss` - Utility-first CSS framework
- `@fontsource/inter` - Self-hosted Inter font
- `class-variance-authority` & `clsx` - Dynamic className management
- Complete Radix UI component suite for accessible primitives

**3D Graphics (Optional/Enhanced):**
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers for R3F
- `@react-three/postprocessing` - Post-processing effects
- `vite-plugin-glsl` - GLSL shader support in Vite

**Build Tools:**
- `vite` - Next-generation frontend build tool
- `esbuild` - Fast JavaScript bundler for server code
- `tsx` - TypeScript execution for development
- `@replit/vite-plugin-runtime-error-modal` - Enhanced error handling in Replit

**Development Utilities:**
- `nanoid` - Unique ID generation for cache-busting
- `cmdk` - Command palette component
- `input-otp`, `embla-carousel-react`, `vaul` - Additional UI utilities

**Asset Support:**
- GLTF/GLB 3D models
- MP3/OGG/WAV audio files
- SVG graphics for cakes, candles, and UI elements
- JSON data files for quotes, milestones, and gift content