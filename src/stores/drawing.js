import { defineStore } from 'pinia'

export const useDrawingStore = defineStore('drawing', {
  state: () => ({
    // Grid settings
    gridSize: 20,        // pixels per grid square
    gridUnit: 1,         // meters per grid square
    scale: '1:100',      // drawing scale
    maxSqm: 200,         // maximum square meters
    pricePerSqm: 25000,  // SEK per square meter
    wallThickness: 2,    // outer wall stroke width in pixels
    innerWallThickness: 1, // inner wall stroke width in pixels

    // Drawing tool
    currentTool: 'select', // 'select', 'line', 'door', 'window', 'room-polygon', 'calibrate'

    // Multi-floor structure
    floors: [
      { id: '1', name: 'Floor 1', elements: [] }
    ],
    currentFloorId: '1',

    // Selection
    selectedElementId: null,

    // History for undo/redo (per floor)
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

    // Background reference image (shared across floors)
    backgroundImage: {
      dataUrl: null,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      opacity: 0.5,
      locked: false,
    },
  }),

  getters: {
    currentFloor: (state) => {
      return state.floors.find(f => f.id === state.currentFloorId) || state.floors[0]
    },

    currentFloorElements: (state) => {
      const floor = state.floors.find(f => f.id === state.currentFloorId)
      return floor ? floor.elements : []
    },

    currentFloorSqm: (state) => {
      const floor = state.floors.find(f => f.id === state.currentFloorId)
      if (!floor) return 0

      let total = 0
      floor.elements.forEach(element => {
        if (element.type === 'polygon' && element.area) {
          total += element.area
        }
      })
      return total
    },

    totalBuildingSqm: (state) => {
      let total = 0
      state.floors.forEach(floor => {
        floor.elements.forEach(element => {
          if (element.type === 'polygon' && element.area) {
            total += element.area
          }
        })
      })
      return total
    },

    // Keep for backward compat
    totalSqm(state) {
      return this.totalBuildingSqm
    },

    totalPrice(state) {
      return this.totalBuildingSqm * state.pricePerSqm
    },

    exceedsMaxSqm(state) {
      return this.totalBuildingSqm > state.maxSqm
    },

    metersPerPixel: (state) => {
      return state.gridUnit / state.gridSize
    },

    selectedElement(state) {
      if (!state.selectedElementId) return null
      const floor = state.floors.find(f => f.id === state.currentFloorId)
      if (!floor) return null
      return floor.elements.find(el => el.id === state.selectedElementId) || null
    },
  },

  actions: {
    setTool(tool) {
      this.currentTool = tool
      // Clear selection when changing tools
      if (tool !== 'select') {
        this.selectedElementId = null
      }
    },

    selectElement(id) {
      this.selectedElementId = id
    },

    clearSelection() {
      this.selectedElementId = null
    },

    // Floor management
    addFloor() {
      const newId = String(Date.now())
      const newFloor = {
        id: newId,
        name: `Floor ${this.floors.length + 1}`,
        elements: []
      }
      this.floors.push(newFloor)
      this.currentFloorId = newId
      this.history = []
      this.historyIndex = -1
    },

    duplicateFloor(floorId) {
      const sourceFloor = this.floors.find(f => f.id === floorId)
      if (!sourceFloor) return

      const newId = String(Date.now())
      const newFloor = {
        id: newId,
        name: `${sourceFloor.name} (Copy)`,
        elements: JSON.parse(JSON.stringify(sourceFloor.elements)).map(el => ({
          ...el,
          id: String(Date.now()) + Math.random()
        }))
      }
      this.floors.push(newFloor)
      this.currentFloorId = newId
      this.history = [JSON.parse(JSON.stringify(newFloor.elements))]
      this.historyIndex = 0
    },

    deleteFloor(floorId) {
      if (this.floors.length === 1) return // Can't delete last floor

      const index = this.floors.findIndex(f => f.id === floorId)
      if (index === -1) return

      this.floors.splice(index, 1)

      // Switch to first floor if current was deleted
      if (floorId === this.currentFloorId) {
        this.currentFloorId = this.floors[0].id
        const floor = this.floors[0]
        this.history = [JSON.parse(JSON.stringify(floor.elements))]
        this.historyIndex = 0
      }
    },

    setCurrentFloor(floorId) {
      const floor = this.floors.find(f => f.id === floorId)
      if (!floor) return

      this.currentFloorId = floorId
      this.selectedElementId = null
      // Reset history to current floor's elements
      this.history = [JSON.parse(JSON.stringify(floor.elements))]
      this.historyIndex = 0
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
      const floor = this.floors.find(f => f.id === this.currentFloorId)
      if (!floor) return

      floor.elements.push(element)
      this.saveToHistory()
    },

    removeElement(id) {
      const floor = this.floors.find(f => f.id === this.currentFloorId)
      if (!floor) return

      floor.elements = floor.elements.filter(el => el.id !== id)
      this.saveToHistory()
    },

    updateElement(id, updates) {
      const floor = this.floors.find(f => f.id === this.currentFloorId)
      if (!floor) return

      const index = floor.elements.findIndex(el => el.id === id)
      if (index !== -1) {
        floor.elements[index] = { ...floor.elements[index], ...updates }
        this.saveToHistory()
      }
    },

    saveToHistory() {
      const floor = this.floors.find(f => f.id === this.currentFloorId)
      if (!floor) return

      // Remove any future history if we're not at the end
      this.history = this.history.slice(0, this.historyIndex + 1)

      // Add current state to history
      this.history.push(JSON.parse(JSON.stringify(floor.elements)))
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
        const floor = this.floors.find(f => f.id === this.currentFloorId)
        if (floor) {
          floor.elements = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
        }
      }
    },

    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++
        const floor = this.floors.find(f => f.id === this.currentFloorId)
        if (floor) {
          floor.elements = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
        }
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
      const oldGridUnit = this.gridUnit
      Object.assign(this, settings)

      // If gridUnit changed, recalculate all areas
      if (settings.gridUnit !== undefined && settings.gridUnit !== oldGridUnit) {
        this.recalculateAllAreas()
      }
    },

    recalculateAllAreas() {
      // Recalculate area for all elements on all floors when scale changes
      this.floors.forEach(floor => {
        floor.elements = floor.elements.map(element => {
          if (element.type === 'polygon' || element.type === 'room-polygon') {
            return {
              ...element,
              area: this.calculatePolygonArea(element.points)
            }
          }
          return element
        })
      })
    },

    clearDrawing() {
      this.floors = [{ id: '1', name: 'Floor 1', elements: [] }]
      this.currentFloorId = '1'
      this.history = []
      this.historyIndex = -1
      this.currentDrawingId = null
      this.currentDrawingName = ''
    },

    setBackgroundImage(imageData) {
      this.backgroundImage = {
        ...this.backgroundImage,
        ...imageData
      }
    },

    updateBackgroundImage(updates) {
      this.backgroundImage = {
        ...this.backgroundImage,
        ...updates
      }
    },

    clearBackgroundImage() {
      this.backgroundImage = {
        dataUrl: null,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        opacity: 0.5,
        locked: false,
      }
    },

    loadDrawing(drawing) {
      // Migrate old format (elements array) to new format (floors array)
      if (drawing.elements && !drawing.floors) {
        this.floors = [{
          id: '1',
          name: 'Floor 1',
          elements: drawing.elements || []
        }]
        this.currentFloorId = '1'
      } else {
        this.floors = drawing.floors || [{ id: '1', name: 'Floor 1', elements: [] }]
        this.currentFloorId = drawing.current_floor_id || drawing.currentFloorId || this.floors[0].id
      }

      this.gridSize = drawing.settings?.gridSize || 20
      this.gridUnit = drawing.settings?.gridUnit || 1
      this.scale = drawing.settings?.scale || '1:100'
      this.maxSqm = drawing.settings?.maxSqm || 200
      this.pricePerSqm = drawing.settings?.pricePerSqm || 25000
      this.wallThickness = drawing.settings?.wallThickness || 2
      this.innerWallThickness = drawing.settings?.innerWallThickness || 1
      this.currentDrawingId = drawing.id
      this.currentDrawingName = drawing.name

      // Reset history to current floor
      const currentFloor = this.floors.find(f => f.id === this.currentFloorId)
      this.history = [JSON.parse(JSON.stringify(currentFloor?.elements || []))]
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
          wallThickness: this.wallThickness,
          innerWallThickness: this.innerWallThickness,
        },
        floors: this.floors,
        current_floor_id: this.currentFloorId,
        total_sqm: this.totalBuildingSqm,
      }
    },
  },
})
