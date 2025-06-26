import { Card } from '../UI/Card'
import { ProgressBar } from '../UI/ProgressBar'
import { Vehicle } from '../../hooks/useVehicles'
import { MaintenanceLog } from '../../hooks/useMaintenanceLogs'
import { FuelLog } from '../../hooks/useFuelLogs'
import { 
  Car, 
  Cog, 
  Disc, 
  Circle, 
  Zap,
  Fuel,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface VehicleHealthScoreProps {
  vehicle: Vehicle
  maintenanceLogs: MaintenanceLog[]
  fuelLogs: FuelLog[]
}

interface ComponentHealth {
  name: string
  score: number
  status: 'excellent' | 'good' | 'attention' | 'critical'
  lastService?: string
  nextService?: string
  icon: React.ReactNode
  details: string[]
}

export function VehicleHealthScore({ vehicle, maintenanceLogs, fuelLogs }: VehicleHealthScoreProps) {
  const calculateComponentHealth = (): ComponentHealth[] => {
    const currentMiles = vehicle.current_odometer || 0
    const today = new Date()

    // Engine Health
    const engineServices = maintenanceLogs.filter(log => 
      log.category?.name?.toLowerCase().includes('oil') ||
      log.category?.name?.toLowerCase().includes('filter') ||
      log.category?.name?.toLowerCase().includes('spark')
    )
    const lastOilChange = engineServices.find(log => 
      log.category?.name?.toLowerCase().includes('oil')
    )
    const milesSinceOil = lastOilChange ? currentMiles - lastOilChange.odometer_reading : 5000
    const engineScore = Math.max(0, 100 - (milesSinceOil / 50)) // Decrease score as miles increase

    // Transmission Health
    const transmissionServices = maintenanceLogs.filter(log =>
      log.category?.name?.toLowerCase().includes('transmission')
    )
    const lastTransmissionService = transmissionServices[0]
    const milesSinceTransmission = lastTransmissionService ? 
      currentMiles - lastTransmissionService.odometer_reading : 30000
    const transmissionScore = Math.max(0, 100 - (milesSinceTransmission / 300))

    // Brake Health
    const brakeServices = maintenanceLogs.filter(log =>
      log.category?.name?.toLowerCase().includes('brake')
    )
    const lastBrakeService = brakeServices[0]
    const milesSinceBrakes = lastBrakeService ? 
      currentMiles - lastBrakeService.odometer_reading : 25000
    const brakeScore = Math.max(0, 100 - (milesSinceBrakes / 250))

    // Tire Health
    const tireServices = maintenanceLogs.filter(log =>
      log.category?.name?.toLowerCase().includes('tire') ||
      log.category?.name?.toLowerCase().includes('rotation')
    )
    const lastTireService = tireServices[0]
    const milesSinceTires = lastTireService ? 
      currentMiles - lastTireService.odometer_reading : 7500
    const tireScore = Math.max(0, 100 - (milesSinceTires / 75))

    // Electrical Health (based on battery and electrical services)
    const electricalServices = maintenanceLogs.filter(log =>
      log.category?.name?.toLowerCase().includes('battery') ||
      log.category?.name?.toLowerCase().includes('electrical') ||
      log.category?.name?.toLowerCase().includes('alternator')
    )
    const lastElectricalService = electricalServices[0]
    const monthsSinceElectrical = lastElectricalService ? 
      (today.getTime() - new Date(lastElectricalService.service_date).getTime()) / (1000 * 60 * 60 * 24 * 30) : 36
    const electricalScore = Math.max(0, 100 - (monthsSinceElectrical / 0.36))

    // Fuel System Health (based on fuel logs and patterns)
    const recentFuelLogs = fuelLogs
      .filter(log => log.fill_date)
      .sort((a, b) => new Date(b.fill_date).getTime() - new Date(a.fill_date).getTime())
      .slice(0, 10) // Last 10 fill-ups

    const avgMpg = recentFuelLogs
      .filter(log => log.mpg && log.mpg > 0)
      .reduce((sum, log, _, arr) => sum + (log.mpg || 0) / arr.length, 0)

    // Calculate expected MPG based on vehicle type/age (simplified)
    const vehicleAge = new Date().getFullYear() - (vehicle.year || 2020)
    const expectedMpg = Math.max(20, 35 - (vehicleAge * 0.5)) // Rough estimate

    const mpgEfficiency = avgMpg > 0 ? Math.min(100, (avgMpg / expectedMpg) * 100) : 75
    const fuelSystemScore = mpgEfficiency

    // Fuel consistency check (variance in MPG)
    const mpgValues = recentFuelLogs
      .filter(log => log.mpg && log.mpg > 0)
      .map(log => log.mpg || 0)
    
    let consistencyBonus = 0
    if (mpgValues.length >= 3) {
      const avgMpgForVariance = mpgValues.reduce((sum, mpg) => sum + mpg, 0) / mpgValues.length
      const variance = mpgValues.reduce((sum, mpg) => sum + Math.pow(mpg - avgMpgForVariance, 2), 0) / mpgValues.length
      const standardDeviation = Math.sqrt(variance)
      // Lower standard deviation = more consistent = better health
      consistencyBonus = Math.max(0, 10 - standardDeviation)
    }

    const adjustedFuelScore = Math.min(100, fuelSystemScore + consistencyBonus)

    const getStatus = (score: number): 'excellent' | 'good' | 'attention' | 'critical' => {
      if (score >= 85) return 'excellent'
      if (score >= 70) return 'good'
      if (score >= 50) return 'attention'
      return 'critical'
    }

    const getNextServiceMiles = (lastMiles: number, interval: number) => {
      const nextMiles = lastMiles + interval
      return nextMiles > currentMiles ? nextMiles : currentMiles + interval
    }

    return [
      {
        name: 'Engine',
        score: Math.round(engineScore),
        status: getStatus(engineScore),
        lastService: lastOilChange ? `${lastOilChange.odometer_reading.toLocaleString()} mi` : 'Unknown',
        nextService: lastOilChange ? 
          `${getNextServiceMiles(lastOilChange.odometer_reading, 5000).toLocaleString()} mi` : 
          `${(currentMiles + 5000).toLocaleString()} mi`,
        icon: <Cog className="w-5 h-5" />,
        details: [
          `Miles since oil change: ${milesSinceOil.toLocaleString()}`,
          `Oil changes: ${engineServices.filter(s => s.category?.name?.toLowerCase().includes('oil')).length}`,
          'Recommended: Every 5,000 miles'
        ]
      },
      {
        name: 'Transmission',
        score: Math.round(transmissionScore),
        status: getStatus(transmissionScore),
        lastService: lastTransmissionService ? 
          `${lastTransmissionService.odometer_reading.toLocaleString()} mi` : 'Unknown',
        nextService: lastTransmissionService ? 
          `${getNextServiceMiles(lastTransmissionService.odometer_reading, 30000).toLocaleString()} mi` : 
          `${(currentMiles + 30000).toLocaleString()} mi`,
        icon: <Cog className="w-5 h-5" />,
        details: [
          `Miles since service: ${milesSinceTransmission.toLocaleString()}`,
          `Services: ${transmissionServices.length}`,
          'Recommended: Every 30,000 miles'
        ]
      },
      {
        name: 'Brakes',
        score: Math.round(brakeScore),
        status: getStatus(brakeScore),
        lastService: lastBrakeService ? 
          `${lastBrakeService.odometer_reading.toLocaleString()} mi` : 'Unknown',
        nextService: lastBrakeService ? 
          `${getNextServiceMiles(lastBrakeService.odometer_reading, 25000).toLocaleString()} mi` : 
          `${(currentMiles + 25000).toLocaleString()} mi`,
        icon: <Disc className="w-5 h-5" />,
        details: [
          `Miles since service: ${milesSinceBrakes.toLocaleString()}`,
          `Services: ${brakeServices.length}`,
          'Recommended: Every 25,000 miles'
        ]
      },
      {
        name: 'Tires',
        score: Math.round(tireScore),
        status: getStatus(tireScore),
        lastService: lastTireService ? 
          `${lastTireService.odometer_reading.toLocaleString()} mi` : 'Unknown',
        nextService: lastTireService ? 
          `${getNextServiceMiles(lastTireService.odometer_reading, 7500).toLocaleString()} mi` : 
          `${(currentMiles + 7500).toLocaleString()} mi`,
        icon: <Circle className="w-5 h-5" />,
        details: [
          `Miles since rotation: ${milesSinceTires.toLocaleString()}`,
          `Rotations: ${tireServices.length}`,
          'Recommended: Every 7,500 miles'
        ]
      },
      {
        name: 'Electrical',
        score: Math.round(electricalScore),
        status: getStatus(electricalScore),
        lastService: lastElectricalService ? 
          new Date(lastElectricalService.service_date).toLocaleDateString() : 'Unknown',
        nextService: lastElectricalService ? 
          new Date(new Date(lastElectricalService.service_date).getTime() + (36 * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString() : 
          new Date(today.getTime() + (36 * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
        icon: <Zap className="w-5 h-5" />,
        details: [
          `Months since service: ${Math.round(monthsSinceElectrical)}`,
          `Services: ${electricalServices.length}`,
          'Recommended: Every 36 months'
        ]
      },
      {
        name: 'Fuel System',
        score: Math.round(adjustedFuelScore),
        status: getStatus(adjustedFuelScore),
        lastService: recentFuelLogs[0] ? 
          new Date(recentFuelLogs[0].fill_date).toLocaleDateString() : 'No data',
        nextService: 'Monitor continuously',
        icon: <Fuel className="w-5 h-5" />,
        details: [
          `Current avg MPG: ${avgMpg > 0 ? avgMpg.toFixed(1) : 'N/A'}`,
          `Expected MPG: ${expectedMpg.toFixed(1)}`,
          `Fuel logs analyzed: ${recentFuelLogs.length}`,
          `Efficiency: ${avgMpg > 0 ? ((avgMpg / expectedMpg) * 100).toFixed(0) + '%' : 'N/A'}`
        ]
      }
    ]
  }

  const components = calculateComponentHealth()
  const overallScore = Math.round(components.reduce((sum, comp) => sum + comp.score, 0) / components.length)
  
  const getOverallStatus = (score: number) => {
    if (score >= 85) return { status: 'excellent', color: 'text-success-600', bg: 'bg-success-50', icon: CheckCircle }
    if (score >= 70) return { status: 'good', color: 'text-success-600', bg: 'bg-success-50', icon: CheckCircle }
    if (score >= 50) return { status: 'attention', color: 'text-warning-600', bg: 'bg-warning-50', icon: Clock }
    return { status: 'critical', color: 'text-error-600', bg: 'bg-error-50', icon: AlertTriangle }
  }

  const overall = getOverallStatus(overallScore)
  const OverallIcon = overall.icon

  const getComponentColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-success-600'
      case 'good': return 'text-success-600'
      case 'attention': return 'text-warning-600'
      case 'critical': return 'text-error-600'
      default: return 'text-gray-600'
    }
  }

  const getProgressVariant = (status: string): 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'excellent':
      case 'good':
        return 'success'
      case 'attention':
        return 'warning'
      case 'critical':
        return 'danger'
      default:
        return 'success'
    }
  }

  return (
    <div className="space-y-4">
      {/* Overall Health Score */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${overall.bg}`}>
              <Car className={`w-6 h-6 ${overall.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Health Score</h3>
              <p className="text-sm text-gray-600">Overall system health assessment</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <OverallIcon className={`w-5 h-5 ${overall.color}`} />
              <span className={`text-2xl font-bold ${overall.color}`}>
                {overallScore}
              </span>
            </div>
            <p className={`text-sm font-medium capitalize ${overall.color}`}>
              {overall.status}
            </p>
          </div>
        </div>

        <ProgressBar
          progress={overallScore}
          variant={getProgressVariant(overall.status)}
          showPercentage={false}
        />
      </Card>

      {/* Component Health Breakdown */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Health</h3>
        
        <div className="space-y-4">
          {components.map((component) => (
            <div key={component.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`${getComponentColor(component.status)}`}>
                    {component.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{component.name}</p>
                    <p className="text-xs text-gray-500">
                      Last: {component.lastService} • Next: {component.nextService}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`text-lg font-bold ${getComponentColor(component.status)}`}>
                    {component.score}
                  </span>
                  <p className={`text-xs font-medium capitalize ${getComponentColor(component.status)}`}>
                    {component.status}
                  </p>
                </div>
              </div>
              
              <ProgressBar
                progress={component.score}
                variant={getProgressVariant(component.status)}
                showPercentage={false}
              />
              
              <div className="ml-8 space-y-1">
                {component.details.map((detail, index) => (
                  <p key={index} className="text-xs text-gray-500">• {detail}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Critical Alerts */}
      {components.some(c => c.status === 'critical') && (
        <Card>
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-error-600" />
            <h3 className="text-lg font-semibold text-error-900">Critical Maintenance Required</h3>
          </div>
          
          <div className="space-y-2">
            {components
              .filter(c => c.status === 'critical')
              .map(component => (
                <div key={component.name} className="bg-error-50 border border-error-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-error-900">
                    {component.name} requires immediate attention
                  </p>
                  <p className="text-xs text-error-600">
                    Last service: {component.lastService}
                  </p>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}