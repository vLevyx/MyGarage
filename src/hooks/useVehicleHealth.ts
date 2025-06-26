import { useMemo } from 'react'
import { Vehicle } from './useVehicles'
import { MaintenanceLog } from './useMaintenanceLogs'
import { FuelLog } from './useFuelLogs'

export interface ComponentHealth {
  name: string
  score: number
  status: 'excellent' | 'good' | 'attention' | 'critical'
  lastServiceMiles?: number
  nextServiceMiles?: number
  lastServiceDate?: string
  recommendations: string[]
}

export interface VehicleHealthData {
  overallScore: number
  overallStatus: 'excellent' | 'good' | 'attention' | 'critical'
  components: ComponentHealth[]
  criticalIssues: string[]
  upcomingMaintenance: string[]
}

export function useVehicleHealth(
  vehicle: Vehicle,
  maintenanceLogs: MaintenanceLog[],
  fuelLogs: FuelLog[]
): VehicleHealthData {
  return useMemo(() => {
    const currentMiles = vehicle.current_odometer || 0
    const today = new Date()

    // Helper function to get services by category
    const getServicesByCategory = (keywords: string[]) => {
      return maintenanceLogs.filter(log =>
        keywords.some(keyword =>
          log.category?.name?.toLowerCase().includes(keyword.toLowerCase())
        )
      ).sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime())
    }

    // Helper function to calculate score based on miles/time since service
    const calculateScore = (
      milesSince: number,
      maxMiles: number,
      monthsSince?: number,
      maxMonths?: number
    ) => {
      let mileScore = Math.max(0, 100 - (milesSince / maxMiles) * 100)
      
      if (monthsSince !== undefined && maxMonths !== undefined) {
        let timeScore = Math.max(0, 100 - (monthsSince / maxMonths) * 100)
        return Math.min(mileScore, timeScore)
      }
      
      return mileScore
    }

    // Engine Health (Oil changes, filters, spark plugs)
    const engineServices = getServicesByCategory(['oil', 'filter', 'spark'])
    const lastOilChange = engineServices.find(s => s.category?.name?.toLowerCase().includes('oil'))
    const milesSinceOil = lastOilChange ? currentMiles - lastOilChange.odometer_reading : 5000
    const monthsSinceOil = lastOilChange ? 
      (today.getTime() - new Date(lastOilChange.service_date).getTime()) / (1000 * 60 * 60 * 24 * 30) : 6
    const engineScore = calculateScore(milesSinceOil, 5000, monthsSinceOil, 6)

    // Transmission Health
    const transmissionServices = getServicesByCategory(['transmission'])
    const lastTransmission = transmissionServices[0]
    const milesSinceTransmission = lastTransmission ? currentMiles - lastTransmission.odometer_reading : 30000
    const transmissionScore = calculateScore(milesSinceTransmission, 30000)

    // Brake Health
    const brakeServices = getServicesByCategory(['brake', 'pad'])
    const lastBrakeService = brakeServices[0]
    const milesSinceBrakes = lastBrakeService ? currentMiles - lastBrakeService.odometer_reading : 25000
    const brakeScore = calculateScore(milesSinceBrakes, 25000)

    // Tire Health
    const tireServices = getServicesByCategory(['tire', 'rotation'])
    const lastTireService = tireServices[0]
    const milesSinceTires = lastTireService ? currentMiles - lastTireService.odometer_reading : 7500
    const tireScore = calculateScore(milesSinceTires, 7500)

    // Electrical Health
    const electricalServices = getServicesByCategory(['battery', 'electrical', 'alternator'])
    const lastElectricalService = electricalServices[0]
    const monthsSinceElectrical = lastElectricalService ? 
      (today.getTime() - new Date(lastElectricalService.service_date).getTime()) / (1000 * 60 * 60 * 24 * 30) : 36
    const electricalScore = calculateScore(0, 1, monthsSinceElectrical, 36)

    // Helper function to determine status
    const getStatus = (score: number): 'excellent' | 'good' | 'attention' | 'critical' => {
      if (score >= 85) return 'excellent'
      if (score >= 70) return 'good'
      if (score >= 50) return 'attention'
      return 'critical'
    }

    // Build component health data
    const components: ComponentHealth[] = [
      {
        name: 'Engine',
        score: Math.round(engineScore),
        status: getStatus(engineScore),
        lastServiceMiles: lastOilChange?.odometer_reading,
        nextServiceMiles: lastOilChange ? lastOilChange.odometer_reading + 5000 : currentMiles + 5000,
        lastServiceDate: lastOilChange?.service_date,
        recommendations: [
          milesSinceOil > 5000 ? 'Oil change overdue' : `Oil change due in ${5000 - milesSinceOil} miles`,
          monthsSinceOil > 6 ? 'Oil change overdue by time' : `Oil change due in ${Math.round(6 - monthsSinceOil)} months`,
          'Check air filter condition',
          'Inspect spark plugs if over 30,000 miles'
        ]
      },
      {
        name: 'Transmission',
        score: Math.round(transmissionScore),
        status: getStatus(transmissionScore),
        lastServiceMiles: lastTransmission?.odometer_reading,
        nextServiceMiles: lastTransmission ? lastTransmission.odometer_reading + 30000 : currentMiles + 30000,
        lastServiceDate: lastTransmission?.service_date,
        recommendations: [
          milesSinceTransmission > 30000 ? 'Transmission service overdue' : `Transmission service due in ${30000 - milesSinceTransmission} miles`,
          'Check transmission fluid level and color',
          'Listen for unusual shifting sounds'
        ]
      },
      {
        name: 'Brakes',
        score: Math.round(brakeScore),
        status: getStatus(brakeScore),
        lastServiceMiles: lastBrakeService?.odometer_reading,
        nextServiceMiles: lastBrakeService ? lastBrakeService.odometer_reading + 25000 : currentMiles + 25000,
        lastServiceDate: lastBrakeService?.service_date,
        recommendations: [
          milesSinceBrakes > 25000 ? 'Brake inspection overdue' : `Brake inspection due in ${25000 - milesSinceBrakes} miles`,
          'Check brake pad thickness',
          'Inspect brake fluid level and color',
          'Listen for squealing or grinding sounds'
        ]
      },
      {
        name: 'Tires',
        score: Math.round(tireScore),
        status: getStatus(tireScore),
        lastServiceMiles: lastTireService?.odometer_reading,
        nextServiceMiles: lastTireService ? lastTireService.odometer_reading + 7500 : currentMiles + 7500,
        lastServiceDate: lastTireService?.service_date,
        recommendations: [
          milesSinceTires > 7500 ? 'Tire rotation overdue' : `Tire rotation due in ${7500 - milesSinceTires} miles`,
          'Check tire pressure monthly',
          'Inspect tread depth and wear patterns',
          'Check for sidewall damage or bulges'
        ]
      },
      {
        name: 'Electrical',
        score: Math.round(electricalScore),
        status: getStatus(electricalScore),
        lastServiceDate: lastElectricalService?.service_date,
        recommendations: [
          monthsSinceElectrical > 36 ? 'Battery replacement may be needed' : `Battery good for ${Math.round(36 - monthsSinceElectrical)} more months`,
          'Test battery voltage regularly',
          'Check alternator charging rate',
          'Inspect electrical connections for corrosion'
        ]
      }
    ]

    // Calculate overall score
    const overallScore = Math.round(components.reduce((sum, comp) => sum + comp.score, 0) / components.length)
    const overallStatus = getStatus(overallScore)

    // Identify critical issues
    const criticalIssues = components
      .filter(comp => comp.status === 'critical')
      .map(comp => `${comp.name} requires immediate attention`)

    // Identify upcoming maintenance
    const upcomingMaintenance = components
      .filter(comp => comp.status === 'attention')
      .map(comp => `${comp.name} service needed soon`)

    return {
      overallScore,
      overallStatus,
      components,
      criticalIssues,
      upcomingMaintenance
    }
  }, [vehicle, maintenanceLogs, fuelLogs])
}