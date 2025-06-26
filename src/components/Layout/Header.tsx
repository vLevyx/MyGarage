
import { useAuth } from '../../contexts/AuthContext'
import { LogOut, User } from 'lucide-react'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <User size={20} className="text-gray-600" />
          <span className="text-sm text-gray-700">
            {user?.user_metadata?.full_name || user?.email}
          </span>
        </div>
        
        <button
          onClick={signOut}
          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}
