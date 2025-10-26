<template>
  <div class="p-3 border-b border-gray-200">
    <h3 class="text-xs font-semibold text-gray-700 mb-2">Reference Image</h3>

    <!-- Upload section -->
    <div v-if="!store.backgroundImage.dataUrl" class="mb-2">
      <input
        type="file"
        ref="fileInput"
        accept="image/png,image/jpeg,image/jpg"
        @change="handleImageUpload"
        class="hidden"
      />
      <Button
        @click="$refs.fileInput.click()"
        class="w-full"
        size="sm"
      >
        Upload Image
      </Button>
    </div>

    <!-- Image controls -->
    <div v-if="store.backgroundImage.dataUrl" class="space-y-2">
      <!-- Opacity slider -->
      <div>
        <label class="text-xs text-gray-600 block mb-1">
          Opacity: {{ Math.round(store.backgroundImage.opacity * 100) }}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          :value="store.backgroundImage.opacity * 100"
          @input="updateOpacity"
          class="w-full"
        />
      </div>

      <!-- Lock toggle -->
      <Button
        @click="toggleLock"
        class="w-full"
        size="sm"
        :variant="store.backgroundImage.locked ? 'destructive' : 'secondary'"
      >
        {{ store.backgroundImage.locked ? 'Unlock Image' : 'Lock Image' }}
      </Button>

      <!-- Clear button -->
      <Button
        @click="clearImage"
        class="w-full"
        size="sm"
        variant="secondary"
      >
        Remove Image
      </Button>

      <!-- Calibration section -->
      <div class="mt-2 pt-2 border-t border-gray-200">
        <h4 class="text-xs font-semibold text-gray-700 mb-2">Calibration</h4>

        <!-- Reference line method -->
        <div class="mb-2 space-y-1">
          <Label class="text-xs">Reference Line Method:</Label>
          <Button
            @click="startCalibration"
            class="w-full"
            size="sm"
            :variant="store.currentTool === 'calibrate' ? 'default' : 'secondary'"
          >
            {{ store.currentTool === 'calibrate' ? 'Drawing Reference...' : 'Draw Reference Line' }}
          </Button>
        </div>

        <!-- Manual method -->
        <div class="space-y-1">
          <Label class="text-xs">Manual Method:</Label>
          <Input
            v-model.number="manualMetersPerGrid"
            type="number"
            step="0.1"
            placeholder="Meters per grid square"
            class="h-8"
          />
          <Button
            @click="applyManualCalibration"
            class="w-full"
            size="sm"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDrawingStore } from '../stores/drawing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const store = useDrawingStore()
const fileInput = ref(null)
const manualMetersPerGrid = ref(1)

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image too large. Maximum size is 5MB.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      // Auto-center and fit to reasonable size
      store.setBackgroundImage({
        dataUrl: e.target.result,
        x: 100,
        y: 100,
        width: img.width,
        height: img.height,
        opacity: 0.5,
        locked: false,
      })
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)

  // Reset input
  event.target.value = ''
}

const updateOpacity = (event) => {
  store.updateBackgroundImage({
    opacity: parseInt(event.target.value) / 100
  })
}

const toggleLock = () => {
  store.updateBackgroundImage({
    locked: !store.backgroundImage.locked
  })
}

const clearImage = () => {
  if (confirm('Remove reference image?')) {
    store.clearBackgroundImage()
  }
}

const startCalibration = () => {
  store.setTool('calibrate')
}

const applyManualCalibration = () => {
  if (manualMetersPerGrid.value > 0) {
    store.updateSettings({
      gridUnit: manualMetersPerGrid.value
    })
    alert(`Grid set to ${manualMetersPerGrid.value}m per square`)
  }
}
</script>
