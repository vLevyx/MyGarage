import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number | null
  trim: string | null
  nickname: string | null
  vin: string | null
  license_plate: string | null
  license_state: string | null
  current_odometer: number | null
  odometer_unit: string | null
  fuel_type: string | null
  engine: string | null
  transmission: string | null
}

export function useVehicles() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setVehicles([])
      setLoading(false)
      return
    }

    fetchVehicles()
  }, [user])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      console.log('Adding vehicle with data:', vehicleData)
      console.log('Current user ID:', user?.id)

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const insertData = {
        ...vehicleData,
        owner_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Insert data:', insertData)

      const { data, error } = await supabase
        .from('vehicles')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Vehicle added successfully:', data)
      setVehicles(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error adding vehicle:', err)
      throw err instanceof Error ? err : new Error('Failed to add vehicle')
    }
  }

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setVehicles(prev => prev.map(v => v.id === id ? data : v))
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update vehicle')
    }
  }

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

      if (error) throw error
      setVehicles(prev => prev.filter(v => v.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete vehicle')
    }
  }

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  }
}