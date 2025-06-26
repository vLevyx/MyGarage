import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { useVehicles } from '../hooks/useVehicles'
import { useFuelLogs } from '../hooks/useFuelLogs'
import { 
  Fuel as FuelIcon, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  Edit,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'

export function Fuel() {
  const [searchParams] = useSearchParams()
  const { vehicles } = useVehicles()
  const { fuelLogs, addFuelLog, updateFuelLog, deleteFuelLog } = useFuelLogs()
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<any>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all')
  const [chartType, setChartType] = useState<'mpg' | 'cost' | 'combined'>('mpg')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Auto-open form if vehicle is specified in URL
  useEffect(() => {
    const vehicleId = searchParams.get('vehicle')
    if (vehicleId && !showForm) {
      setShowForm(true)
    }
  }, [searchParams, showForm])

  const filteredLogs = selectedVehicle === 'all' 
    ? fuelLogs 
    : fuelLogs.filter(log => log.vehicle_id === selectedVehicle)

  const stats = {
    totalFillups: filteredLogs.length,
    avgMpg: filteredLogs
      .filter(log => log.mpg && log.mpg > 0)
      .reduce((sum, log, _, arr) => sum + (log.mpg || 0) / arr.length, 0),
    totalCost: filteredLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0),
    lastFillup: filteredLogs[0]?.fill_date
  }

  const thisMonth = new Date()
  thisMonth.setDate(1)
  const monthlyStats = {
    fillups: filteredLogs.filter(log => new Date(log.fill_date) >= thisMonth).length,
    cost: filteredLogs
      .filter(log => new Date(log.fill_date) >= thisMonth)
      .reduce((sum, log) => sum + (log.total_cost || 0), 0)
  }

  const handleSubmitFuelLog = async (data: any) => {
    try {
      if (editingLog) {
        await updateFuelLog(editingLog.id, data)
      } else {
        await addFuelLog(data)
      }
      setShowForm(false)
      setEditingLog(null)
    } catch (error) {
      throw error
    }
  }

  const handleEditLog = (log: any) => {
    setEditingLog(log)
    setShowForm(true)
  }

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this fuel log?')) {
      return
    }

    setDeletingId(logId)
    try {
      await deleteFuelLog(logId)
    } catch (error) {
      console.error('Failed to delete fuel log:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    return vehicle ? (vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`) : 'Unknown Vehicle'
  }

  // Simple FuelLogForm placeholder component
  const FuelLogForm = ({ vehicles, onSubmit, onCancel, initialData }: any) => (
    <Card>
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? 'Edit Fuel Log' : 'Add Fuel Log'}
      </h3>
      <p className="text-gray-600 mb-4">
        Fuel log form coming soon. You have {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} available for tracking.
      </p>
      <div className="flex space-x-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit({})}>
          Save (Demo)
        </Button>
      </div>
    </Card>
  )

  // Simple FuelChart placeholder component
  const FuelChart = ({ fuelLogs, type }: { fuelLogs: any[], type: string }) => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <BarChart3 size={48} />
        <p className="text-gray-600 mt-2">
          Fuel chart coming soon
        </p>
        <p className="text-sm text-gray-500">
          Showing {type} data for {fuelLogs.length} logs
        </p>
      </div>
    </div>
  )

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title={editingLog ? 'Edit Fuel Log' : 'Add Fuel Log'} />
        <div className="p-4">
          <FuelLogForm
            vehicles={vehicles}
            onSubmit={handleSubmitFuelLog}
            onCancel={() => {
              setShowForm(false)
              setEditingLog(null)
            }}
            initialData={editingLog}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Fuel Tracking" />
      
      <div className="p-4 space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Fuel Economy</h2>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>Add Fill-up</span>
          </Button>
        </div>

        {/* Vehicle Filter */}
        <Card>
          <div className="flex items-center space-x-3">
            <FuelIcon className="w-5 h-5 text-primary-600" />
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg MPG</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgMpg ? stats.avgMpg.toFixed(1) : '--'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalCost.toFixed(0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlyStats.fillups}
                </p>
                <p className="text-xs text-gray-500">Fill-ups</p>
              </div>
              <Calendar className="w-8 h-8 text-warning-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${monthlyStats.cost.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Fuel Cost</p>
              </div>
              <DollarSign className="w-8 h-8 text-error-600" />
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Fuel Trends</h3>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:border-primary-500 focus:outline-none"
              >
                <option value="mpg">MPG Only</option>
                <option value="cost">Price Only</option>
                <option value="combined">MPG & Price</option>
              </select>
            </div>
          </div>
          
          <FuelChart fuelLogs={filteredLogs} type={chartType} />
        </Card>

        {/* Recent Fill-ups */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Fill-ups</h3>
          
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FuelIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No fuel logs yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start tracking your fuel economy by adding your first fill-up
              </p>
              <Button onClick={() => setShowForm(true)}>
                Add First Fill-up
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">
                        {format(new Date(log.fill_date), 'MMM dd, yyyy')}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditLog(log)}
                        >
                          <Edit size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteLog(log.id)}
                          disabled={deletingId === log.id}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-1">
                      {getVehicleName(log.vehicle_id)}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{log.fuel_amount} gal</span>
                      <span>{log.odometer_reading.toLocaleString()} mi</span>
                      {log.total_cost && <span>${log.total_cost.toFixed(2)}</span>}
                      {log.mpg && <span>{log.mpg.toFixed(1)} MPG</span>}
                    </div>
                    
                    {log.fuel_brand && (
                      <p className="text-xs text-gray-500 mt-1">
                        {log.fuel_brand} • {log.fuel_grade}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}