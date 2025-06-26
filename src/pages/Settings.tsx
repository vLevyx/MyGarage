import React, { useState } from 'react'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  User, 
  Settings as SettingsIcon, 
  Gauge, 
  Bell, 
  Shield,
  Download,
  Trash2,
  Save
} from 'lucide-react'

export function Settings() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [profile, setProfile] = useState({
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    preferred_units: 'imperial'
  })

  const [notifications, setNotifications] = useState({
    maintenance_reminders: true,
    fuel_tracking: true,
    document_expiration: true,
    email_notifications: false
  })

  const [maintenanceSettings, setMaintenanceSettings] = useState({
    oil_change_miles: 5000,
    oil_change_months: 6,
    tire_rotation_miles: 7500,
    tire_rotation_months: 6,
    brake_inspection_miles: 12000,
    brake_inspection_months: 12,
    registration_reminder_days: 30
  })

  React.useEffect(() => {
    fetchUserProfile()
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          preferred_units: data.preferred_units || 'imperial'
        })
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user?.id,
          email: profile.email,
          full_name: profile.full_name,
          preferred_units: profile.preferred_units,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      // This would implement data export functionality
      alert('Data export feature coming soon!')
    } catch (err) {
      setError('Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your data.')) {
      return
    }

    if (!confirm('This will permanently delete all your vehicles, fuel logs, maintenance records, and documents. Type "DELETE" to confirm.')) {
      return
    }

    try {
      // This would implement account deletion
      alert('Account deletion feature coming soon. Please contact support.')
    } catch (err) {
      setError('Failed to delete account')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Settings" />
      
      <div className="p-4 space-y-6">
        {/* Profile Settings */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
              <p className="text-sm text-gray-600">Manage your account information</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              value={profile.full_name}
              onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your full name"
            />

            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              disabled
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Units
              </label>
              <select
                value={profile.preferred_units}
                onChange={(e) => setProfile(prev => ({ ...prev, preferred_units: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="imperial">Imperial (Miles, Gallons, °F)</option>
                <option value="metric">Metric (Kilometers, Liters, °C)</option>
              </select>
            </div>

            {error && (
              <div className="text-error-600 text-sm bg-error-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="text-success-600 text-sm bg-success-50 p-3 rounded-lg">
                {success}
              </div>
            )}

            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
            </Button>
          </div>
        </Card>

        {/* Maintenance Reminder Settings */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-warning-50 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Maintenance Reminders</h2>
              <p className="text-sm text-gray-600">Set default reminder intervals</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Oil Change</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Miles"
                  value={maintenanceSettings.oil_change_miles.toString()}
                  onChange={(e) => setMaintenanceSettings(prev => ({ 
                    ...prev, 
                    oil_change_miles: parseInt(e.target.value) || 0 
                  }))}
                  icon={<Gauge size={16} className="text-gray-400" />}
                />
                <Input
                  type="number"
                  label="Months"
                  value={maintenanceSettings.oil_change_months.toString()}
                  onChange={(e) => setMaintenanceSettings(prev => ({ 
                    ...prev, 
                    oil_change_months: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tire Rotation</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Miles"
                  value={maintenanceSettings.tire_rotation_miles.toString()}
                  onChange={(e) => setMaintenanceSettings(prev => ({ 
                    ...prev, 
                    tire_rotation_miles: parseInt(e.target.value) || 0 
                  }))}
                  icon={<Gauge size={16} className="text-gray-400" />}
                />
                <Input
                  type="number"
                  label="Months"
                  value={maintenanceSettings.tire_rotation_months.toString()}
                  onChange={(e) => setMaintenanceSettings(prev => ({ 
                    ...prev, 
                    tire_rotation_months: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Brake Inspection</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Miles"
                  value={maintenanceSettings.brake_inspection_miles.toString()}
                  onChange={(e) => setMaintenanceSettings(prev => ({ 
                    ...prev, 
                    brake_inspection_miles: parseInt(e.target.value) || 0 
                  }))}
                  icon={<Gauge size={16} className="text-gray-400" />}
                />
                <Input
                  type="number"
                  label="Months"
                  value={maintenanceSettings.brake_inspection_months.toString()}
                  onChange={(e) => setMaintenanceSettings(prev => ({ 
                    ...prev, 
                    brake_inspection_months: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            <Input
              type="number"
              label="Registration Reminder (Days Before Expiration)"
              value={maintenanceSettings.registration_reminder_days.toString()}
              onChange={(e) => setMaintenanceSettings(prev => ({ 
                ...prev, 
                registration_reminder_days: parseInt(e.target.value) || 0 
              }))}
            />
          </div>
        </Card>

        {/* Notification Settings */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-success-50 rounded-lg">
              <Bell className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">Choose what notifications you receive</p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {key === 'maintenance_reminders' && 'Get notified when maintenance is due'}
                    {key === 'fuel_tracking' && 'Reminders to log fuel fill-ups'}
                    {key === 'document_expiration' && 'Alerts for expiring documents'}
                    {key === 'email_notifications' && 'Receive notifications via email'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications(prev => ({ 
                    ...prev, 
                    [key]: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Shield className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
              <p className="text-sm text-gray-600">Export or delete your data</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={handleExportData}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Download size={16} />
              <span>Export All Data</span>
            </Button>

            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete Account</span>
            </Button>
          </div>
        </Card>

        {/* Sign Out */}
        <Card>
          <Button
            variant="secondary"
            onClick={signOut}
            className="w-full"
          >
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  )
}