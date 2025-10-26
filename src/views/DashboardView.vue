<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">GridPlan Dashboard</h1>
        <Button @click="createNewDrawing" size="lg">
          <span class="text-lg mr-2">+</span>
          New Drawing
        </Button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-gray-500">Loading drawings...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="drawings.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="text-center">
          <h2 class="text-xl font-semibold text-gray-700 mb-2">No drawings yet</h2>
          <p class="text-gray-500 mb-6">Get started by creating your first floor plan</p>
          <Button @click="createNewDrawing" size="lg">
            <span class="text-lg mr-2">+</span>
            Create Your First Drawing
          </Button>
        </div>
      </div>

      <!-- Drawings Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="drawing in drawings" :key="drawing.id" class="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle class="text-lg">{{ drawing.name }}</CardTitle>
            <CardDescription>
              {{ formatDate(drawing.created_at) }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Total Area:</span>
                <Badge variant="secondary">{{ drawing.total_sqm?.toFixed(1) || 0 }}m²</Badge>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Estimated Price:</span>
                <span class="font-semibold">{{ formatPrice(drawing.total_sqm * (drawing.settings?.pricePerSqm || 25000)) }} SEK</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Elements:</span>
                <span>{{ drawing.elements?.length || 0 }}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter class="flex gap-2">
            <Button @click="loadDrawing(drawing)" class="flex-1" variant="default">
              Open
            </Button>
            <Button @click="confirmDelete(drawing)" variant="destructive">
              Delete
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Drawing?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ drawingToDelete?.name }}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="deleteDialogOpen = false" variant="outline">
            Cancel
          </Button>
          <Button @click="deleteDrawing" variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDrawingStore } from '@/stores/drawing'
import { drawingService } from '@/utils/drawingService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const router = useRouter()
const store = useDrawingStore()
const drawings = ref([])
const loading = ref(true)
const deleteDialogOpen = ref(false)
const drawingToDelete = ref(null)

const loadDrawings = async () => {
  loading.value = true
  const { data, error } = await drawingService.loadDrawings()
  if (!error && data) {
    drawings.value = data
  }
  loading.value = false
}

const createNewDrawing = () => {
  store.clearDrawing()
  router.push('/editor')
}

const loadDrawing = (drawing) => {
  store.loadDrawing(drawing)
  router.push(`/editor/${drawing.id}`)
}

const confirmDelete = (drawing) => {
  drawingToDelete.value = drawing
  deleteDialogOpen.value = true
}

const deleteDrawing = async () => {
  if (!drawingToDelete.value) return

  const { error } = await drawingService.deleteDrawing(drawingToDelete.value.id)
  if (!error) {
    await loadDrawings()
    if (store.currentDrawingId === drawingToDelete.value.id) {
      store.clearDrawing()
    }
  } else {
    alert('Failed to delete drawing')
  }

  deleteDialogOpen.value = false
  drawingToDelete.value = null
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('sv-SE').format(Math.round(price))
}

onMounted(() => {
  loadDrawings()
})
</script>
