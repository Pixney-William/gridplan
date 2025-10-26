# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GridPlan - Vue 3 floor plan designer using Konva.js canvas with grid-based drawing, real-time measurement calculations, and Supabase persistence.

## Commands

### Development
```bash
npm run dev        # Start Vite dev server (port 5173)
npm run build      # Build for production
npm run preview    # Preview production build
```

### Environment Setup
```bash
cp .env.example .env
# Then edit .env with Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup
Run `supabase/schema.sql` in Supabase SQL Editor to create the `drawings` table.

## Architecture

### State Management (Pinia)
All app state lives in `src/stores/drawing.js`:
- **Grid settings**: gridSize (px), gridUnit (meters), scale ratio
- **Drawing state**: currentTool, elements array, zoom/pan
- **History**: Undo/redo using snapshots (50 state limit)
- **Getters**: totalSqm, totalPrice, metersPerPixel calculations

### Canvas Architecture (Konva/vue-konva)
`src/components/DrawingCanvas.vue` manages 2 layers:
1. **Grid layer**: Dynamically generated lines based on gridSize
2. **Drawing layer**: Renders elements by type (line, door, window, room)

**Drawing flow**:
- Mouse down → snap to grid → start drawing
- Mouse move → update preview (dashed)
- Mouse up → finalize element, add to store, save to history

**Pan/zoom**:
- Middle mouse or Ctrl+drag for panning
- Mouse wheel for zoom (0.1x - 5x scale)
- Zoom preserves cursor position using transform math

### Element Types
Elements stored as objects with type-specific properties:
- `line`: { type, id, points: [x1,y1,x2,y2] }
- `room`: { type, id, x, y, width, height, area (sqm) }
- `door`: { type, id, x, y, radius, rotation }
- `window`: { type, id, x, y, width, height, rotation }

Area calculation: `(pixels * metersPerPixel)^2` where `metersPerPixel = gridUnit / gridSize`

### Persistence (Supabase)
`src/utils/drawingService.js` provides CRUD operations:
- Drawings stored as JSONB: { name, settings, elements, total_sqm }
- No authentication (open policy - see schema.sql warning)
- Auto-timestamps on create/update

### Component Structure
- **App.vue**: Layout wrapper (toolbar + sidebar + canvas)
- **Toolbar.vue**: Tool selection, save/export/clear actions
- **GridConfig.vue**: Grid/scale/budget settings form
- **MeasurementPanel.vue**: Real-time sqm/price display with warnings
- **SavedDrawings.vue**: List/load/delete saved drawings
- **DrawingCanvas.vue**: Main Konva stage with drawing logic

## Key Patterns

### Grid Snapping
All drawing coordinates snap via: `Math.round(value / gridSize) * gridSize`

### History Management
- Save snapshot after every element add/update/remove
- Undo/redo navigate history array by index
- History limited to 50 states (FIFO)

### Relative Positioning
Stage transforms (zoom/pan) require converting pointer position:
```js
const transform = stage.getAbsoluteTransform().copy().invert()
const relativePos = transform.point(pointerPos)
```

## Currency & Units
- Currency: SEK (Swedish Krona)
- Measurements: Metric (meters, square meters)
- Scale format: String like '1:100'
