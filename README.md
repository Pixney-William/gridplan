# GridPlan

House floor plan designer with grid-based drawing, measurement calculations, and pricing estimates.

**Domain available:** gridplan.io

## Features

### Drawing Tools
- **Line Tool** - Draw walls with snap-to-grid
- **Door Tool** - Place door symbols (arc)
- **Window Tool** - Place window symbols (rectangle)
- **Room Tool** - Draw rooms with automatic sqm calculation

### Grid System
- Configurable grid size (pixels per square)
- Define meters per grid square
- Scale ratio (e.g., 1:100)
- Visual grid overlay

### Measurements
- Real-time sqm calculation from room shapes
- Max sqm warning (default: 200m²)
- Price estimation (SEK per sqm)
- Total cost display
- Area labels on rooms

### Canvas Controls
- Zoom with mouse wheel
- Pan with middle mouse or Ctrl+drag
- Undo/Redo functionality
- Clear canvas

### Persistence
- Save drawings to Supabase
- Load saved drawings
- Delete drawings
- Auto-naming with timestamps

### Export
- Export canvas to PNG

## Tech Stack

- **Frontend:** Vue 3, Vite, TailwindCSS
- **Canvas:** Konva.js, vue-konva
- **State:** Pinia
- **Backend:** Supabase (PostgreSQL)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL from `supabase/schema.sql` in SQL Editor
4. Get API credentials from Settings > API

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Usage

### Drawing Workflow

1. **Configure Grid** - Set grid size, meters/square, scale in left sidebar
2. **Set Budget** - Define max sqm and price/sqm (SEK)
3. **Draw Walls** - Select Line tool, click and drag
4. **Add Rooms** - Select Room tool, drag to create measured areas
5. **Place Elements** - Add doors and windows as needed
6. **Monitor Metrics** - Watch sqm total and price in sidebar
7. **Save** - Click Save button (requires Supabase setup)
8. **Export** - Export PNG for sharing

### Keyboard Shortcuts

- **Ctrl + Mouse Drag** - Pan canvas
- **Mouse Wheel** - Zoom in/out
- **Ctrl + Z** - Undo *(coming soon)*
- **Ctrl + Y** - Redo *(coming soon)*

### Grid Configuration

**Example Settings:**
- Grid size: 20px
- Meters per square: 1m
- Scale: 1:100
- Result: Each 20px square = 1m² in real life at 1:100 scale

**Calculation:**
- Room 100px × 200px = 5 × 10 grid squares = 50m²

## Configuration Defaults

```javascript
gridSize: 20px          // Pixels per grid square
gridUnit: 1m            // Meters per grid square
scale: '1:100'          // Drawing scale
maxSqm: 200m²           // Warning threshold
pricePerSqm: 25000 SEK  // Price per square meter
```

## Database Schema

```sql
CREATE TABLE drawings (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  settings JSONB NOT NULL,
  elements JSONB NOT NULL,
  total_sqm NUMERIC,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Project Structure

```
gridplan/
├── src/
│   ├── components/
│   │   ├── DrawingCanvas.vue    # Konva canvas with grid
│   │   ├── Toolbar.vue          # Tool selection, save, export
│   │   ├── GridConfig.vue       # Grid/scale settings
│   │   ├── MeasurementPanel.vue # Sqm/price display
│   │   └── SavedDrawings.vue    # Load/delete drawings
│   ├── stores/
│   │   └── drawing.js           # Pinia state management
│   ├── utils/
│   │   ├── supabase.js          # Supabase client
│   │   └── drawingService.js    # CRUD operations
│   ├── App.vue                  # Main layout
│   ├── main.js                  # App initialization
│   └── style.css                # Global styles + Tailwind
├── supabase/
│   └── schema.sql               # Database schema
└── package.json
```

## Future Enhancements

### v2 Features
- Multi-floor support
- Drawing versions/history
- Templates (common room layouts)
- Furniture placement
- Wall thickness
- Measurement annotations
- Copy/paste sections
- Keyboard shortcuts
- Export to PDF/SVG
- Sharing (public links)
- User authentication

### v3 Features
- 3D preview
- Material costs
- Regulatory compliance checks
- Collaborative editing
- Mobile app

## License

MIT

## Domain

**gridplan.io** - Available for registration
