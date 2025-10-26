<template>
  <div class="p-4 border-b border-gray-200">
    <h2 class="text-sm font-semibold text-gray-800 mb-3">Measurements</h2>

    <div class="space-y-3">
      <!-- Total SQM -->
      <div class="bg-blue-50 rounded p-3">
        <div class="text-xs text-gray-600 mb-1">Total Area</div>
        <div class="text-2xl font-bold text-blue-900">
          {{ store.totalSqm.toFixed(2) }} m²
        </div>
      </div>

      <!-- Max SQM Warning -->
      <div
        v-if="store.exceedsMaxSqm"
        class="bg-red-50 border border-red-200 rounded p-3"
      >
        <div class="text-xs font-semibold text-red-800 mb-1">⚠ Warning</div>
        <div class="text-xs text-red-700">
          Exceeds max {{ store.maxSqm }}m² by {{ (store.totalSqm - store.maxSqm).toFixed(2) }}m²
        </div>
      </div>

      <!-- Price -->
      <div class="bg-gray-50 rounded p-3">
        <div class="text-xs text-gray-600 mb-1">Estimated Price</div>
        <div class="text-xl font-bold text-gray-900">
          {{ formatPrice(store.totalPrice) }} SEK
        </div>
        <div class="text-xs text-gray-500 mt-1">
          @ {{ formatPrice(store.pricePerSqm) }} SEK/m²
        </div>
      </div>

      <!-- Elements Count -->
      <div class="text-xs text-gray-600 pt-2 border-t border-gray-200">
        <div>Elements: {{ store.elements.length }}</div>
        <div>Lines: {{ store.elements.filter(e => e.type === 'line').length }}</div>
        <div>Doors: {{ store.elements.filter(e => e.type === 'door').length }}</div>
        <div>Windows: {{ store.elements.filter(e => e.type === 'window').length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDrawingStore } from '../stores/drawing'

const store = useDrawingStore()

const formatPrice = (price) => {
  return new Intl.NumberFormat('sv-SE').format(Math.round(price))
}
</script>
