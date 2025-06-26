import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { FuelLog } from '../../hooks/useFuelLogs'
import { format } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface FuelChartProps {
  fuelLogs: FuelLog[]
  type: 'mpg' | 'cost' | 'combined'
}

export function FuelChart({ fuelLogs, type }: FuelChartProps) {
  const sortedLogs = fuelLogs
    .filter(log => log.mpg && log.mpg > 0)
    .sort((a, b) => new Date(a.fill_date).getTime() - new Date(b.fill_date).getTime())

  const labels = sortedLogs.map(log => format(new Date(log.fill_date), 'MMM dd'))
  const mpgData = sortedLogs.map(log => log.mpg || 0)
  const costData = sortedLogs.map(log => log.price_per_unit || 0)

  const datasets = []

  if (type === 'mpg' || type === 'combined') {
    datasets.push({
      label: 'MPG',
      data: mpgData,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      yAxisID: 'y',
      tension: 0.1
    })
  }

  if (type === 'cost' || type === 'combined') {
    datasets.push({
      label: 'Price per Gallon',
      data: costData,
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      yAxisID: type === 'combined' ? 'y1' : 'y',
      tension: 0.1
    })
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: type === 'mpg' ? 'Fuel Economy Trend' :
              type === 'cost' ? 'Fuel Price Trend' :
              'Fuel Economy & Price Trends'
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Fill Date'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: type === 'cost' ? 'Price ($)' : 'MPG'
        }
      },
      ...(type === 'combined' && {
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Price ($)'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      })
    },
  }

  const data = {
    labels,
    datasets
  }

  if (sortedLogs.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No fuel data available for chart
      </div>
    )
  }

  return (
    <div className="h-64">
      <Line options={options} data={data} />
    </div>
  )
}