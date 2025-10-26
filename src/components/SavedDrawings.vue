<template>
  <div class="p-4 flex-1 overflow-auto">
    <h2 class="text-sm font-semibold text-gray-800 mb-3">Saved Drawings</h2>

    <div v-if="drawings.length === 0" class="text-xs text-gray-500 italic">
      No saved drawings yet
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="drawing in drawings"
        :key="drawing.id"
        class="bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors group relative"
      >
        <div @click="loadDrawing(drawing)" class="cursor-pointer">
          <div class="text-sm font-medium text-gray-800">{{ drawing.name }}</div>
          <div class="text-xs text-gray-500">
            {{ formatDate(drawing.created_at) }}
          </div>
          <div class="text-xs text-gray-400">
            {{ drawing.total_sqm?.toFixed(1) || 0 }}m²
          </div>
        </div>
        <button
          @click.stop="deleteDrawing(drawing.id)"
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDrawingStore } from '../stores/drawing'
import { drawingService } from '../utils/drawingService'

const store = useDrawingStore()
const drawings = ref([])

const loadDrawings = async () => {
  const { data, error } = await drawingService.loadDrawings()
  if (!error && data) {
    drawings.value = data
  }
}

const loadDrawing = async (drawing) => {
  if (confirm('Load this drawing? Any unsaved changes will be lost.')) {
    store.loadDrawing(drawing)
  }
}

const deleteDrawing = async (id) => {
  if (confirm('Delete this drawing? This cannot be undone.')) {
    const { error } = await drawingService.deleteDrawing(id)
    if (!error) {
      await loadDrawings()
      if (store.currentDrawingId === id) {
        store.clearDrawing()
      }
    } else {
      alert('Failed to delete drawing')
    }
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadDrawings()
})
</script>
