# Animation Timelines Documentation

This document describes the GSAP animation timelines used throughout AFRAH20.

## Scene Transitions (SceneRouter)

### Exit Animation
```javascript
timeline
  .to(container, {
    opacity: 0,
    scale: 0.95,
    duration: 0.5,
    ease: 'power3.in'
  })
```

### Entry Animation
```javascript
timeline
  .to(container, {
    opacity: 1,
    scale: 1,
    duration: 0.8,
    ease: 'power3.out'
  })
```

**Total Duration**: ~1.3 seconds per scene transition

---

## Intro Scene

### Title Reveal
```javascript
timeline
  .from(title, {
    opacity: 0,
    y: -50,
    scale: 0.8,
    duration: 1.5,
    ease: 'back.out(1.7)'
  })
```

### Subtitle Fade
```javascript
timeline
  .from(subtitle, {
    opacity: 0,
    y: 20,
    duration: 1,
    ease: 'power3.out'
  }, '-=0.8')  // Overlaps by 0.8s
```

### Button Bounce
```javascript
timeline
  .from(button, {
    opacity: 0,
    scale: 0.8,
    duration: 0.8,
    ease: 'elastic.out(1, 0.5)'
  }, '-=0.5')  // Overlaps by 0.5s
```

**Total Timeline Duration**: ~2.0 seconds

---

## Midnight Scene

### Earth Rotation
```javascript
gsap.to(earth, {
  rotation: 360,
  duration: 20,  // 2 seconds when countdown > 18
  ease: 'none',
  repeat: -1
})
```

### Countdown Number Animation
```javascript
gsap.fromTo(number,
  { scale: 0.5, opacity: 0 },
  { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
)
```

**Frequency**: Every 800ms for 20 counts = 16 seconds total

---

## Room Scene

### Wallpaper Parallax
```javascript
gsap.fromTo(wallpaper,
  { y: 0 },
  { 
    y: -20,
    duration: 8,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  }
)
```

### Interactive Element Float
```javascript
gsap.fromTo(element,
  { y: 0 },
  {
    y: -10,
    duration: 2 + (index * 0.5),
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    delay: index * 0.3
  }
)
```

### Cat Animation
```javascript
gsap.to(cat, {
  x: 20,
  duration: 3,
  ease: 'sine.inOut',
  repeat: -1,
  yoyo: true
})
```

**All animations loop infinitely**

---

## Ladder Scene

### Successful Climb
```javascript
gsap.to(character, {
  y: -40 * progress,
  x: (side === 'left' ? 1 : -1) * 30,
  duration: 0.3,
  ease: 'power2.out'
})
```

### Fall Animation (Failure)
```javascript
timeline
  .to(character, {
    scaleY: 0.7,
    scaleX: 1.2,
    duration: 0.2,
    ease: 'power2.in'
  })
  .to(character, {
    y: 0,
    scaleY: 1,
    scaleX: 1,
    duration: 0.5,
    ease: 'bounce.out'
  })
```

**Climb Timing Window**: 300-800ms random

---

## Cake Scene

### Knife Follow (Mouse)
```javascript
gsap.to(knifePos, {
  x: targetX,
  y: targetY,
  duration: 0.3,
  ease: 'power2.out'
})
```

### Slice Reveal
```javascript
gsap.fromTo(slice,
  { scale: 0, opacity: 0, rotation: -45 },
  { 
    scale: 1,
    opacity: 1,
    rotation: 0,
    duration: 0.5,
    ease: 'back.out(1.7)'
  }
)
```

**Lag Duration**: 300ms for smooth knife trailing

---

## Candle Scene

### Flame Flicker (Before Blow)
```javascript
gsap.to(flame, {
  scaleY: 1.1,
  opacity: 0.9,
  duration: 0.3,
  ease: 'sine.inOut',
  repeat: -1,
  yoyo: true
})
```

### Blow Out Animation
```javascript
timeline
  .to(flame, {
    scaleX: 0.5,
    x: -10,
    duration: 0.2,
    ease: 'power2.in'
  })
  .to(flame, {
    opacity: 0,
    scale: 0,
    duration: 0.3,
    ease: 'power2.out'
  })
```

**Total Blow Duration**: 0.5 seconds

---

## Gifts Scene

### Gift Box Float
```javascript
gsap.to(giftBox, {
  y: -15,
  duration: 1.5 + (index * 0.2),
  ease: 'sine.inOut',
  repeat: -1,
  yoyo: true,
  delay: index * 0.1
})
```

**Staggered by**: 100ms per gift (6 total)

---

## Animation Easings Reference

### Used Throughout
- **`back.out(1.7)`** - Bouncy overshoot (intro title)
- **`elastic.out(1, 0.5)`** - Springy bounce (buttons)
- **`power2.out`** - Smooth deceleration (movements)
- **`power3.in`** - Quick acceleration (exits)
- **`power3.out`** - Smooth deceleration (entrances)
- **`sine.inOut`** - Smooth oscillation (floating elements)
- **`bounce.out`** - Bouncy landing (ladder fall)

---

## Performance Considerations

- All animations respect `prefers-reduced-motion` media query
- Particle systems limited to 250 particles max
- Infinite loops use `repeat: -1` with `yoyo: true` for efficiency
- Timeline cleanup with `.kill()` in component unmount
- GPU-accelerated properties: `opacity`, `scale`, `rotation`, `x`, `y`

---

## Customization Tips

1. **Speed up all animations**: Multiply all durations by 0.5
2. **Make more dramatic**: Increase scale/y values by 1.5x
3. **Add bounce**: Replace `power3.out` with `elastic.out(1, 0.3)`
4. **Smooth motion**: Use `sine.inOut` for gentler feel
5. **Instant transitions**: Set `duration: 0` and `settings.reducedMotion: true`

---

**Total Interactive Runtime**: ~30-60 seconds depending on user pace
