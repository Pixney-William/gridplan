<template>
  <SidebarProvider>
    <div class="h-screen w-screen flex flex-col bg-gray-50">
      <!-- Toolbar -->
      <Toolbar />

      <!-- Main content area with collapsible sidebar -->
      <div class="flex-1 flex overflow-hidden">
        <Sidebar collapsible="icon" class="border-r border-gray-200">
          <SidebarContent class="overflow-y-auto">
            <BackgroundImageControls />
            <GridConfig />
            <MeasurementPanel />
          </SidebarContent>
        </Sidebar>

        <!-- Canvas -->
        <SidebarInset class="flex-1 relative">
          <DrawingCanvas />
        </SidebarInset>
      </div>
    </div>
  </SidebarProvider>
</template>

<script setup>
import Toolbar from '../components/Toolbar.vue'
import BackgroundImageControls from '../components/BackgroundImageControls.vue'
import GridConfig from '../components/GridConfig.vue'
import MeasurementPanel from '../components/MeasurementPanel.vue'
import DrawingCanvas from '../components/DrawingCanvas.vue'
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@/components/ui/sidebar'
</script>
