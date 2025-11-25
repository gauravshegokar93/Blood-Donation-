'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const commonBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: {
      display: false,
    },
    datalabels: {
      anchor: 'end' as const,
      align: 'right' as const,
      color: '#4A5568',
      font: {
        weight: 'bold' as const,
      },
      formatter: (value: number) => value > 0 ? value.toLocaleString() : '',
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        display: false,
      },
    },
  },
};

const commonLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
     datalabels: {
        display: false, // Generally too cluttered for line charts
     },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
  elements: {
    line: {
      tension: 0.1,
    }
  }
};


export function LocationRegistrationsChart({ data }: { data: { [key: string]: number } }) {
  const labels = Object.keys(data);
  const values = Object.values(data);
  
  const chartData: ChartData<'bar'> = {
    labels: labels,
    datasets: [
      {
        label: 'Registrations',
        data: values,
        backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(34, 197, 94, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(217, 119, 6, 0.7)',
        ],
        borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(217, 119, 6, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={commonBarOptions} />
    </div>
  );
}


export function YearlyTrendChart({ data }: { data: { [key: string]: number } }) {
  const allYears = Array.from({length: 6}, (_, i) => `202${i}-${(i + 1).toString().slice(-2)}`);
  
  const historicalYears = allYears.filter(year => year !== '2025-26');
  
  const historicalValues = historicalYears.map(year => data[year] || 0);
  const liveValue = data['2025-26'] || 0;

  const chartData: ChartData<'line'> = {
    labels: allYears,
    datasets: [
      {
        label: 'Historical Registrations',
        data: [...historicalValues, null], 
        borderColor: 'rgba(107, 114, 128, 0.5)',
        backgroundColor: 'rgba(107, 114, 128, 0.5)',
        borderDash: [5, 5],
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Live Registrations (2025-26)',
        data: [...Array(historicalValues.length).fill(null), liveValue], 
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
        pointStyle: 'rectRot',
      },
    ],
  };

  return (
    <div style={{ height: '350px' }}>
      <Line data={chartData} options={commonLineOptions} />
    </div>
  );
}
