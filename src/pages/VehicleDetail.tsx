import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { ProgressBar } from '../components/UI/ProgressBar'
import { FuelChart } from '../components/Fuel/FuelChart'
import { VehicleHealthScore } from '../components/Vehicle/VehicleHealthScore'
import { useVehicles } from '../hooks/useVehicles'
import { useFuelLogs } from '../hooks/useFuelLogs'
import { useMaintenanceLogs } from '../hooks/useMaintenanceLogs'
import { 
  Car, 
  Fuel, 
  Wrench, 
  TrendingUp, 
  DollarSign, 
  Plus,
  ArrowLeft,
  Activity
} from 'lucide-react'
import { format } from 'date-fns'

export function VehicleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { vehicles } = useVehicles()
  const { fuelLogs } = useFuelLogs(id)
  const { maintenanceLogs, reminders } = useMaintenanceLogs(id)
  const [activeTab, setActiveTab] = useState<'overview' | 'fuel' | 'maintenance' | 'health'>('overview')

  const vehicle = vehicles.find(v => v.id === id)

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Vehicle Not Found" />
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

  const fuelStats = {
    avgMpg: fuelLogs
      .filter(log => log.mpg && log.mpg > 0)
      .reduce((sum, log, _, arr) => sum + (log.mpg || 0) / arr.length, 0),
    totalCost: fuelLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0),
    lastFillup: fuelLogs[0]?.fill_date,
    totalFillups: fuelLogs.length
  }

  const maintenanceStats = {
    totalServices: maintenanceLogs.length,
    totalCost: maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0),
    lastService: maintenanceLogs[0]?.service_date,
    upcomingServices: reminders.filter(r => r.is_active).length
  }

  const getMaintenanceProgress = (reminder: any) => {
    if (!vehicle.current_odometer || !reminder.last_service_miles || !reminder.reminder_miles) {
      return 0
    }
    
    const milesSinceService = vehicle.current_odometer - reminder.last_service_miles
    const progress = (milesSinceService / reminder.reminder_miles) * 100
    return Math.min(100, Math.max(0, progress))
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Car },
    { id: 'fuel', label: 'Fuel', icon: Fuel },
    { id: 'maintenance', label: 'Service', icon: Wrench },
    { id: 'health', label: 'Health', icon: Activity }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
      
      <div className="p-4 space-y-4">
        {/* Back Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/vehicles')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Vehicles</span>
        </Button>

        {/* Vehicle Info Card */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary-50 rounded-lg">
              <Car className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              </h2>
              <p className="text-gray-600">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
              </p>
              {vehicle.license_plate && (
                <p className="text-sm text-gray-500">
                  {vehicle.license_plate} • {vehicle.license_state}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Current Odometer</p>
              <p className="text-lg font-semibold">
                {vehicle.current_odometer?.toLocaleString() || 0} {vehicle.odometer_unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fuel Type</p>
              <p className="text-lg font-semibold capitalize">
                {vehicle.fuel_type || 'Gasoline'}
              </p>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg MPG</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fuelStats.avgMpg.toFixed(1)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-success-600" />
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Fuel Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${fuelStats.totalCost.toFixed(0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary-600" />
                </div>
              </Card>
            </div>

            {/* Maintenance Reminders */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Maintenance Status</h3>
                <Button
                  size="sm"
                  onClick={() => navigate(`/maintenance/add?vehicle=${vehicle.id}`)}
                >
                  <Plus size={16} />
                </Button>
              </div>

              {reminders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No maintenance reminders set up
                </p>
              ) : (
                <div className="space-y-3">
                  {reminders.slice(0, 3).map(reminder => (
                    <ProgressBar
                      key={reminder.id}
                      progress={getMaintenanceProgress(reminder)}
                      label={reminder.category?.name || 'Unknown Service'}
                      showPercentage={false}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                {fuelLogs.slice(0, 3).map(log => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Fuel className="w-4 h-4 text-primary-600" />
                      <div>
                        <p className="text-sm font-medium">Fuel Fill-up</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(log.fill_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{log.fuel_amount} gal</p>
                      {log.mpg && (
                        <p className="text-xs text-gray-500">{log.mpg.toFixed(1)} MPG</p>
                      )}
                    </div>
                  </div>
                ))}

                {maintenanceLogs.slice(0, 2).map(log => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Wrench className="w-4 h-4 text-success-600" />
                      <div>
                        <p className="text-sm font-medium">{log.category?.name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(log.service_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {log.cost && (
                        <p className="text-sm font-medium">${log.cost.toFixed(0)}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {log.is_diy ? 'DIY' : 'Shop'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'fuel' && (
          <div className="space-y-4">
            {/* Fuel Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Fill-ups</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {fuelStats.totalFillups}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Last Fill-up</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {fuelStats.lastFillup ? format(new Date(fuelStats.lastFillup), 'MMM dd') : '--'}
                  </p>
                </div>
              </Card>
            </div>

            {/* Fuel Chart */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Economy Trend</h3>
              <FuelChart fuelLogs={fuelLogs} type="mpg" />
            </Card>

            {/* Add Fuel Button */}
            <Button
              onClick={() => navigate(`/fuel/add?vehicle=${vehicle.id}`)}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Fuel Log</span>
            </Button>

            {/* Recent Fuel Logs */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Fill-ups</h3>
              
              {fuelLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No fuel logs yet
                </p>
              ) : (
                <div className="space-y-3">
                  {fuelLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(log.fill_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.fuel_amount} gal • {log.odometer_reading.toLocaleString()} mi
                        </p>
                      </div>
                      <div className="text-right">
                        {log.total_cost && (
                          <p className="text-sm font-medium">${log.total_cost.toFixed(2)}</p>
                        )}
                        {log.mpg && (
                          <p className="text-xs text-gray-500">{log.mpg.toFixed(1)} MPG</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            {/* Maintenance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {maintenanceStats.totalServices}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${maintenanceStats.totalCost.toFixed(0)}
                  </p>
                </div>
              </Card>
            </div>

            {/* Maintenance Reminders */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Reminders</h3>
              
              {reminders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No maintenance reminders set up
                </p>
              ) : (
                <div className="space-y-3">
                  {reminders.map(reminder => (
                    <ProgressBar
                      key={reminder.id}
                      progress={getMaintenanceProgress(reminder)}
                      label={reminder.category?.name || 'Unknown Service'}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Add Service Button */}
            <Button
              onClick={() => navigate(`/maintenance/add?vehicle=${vehicle.id}`)}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Service Record</span>
            </Button>

            {/* Recent Services */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service History</h3>
              
              {maintenanceLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No service records yet
                </p>
              ) : (
                <div className="space-y-3">
                  {maintenanceLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium">{log.category?.name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(log.service_date), 'MMM dd, yyyy')} • 
                          {log.odometer_reading.toLocaleString()} mi
                        </p>
                      </div>
                      <div className="text-right">
                        {log.cost && (
                          <p className="text-sm font-medium">${log.cost.toFixed(0)}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {log.is_diy ? 'DIY' : log.service_provider || 'Shop'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'health' && (
          <VehicleHealthScore
            vehicle={vehicle}
            maintenanceLogs={maintenanceLogs}
            fuelLogs={fuelLogs}
          />
        )}
      </div>
    </div>
  )
}