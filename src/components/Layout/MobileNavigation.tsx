
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Car, 
  Fuel, 
  Wrench, 
  FileText, 
  Settings
} from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/fuel', icon: Fuel, label: 'Fuel' },
  { to: '/maintenance', icon: Wrench, label: 'Service' },
  { to: '/glovebox', icon: FileText, label: 'Glovebox' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
