import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface MaintenanceCategory {
  id: string
  name: string
  description: string | null
  default_interval_miles: number | null
  default_interval_months: number | null
  is_mileage_based: boolean
  is_time_based: boolean
  severity: 'routine' | 'important' | 'critical'
}

export interface MaintenanceLog {
  id: string
  vehicle_id: string
  user_id: string
  category_id: string
  service_date: string
  odometer_reading: number
  cost: number | null
  service_provider: string | null
  is_diy: boolean
  parts_used: string | null
  notes: string | null
  next_service_miles: number | null
  next_service_date: string | null
  category?: MaintenanceCategory
}

export interface MaintenanceReminder {
  id: string
  vehicle_id: string
  category_id: string
  reminder_miles: number | null
  reminder_months: number | null
  last_service_date: string | null
  last_service_miles: number | null
  is_active: boolean
  category?: MaintenanceCategory
}

export function useMaintenanceLogs(vehicleId?: string) {
  const { user } = useAuth()
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([])
  const [categories, setCategories] = useState<MaintenanceCategory[]>([])
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setMaintenanceLogs([])
      setCategories([])
      setReminders([])
      setLoading(false)
      return
    }

    fetchData()
  }, [user, vehicleId])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchMaintenanceLogs(),
        fetchCategories(),
        fetchReminders()
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchMaintenanceLogs = async () => {
    let query = supabase
      .from('maintenance_logs')
      .select(`
        *,
        category:maintenance_categories(*)
      `)
      .eq('user_id', user?.id)
      .order('service_date', { ascending: false })

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }

    const { data, error } = await query

    if (error) throw error
    setMaintenanceLogs(data || [])
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('maintenance_categories')
      .select('*')
      .order('name')

    if (error) throw error
    setCategories(data || [])
  }

  const fetchReminders = async () => {
    let query = supabase
      .from('maintenance_reminders')
      .select(`
        *,
        category:maintenance_categories(*)
      `)
      .eq('is_active', true)

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }

    const { data, error } = await query

    if (error) throw error
    setReminders(data || [])
  }

  const addMaintenanceLog = async (logData: Omit<MaintenanceLog, 'id' | 'category'>) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .insert([{
          ...logData,
          user_id: user?.id
        }])
        .select()
        .single()

      if (error) throw error
      await fetchMaintenanceLogs()
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add maintenance log')
    }
  }

  const updateMaintenanceLog = async (id: string, updates: Partial<MaintenanceLog>) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchMaintenanceLogs()
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update maintenance log')
    }
  }

  const deleteMaintenanceLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchMaintenanceLogs()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete maintenance log')
    }
  }

  return {
    maintenanceLogs,
    categories,
    reminders,
    loading,
    error,
    fetchData,
    addMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog
  }
}