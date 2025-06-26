import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { DocumentForm } from '../components/Glovebox/DocumentForm'
import { useVehicles } from '../hooks/useVehicles'
import { useVehicleDocuments } from '../hooks/useVehicleDocuments'
import { 
  FileText, 
  Plus, 
  Car,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  Shield,
  BookOpen,
  Award,
  File
} from 'lucide-react'
import { format } from 'date-fns'

export function Glovebox() {
  const navigate = useNavigate()
  const { vehicles } = useVehicles()
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.id || '')
  const { documents, addDocument, updateDocument, deleteDocument } = useVehicleDocuments(selectedVehicle)
  const [showForm, setShowForm] = useState(false)
  const [editingDocument, setEditingDocument] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const vehicle = vehicles.find(v => v.id === selectedVehicle)

  const handleSubmitDocument = async (data: any) => {
    try {
      if (editingDocument) {
        await updateDocument(editingDocument.id, data)
      } else {
        await addDocument(data)
      }
      setShowForm(false)
      setEditingDocument(null)
    } catch (error) {
      throw error
    }
  }

  const handleEditDocument = (document: any) => {
    setEditingDocument(document)
    setShowForm(true)
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    setDeletingId(documentId)
    try {
      await deleteDocument(documentId)
    } catch (error) {
      console.error('Failed to delete document:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return <Car className="w-5 h-5 text-primary-600" />
      case 'insurance':
        return <Shield className="w-5 h-5 text-success-600" />
      case 'warranty':
        return <Award className="w-5 h-5 text-warning-600" />
      case 'manual':
        return <BookOpen className="w-5 h-5 text-purple-600" />
      default:
        return <File className="w-5 h-5 text-gray-600" />
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'registration':
        return 'Registration'
      case 'insurance':
        return 'Insurance'
      case 'warranty':
        return 'Warranty'
      case 'manual':
        return 'Owner\'s Manual'
      default:
        return 'Other'
    }
  }

  const isExpiringSoon = (expirationDate: string) => {
    const expDate = new Date(expirationDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    return expDate <= thirtyDaysFromNow && expDate >= today
  }

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date()
  }

  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Glovebox" />
        <div className="p-4">
          <Card>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No vehicles yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add a vehicle first to store its documents
              </p>
              <Button onClick={() => navigate('/vehicles/add')}>
                Add Your First Vehicle
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title={editingDocument ? 'Edit Document' : 'Add Document'} />
        <div className="p-4">
          <DocumentForm
            vehicleId={selectedVehicle}
            onSubmit={handleSubmitDocument}
            onCancel={() => {
              setShowForm(false)
              setEditingDocument(null)
            }}
            initialData={editingDocument}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Glovebox" />
      
      <div className="p-4 space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Documents</h2>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-1"
            disabled={!selectedVehicle}
          >
            <Plus size={16} />
            <span>Add Document</span>
          </Button>
        </div>

        {/* Vehicle Selector */}
        <Card>
          <div className="flex items-center space-x-3">
            <Car className="w-5 h-5 text-primary-600" />
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Vehicle Info */}
        {vehicle && (
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Car className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </h3>
                <p className="text-sm text-gray-600">
                  {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">VIN</p>
                <p className="font-medium">{vehicle.vin || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600">License Plate</p>
                <p className="font-medium">
                  {vehicle.license_plate ? `${vehicle.license_plate} (${vehicle.license_state})` : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Engine</p>
                <p className="font-medium">{vehicle.engine || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600">Fuel Type</p>
                <p className="font-medium capitalize">{vehicle.fuel_type || 'Gasoline'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Documents */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
          
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents yet
              </h3>
              <p className="text-gray-600 mb-4">
                Store important vehicle documents like registration, insurance, and warranties
              </p>
              <Button onClick={() => setShowForm(true)}>
                Add First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map(document => (
                <div key={document.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    {getDocumentIcon(document.document_type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {document.title}
                        </p>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {getDocumentTypeLabel(document.document_type)}
                        </span>
                      </div>
                      
                      {document.description && (
                        <p className="text-xs text-gray-600 mb-1">
                          {document.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Added {format(new Date(document.created_at), 'MMM dd, yyyy')}</span>
                        
                        {document.expiration_date && (
                          <span className={`flex items-center space-x-1 ${
                            isExpired(document.expiration_date) ? 'text-error-600' :
                            isExpiringSoon(document.expiration_date) ? 'text-warning-600' :
                            'text-gray-500'
                          }`}>
                            <Calendar size={12} />
                            <span>
                              Expires {format(new Date(document.expiration_date), 'MMM dd, yyyy')}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {document.document_url && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(document.document_url!, '_blank')}
                      >
                        <ExternalLink size={12} />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditDocument(document)}
                    >
                      <Edit size={12} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteDocument(document.id)}
                      disabled={deletingId === document.id}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Expiration Alerts */}
        {documents.some(doc => doc.expiration_date && (isExpired(doc.expiration_date) || isExpiringSoon(doc.expiration_date))) && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiration Alerts</h3>
            
            <div className="space-y-2">
              {documents
                .filter(doc => doc.expiration_date && (isExpired(doc.expiration_date) || isExpiringSoon(doc.expiration_date)))
                .map(document => (
                  <div key={document.id} className={`p-3 rounded-lg border ${
                    isExpired(document.expiration_date!) ? 'bg-error-50 border-error-200' : 'bg-warning-50 border-warning-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${
                          isExpired(document.expiration_date!) ? 'text-error-900' : 'text-warning-900'
                        }`}>
                          {document.title}
                        </p>
                        <p className={`text-xs ${
                          isExpired(document.expiration_date!) ? 'text-error-600' : 'text-warning-600'
                        }`}>
                          {isExpired(document.expiration_date!) ? 'Expired' : 'Expires soon'} - 
                          {format(new Date(document.expiration_date!), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={isExpired(document.expiration_date!) ? 'danger' : 'secondary'}
                        onClick={() => handleEditDocument(document)}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}