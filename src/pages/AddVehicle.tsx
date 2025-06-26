import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Input } from '../components/UI/Input'
import { Button } from '../components/UI/Button'
import { useVehicles } from '../hooks/useVehicles'
import { decodeVin, VinData } from '../lib/vin-decoder'
import { Search, Car, Plus } from 'lucide-react'

export function AddVehicle() {
  const navigate = useNavigate()
  const { addVehicle } = useVehicles()
  const [loading, setLoading] = useState(false)
  const [vinLoading, setVinLoading] = useState(false)
  const [error, setError] = useState('')
  const [vinData, setVinData] = useState<VinData | null>(null)
  
  const [formData, setFormData] = useState({
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    engine: '',
    transmission: '',
    fuel_type: 'gasoline',
    nickname: '',
    license_plate: '',
    license_state: '',
    current_odometer: '',
    odometer_unit: 'miles'
  })

  const handleVinLookup = async () => {
    if (!formData.vin || formData.vin.length !== 17) {
      setError('Please enter a valid 17-character VIN')
      return
    }

    setVinLoading(true)
    setError('')

    try {
      const data = await decodeVin(formData.vin)
      if (data) {
        setVinData(data)
        setFormData(prev => ({
          ...prev,
          year: data.year || '',
          make: data.make || '',
          model: data.model || '',
          trim: data.trim || '',
          engine: data.engine || '',
          fuel_type: data.fuelType?.toLowerCase() || 'gasoline'
        }))
      } else {
        setError('Could not decode VIN. Please enter vehicle details manually.')
      }
    } catch (err) {
      setError('Failed to decode VIN. Please enter vehicle details manually.')
    } finally {
      setVinLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const vehicleData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        current_odometer: formData.current_odometer ? parseInt(formData.current_odometer) : null,
        vin: formData.vin || null,
        trim: formData.trim || null,
        engine: formData.engine || null,
        transmission: formData.transmission || null,
        license_plate: formData.license_plate || null,
        license_state: formData.license_state || null,
        nickname: formData.nickname || null
      }

      await addVehicle(vehicleData)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add vehicle')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Add Vehicle" />
      
      <div className="p-4 space-y-6">
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Car className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Vehicle Information
              </h2>
              <p className="text-sm text-gray-600">
                Enter VIN for auto-fill or add details manually
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* VIN Section */}
            <div className="space-y-3">
              <Input
                label="VIN (Vehicle Identification Number)"
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                placeholder="Enter 17-character VIN"
                maxLength={17}
              />
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleVinLookup}
                disabled={!formData.vin || formData.vin.length !== 17 || vinLoading}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Search size={16} />
                <span>{vinLoading ? 'Decoding VIN...' : 'Auto-Fill from VIN'}</span>
              </Button>
            </div>

            {vinData && (
              <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                <p className="text-sm text-success-700 font-medium">
                  ✓ VIN decoded successfully
                </p>
              </div>
            )}

            {/* Vehicle Details */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
              
              <Input
                label="Make"
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                placeholder="Toyota"
                required
              />
            </div>

            <Input
              label="Model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="Camry"
              required
            />

            <Input
              label="Trim (Optional)"
              value={formData.trim}
              onChange={(e) => handleInputChange('trim', e.target.value)}
              placeholder="LE, XLE, SE, etc."
            />

            <Input
              label="Engine (Optional)"
              value={formData.engine}
              onChange={(e) => handleInputChange('engine', e.target.value)}
              placeholder="2.5L 4-Cylinder"
            />

            <Input
              label="Transmission (Optional)"
              value={formData.transmission}
              onChange={(e) => handleInputChange('transmission', e.target.value)}
              placeholder="Automatic, Manual, CVT, etc."
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type
                </label>
                <select
                  value={formData.fuel_type}
                  onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                  <option value="flex">Flex Fuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer Unit
                </label>
                <select
                  value={formData.odometer_unit}
                  onChange={(e) => handleInputChange('odometer_unit', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="miles">Miles</option>
                  <option value="kilometers">Kilometers</option>
                </select>
              </div>
            </div>

            <Input
              label="Current Odometer Reading"
              type="number"
              value={formData.current_odometer}
              onChange={(e) => handleInputChange('current_odometer', e.target.value)}
              placeholder="50000"
              min="0"
            />

            <Input
              label="Nickname (Optional)"
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              placeholder="My Car, Work Truck, etc."
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="License Plate"
                value={formData.license_plate}
                onChange={(e) => handleInputChange('license_plate', e.target.value.toUpperCase())}
                placeholder="ABC123"
              />
              
              <Input
                label="State"
                value={formData.license_state}
                onChange={(e) => handleInputChange('license_state', e.target.value.toUpperCase())}
                placeholder="CA"
                maxLength={2}
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
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <Plus size={16} />
                <span>{loading ? 'Adding...' : 'Add Vehicle'}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}