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

const locationColors: { [key: string]: string } = {
    'Pune': 'rgba(59, 130, 246, 1)',
    'Rudrapur': 'rgba(34, 197, 94, 1)',
    'Dharwad': 'rgba(249, 115, 22, 1)',
    'Shegaon': 'rgba(168, 85, 247, 1)',
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
      const colors = {
        total: locationColors[item.location] || 'rgba(100,100,100,1)',
        accepted: 'rgba(34, 197, 94, 1)', 
        rejected: 'rgba(239, 68, 68, 1)'
      };

      return {
        labels: ['Total', 'Accepted', 'Rejected'],
        datasets: [
            {
                label: 'Registrations',
                data: [item.total, item.accepted, item.rejected],
                backgroundColor: [
                    colors.total.replace('1)', '0.8)'), 
                    colors.accepted.replace('1)', '0.8)'), 
                    colors.rejected.replace('1)', '0.8)')
                ],
                borderColor: [colors.total, colors.accepted, colors.rejected],
                borderWidth: 2,
                borderRadius: 5
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
                    <Card key={item.location} className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4" style={{borderLeftColor: locationColors[item.location]}}>
                        <CardHeader>
                            <CardTitle style={{color: locationColors[item.location]}}>{item.location}</CardTitle>
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
