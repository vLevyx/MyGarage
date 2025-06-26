
import { clsx } from 'clsx'

interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  variant?: 'success' | 'warning' | 'danger'
  showPercentage?: boolean
}

export function ProgressBar({ 
  progress, 
  label, 
  variant = 'success', 
  showPercentage = true 
}: ProgressBarProps) {
  const getColor = () => {
    if (progress >= 80) return 'danger'
    if (progress >= 60) return 'warning'
    return 'success'
  }

  const color = variant === 'success' ? getColor() : variant

  const colorClasses = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-error-500',
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={clsx(
            'h-2 rounded-full transition-all duration-300',
            colorClasses[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}
