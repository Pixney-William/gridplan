import { defineStore } from 'pinia'

export const useDrawingStore = defineStore('drawing', {
  state: () => ({
    // Grid settings
    gridSize: 20,        // pixels per grid square
    gridUnit: 1,         // meters per grid square
    scale: '1:100',      // drawing scale
    maxSqm: 200,         // maximum square meters
    pricePerSqm: 25000,  // SEK per square meter

    // Drawing tool
    currentTool: 'line', // 'line', 'door', 'window', 'room'

    // Drawing elements
    elements: [],

    // History for undo/redo
    history: [],
    historyIndex: -1,

    // Canvas
    zoom: 1,
    panX: 0,
    panY: 0,

    // Drawing state
    isDrawing: false,
    currentDrawing: null,

    // Saved drawings
    currentDrawingId: null,
    currentDrawingName: '',
  }),

  getters: {
    totalSqm: (state) => {
      // Calculate total square meters from all elements
      let total = 0

      state.elements.forEach(element => {
        if (element.type === 'line') {
          // Lines don't contribute to area directly
        } else if (element.type === 'polygon' && element.area) {
          total += element.area
        } else if (element.area) {
          total += element.area
        }
      })

      return total
    },

    totalPrice: (state) => {
      const total = state.totalSqm
      return total * state.pricePerSqm
    },

    exceedsMaxSqm: (state) => {
      return state.totalSqm > state.maxSqm
    },

    metersPerPixel: (state) => {
      return state.gridUnit / state.gridSize
    },
  },

  actions: {
    setTool(tool) {
      this.currentTool = tool
    },

    calculatePolygonArea(points) {
      // Shoelace formula for polygon area
      // points is [x1, y1, x2, y2, ..., xn, yn]
      if (points.length < 6) return 0 // Need at least 3 points

      let area = 0
      const n = points.length / 2

      for (let i = 0; i < n; i++) {
        const x1 = points[i * 2]
        const y1 = points[i * 2 + 1]
        const x2 = points[((i + 1) % n) * 2]
        const y2 = points[((i + 1) % n) * 2 + 1]
        area += x1 * y2 - x2 * y1
      }

      const areaInPixels = Math.abs(area) / 2
      const areaInMeters = areaInPixels * (this.metersPerPixel ** 2)
      return areaInMeters
    },

    addElement(element) {
      this.elements.push(element)
      this.saveToHistory()
    },

    removeElement(id) {
      this.elements = this.elements.filter(el => el.id !== id)
      this.saveToHistory()
    },

    updateElement(id, updates) {
      const index = this.elements.findIndex(el => el.id === id)
      if (index !== -1) {
        this.elements[index] = { ...this.elements[index], ...updates }
        this.saveToHistory()
      }
    },

    saveToHistory() {
      // Remove any future history if we're not at the end
      this.history = this.history.slice(0, this.historyIndex + 1)

      // Add current state to history
      this.history.push(JSON.parse(JSON.stringify(this.elements)))
      this.historyIndex++

      // Limit history to 50 states
      if (this.history.length > 50) {
        this.history.shift()
        this.historyIndex--
      }
    },

    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--
        this.elements = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      }
    },

    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++
        this.elements = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      }
    },

    canUndo() {
      return this.historyIndex > 0
    },

    canRedo() {
      return this.historyIndex < this.history.length - 1
    },

    setZoom(zoom) {
      this.zoom = Math.max(0.1, Math.min(5, zoom))
    },

    setPan(x, y) {
      this.panX = x
      this.panY = y
    },

    updateSettings(settings) {
      Object.assign(this, settings)
    },

    clearDrawing() {
      this.elements = []
      this.history = []
      this.historyIndex = -1
      this.currentDrawingId = null
      this.currentDrawingName = ''
    },

    loadDrawing(drawing) {
      this.elements = drawing.elements || []
      this.gridSize = drawing.settings?.gridSize || 20
      this.gridUnit = drawing.settings?.gridUnit || 1
      this.scale = drawing.settings?.scale || '1:100'
      this.maxSqm = drawing.settings?.maxSqm || 200
      this.pricePerSqm = drawing.settings?.pricePerSqm || 25000
      this.currentDrawingId = drawing.id
      this.currentDrawingName = drawing.name

      // Reset history
      this.history = [JSON.parse(JSON.stringify(this.elements))]
      this.historyIndex = 0
    },

    getDrawingData() {
      return {
        name: this.currentDrawingName || `Drawing ${new Date().toLocaleString()}`,
        settings: {
          gridSize: this.gridSize,
          gridUnit: this.gridUnit,
          scale: this.scale,
          maxSqm: this.maxSqm,
          pricePerSqm: this.pricePerSqm,
        },
        elements: this.elements,
        total_sqm: this.totalSqm,
      }
    },
  },
})
