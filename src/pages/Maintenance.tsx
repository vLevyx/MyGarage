import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { ProgressBar } from '../components/UI/ProgressBar'
import { MaintenanceForm } from '../components/Maintenance/MaintenanceForm'
import { useVehicles } from '../hooks/useVehicles'
import { useMaintenanceLogs } from '../hooks/useMaintenanceLogs'
import { 
  Wrench, 
  Plus, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'

export function Maintenance() {
  const [searchParams] = useSearchParams()
  const { vehicles } = useVehicles()
  const { maintenanceLogs, categories, reminders, addMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog } = useMaintenanceLogs()
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<any>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'reminders' | 'history' | 'schedule'>('reminders')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Auto-open form if vehicle is specified in URL
  useEffect(() => {
    const vehicleId = searchParams.get('vehicle')
    if (vehicleId && !showForm) {
      setShowForm(true)
    }
  }, [searchParams, showForm])

  const filteredLogs = selectedVehicle === 'all' 
    ? maintenanceLogs 
    : maintenanceLogs.filter(log => log.vehicle_id === selectedVehicle)

  const filteredReminders = selectedVehicle === 'all'
    ? reminders
    : reminders.filter(reminder => reminder.vehicle_id === selectedVehicle)

  const stats = {
    totalServices: filteredLogs.length,
    totalCost: filteredLogs.reduce((sum, log) => sum + (log.cost || 0), 0),
    lastService: filteredLogs[0]?.service_date,
    upcomingServices: filteredReminders.filter(r => r.is_active).length
  }

  const getMaintenanceProgress = (reminder: any) => {
    const vehicle = vehicles.find(v => v.id === reminder.vehicle_id)
    if (!vehicle?.current_odometer || !reminder.last_service_miles || !reminder.reminder_miles) {
      return 0
    }
    
    const milesSinceService = vehicle.current_odometer - reminder.last_service_miles
    const progress = (milesSinceService / reminder.reminder_miles) * 100
    return Math.min(100, Math.max(0, progress))
  }

  const getMaintenanceStatus = (progress: number) => {
    if (progress >= 100) return 'overdue'
    if (progress >= 80) return 'due-soon'
    return 'good'
  }

  const handleSubmitMaintenanceLog = async (data: any) => {
    try {
      if (editingLog) {
        await updateMaintenanceLog(editingLog.id, data)
      } else {
        await addMaintenanceLog(data)
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
    if (!confirm('Are you sure you want to delete this maintenance record?')) {
      return
    }

    setDeletingId(logId)
    try {
      await deleteMaintenanceLog(logId)
    } catch (error) {
      console.error('Failed to delete maintenance log:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    return vehicle ? (vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`) : 'Unknown Vehicle'
  }

  const maintenanceSchedule = [
    { miles: 5000, services: ['Oil Change', 'Oil Filter'] },
    { miles: 10000, services: ['Oil Change', 'Oil Filter', 'Tire Rotation'] },
    { miles: 15000, services: ['Oil Change', 'Oil Filter', 'Air Filter'] },
    { miles: 20000, services: ['Oil Change', 'Oil Filter', 'Tire Rotation'] },
    { miles: 25000, services: ['Oil Change', 'Oil Filter', 'Brake Inspection'] },
    { miles: 30000, services: ['Oil Change', 'Oil Filter', 'Tire Rotation', 'Transmission Service'] },
    { miles: 35000, services: ['Oil Change', 'Oil Filter'] },
    { miles: 40000, services: ['Oil Change', 'Oil Filter', 'Tire Rotation'] },
    { miles: 45000, services: ['Oil Change', 'Oil Filter', 'Spark Plugs'] },
    { miles: 50000, services: ['Oil Change', 'Oil Filter', 'Tire Rotation', 'Brake Service'] }
  ]

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title={editingLog ? 'Edit Service Record' : 'Add Service Record'} />
        <div className="p-4">
          <MaintenanceForm
            vehicles={vehicles}
            categories={categories}
            onSubmit={handleSubmitMaintenanceLog}
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

  const tabs = [
    { id: 'reminders', label: 'Reminders', icon: AlertTriangle },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'schedule', label: 'Schedule', icon: Calendar }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Maintenance" />
      
      <div className="p-4 space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Service & Maintenance</h2>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>Add Service</span>
          </Button>
        </div>

        {/* Vehicle Filter */}
        <Card>
          <div className="flex items-center space-x-3">
            <Wrench className="w-5 h-5 text-primary-600" />
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
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalServices}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success-600" />
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
        {activeTab === 'reminders' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Reminders</h3>
            
            {filteredReminders.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No maintenance reminders
                </h3>
                <p className="text-gray-600 mb-4">
                  Set up maintenance reminders to stay on top of your vehicle's service needs
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReminders.map(reminder => {
                  const progress = getMaintenanceProgress(reminder)
                  const status = getMaintenanceStatus(progress)
                  
                  return (
                    <div key={reminder.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {reminder.category?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getVehicleName(reminder.vehicle_id)}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status === 'overdue' ? 'bg-error-50 text-error-600' :
                          status === 'due-soon' ? 'bg-warning-50 text-warning-600' :
                          'bg-success-50 text-success-600'
                        }`}>
                          {status === 'overdue' ? 'Overdue' :
                           status === 'due-soon' ? 'Due Soon' :
                           'Up to Date'}
                        </div>
                      </div>
                      
                      <ProgressBar
                        progress={progress}
                        variant={status === 'overdue' ? 'danger' : status === 'due-soon' ? 'warning' : 'success'}
                        showPercentage={false}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service History</h3>
            
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No service records yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start tracking your vehicle maintenance by adding your first service record
                </p>
                <Button onClick={() => setShowForm(true)}>
                  Add First Service
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{log.category?.name}</p>
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
                        <span>{format(new Date(log.service_date), 'MMM dd, yyyy')}</span>
                        <span>{log.odometer_reading.toLocaleString()} mi</span>
                        {log.cost && <span>${log.cost.toFixed(0)}</span>}
                        <span>{log.is_diy ? 'DIY' : log.service_provider || 'Shop'}</span>
                      </div>
                      
                      {log.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Normal Maintenance Schedule</h3>
              <p className="text-sm text-gray-600 mb-4">
                Recommended maintenance intervals for normal driving conditions
              </p>
              
              <div className="space-y-3">
                {maintenanceSchedule.map(item => (
                  <div key={item.miles} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.miles.toLocaleString()} miles
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.services.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Severe Maintenance Schedule</h3>
              <p className="text-sm text-gray-600 mb-4">
                For severe driving conditions (frequent towing, extreme temperatures, stop-and-go traffic)
              </p>
              
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-warning-700">
                  <strong>Severe conditions include:</strong> Frequent short trips, extreme hot or cold weather, 
                  dusty conditions, frequent towing, or stop-and-go city driving.
                </p>
              </div>
              
              <div className="space-y-3">
                {maintenanceSchedule.map(item => (
                  <div key={item.miles} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(item.miles * 0.75).toLocaleString()} miles
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.services.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}