import { useNavigate, useSearchParams } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { MaintenanceForm } from '../components/Maintenance/MaintenanceForm'
import { useVehicles } from '../hooks/useVehicles'
import { useMaintenanceLogs } from '../hooks/useMaintenanceLogs'

export function AddMaintenance() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { vehicles } = useVehicles()
  const { categories, addMaintenanceLog } = useMaintenanceLogs()
  
  const vehicleId = searchParams.get('vehicle')
  const selectedVehicle = vehicleId ? vehicles.find(v => v.id === vehicleId) : null

  const handleSubmitMaintenanceLog = async (data: any) => {
    try {
      await addMaintenanceLog(data)
      navigate('/maintenance')
    } catch (error) {
      throw error
    }
  }

  const handleCancel = () => {
    navigate('/maintenance')
  }

  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Add Service Record" />
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You need to add a vehicle first</p>
            <button
              onClick={() => navigate('/vehicles/add')}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg"
            >
              Add Vehicle
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Add Service Record" />
      <div className="p-4">
        <MaintenanceForm
          vehicles={vehicles}
          categories={categories}
          onSubmit={handleSubmitMaintenanceLog}
          onCancel={handleCancel}
          initialData={selectedVehicle ? { vehicle_id: selectedVehicle.id } : undefined}
        />
      </div>
    </div>
  )
}