
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { VehicleOverview } from '../components/Dashboard/VehicleOverview'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { useVehicles } from '../hooks/useVehicles'
import { useFuelLogs } from '../hooks/useFuelLogs'
import { Plus, TrendingUp, DollarSign, Calendar } from 'lucide-react'

export function Dashboard() {
  const navigate = useNavigate()
  const { vehicles, loading: vehiclesLoading } = useVehicles()
  const { fuelLogs } = useFuelLogs()

  // Calculate summary statistics
  const thisMonth = new Date()
  thisMonth.setDate(1)
  
  const monthlyFuelCost = fuelLogs
    .filter(log => new Date(log.fill_date) >= thisMonth)
    .reduce((sum, log) => sum + (log.total_cost || 0), 0)

  const avgMpg = fuelLogs
    .filter(log => log.mpg && log.mpg > 0)
    .reduce((sum, log, _, arr) => sum + (log.mpg || 0) / arr.length, 0)

  const upcomingMaintenance = vehicles.length * 2 // Placeholder

  if (vehiclesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Dashboard" />
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
      <Header title="Dashboard" />
      
      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${monthlyFuelCost.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Fuel Cost</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgMpg.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">MPG</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success-600" />
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingMaintenance}
              </p>
              <p className="text-xs text-gray-500">Services Due</p>
            </div>
            <Calendar className="w-8 h-8 text-warning-600" />
          </div>
        </Card>

        {/* Vehicles Section */}
        <div className="space-y-4">
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
                  <Plus className="w-8 h-8 text-gray-400" />
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
              {vehicles.map(vehicle => (
                <VehicleOverview
                  key={vehicle.id}
                  vehicle={vehicle}
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
