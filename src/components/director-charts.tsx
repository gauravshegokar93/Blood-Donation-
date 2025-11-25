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
       ticks: { display: false }
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
        anchor: 'end' as const,
        align: 'top' as const,
        formatter: (value: number) => value > 0 ? value.toLocaleString() : '',
        color: '#4A5568',
        font: {
            weight: 'bold' as const
        }
     },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        drawOnChartArea: false,
      },
      ticks: { display: false }
    },
    x: {
         grid: {
             display: false
         }
    }
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
        backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) { return; }

            const colors = [
                { base: 'rgba(59, 130, 246, 1)', light: 'rgba(147, 197, 253, 1)'},
                { base: 'rgba(249, 115, 22, 1)', light: 'rgba(253, 186, 116, 1)'},
                { base: 'rgba(34, 197, 94, 1)', light: 'rgba(134, 239, 172, 1)'},
                { base: 'rgba(168, 85, 247, 1)', light: 'rgba(216, 180, 254, 1)'},
            ];
            
            const selectedColor = colors[context.dataIndex % colors.length];

            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            gradient.addColorStop(0, selectedColor.base);
            gradient.addColorStop(1, selectedColor.light);
            return gradient;
        },
        borderColor: [
            'rgba(37, 99, 235, 1)',
            'rgba(217, 119, 6, 1)',
            'rgba(22, 163, 74, 1)',
            'rgba(147, 51, 234, 1)',
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={commonBarOptions as any} />
    </div>
  );
}


export function YearlyTrendChart({ data }: { data: { [key: string]: number } }) {
  const allYears = Array.from({length: 6}, (_, i) => `202${i}-${(i + 1).toString().slice(-2)}`);
  
  const historicalYears = allYears.filter(year => year !== '2025-26');
  
  const historicalValues = historicalYears.map(year => data[year] || 0);
  const liveValue = data['2025-26'] || 0;

  const chartData: ChartData<'line'> = {
    labels: allYears.map(y => y.split('-')[0]),
    datasets: [
      {
        label: 'Historical',
        data: [...historicalValues, liveValue], 
        fill: true,
        backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) { return; }
             const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
             gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
             gradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)');
             return gradient;
        },
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  return (
    <div style={{ height: '350px' }}>
      <Line data={chartData} options={commonLineOptions as any} />
    </div>
  );
}
