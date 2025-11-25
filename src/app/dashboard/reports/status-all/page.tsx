'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const locationColors: { [key: string]: { bg: string, border: string } } = {
    'Pune': { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(37, 99, 235, 1)' },
    'Rudrapur': { bg: 'rgba(34, 197, 94, 0.7)', border: 'rgba(22, 163, 74, 1)' },
    'Dharwad': { bg: 'rgba(217, 119, 6, 0.7)', border: 'rgba(180, 83, 9, 1)' },
    'Shegaon': { bg: 'rgba(168, 85, 247, 0.7)', border: 'rgba(147, 51, 234, 1)' },
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
                anchor: 'center' as const,
                align: 'center' as const,
                color: 'white',
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

    const getChartData = (item: LocationStats) => ({
        labels: ['Total', 'Accepted', 'Rejected'],
        datasets: [
            {
                label: 'Registrations',
                data: [item.total, item.accepted, item.rejected],
                backgroundColor: [
                    (context: any) => {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) { return; }
                        const baseColor = locationColors[item.location]?.bg || 'rgba(156, 163, 175, 0.7)';
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, baseColor.replace('0.7', '0.9'));
                        gradient.addColorStop(1, baseColor.replace('0.7', '0.4'));
                        return gradient;
                    },
                    'rgba(74, 222, 128, 0.7)',
                    'rgba(248, 113, 113, 0.7)',
                ],
                borderColor: [
                     locationColors[item.location]?.border || 'rgba(107, 114, 128, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 2,
            },
        ],
    });


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
                                <Bar options={getChartOptions()} data={getChartData(item)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
