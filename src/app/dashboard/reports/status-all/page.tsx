'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import type { Registration } from "@/lib/mock-data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const YEAR = '2025-26';
const LOCATIONS = ['Pune', 'Rudrapur', 'Dharwad', 'Shegaon'];

interface LocationStats {
    location: string;
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
}

const locationColors: { [key: string]: { base: string, light: string, border: string } } = {
    'Pune': { base: 'rgba(59, 130, 246, 1)', light: 'rgba(147, 197, 253, 1)', border: 'rgba(37, 99, 235, 1)' },
    'Rudrapur': { base: 'rgba(34, 197, 94, 1)', light: 'rgba(134, 239, 172, 1)', border: 'rgba(22, 163, 74, 1)' },
    'Dharwad': { base: 'rgba(249, 115, 22, 1)', light: 'rgba(253, 186, 116, 1)', border: 'rgba(217, 119, 6, 1)' },
    'Shegaon': { base: 'rgba(168, 85, 247, 1)', light: 'rgba(216, 180, 254, 1)', border: 'rgba(147, 51, 234, 1)' },
};


export default function BDC_StatusAllPage() {
    const router = useRouter();
    const [reportData, setReportData] = useState<LocationStats[]>([]);
    const [year, setYear] = useState<string | null>(YEAR);

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        if (!savedLocation) {
            router.push('/');
        } else {
            const allStats: LocationStats[] = LOCATIONS.map(loc => {
                const registrationKey = `registrations_${loc}`;
                const registrations: Registration[] = JSON.parse(sessionStorage.getItem(registrationKey) || '[]');
                
                const total = registrations.length;
                const accepted = registrations.filter(r => r.status === 'ACCEPTED').length;
                const rejected = registrations.filter(r => r.status === 'REJECTED').length;
                const pending = registrations.filter(r => r.status === 'REGISTERED').length;

                return { location: loc, total, accepted, rejected, pending };
            });
            setReportData(allStats);
        }
    }, [router]);

    if (!year) {
        return <div>Loading session...</div>;
    }

    const getChartOptions = () => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                display: false
            },
            title: { 
                display: false,
            },
            datalabels: {
                anchor: 'end' as const,
                align: 'top' as const,
                color: '#4A5568',
                font: {
                    weight: 'bold' as const,
                    size: 14,
                },
                 formatter: (value: number) => value > 0 ? value : '',
            },
        },
        scales: {
            y: { 
                beginAtZero: true,
                ticks: { display: false },
                grid: { drawOnChartArea: false, }
            },
            x: {
                grid: { display: false, },
                ticks: {
                    color: '#333',
                    font: {
                        weight: 'bold' as const,
                    }
                }
            }
        },
        elements: {
            bar: {
                borderWidth: 2,
                borderRadius: 4,
            }
        }
    });

    const getChartData = (item: LocationStats) => {
      const colors = [
          locationColors[item.location] || locationColors['Pune'],
          { base: 'rgba(34, 197, 94, 1)', light: 'rgba(134, 239, 172, 1)', border: 'rgba(22, 163, 74, 1)' }, // Accepted Green
          { base: 'rgba(239, 68, 68, 1)', light: 'rgba(252, 165, 165, 1)', border: 'rgba(220, 38, 38, 1)' }  // Rejected Red
      ];

      return {
        labels: ['Total', 'Accepted', 'Rejected'],
        datasets: [
            {
                label: 'Registrations',
                data: [item.total, item.accepted, item.rejected],
                backgroundColor: (context: any) => {
                    const chart = context.chart;
                    const {ctx, chartArea, dataIndex} = chart;
                    if (!chartArea) { return; }

                    const selectedColor = colors[dataIndex];
                    if (!selectedColor) return 'rgba(0,0,0,0.1)';

                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, selectedColor.base);
                    gradient.addColorStop(1, selectedColor.light);
                    return gradient;
                },
                borderColor: colors.map(c => c.border),
                borderWidth: 1,
            },
        ],
      };
    };


    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">BDC Status Report - All Locations</h1>
                <p className="text-muted-foreground">
                    Live registration summary for all camp locations for the year {year}.
                </p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {reportData.map(item => (
                    <Card key={item.location} className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4" style={{borderLeftColor: locationColors[item.location]?.border}}>
                        <CardHeader>
                            <CardTitle style={{color: locationColors[item.location]?.border}}>{item.location}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 relative">
                                <Bar options={getChartOptions() as any} data={getChartData(item)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
