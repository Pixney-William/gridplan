<template>
  <div class="p-4 border-b border-gray-200">
    <h2 class="text-sm font-semibold text-gray-800 mb-3">Grid Settings</h2>

    <div class="space-y-3">
      <!-- Grid Size -->
      <div>
        <label class="block text-xs text-gray-600 mb-1">Grid Size (px)</label>
        <input
          v-model.number="store.gridSize"
          type="number"
          min="5"
          max="100"
          class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Grid Unit -->
      <div>
        <label class="block text-xs text-gray-600 mb-1">Meters per Square</label>
        <input
          v-model.number="store.gridUnit"
          type="number"
          min="0.1"
          step="0.1"
          class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Scale -->
      <div>
        <label class="block text-xs text-gray-600 mb-1">Scale</label>
        <input
          v-model="store.scale"
          type="text"
          class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Max SQM -->
      <div>
        <label class="block text-xs text-gray-600 mb-1">Max m² Warning</label>
        <input
          v-model.number="store.maxSqm"
          type="number"
          min="1"
          class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Price per SQM -->
      <div>
        <label class="block text-xs text-gray-600 mb-1">Price per m² (SEK)</label>
        <input
          v-model.number="store.pricePerSqm"
          type="number"
          min="0"
          step="1000"
          class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDrawingStore } from '../stores/drawing'

const store = useDrawingStore()
</script>
