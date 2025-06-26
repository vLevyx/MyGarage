import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { useVehicles } from '../hooks/useVehicles'
import { useFuelLogs } from '../hooks/useFuelLogs'
import { Car, Plus, Gauge, Fuel, Calendar, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export function Vehicles() {
  const navigate = useNavigate()
  const { vehicles, loading, deleteVehicle } = useVehicles()
  const { fuelLogs } = useFuelLogs()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getVehicleStats = (vehicleId: string) => {
    const vehicleFuelLogs = fuelLogs.filter(log => log.vehicle_id === vehicleId)
    const avgMpg = vehicleFuelLogs
      .filter(log => log.mpg && log.mpg > 0)
      .reduce((sum, log, _, arr) => sum + (log.mpg || 0) / arr.length, 0)
    
    const totalCost = vehicleFuelLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0)
    const lastFillup = vehicleFuelLogs[0]?.fill_date

    return { avgMpg, totalCost, lastFillup }
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle? This will also delete all associated fuel logs and maintenance records.')) {
      return
    }

    setDeletingId(vehicleId)
    try {
      await deleteVehicle(vehicleId)
    } catch (error) {
      console.error('Failed to delete vehicle:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Vehicles" />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Vehicles" />
      
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Vehicles</h2>
          <Button
            size="sm"
            onClick={() => navigate('/vehicles/add')}
            className="flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>Add Vehicle</span>
          </Button>
        </div>

        {vehicles.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No vehicles yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add your first vehicle to start tracking maintenance and fuel economy
              </p>
              <Button onClick={() => navigate('/vehicles/add')}>
                Add Your First Vehicle
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {vehicles.map(vehicle => {
              const stats = getVehicleStats(vehicle.id)
              return (
                <Card key={vehicle.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-50 rounded-lg">
                        <Car className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                          {vehicle.trim && ` ${vehicle.trim}`}
                        </p>
                        {vehicle.license_plate && (
                          <p className="text-xs text-gray-500">
                            {vehicle.license_plate} • {vehicle.license_state}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        disabled={deletingId === vehicle.id}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Gauge className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-600">Odometer</p>
                      <p className="font-semibold">
                        {vehicle.current_odometer?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Fuel className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-600">Avg MPG</p>
                      <p className="font-semibold">
                        {stats.avgMpg ? stats.avgMpg.toFixed(1) : '--'}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-600">Last Fill</p>
                      <p className="font-semibold text-xs">
                        {stats.lastFillup ? format(new Date(stats.lastFillup), 'MMM dd') : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/fuel/add?vehicle=${vehicle.id}`)}
                      className="flex-1"
                    >
                      Add Fuel Log
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}