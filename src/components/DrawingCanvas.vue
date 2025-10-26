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
            stroke: '#000',
            strokeWidth: 2,
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
              stroke: '#4f46e5',
              strokeWidth: 2,
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
              stroke: '#0891b2',
              strokeWidth: 2,
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
              stroke: '#16a34a',
              strokeWidth: 2,
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

  // Left click for drawing
  if (e.evt.button === 0) {
    const snappedX = snapToGrid(pos.x)
    const snappedY = snapToGrid(pos.y)

    if (store.currentTool === 'line') {
      isDrawing.value = true
      currentPoints.value = [snappedX, snappedY, snappedX, snappedY]
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
    } else if (store.currentTool === 'room') {
      // Start drawing room
      isDrawing.value = true
      currentPoints.value = [snappedX, snappedY, snappedX, snappedY]
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
})
</script>
