
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface VehicleDocument {
  id: string
  vehicle_id: string
  document_type: 'registration' | 'insurance' | 'warranty' | 'manual' | 'other'
  title: string
  description: string | null
  document_url: string | null
  expiration_date: string | null
  created_at: string
}

export function useVehicleDocuments(vehicleId?: string) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<VehicleDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setDocuments([])
      setLoading(false)
      return
    }

    if (vehicleId) {
      fetchDocuments()
    }
  }, [user, vehicleId])

  const fetchDocuments = async () => {
    if (!vehicleId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vehicle_documents')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addDocument = async (documentData: Omit<VehicleDocument, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .insert([documentData])
        .select()
        .single()

      if (error) throw error
      setDocuments(prev => [data, ...prev])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add document')
    }
  }

  const updateDocument = async (id: string, updates: Partial<VehicleDocument>) => {
    try {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setDocuments(prev => prev.map(d => d.id === id ? data : d))
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update document')
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicle_documents')
        .delete()
        .eq('id', id)

      if (error) throw error
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete document')
    }
  }

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument
  }
}