import React, { useState } from 'react'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'
import { Card } from '../UI/Card'
import { Vehicle } from '../../hooks/useVehicles'
import { MaintenanceLog, MaintenanceCategory } from '../../hooks/useMaintenanceLogs'
import { Calendar, Gauge, DollarSign, Wrench } from 'lucide-react'

interface MaintenanceFormProps {
  vehicles: Vehicle[]
  categories: MaintenanceCategory[]
  onSubmit: (data: Omit<MaintenanceLog, 'id' | 'category'>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<MaintenanceLog>
}

export function MaintenanceForm({ 
  vehicles, 
  categories, 
  onSubmit, 
  onCancel, 
  initialData 
}: MaintenanceFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    vehicle_id: initialData?.vehicle_id || vehicles[0]?.id || '',
    category_id: initialData?.category_id || categories[0]?.id || '',
    service_date: initialData?.service_date || new Date().toISOString().split('T')[0],
    odometer_reading: initialData?.odometer_reading?.toString() || '',
    cost: initialData?.cost?.toString() || '',
    service_provider: initialData?.service_provider || '',
    is_diy: initialData?.is_diy ?? false,
    parts_used: initialData?.parts_used || '',
    notes: initialData?.notes || '',
    next_service_miles: initialData?.next_service_miles?.toString() || '',
    next_service_date: initialData?.next_service_date || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const submitData = {
        ...formData,
        odometer_reading: parseInt(formData.odometer_reading),
        cost: formData.cost ? parseFloat(formData.cost) : null,
        service_provider: formData.service_provider || null,
        parts_used: formData.parts_used || null,
        notes: formData.notes || null,
        next_service_miles: formData.next_service_miles ? parseInt(formData.next_service_miles) : null,
        next_service_date: formData.next_service_date || null,
        user_id: '' // Will be set by the hook
      }

      await onSubmit(submitData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save maintenance log')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Wrench className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {initialData ? 'Edit Service Record' : 'Add Service Record'}
            </h2>
            <p className="text-sm text-gray-600">
              Log maintenance and service details
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Category
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            required
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Service Date"
            value={formData.service_date}
            onChange={(e) => handleInputChange('service_date', e.target.value)}
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
            step="0.01"
            label="Cost"
            value={formData.cost}
            onChange={(e) => handleInputChange('cost', e.target.value)}
            icon={<DollarSign size={16} className="text-gray-400" />}
            placeholder="150.00"
          />

          <Input
            label="Service Provider"
            value={formData.service_provider}
            onChange={(e) => handleInputChange('service_provider', e.target.value)}
            placeholder="Shop name or DIY"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_diy"
            checked={formData.is_diy}
            onChange={(e) => handleInputChange('is_diy', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="is_diy" className="text-sm text-gray-700">
            DIY (Do It Yourself)
          </label>
        </div>

        <Input
          label="Parts Used"
          value={formData.parts_used}
          onChange={(e) => handleInputChange('parts_used', e.target.value)}
          placeholder="Oil filter, spark plugs, etc."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Next Service Miles"
            value={formData.next_service_miles}
            onChange={(e) => handleInputChange('next_service_miles', e.target.value)}
            placeholder="55000"
          />

          <Input
            type="date"
            label="Next Service Date"
            value={formData.next_service_date}
            onChange={(e) => handleInputChange('next_service_date', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Additional notes about the service..."
          />
        </div>

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
            {loading ? 'Saving...' : 'Save Service Record'}
          </Button>
        </div>
      </form>
    </Card>
  )
}