import React, { useState } from 'react'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'
import { Card } from '../UI/Card'
import { VehicleDocument } from '../../hooks/useVehicleDocuments'
import { FileText, Calendar } from 'lucide-react'

interface DocumentFormProps {
  vehicleId: string
  onSubmit: (data: Omit<VehicleDocument, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<VehicleDocument>
}

export function DocumentForm({ vehicleId, onSubmit, onCancel, initialData }: DocumentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    vehicle_id: vehicleId,
    document_type: initialData?.document_type || 'other' as const,
    title: initialData?.title || '',
    description: initialData?.description || '',
    document_url: initialData?.document_url || '',
    expiration_date: initialData?.expiration_date || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const submitData = {
        ...formData,
        description: formData.description || null,
        document_url: formData.document_url || null,
        expiration_date: formData.expiration_date || null
      }

      await onSubmit(submitData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const documentTypes = [
    { value: 'registration', label: 'Registration' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'warranty', label: 'Warranty' },
    { value: 'manual', label: 'Owner\'s Manual' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-50 rounded-lg">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {initialData ? 'Edit Document' : 'Add Document'}
            </h2>
            <p className="text-sm text-gray-600">
              Store important vehicle documents
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            value={formData.document_type}
            onChange={(e) => handleInputChange('document_type', e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            required
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Document title"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Additional details about the document..."
          />
        </div>

        <Input
          label="Document URL"
          value={formData.document_url}
          onChange={(e) => handleInputChange('document_url', e.target.value)}
          placeholder="https://example.com/document.pdf"
        />

        <Input
          type="date"
          label="Expiration Date"
          value={formData.expiration_date}
          onChange={(e) => handleInputChange('expiration_date', e.target.value)}
          icon={<Calendar size={16} className="text-gray-400" />}
        />

        {error && (
          <div className="text-error-600 text-sm bg-error-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : 'Save Document'}
          </Button>
        </div>
      </form>
    </Card>
  )
}