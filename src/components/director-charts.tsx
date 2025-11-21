'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};

// --- Yearly Registrations Chart (Bar) ---
export function YearlyRegistrationsChart({ data }: { data: { [key: string]: number } }) {
  const labels = Object.keys(data).sort();
  const values = labels.map(label => data[label]);

  const chartData: ChartData<'bar'> = {
    labels: labels,
    datasets: [
      {
        label: 'Total Registrations',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    ...commonOptions,
     scales: {
        y: {
            beginAtZero: true
        }
    },
    plugins: {
        ...commonOptions.plugins,
        title: {
            display: true,
            text: 'Total registrations across all locations per year.'
        }
    }
  };

  return (
    <div style={{ height: '400px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}


// --- Location Performance Chart (Bar) ---
export function LocationPerformanceChart({ data }: { data: { [key: string]: number } }) {
  const labels = Object.keys(data);
  const values = Object.values(data);
  
  const chartData: ChartData<'bar'> = {
    labels: labels,
    datasets: [
      {
        label: 'Live Registrations',
        data: values,
        backgroundColor: [
            'rgba(34, 197, 94, 0.6)',
            'rgba(239, 68, 68, 0.6)',
            'rgba(217, 119, 6, 0.6)',
            'rgba(168, 85, 247, 0.6)',
        ],
        borderColor: [
            'rgba(22, 163, 74, 1)',
            'rgba(220, 38, 38, 1)',
            'rgba(180, 83, 9, 1)',
            'rgba(147, 51, 234, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
     ...commonOptions,
     indexAxis: 'y' as const,
     scales: {
        x: {
            beginAtZero: true
        }
    },
    plugins: {
        ...commonOptions.plugins,
        legend: { display: false }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}


// --- Status Breakdown Chart (Doughnut) ---
export function StatusBreakdownChart({ data }: { data: { accepted: number, rejected: number, pending: number } }) {
  const chartData: ChartData<'doughnut'> = {
    labels: ['Accepted', 'Rejected', 'Pending'],
    datasets: [
      {
        label: '# of Registrations',
        data: [data.accepted, data.rejected, data.pending],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)', // Green
          'rgba(239, 68, 68, 0.6)',  // Red
          'rgba(59, 130, 246, 0.6)', // Blue
        ],
        borderColor: [
          'rgba(22, 163, 74, 1)',
          'rgba(220, 38, 38, 1)',
          'rgba(37, 99, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ height: '300px' }}>
      <Doughnut data={chartData} options={commonOptions} />
    </div>
  );
}
