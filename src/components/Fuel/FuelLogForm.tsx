import React, { useState } from 'react'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'
import { Card } from '../UI/Card'
import { Vehicle } from '../../hooks/useVehicles'
import { FuelLog } from '../../hooks/useFuelLogs'
import { Calendar, Gauge, Fuel, DollarSign, MapPin } from 'lucide-react'

interface FuelLogFormProps {
  vehicles: Vehicle[]
  onSubmit: (data: Omit<FuelLog, 'id'>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<FuelLog>
}

export function FuelLogForm({ vehicles, onSubmit, onCancel, initialData }: FuelLogFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    vehicle_id: initialData?.vehicle_id || vehicles[0]?.id || '',
    fill_date: initialData?.fill_date || new Date().toISOString().split('T')[0],
    odometer_reading: initialData?.odometer_reading?.toString() || '',
    fuel_amount: initialData?.fuel_amount?.toString() || '',
    fuel_unit: initialData?.fuel_unit || 'gallons',
    price_per_unit: initialData?.price_per_unit?.toString() || '',
    total_cost: initialData?.total_cost?.toString() || '',
    fuel_grade: initialData?.fuel_grade || 'regular',
    fuel_brand: initialData?.fuel_brand || '',
    station_location: initialData?.station_location || '',
    is_full_tank: initialData?.is_full_tank ?? true,
    notes: initialData?.notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const submitData = {
        ...formData,
        odometer_reading: parseInt(formData.odometer_reading),
        fuel_amount: parseFloat(formData.fuel_amount),
        price_per_unit: formData.price_per_unit ? parseFloat(formData.price_per_unit) : null,
        total_cost: formData.total_cost ? parseFloat(formData.total_cost) : null,
        fuel_brand: formData.fuel_brand || null,
        station_location: formData.station_location || null,
        notes: formData.notes || null
      }

      await onSubmit(submitData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fuel log')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateTotalCost = () => {
    const amount = parseFloat(formData.fuel_amount)
    const price = parseFloat(formData.price_per_unit)
    if (amount && price) {
      const total = (amount * price).toFixed(2)
      setFormData(prev => ({ ...prev, total_cost: total }))
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Fuel className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {initialData ? 'Edit Fuel Log' : 'Add Fuel Log'}
            </h2>
            <p className="text-sm text-gray-600">
              Record your fuel fill-up details
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle
          </label>
          <select
            value={formData.vehicle_id}
            onChange={(e) => handleInputChange('vehicle_id', e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            required
          >
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Fill Date"
            value={formData.fill_date}
            onChange={(e) => handleInputChange('fill_date', e.target.value)}
            icon={<Calendar size={16} className="text-gray-400" />}
            required
          />

          <Input
            type="number"
            label="Odometer Reading"
            value={formData.odometer_reading}
            onChange={(e) => handleInputChange('odometer_reading', e.target.value)}
            icon={<Gauge size={16} className="text-gray-400" />}
            placeholder="50000"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            step="0.001"
            label="Fuel Amount"
            value={formData.fuel_amount}
            onChange={(e) => handleInputChange('fuel_amount', e.target.value)}
            placeholder="12.5"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={formData.fuel_unit}
              onChange={(e) => handleInputChange('fuel_unit', e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="gallons">Gallons</option>
              <option value="liters">Liters</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            step="0.001"
            label="Price per Unit"
            value={formData.price_per_unit}
            onChange={(e) => handleInputChange('price_per_unit', e.target.value)}
            onBlur={calculateTotalCost}
            icon={<DollarSign size={16} className="text-gray-400" />}
            placeholder="3.45"
          />

          <Input
            type="number"
            step="0.01"
            label="Total Cost"
            value={formData.total_cost}
            onChange={(e) => handleInputChange('total_cost', e.target.value)}
            icon={<DollarSign size={16} className="text-gray-400" />}
            placeholder="43.13"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Grade
            </label>
            <select
              value={formData.fuel_grade}
              onChange={(e) => handleInputChange('fuel_grade', e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="regular">Regular (87)</option>
              <option value="midgrade">Mid-Grade (89)</option>
              <option value="premium">Premium (91+)</option>
              <option value="diesel">Diesel</option>
              <option value="e85">E85</option>
            </select>
          </div>

          <Input
            label="Fuel Brand"
            value={formData.fuel_brand}
            onChange={(e) => handleInputChange('fuel_brand', e.target.value)}
            placeholder="Shell, Exxon, etc."
          />
        </div>

        <Input
          label="Station Location"
          value={formData.station_location}
          onChange={(e) => handleInputChange('station_location', e.target.value)}
          icon={<MapPin size={16} className="text-gray-400" />}
          placeholder="123 Main St, City, State"
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_full_tank"
            checked={formData.is_full_tank}
            onChange={(e) => handleInputChange('is_full_tank', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="is_full_tank" className="text-sm text-gray-700">
            Full tank fill-up (required for accurate MPG calculation)
          </label>
        </div>

        <Input
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Any additional notes..."
        />

        {error && (
          <div className="text-error-600 text-sm bg-error-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : 'Save Fuel Log'}
          </Button>
        </div>
      </form>
    </Card>
  )
}