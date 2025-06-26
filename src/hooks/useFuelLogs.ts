import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface FuelLog {
  id: string
  vehicle_id: string
  fill_date: string
  odometer_reading: number
  fuel_amount: number
  fuel_unit: string
  price_per_unit: number | null
  total_cost: number | null
  fuel_grade: string | null
  fuel_brand: string | null
  station_location: string | null
  is_full_tank: boolean
  notes: string | null
  mpg?: number
}

export function useFuelLogs(vehicleId?: string) {
  const { user } = useAuth()
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setFuelLogs([])
      setLoading(false)
      return
    }

    fetchFuelLogs()
  }, [user, vehicleId])

  const fetchFuelLogs = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('fuel_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('fill_date', { ascending: false })

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Calculate MPG for each fuel log
      const logsWithMpg = calculateMpg(data || [])
      setFuelLogs(logsWithMpg)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const calculateMpg = (logs: FuelLog[]): FuelLog[] => {
    const logsByVehicle = logs.reduce((acc, log) => {
      if (!acc[log.vehicle_id]) {
        acc[log.vehicle_id] = []
      }
      acc[log.vehicle_id].push(log)
      return acc
    }, {} as Record<string, FuelLog[]>)

    Object.keys(logsByVehicle).forEach(vehicleId => {
      const vehicleLogs = logsByVehicle[vehicleId].sort((a, b) => 
        new Date(a.fill_date).getTime() - new Date(b.fill_date).getTime()
      )

      for (let i = 1; i < vehicleLogs.length; i++) {
        const currentLog = vehicleLogs[i]
        const previousLog = vehicleLogs[i - 1]
        
        if (currentLog.is_full_tank && previousLog.is_full_tank) {
          const milesDriven = currentLog.odometer_reading - previousLog.odometer_reading
          const mpg = milesDriven / currentLog.fuel_amount
          currentLog.mpg = mpg > 0 && mpg < 100 ? mpg : undefined
        }
      }
    })

    return logs
  }

  const addFuelLog = async (logData: Omit<FuelLog, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('fuel_logs')
        .insert([{
          ...logData,
          user_id: user?.id
        }])
        .select()
        .single()

      if (error) throw error
      await fetchFuelLogs() // Refresh to recalculate MPG
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add fuel log')
    }
  }

  const updateFuelLog = async (id: string, updates: Partial<FuelLog>) => {
    try {
      const { data, error } = await supabase
        .from('fuel_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchFuelLogs() // Refresh to recalculate MPG
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update fuel log')
    }
  }

  const deleteFuelLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fuel_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchFuelLogs() // Refresh to recalculate MPG
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete fuel log')
    }
  }

  return {
    fuelLogs,
    loading,
    error,
    fetchFuelLogs,
    addFuelLog,
    updateFuelLog,
    deleteFuelLog
  }
}