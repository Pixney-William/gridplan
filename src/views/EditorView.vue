<template>
  <div class="h-screen w-screen flex flex-col bg-gray-50">
    <!-- Toolbar -->
    <Toolbar />

    <!-- Main content area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <div class="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <BackgroundImageControls />
        <GridConfig />
        <MeasurementPanel />
      </div>

      <!-- Canvas -->
      <div class="flex-1 relative">
        <DrawingCanvas />
      </div>
    </div>
  </div>
</template>

<script setup>
import Toolbar from '../components/Toolbar.vue'
import BackgroundImageControls from '../components/BackgroundImageControls.vue'
import GridConfig from '../components/GridConfig.vue'
import MeasurementPanel from '../components/MeasurementPanel.vue'
import DrawingCanvas from '../components/DrawingCanvas.vue'
</script>
