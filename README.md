# AFRAH20 — A Night For Afrah 🎂✨

A cinematic, interactive birthday celebration experience built as a story-driven mini-game. This project celebrates Afrah's 20th birthday with engaging scenes, animations, and mini-games.

## 🌟 Features

- **Cinematic Intro**: Particle-filled cosmic scene with smooth GSAP animations
- **Midnight Countdown**: Interactive countdown to midnight with rotating Earth visual
- **Explorable Room**: 2.5D parallax room with clickable elements
- **Ladder Mini-Game**: Challenging climbing game with timing mechanics and progress tracking
- **Cake Slicing**: Interactive cake cutting with mouse-following knife
- **Candle Blowing**: Blow out candles using microphone or button
- **Gift Opening**: Six beautiful gifts with modal viewer
- **Accessibility**: Full keyboard navigation, ARIA labels, reduced motion support

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or similar package manager

### Installation

```bash
# Install dependencies
npm install
```

### Running the Development Server

```bash
# Start the development server
npm run dev
```

The app will be available at `http://localhost:5000`

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🎮 How to Play

1. **Intro Scene**: Click "Enter the Birthday House" or press Enter/Esc
2. **Midnight Scene**: Press Enter to start the countdown from 1-20
3. **Room Scene**: Click on cake, ladder, or gifts to explore different activities
4. **Ladder Game**: Click or press Space/↑ to climb. Reach milestone 20 to unlock all gifts!
5. **Cake Scene**: Move mouse to control knife, click to slice the cake
6. **Candle Scene**: Use microphone or click button to blow out candles
7. **Gifts Scene**: Click each gift box to open and reveal surprises

## 🎨 Customization

### Replacing Assets

#### Wallpaper
Replace or add GIF wallpapers in `client/public/assets/wallpaper/`

#### Cake SVGs
Add custom cake designs to `client/public/assets/cakes/`

#### Audio
Replace audio files in `client/public/sounds/`:
- `background.mp3` - Background music loop
- `success.mp3` - Success/celebration sound
- `hit.mp3` - Interaction sound effect

#### Gift Content
Edit gift content in `client/src/components/scenes/GiftsScene.tsx` or add files to `client/public/assets/gifts/`

#### Motivational Quotes
Edit quotes in `client/public/data/manifest.json`

## 🎯 Scene Flow

```
Intro → Midnight → Room → (Ladder/Cake/Gifts) → Candle → Gifts Finale
```

See `TIMELINES.md` for detailed animation timelines.

## ⌨️ Keyboard Shortcuts

- **Enter**: Start countdown, confirm actions
- **Escape**: Skip intro
- **Space / ↑**: Climb ladder
- **Tab**: Navigate UI elements
- **Arrow Keys**: Navigate (in applicable scenes)

## ♿ Accessibility

- Full keyboard navigation
- ARIA labels and roles
- Screen reader friendly
- Reduced motion mode (respects system preferences)
- High contrast mode toggle
- Focus management in modals

## 🛠️ Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **GSAP** - Cinematic animations
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Radix UI** - Accessible components
- **Vite** - Build tool
- **Express** - Server

## 📱 Deployment

### GitHub Pages

1. Build the project: `npm run build`
2. Deploy the `dist/public` folder to GitHub Pages
3. Configure your repository settings to serve from the correct branch

### Vercel/Netlify

1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist/public`

## 📄 License

MIT License - feel free to customize for your own celebrations!

## 🎉 Credits

Created with love for Afrah's 20th Birthday celebration.

---

**Happy Birthday, Afrah! 🎂🎊**
