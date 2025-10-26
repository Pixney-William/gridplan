<template>
  <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
    <div class="flex items-center gap-2">
      <h1 class="text-xl font-bold text-gray-800">GridPlan</h1>
    </div>

    <div class="h-6 w-px bg-gray-300"></div>

    <!-- Drawing tools -->
    <div class="flex items-center gap-2">
      <button
        @click="store.setTool('select')"
        :class="[
          'px-4 py-2 rounded text-sm font-medium transition-colors',
          store.currentTool === 'select'
            ? 'bg-gray-800 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        Select
      </button>
      <button
        @click="store.setTool('line')"
        :class="[
          'px-4 py-2 rounded text-sm font-medium transition-colors',
          store.currentTool === 'line'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        Line
      </button>
      <button
        @click="store.setTool('door')"
        :class="[
          'px-4 py-2 rounded text-sm font-medium transition-colors',
          store.currentTool === 'door'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        Door
      </button>
      <button
        @click="store.setTool('window')"
        :class="[
          'px-4 py-2 rounded text-sm font-medium transition-colors',
          store.currentTool === 'window'
            ? 'bg-cyan-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        Window
      </button>
      <button
        @click="store.setTool('room')"
        :class="[
          'px-4 py-2 rounded text-sm font-medium transition-colors',
          store.currentTool === 'room'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        Room
      </button>
      <button
        @click="store.setTool('room-polygon')"
        :class="[
          'px-4 py-2 rounded text-sm font-medium transition-colors',
          store.currentTool === 'room-polygon'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        Room Polygon
      </button>
    </div>

    <div class="h-6 w-px bg-gray-300"></div>

    <!-- Undo/Redo -->
    <div class="flex items-center gap-2">
      <button
        @click="store.undo()"
        :disabled="!store.canUndo()"
        class="px-4 py-2 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Undo
      </button>
      <button
        @click="store.redo()"
        :disabled="!store.canRedo()"
        class="px-4 py-2 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Redo
      </button>
    </div>

    <div class="h-6 w-px bg-gray-300"></div>

    <!-- Save/Export -->
    <div class="flex items-center gap-2">
      <button
        @click="handleSave"
        class="px-4 py-2 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700"
      >
        Save
      </button>
      <button
        @click="handleExport"
        class="px-4 py-2 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
      >
        Export PNG
      </button>
    </div>

    <div class="flex-1"></div>

    <!-- Clear -->
    <button
      @click="handleClear"
      class="px-4 py-2 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
    >
      Clear
    </button>
  </div>
</template>

<script setup>
import { useDrawingStore } from '../stores/drawing'
import { drawingService } from '../utils/drawingService'

const store = useDrawingStore()

const handleSave = async () => {
  try {
    const drawingData = store.getDrawingData()

    if (store.currentDrawingId) {
      // Update existing drawing
      const { data, error } = await drawingService.updateDrawing(store.currentDrawingId, drawingData)
      if (error) throw error
      alert('Drawing saved successfully!')
    } else {
      // Create new drawing
      const { data, error } = await drawingService.saveDrawing(drawingData)
      if (error) throw error
      store.currentDrawingId = data.id
      store.currentDrawingName = data.name
      alert('Drawing saved successfully!')
    }
  } catch (error) {
    console.error('Save error:', error)
    alert('Failed to save drawing. Please check console for details.')
  }
}

const handleExport = () => {
  // Export canvas to PNG
  const stage = document.querySelector('canvas')
  if (!stage) {
    alert('Canvas not found')
    return
  }

  const link = document.createElement('a')
  link.download = `${store.currentDrawingName || 'gridplan-drawing'}.png`
  link.href = stage.toDataURL()
  link.click()
}

const handleClear = () => {
  if (confirm('Clear all elements? This cannot be undone.')) {
    store.clearDrawing()
  }
}
</script>
