'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartData,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};

// --- Registration Status Chart ---
export function RegistrationStatusChart({ data }: { data: { accepted: number, rejected: number, pending: number } }) {
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

// --- Blood Group Chart ---
export function BloodGroupChart({ data }: { data: { [key: string]: number } }) {
  const labels = Object.keys(data);
  const values = Object.values(data);
  
  const chartData: ChartData<'doughnut'> = {
    labels: labels,
    datasets: [
      {
        label: 'Donors',
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
        ],
        borderColor: [
           'rgba(255, 99, 132, 1)',
           'rgba(54, 162, 235, 1)',
           'rgba(255, 206, 86, 1)',
           'rgba(75, 192, 192, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)',
           'rgba(159, 159, 159, 1)',
           'rgba(83, 102, 255, 1)',
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


// --- Agency Chart ---
export function AgencyChart({ data }: { data: { [key: string]: number } }) {
  const filteredData = Object.entries(data).filter(([_, value]) => value > 0);
  const labels = filteredData.map(([key, _]) => key);
  const values = filteredData.map(([_, value]) => value);
  
  const chartData: ChartData<'doughnut'> = {
    labels: labels,
    datasets: [
      {
        label: 'Registrations',
        data: values,
        backgroundColor: [
          'rgba(217, 119, 6, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(168, 85, 247, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(236, 72, 153, 0.6)',
        ],
        borderColor: [
          'rgba(180, 83, 9, 1)',
          'rgba(22, 163, 74, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(220, 38, 38, 1)',
          'rgba(37, 99, 235, 1)',
          'rgba(219, 39, 119, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ height: '300px' }}>
      {values.length > 0 ? (
        <Doughnut data={chartData} options={commonOptions} />
      ) : (
        <p className="text-center text-muted-foreground pt-12">No registrations for any agency yet.</p>
      )}
    </div>
  );
}
