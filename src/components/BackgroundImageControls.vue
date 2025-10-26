<template>
  <div class="p-4 border-b border-gray-200">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">Reference Image</h3>

    <!-- Upload section -->
    <div v-if="!store.backgroundImage.dataUrl" class="mb-4">
      <input
        type="file"
        ref="fileInput"
        accept="image/png,image/jpeg,image/jpg"
        @change="handleImageUpload"
        class="hidden"
      />
      <button
        @click="$refs.fileInput.click()"
        class="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Upload Image
      </button>
    </div>

    <!-- Image controls -->
    <div v-if="store.backgroundImage.dataUrl" class="space-y-3">
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
      <button
        @click="toggleLock"
        class="w-full px-3 py-2 text-sm rounded"
        :class="store.backgroundImage.locked
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      >
        {{ store.backgroundImage.locked ? 'Unlock Image' : 'Lock Image' }}
      </button>

      <!-- Clear button -->
      <button
        @click="clearImage"
        class="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
      >
        Remove Image
      </button>

      <!-- Calibration section -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <h4 class="text-xs font-semibold text-gray-700 mb-2">Calibration</h4>

        <!-- Reference line method -->
        <div class="mb-3">
          <p class="text-xs text-gray-600 mb-2">Reference Line Method:</p>
          <button
            @click="startCalibration"
            class="w-full px-3 py-2 text-sm rounded"
            :class="store.currentTool === 'calibrate'
              ? 'bg-orange-600 text-white'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'"
          >
            {{ store.currentTool === 'calibrate' ? 'Drawing Reference...' : 'Draw Reference Line' }}
          </button>
        </div>

        <!-- Manual method -->
        <div>
          <p class="text-xs text-gray-600 mb-2">Manual Method:</p>
          <div class="space-y-2">
            <input
              v-model.number="manualMetersPerGrid"
              type="number"
              step="0.1"
              placeholder="Meters per grid square"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <button
              @click="applyManualCalibration"
              class="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDrawingStore } from '../stores/drawing'

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
