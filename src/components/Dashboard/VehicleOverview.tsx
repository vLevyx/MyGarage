import { Card } from '../UI/Card'
import { ProgressBar } from '../UI/ProgressBar'
import { Vehicle } from '../../hooks/useVehicles'
import { Car, Gauge, Fuel, Wrench } from 'lucide-react'

interface VehicleOverviewProps {
  vehicle: Vehicle
  fuelStats?: {
    avgMpg: number
    totalCost: number
    lastFillup: string
  }
  maintenanceAlerts?: {
    oilChange: number
    tireRotation: number
    brakeInspection: number
  }
  onClick: () => void
}

export function VehicleOverview({ 
  vehicle, 
  fuelStats, 
  maintenanceAlerts, 
  onClick 
}: VehicleOverviewProps) {
  const getMaintenanceStatus = () => {
    if (!maintenanceAlerts) return 'success'
    
    const alerts = Object.values(maintenanceAlerts)
    const maxAlert = Math.max(...alerts)
    
    if (maxAlert >= 100) return 'danger'
    if (maxAlert >= 80) return 'warning'
    return 'success'
  }

  const maintenanceStatus = getMaintenanceStatus()
  const statusColors = {
    success: 'text-success-600 bg-success-50',
    warning: 'text-warning-600 bg-warning-50',
    danger: 'text-error-600 bg-error-50'
  }

  const statusLabels = {
    success: 'Up to date',
    warning: 'Attention needed',
    danger: 'Overdue service'
  }

  return (
    <Card onClick={onClick} className="hover:shadow-md transition-shadow">
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
            </p>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[maintenanceStatus]}`}>
          {statusLabels[maintenanceStatus]}
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
            {fuelStats?.avgMpg ? fuelStats.avgMpg.toFixed(1) : '--'}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Wrench className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-sm text-gray-600">Next Service</p>
          <p className="font-semibold text-xs">
            {maintenanceAlerts ? `${Math.min(...Object.values(maintenanceAlerts)).toFixed(0)}%` : '--'}
          </p>
        </div>
      </div>

      {maintenanceAlerts && (
        <div className="space-y-2">
          <ProgressBar
            progress={maintenanceAlerts.oilChange}
            label="Oil Change"
            showPercentage={false}
          />
          <ProgressBar
            progress={maintenanceAlerts.tireRotation}
            label="Tire Rotation"
            showPercentage={false}
          />
        </div>
      )}
    </Card>
  )
}