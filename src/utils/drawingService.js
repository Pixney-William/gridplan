import { supabase } from './supabase'

export const drawingService = {
  async saveDrawing(drawingData) {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .insert([drawingData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error saving drawing:', error)
      return { data: null, error }
    }
  },

  async updateDrawing(id, drawingData) {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .update({ ...drawingData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating drawing:', error)
      return { data: null, error }
    }
  },

  async loadDrawings() {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error loading drawings:', error)
      return { data: null, error }
    }
  },

  async loadDrawing(id) {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error loading drawing:', error)
      return { data: null, error }
    }
  },

  async deleteDrawing(id) {
    try {
      const { error } = await supabase
        .from('drawings')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting drawing:', error)
      return { error }
    }
  },
}
