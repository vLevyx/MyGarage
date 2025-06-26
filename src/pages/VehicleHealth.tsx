import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { VehicleHealthScore } from '../components/Vehicle/VehicleHealthScore'
import { useVehicles } from '../hooks/useVehicles'
import { useMaintenanceLogs } from '../hooks/useMaintenanceLogs'
import { useFuelLogs } from '../hooks/useFuelLogs'
import { ArrowLeft, Plus } from 'lucide-react'

export function VehicleHealth() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { vehicles } = useVehicles()
  const { maintenanceLogs } = useMaintenanceLogs(id)
  const { fuelLogs } = useFuelLogs(id)

  const vehicle = vehicles.find(v => v.id === id)

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Vehicle Health" />
        <div className="p-4">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Vehicle not found</p>
              <Button onClick={() => navigate('/vehicles')}>
                Back to Vehicles
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Vehicle Health" />
      
      <div className="p-4 space-y-4">
        {/* Back Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Vehicle</span>
        </Button>

        {/* Vehicle Info */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              </h2>
              <p className="text-gray-600">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
              </p>
              <p className="text-sm text-gray-500">
                Current Odometer: {vehicle.current_odometer?.toLocaleString() || 0} {vehicle.odometer_unit}
              </p>
            </div>
            
            <Button
              size="sm"
              onClick={() => navigate(`/maintenance/add?vehicle=${vehicle.id}`)}
              className="flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add Service</span>
            </Button>
          </div>
        </Card>

        {/* Health Score Component */}
        <VehicleHealthScore
          vehicle={vehicle}
          maintenanceLogs={maintenanceLogs}
          fuelLogs={fuelLogs}
        />
      </div>
    </div>
  )
}