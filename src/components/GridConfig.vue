<template>
  <div class="p-4 border-b border-gray-200">
    <h2 class="text-sm font-semibold text-gray-800 mb-3">Grid Settings</h2>

    <div class="space-y-4">
      <!-- Grid Size -->
      <div class="space-y-2">
        <Label for="grid-size" class="text-xs">Grid Size (px)</Label>
        <Input
          id="grid-size"
          v-model.number="store.gridSize"
          type="number"
          min="5"
          max="100"
        />
      </div>

      <!-- Grid Unit -->
      <div class="space-y-2">
        <Label for="grid-unit" class="text-xs">Meters per Square</Label>
        <Input
          id="grid-unit"
          v-model.number="store.gridUnit"
          type="number"
          min="0.1"
          step="0.1"
        />
      </div>

      <!-- Scale -->
      <div class="space-y-2">
        <Label for="scale" class="text-xs">Scale</Label>
        <Input
          id="scale"
          v-model="store.scale"
          type="text"
        />
      </div>

      <!-- Max SQM -->
      <div class="space-y-2">
        <Label for="max-sqm" class="text-xs">Max m² Warning</Label>
        <Input
          id="max-sqm"
          v-model.number="store.maxSqm"
          type="number"
          min="1"
        />
      </div>

      <!-- Price per SQM -->
      <div class="space-y-2">
        <Label for="price-per-sqm" class="text-xs">Price per m² (SEK)</Label>
        <Input
          id="price-per-sqm"
          v-model.number="store.pricePerSqm"
          type="number"
          min="0"
          step="1000"
        />
      </div>

      <!-- Wall Thickness -->
      <div class="space-y-2">
        <Label for="wall-thickness" class="text-xs">Wall Thickness (px)</Label>
        <Input
          id="wall-thickness"
          v-model.number="store.wallThickness"
          type="number"
          min="1"
          max="20"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useDrawingStore } from '../stores/drawing'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const store = useDrawingStore()

// Watch for gridUnit changes and trigger recalculation
watch(() => store.gridUnit, (newVal, oldVal) => {
  if (newVal !== oldVal && oldVal !== undefined) {
    store.recalculateAllAreas()
  }
})

// Watch for gridSize changes (affects metersPerPixel calculation)
watch(() => store.gridSize, (newVal, oldVal) => {
  if (newVal !== oldVal && oldVal !== undefined) {
    store.recalculateAllAreas()
  }
})
</script>
