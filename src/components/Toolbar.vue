<template>
  <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
    <div class="flex items-center gap-2">
      <SidebarTrigger />
      <Button @click="goToDashboard" variant="ghost" size="sm">
        ← Dashboard
      </Button>
      <h1 class="text-xl font-bold text-gray-800">GridPlan</h1>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- Drawing tools -->
    <ButtonGroup>
      <Button
        @click="store.setTool('select')"
        :variant="store.currentTool === 'select' ? 'default' : 'outline'"
        size="sm"
      >
        Select
      </Button>
      <Button
        @click="store.setTool('line')"
        :variant="store.currentTool === 'line' ? 'default' : 'outline'"
        size="sm"
      >
        Line
      </Button>
      <Button
        @click="store.setTool('door')"
        :variant="store.currentTool === 'door' ? 'default' : 'outline'"
        size="sm"
      >
        Door
      </Button>
      <Button
        @click="store.setTool('window')"
        :variant="store.currentTool === 'window' ? 'default' : 'outline'"
        size="sm"
      >
        Window
      </Button>
      <Button
        @click="store.setTool('room-polygon')"
        :variant="store.currentTool === 'room-polygon' ? 'default' : 'outline'"
        size="sm"
      >
        Room Polygon
      </Button>
    </ButtonGroup>

    <Separator orientation="vertical" class="h-6" />

    <!-- Undo/Redo -->
    <div class="flex items-center gap-2">
      <Button
        @click="store.undo()"
        :disabled="!store.canUndo()"
        variant="secondary"
        size="sm"
      >
        Undo
      </Button>
      <Button
        @click="store.redo()"
        :disabled="!store.canRedo()"
        variant="secondary"
        size="sm"
      >
        Redo
      </Button>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- Save/Export -->
    <div class="flex items-center gap-2">
      <Button
        @click="handleSave"
        size="sm"
      >
        Save
      </Button>
      <Button
        @click="handleExport"
        variant="secondary"
        size="sm"
      >
        Export PNG
      </Button>
    </div>

    <div class="flex-1"></div>

    <!-- Clear -->
    <Button
      @click="handleClear"
      variant="destructive"
      size="sm"
    >
      Clear
    </Button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useDrawingStore } from '../stores/drawing'
import { drawingService } from '../utils/drawingService'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ButtonGroup } from '@/components/ui/button-group'
import { SidebarTrigger } from '@/components/ui/sidebar'

const router = useRouter()
const store = useDrawingStore()

const goToDashboard = () => {
  router.push('/')
}

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
