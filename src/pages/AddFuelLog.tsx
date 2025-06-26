import { useNavigate, useSearchParams } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { FuelLogForm } from '../components/Fuel/FuelLogForm'
import { useVehicles } from '../hooks/useVehicles'
import { useFuelLogs } from '../hooks/useFuelLogs'

export function AddFuelLog() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { vehicles } = useVehicles()
  const { addFuelLog } = useFuelLogs()
  
  const vehicleId = searchParams.get('vehicle')
  const selectedVehicle = vehicleId ? vehicles.find(v => v.id === vehicleId) : null

  const handleSubmitFuelLog = async (data: any) => {
    try {
      await addFuelLog(data)
      navigate('/fuel')
    } catch (error) {
      throw error
    }
  }

  const handleCancel = () => {
    navigate('/fuel')
  }

  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Add Fuel Log" />
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
      <Header title="Add Fuel Log" />
      <div className="p-4">
        <FuelLogForm
          vehicles={vehicles}
          onSubmit={handleSubmitFuelLog}
          onCancel={handleCancel}
          initialData={selectedVehicle ? { vehicle_id: selectedVehicle.id } : undefined}
        />
      </div>
    </div>
  )
}