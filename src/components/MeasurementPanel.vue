<template>
  <div class="p-3 border-b border-gray-200">
    <h2 class="text-xs font-semibold text-gray-800 mb-2">Measurements</h2>

    <div class="space-y-2">
      <!-- Total SQM -->
      <Card>
        <CardContent class="p-2">
          <div class="text-xs text-gray-600 mb-1">Total Area</div>
          <div class="text-xl font-bold text-blue-900">
            {{ store.totalSqm.toFixed(2) }} m²
          </div>
        </CardContent>
      </Card>

      <!-- Max SQM Warning -->
      <Card v-if="store.exceedsMaxSqm" class="border-red-200 bg-red-50">
        <CardContent class="p-2">
          <div class="flex items-center gap-2 mb-1">
            <Badge variant="destructive" class="text-xs">⚠ Warning</Badge>
          </div>
          <div class="text-xs text-red-700">
            Exceeds max {{ store.maxSqm }}m² by {{ (store.totalSqm - store.maxSqm).toFixed(2) }}m²
          </div>
        </CardContent>
      </Card>

      <!-- Price -->
      <Card>
        <CardContent class="p-2">
          <div class="text-xs text-gray-600 mb-1">Estimated Price</div>
          <div class="text-lg font-bold text-gray-900">
            {{ formatPrice(store.totalPrice) }} SEK
          </div>
          <div class="text-xs text-gray-500 mt-1">
            @ {{ formatPrice(store.pricePerSqm) }} SEK/m²
          </div>
        </CardContent>
      </Card>

      <!-- Elements Count -->
      <div class="text-xs text-gray-600 pt-2 border-t border-gray-200 space-y-1">
        <div class="flex items-center justify-between">
          <span>Elements:</span>
          <Badge variant="secondary">{{ store.elements.length }}</Badge>
        </div>
        <div class="flex items-center justify-between">
          <span>Lines:</span>
          <Badge variant="secondary">{{ store.elements.filter(e => e.type === 'line').length }}</Badge>
        </div>
        <div class="flex items-center justify-between">
          <span>Doors:</span>
          <Badge variant="secondary">{{ store.elements.filter(e => e.type === 'door').length }}</Badge>
        </div>
        <div class="flex items-center justify-between">
          <span>Windows:</span>
          <Badge variant="secondary">{{ store.elements.filter(e => e.type === 'window').length }}</Badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDrawingStore } from '../stores/drawing'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const store = useDrawingStore()

const formatPrice = (price) => {
  return new Intl.NumberFormat('sv-SE').format(Math.round(price))
}
</script>
