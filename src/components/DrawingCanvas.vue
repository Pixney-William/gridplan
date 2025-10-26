<template>
  <div ref="container" class="w-full h-full bg-white">
    <v-stage
      ref="stage"
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
    >
      <!-- Background image layer -->
      <v-layer ref="backgroundLayer">
        <v-image
          v-if="backgroundImageObj"
          :config="{
            image: backgroundImageObj,
            x: store.backgroundImage.x,
            y: store.backgroundImage.y,
            width: store.backgroundImage.width,
            height: store.backgroundImage.height,
            opacity: store.backgroundImage.opacity,
            draggable: !store.backgroundImage.locked && store.currentTool === 'select',
          }"
          @dragend="handleImageDragEnd"
        />
      </v-layer>

      <!-- Grid layer -->
      <v-layer ref="gridLayer">
        <v-line
          v-for="(line, i) in gridLines"
          :key="'grid-' + i"
          :config="line"
        />
      </v-layer>

      <!-- Drawing layer -->
      <v-layer ref="drawingLayer">
        <!-- Render lines -->
        <v-line
          v-for="element in store.elements.filter(el => el.type === 'line')"
          :key="element.id"
          :config="{
            points: element.points,
            stroke: store.selectedElementId === element.id ? '#1f2937' : '#000',
            strokeWidth: store.selectedElementId === element.id ? 4 : 2,
          }"
        />

        <!-- Render doors -->
        <v-group
          v-for="element in store.elements.filter(el => el.type === 'door')"
          :key="element.id"
        >
          <v-arc
            :config="{
              x: element.x,
              y: element.y,
              innerRadius: 0,
              outerRadius: element.radius || 30,
              angle: 90,
              rotation: element.rotation || 0,
              stroke: store.selectedElementId === element.id ? '#3730a3' : '#4f46e5',
              strokeWidth: store.selectedElementId === element.id ? 4 : 2,
            }"
          />
        </v-group>

        <!-- Render windows -->
        <v-group
          v-for="element in store.elements.filter(el => el.type === 'window')"
          :key="element.id"
        >
          <v-rect
            :config="{
              x: element.x,
              y: element.y,
              width: element.width || 40,
              height: element.height || 10,
              rotation: element.rotation || 0,
              stroke: store.selectedElementId === element.id ? '#0e7490' : '#0891b2',
              strokeWidth: store.selectedElementId === element.id ? 4 : 2,
              fill: '#cffafe',
            }"
          />
        </v-group>

        <!-- Render rooms -->
        <v-group
          v-for="element in store.elements.filter(el => el.type === 'room')"
          :key="element.id"
        >
          <v-rect
            :config="{
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              stroke: store.selectedElementId === element.id ? '#059669' : '#16a34a',
              strokeWidth: store.selectedElementId === element.id ? 4 : 2,
              fill: '#dcfce7',
              opacity: 0.3,
            }"
          />
          <v-text
            :config="{
              x: element.x + 5,
              y: element.y + 5,
              text: `${element.area.toFixed(1)}m²`,
              fontSize: 14,
              fill: '#166534',
              fontStyle: 'bold',
            }"
          />
        </v-group>

        <!-- Render polygons -->
        <v-group
          v-for="element in store.elements.filter(el => el.type === 'polygon')"
          :key="element.id"
        >
          <v-line
            :config="{
              points: element.points,
              stroke: store.selectedElementId === element.id ? '#7e22ce' : '#9333ea',
              strokeWidth: store.selectedElementId === element.id ? 4 : 2,
              fill: '#f3e8ff',
              opacity: 0.4,
              closed: true,
            }"
          />
          <v-text
            :config="{
              x: element.points[0] + 5,
              y: element.points[1] + 5,
              text: `${element.area.toFixed(1)}m²`,
              fontSize: 14,
              fill: '#581c87',
              fontStyle: 'bold',
            }"
          />
        </v-group>

        <!-- Render room polygons -->
        <v-group
          v-for="element in store.elements.filter(el => el.type === 'room-polygon')"
          :key="element.id"
        >
          <v-line
            :config="{
              points: element.points,
              stroke: store.selectedElementId === element.id ? '#059669' : '#16a34a',
              strokeWidth: store.selectedElementId === element.id ? 4 : 2,
              fill: '#dcfce7',
              opacity: 0.3,
              closed: true,
            }"
          />
          <v-text
            :config="{
              x: element.points[0] + 5,
              y: element.points[1] + 5,
              text: `${element.area.toFixed(1)}m²`,
              fontSize: 14,
              fill: '#166534',
              fontStyle: 'bold',
            }"
          />
        </v-group>

        <!-- Current polygon preview -->
        <v-line
          v-if="isDrawingPolygon && currentPolygonPoints.length >= 2"
          :config="{
            points: currentPolygonPoints,
            stroke: '#9333ea',
            strokeWidth: 2,
            dash: [5, 5],
          }"
        />

        <!-- Start point indicator for closing polygon -->
        <v-circle
          v-if="isDrawingPolygon && currentPolygonPoints.length >= 2"
          :config="{
            x: currentPolygonPoints[0],
            y: currentPolygonPoints[1],
            radius: 8,
            fill: '#9333ea',
            opacity: 0.6,
          }"
        />

        <!-- Current room polygon preview -->
        <v-line
          v-if="isDrawingRoomPolygon && currentRoomPolygonPoints.length >= 2"
          :config="{
            points: currentRoomPolygonPoints,
            stroke: '#16a34a',
            strokeWidth: 2,
            dash: [5, 5],
          }"
        />

        <!-- Start point indicator for closing room polygon -->
        <v-circle
          v-if="isDrawingRoomPolygon && currentRoomPolygonPoints.length >= 2"
          :config="{
            x: currentRoomPolygonPoints[0],
            y: currentRoomPolygonPoints[1],
            radius: 8,
            fill: '#16a34a',
            opacity: 0.6,
          }"
        />

        <!-- Vertex handles for selected polygon -->
        <template v-if="store.selectedElementId && store.selectedElement">
          <v-circle
            v-if="(store.selectedElement.type === 'polygon' || store.selectedElement.type === 'room-polygon')"
            v-for="(_, i) in store.selectedElement.points.filter((_, idx) => idx % 2 === 0)"
            :key="'vertex-' + i"
            :config="{
              x: store.selectedElement.points[i * 2],
              y: store.selectedElement.points[i * 2 + 1],
              radius: 6,
              fill: '#fff',
              stroke: store.selectedElement.type === 'polygon' ? '#9333ea' : '#16a34a',
              strokeWidth: 2,
            }"
          />
        </template>

        <!-- Current drawing preview -->
        <v-line
          v-if="isDrawing && currentPoints.length > 0 && store.currentTool === 'line'"
          :config="{
            points: currentPoints,
            stroke: '#888',
            strokeWidth: 2,
            dash: [5, 5],
          }"
        />
        <v-rect
          v-if="isDrawing && currentPoints.length > 0 && store.currentTool === 'room'"
          :config="{
            x: Math.min(currentPoints[0], currentPoints[2]),
            y: Math.min(currentPoints[1], currentPoints[3]),
            width: Math.abs(currentPoints[2] - currentPoints[0]),
            height: Math.abs(currentPoints[3] - currentPoints[1]),
            stroke: '#16a34a',
            strokeWidth: 2,
            fill: '#dcfce7',
            opacity: 0.3,
            dash: [5, 5],
          }"
        />

        <!-- Calibration line preview -->
        <v-line
          v-if="isDrawingCalibration && calibrationPoints.length === 4"
          :config="{
            points: calibrationPoints,
            stroke: '#f97316',
            strokeWidth: 3,
            dash: [10, 5],
          }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDrawingStore } from '../stores/drawing'

const store = useDrawingStore()
const container = ref(null)
const stage = ref(null)
const backgroundImageObj = ref(null)

const stageConfig = ref({
  width: 800,
  height: 600,
  draggable: false,
  scaleX: 1,
  scaleY: 1,
})

const isDrawing = ref(false)
const currentPoints = ref([])
const isPanning = ref(false)
const lastPanPoint = ref({ x: 0, y: 0 })
const currentPolygonPoints = ref([])
const isDrawingPolygon = ref(false)
const currentRoomPolygonPoints = ref([])
const isDrawingRoomPolygon = ref(false)
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const dragElementStart = ref(null)
const isDraggingVertex = ref(false)
const selectedVertexIndex = ref(-1)
const vertexDragStart = ref({ x: 0, y: 0 })
const isDrawingCalibration = ref(false)
const calibrationPoints = ref([])

// Grid lines
const gridLines = computed(() => {
  const lines = []
  const { width, height } = stageConfig.value
  const gridSize = store.gridSize
  const scale = stageConfig.value.scaleX

  // Vertical lines
  for (let x = 0; x <= width / scale; x += gridSize) {
    lines.push({
      points: [x, 0, x, height / scale],
      stroke: '#e5e7eb',
      strokeWidth: 1,
    })
  }

  // Horizontal lines
  for (let y = 0; y <= height / scale; y += gridSize) {
    lines.push({
      points: [0, y, width / scale, y],
      stroke: '#e5e7eb',
      strokeWidth: 1,
    })
  }

  return lines
})

// Snap to grid function
const snapToGrid = (value) => {
  const gridSize = store.gridSize
  return Math.round(value / gridSize) * gridSize
}

// Check if point is near another point (for closing polygons)
const isNearPoint = (x1, y1, x2, y2, threshold = null) => {
  const snapDistance = threshold || store.gridSize
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy) <= snapDistance
}

// Hit detection - check if point is inside/near an element
const isPointInElement = (x, y, element) => {
  const threshold = 10 // pixels

  if (element.type === 'room') {
    // Rectangle bounds check
    return x >= element.x && x <= element.x + element.width &&
           y >= element.y && y <= element.y + element.height
  }

  if (element.type === 'polygon' || element.type === 'room-polygon') {
    // Point in polygon algorithm (ray casting)
    const points = element.points
    let inside = false
    const n = points.length / 2

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = points[i * 2]
      const yi = points[i * 2 + 1]
      const xj = points[j * 2]
      const yj = points[j * 2 + 1]

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }

    return inside
  }

  if (element.type === 'line') {
    // Distance to line segment
    const x1 = element.points[0]
    const y1 = element.points[1]
    const x2 = element.points[2]
    const y2 = element.points[3]

    const A = x - x1
    const B = y - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) param = dot / lenSq

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = x - xx
    const dy = y - yy
    return Math.sqrt(dx * dx + dy * dy) <= threshold
  }

  if (element.type === 'door' || element.type === 'window') {
    // Simple radius check
    const dx = x - element.x
    const dy = y - element.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (element.type === 'door') {
      return dist <= (element.radius || 30) + threshold
    } else {
      // Window rectangle check
      const hw = (element.width || 40) / 2
      const hh = (element.height || 10) / 2
      return Math.abs(dx) <= hw + threshold && Math.abs(dy) <= hh + threshold
    }
  }

  return false
}

// Get element at position (returns topmost element)
const getElementAtPosition = (x, y) => {
  // Check in reverse order (topmost first)
  for (let i = store.elements.length - 1; i >= 0; i--) {
    const element = store.elements[i]
    if (isPointInElement(x, y, element)) {
      return element
    }
  }
  return null
}

// Check if point is near a vertex (for vertex selection)
const getVertexAtPosition = (x, y, element, threshold = 15) => {
  if (!element) return -1

  // Only check polygon types
  if (element.type !== 'polygon' && element.type !== 'room-polygon') {
    return -1
  }

  const points = element.points
  for (let i = 0; i < points.length; i += 2) {
    const vx = points[i]
    const vy = points[i + 1]
    const dx = x - vx
    const dy = y - vy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist <= threshold) {
      return i // Return the index in points array
    }
  }

  return -1
}

// Get mouse position relative to stage
const getRelativePointerPosition = () => {
  const stageNode = stage.value?.getNode()
  if (!stageNode) return { x: 0, y: 0 }

  const pos = stageNode.getPointerPosition()
  const transform = stageNode.getAbsoluteTransform().copy().invert()
  return transform.point(pos)
}

// Mouse handlers
const handleMouseDown = (e) => {
  const pos = getRelativePointerPosition()

  // Middle mouse button for panning
  if (e.evt.button === 1 || e.evt.ctrlKey) {
    isPanning.value = true
    lastPanPoint.value = { x: e.evt.clientX, y: e.evt.clientY }
    return
  }

  // Left click for drawing or selecting
  if (e.evt.button === 0) {
    const snappedX = snapToGrid(pos.x)
    const snappedY = snapToGrid(pos.y)

    // Select tool - handle element selection and dragging
    if (store.currentTool === 'select') {
      // First, check if clicking on a vertex of the currently selected polygon
      if (store.selectedElementId) {
        const selectedEl = store.selectedElement
        if (selectedEl && (selectedEl.type === 'polygon' || selectedEl.type === 'room-polygon')) {
          const vertexIndex = getVertexAtPosition(pos.x, pos.y, selectedEl)
          if (vertexIndex >= 0) {
            // Start vertex dragging
            isDraggingVertex.value = true
            selectedVertexIndex.value = vertexIndex
            vertexDragStart.value = { x: snappedX, y: snappedY }
            dragElementStart.value = JSON.parse(JSON.stringify(selectedEl))
            return
          }
        }
      }

      // Otherwise, select element
      const element = getElementAtPosition(pos.x, pos.y)
      if (element) {
        store.selectElement(element.id)
        isDragging.value = true
        // Store snapped position for grid-aligned dragging
        dragStartPos.value = { x: snappedX, y: snappedY }
        // Store copy of element start state for dragging
        dragElementStart.value = JSON.parse(JSON.stringify(element))
      } else {
        store.clearSelection()
      }
      return
    }

    if (store.currentTool === 'line') {
      // Multi-segment polygon drawing
      if (!isDrawingPolygon.value) {
        // Start new polygon
        isDrawingPolygon.value = true
        currentPolygonPoints.value = [snappedX, snappedY]
      } else {
        // Check if clicking near start point to close polygon
        const startX = currentPolygonPoints.value[0]
        const startY = currentPolygonPoints.value[1]

        if (currentPolygonPoints.value.length >= 6 && isNearPoint(snappedX, snappedY, startX, startY)) {
          // Close polygon and calculate area
          const area = store.calculatePolygonArea(currentPolygonPoints.value)
          store.addElement({
            id: Date.now().toString(),
            type: 'polygon',
            points: [...currentPolygonPoints.value],
            area: area,
          })
          // Reset polygon drawing
          isDrawingPolygon.value = false
          currentPolygonPoints.value = []
        } else {
          // Add new point to polygon
          currentPolygonPoints.value.push(snappedX, snappedY)
        }
      }
    } else if (store.currentTool === 'door') {
      // Place door
      store.addElement({
        id: Date.now().toString(),
        type: 'door',
        x: snappedX,
        y: snappedY,
        radius: 30,
        rotation: 0,
      })
    } else if (store.currentTool === 'window') {
      // Place window
      store.addElement({
        id: Date.now().toString(),
        type: 'window',
        x: snappedX,
        y: snappedY,
        width: 40,
        height: 10,
        rotation: 0,
      })
    } else if (store.currentTool === 'room-polygon') {
      // Multi-segment room polygon drawing
      if (!isDrawingRoomPolygon.value) {
        // Start new room polygon
        isDrawingRoomPolygon.value = true
        currentRoomPolygonPoints.value = [snappedX, snappedY]
      } else {
        // Check if clicking near start point to close polygon
        const startX = currentRoomPolygonPoints.value[0]
        const startY = currentRoomPolygonPoints.value[1]

        if (currentRoomPolygonPoints.value.length >= 6 && isNearPoint(snappedX, snappedY, startX, startY)) {
          // Close polygon and calculate area
          const area = store.calculatePolygonArea(currentRoomPolygonPoints.value)
          store.addElement({
            id: Date.now().toString(),
            type: 'room-polygon',
            points: [...currentRoomPolygonPoints.value],
            area: area,
          })
          // Reset polygon drawing
          isDrawingRoomPolygon.value = false
          currentRoomPolygonPoints.value = []
        } else {
          // Add new point to polygon
          currentRoomPolygonPoints.value.push(snappedX, snappedY)
        }
      }
    } else if (store.currentTool === 'room') {
      // Start drawing room
      isDrawing.value = true
      currentPoints.value = [snappedX, snappedY, snappedX, snappedY]
    } else if (store.currentTool === 'calibrate') {
      // Calibration line drawing
      if (!isDrawingCalibration.value) {
        isDrawingCalibration.value = true
        calibrationPoints.value = [pos.x, pos.y, pos.x, pos.y]
      }
    }
  }
}

const handleMouseMove = (e) => {
  if (isPanning.value) {
    const dx = e.evt.clientX - lastPanPoint.value.x
    const dy = e.evt.clientY - lastPanPoint.value.y

    const stageNode = stage.value?.getNode()
    if (stageNode) {
      stageNode.x(stageNode.x() + dx)
      stageNode.y(stageNode.y() + dy)
    }

    lastPanPoint.value = { x: e.evt.clientX, y: e.evt.clientY }
    return
  }

  // Handle dragging of vertex
  if (isDraggingVertex.value && store.selectedElementId && dragElementStart.value && selectedVertexIndex.value >= 0) {
    const pos = getRelativePointerPosition()
    const snappedX = snapToGrid(pos.x)
    const snappedY = snapToGrid(pos.y)

    // Calculate delta from drag start
    const dx = snappedX - vertexDragStart.value.x
    const dy = snappedY - vertexDragStart.value.y

    const element = dragElementStart.value
    const newPoints = [...element.points]

    // Update just the selected vertex by applying delta to original position
    newPoints[selectedVertexIndex.value] = element.points[selectedVertexIndex.value] + dx
    newPoints[selectedVertexIndex.value + 1] = element.points[selectedVertexIndex.value + 1] + dy

    // Recalculate area for polygons
    const area = store.calculatePolygonArea(newPoints)

    store.updateElement(store.selectedElementId, {
      points: newPoints,
      area: area
    })
    return
  }

  // Handle dragging of selected element
  if (isDragging.value && store.selectedElementId && dragElementStart.value) {
    const pos = getRelativePointerPosition()

    // Snap current position to grid for smooth grid-aligned dragging
    const snappedX = snapToGrid(pos.x)
    const snappedY = snapToGrid(pos.y)
    const dx = snappedX - dragStartPos.value.x
    const dy = snappedY - dragStartPos.value.y

    const element = dragElementStart.value
    const updates = {}

    if (element.type === 'room') {
      updates.x = element.x + dx
      updates.y = element.y + dy
    } else if (element.type === 'polygon' || element.type === 'room-polygon') {
      // Shift all points
      const newPoints = []
      for (let i = 0; i < element.points.length; i += 2) {
        newPoints.push(element.points[i] + dx)
        newPoints.push(element.points[i + 1] + dy)
      }
      updates.points = newPoints
    } else if (element.type === 'line') {
      // Shift all points
      const newPoints = []
      for (let i = 0; i < element.points.length; i += 2) {
        newPoints.push(element.points[i] + dx)
        newPoints.push(element.points[i + 1] + dy)
      }
      updates.points = newPoints
    } else if (element.type === 'door' || element.type === 'window') {
      updates.x = element.x + dx
      updates.y = element.y + dy
    }

    store.updateElement(store.selectedElementId, updates)
    return
  }

  // Update preview line for polygon drawing
  if (isDrawingPolygon.value && store.currentTool === 'line') {
    const pos = getRelativePointerPosition()
    const snappedX = snapToGrid(pos.x)
    const snappedY = snapToGrid(pos.y)

    // Create preview line from last point to current position
    if (currentPolygonPoints.value.length >= 2) {
      const lastX = currentPolygonPoints.value[currentPolygonPoints.value.length - 2]
      const lastY = currentPolygonPoints.value[currentPolygonPoints.value.length - 1]
      currentPoints.value = [lastX, lastY, snappedX, snappedY]
    }
    return
  }

  // Update preview line for room polygon drawing
  if (isDrawingRoomPolygon.value && store.currentTool === 'room-polygon') {
    const pos = getRelativePointerPosition()
    const snappedX = snapToGrid(pos.x)
    const snappedY = snapToGrid(pos.y)

    // Create preview line from last point to current position
    if (currentRoomPolygonPoints.value.length >= 2) {
      const lastX = currentRoomPolygonPoints.value[currentRoomPolygonPoints.value.length - 2]
      const lastY = currentRoomPolygonPoints.value[currentRoomPolygonPoints.value.length - 1]
      currentPoints.value = [lastX, lastY, snappedX, snappedY]
    }
    return
  }

  // Update calibration line preview
  if (isDrawingCalibration.value && store.currentTool === 'calibrate') {
    const pos = getRelativePointerPosition()
    calibrationPoints.value = [
      calibrationPoints.value[0],
      calibrationPoints.value[1],
      pos.x,
      pos.y,
    ]
    return
  }

  if (isDrawing.value && (store.currentTool === 'line' || store.currentTool === 'room')) {
    const pos = getRelativePointerPosition()
    const snappedX = snapToGrid(pos.x)
    const snappedY = snapToGrid(pos.y)
    currentPoints.value = [
      currentPoints.value[0],
      currentPoints.value[1],
      snappedX,
      snappedY,
    ]
  }
}

const handleMouseUp = () => {
  if (isPanning.value) {
    isPanning.value = false
    return
  }

  // Stop vertex dragging
  if (isDraggingVertex.value) {
    isDraggingVertex.value = false
    selectedVertexIndex.value = -1
    dragElementStart.value = null
    return
  }

  // Stop element dragging
  if (isDragging.value) {
    isDragging.value = false
    dragElementStart.value = null
    return
  }

  // Complete calibration line
  if (isDrawingCalibration.value) {
    isDrawingCalibration.value = false
    const x1 = calibrationPoints.value[0]
    const y1 = calibrationPoints.value[1]
    const x2 = calibrationPoints.value[2]
    const y2 = calibrationPoints.value[3]
    const dx = x2 - x1
    const dy = y2 - y1
    const lineLength = Math.sqrt(dx * dx + dy * dy)

    if (lineLength > 10) {
      // Prompt for actual measurement
      const actualMeters = prompt(`This line is ${lineLength.toFixed(0)} pixels.\nEnter actual length in meters:`)
      if (actualMeters && !isNaN(parseFloat(actualMeters))) {
        const meters = parseFloat(actualMeters)
        const metersPerPixel = meters / lineLength
        // Update grid unit to match
        const newGridUnit = metersPerPixel * store.gridSize
        store.updateSettings({
          gridUnit: newGridUnit
        })
        alert(`Calibration applied!\nScale: ${metersPerPixel.toFixed(4)} meters/pixel\nGrid: ${newGridUnit.toFixed(2)}m per square`)
      }
    }
    calibrationPoints.value = []
    return
  }

  if (isDrawing.value) {
    if (currentPoints.value.length === 4) {
      const x1 = currentPoints.value[0]
      const y1 = currentPoints.value[1]
      const x2 = currentPoints.value[2]
      const y2 = currentPoints.value[3]
      const dx = x2 - x1
      const dy = y2 - y1

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        if (store.currentTool === 'line') {
          store.addElement({
            id: Date.now().toString(),
            type: 'line',
            points: [...currentPoints.value],
          })
        } else if (store.currentTool === 'room') {
          // Calculate area in square meters
          const widthInPixels = Math.abs(dx)
          const heightInPixels = Math.abs(dy)
          const widthInMeters = widthInPixels * store.metersPerPixel
          const heightInMeters = heightInPixels * store.metersPerPixel
          const areaSqm = widthInMeters * heightInMeters

          store.addElement({
            id: Date.now().toString(),
            type: 'room',
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: widthInPixels,
            height: heightInPixels,
            area: areaSqm,
          })
        }
      }
    }
    isDrawing.value = false
    currentPoints.value = []
  }
}

const handleWheel = (e) => {
  e.evt.preventDefault()

  const stageNode = stage.value?.getNode()
  if (!stageNode) return

  const oldScale = stageNode.scaleX()
  const pointer = stageNode.getPointerPosition()

  const mousePointTo = {
    x: (pointer.x - stageNode.x()) / oldScale,
    y: (pointer.y - stageNode.y()) / oldScale,
  }

  const direction = e.evt.deltaY > 0 ? -1 : 1
  const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1

  // Limit zoom
  const clampedScale = Math.max(0.1, Math.min(5, newScale))

  stageNode.scale({ x: clampedScale, y: clampedScale })
  stageConfig.value.scaleX = clampedScale
  stageConfig.value.scaleY = clampedScale

  const newPos = {
    x: pointer.x - mousePointTo.x * clampedScale,
    y: pointer.y - mousePointTo.y * clampedScale,
  }

  stageNode.position(newPos)
}

// Cancel polygon drawing
const cancelPolygon = () => {
  if (isDrawingPolygon.value) {
    isDrawingPolygon.value = false
    currentPolygonPoints.value = []
    currentPoints.value = []
  }
  if (isDrawingRoomPolygon.value) {
    isDrawingRoomPolygon.value = false
    currentRoomPolygonPoints.value = []
    currentPoints.value = []
  }
}

// Keyboard handler
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    cancelPolygon()
  }
}

// Resize observer
onMounted(() => {
  if (container.value) {
    const resizeObserver = new ResizeObserver(() => {
      stageConfig.value.width = container.value.offsetWidth
      stageConfig.value.height = container.value.offsetHeight
    })
    resizeObserver.observe(container.value)
  }

  // Initial size
  stageConfig.value.width = container.value.offsetWidth
  stageConfig.value.height = container.value.offsetHeight

  // Add keyboard listener
  window.addEventListener('keydown', handleKeyDown)
})

// Watch for tool changes and cancel polygon
watch(() => store.currentTool, () => {
  cancelPolygon()
})

// Watch for background image changes and load image
watch(() => store.backgroundImage.dataUrl, (dataUrl) => {
  if (dataUrl) {
    const img = new window.Image()
    img.onload = () => {
      backgroundImageObj.value = img
    }
    img.src = dataUrl
  } else {
    backgroundImageObj.value = null
  }
})

// Handle background image drag end
const handleImageDragEnd = (e) => {
  store.updateBackgroundImage({
    x: e.target.x(),
    y: e.target.y()
  })
}
</script>
