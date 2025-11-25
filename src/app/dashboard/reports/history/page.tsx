'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { historicalData } from "@/lib/historical-data";
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

const CURRENT_YEAR = '2025-26';

interface YearlyTotal {
    year: string;
    total: number;
    source: 'Historical' | 'Live';
}

export default function BDC_HistoryPage() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [reportData, setReportData] = useState<YearlyTotal[]>([]);

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        if (!savedLocation) {
            router.push('/');
        } else {
            setLocation(savedLocation);
            
            const locationHistory = historicalData
                .filter(item => item.location === savedLocation)
                .map(item => ({
                    year: item.campYear,
                    total: item.totalRegistrations,
                    source: 'Historical' as const
                }));

            const registrationKey = `registrations_${savedLocation}`;
            const liveRegistrations: Registration[] = JSON.parse(sessionStorage.getItem(registrationKey) || '[]');
            
            const liveDataForCurrentYear = {
                year: CURRENT_YEAR,
                total: liveRegistrations.length,
                source: 'Live' as const
            };
            
            const combinedData = [...locationHistory];
            const currentYearIndex = combinedData.findIndex(d => d.year === CURRENT_YEAR);

            if (currentYearIndex > -1) {
                combinedData[currentYearIndex] = liveDataForCurrentYear;
            } else {
                combinedData.push(liveDataForCurrentYear);
            }
            
            setReportData(combinedData.sort((a, b) => a.year.localeCompare(b.year)));
        }
    }, [router]);

    if (!location) {
        return <div>Loading session...</div>;
    }
    
    const chartData = {
        labels: reportData.map(d => d.year.split('-')[0]),
        datasets: [
            {
                label: `Total Registrations in ${location}`,
                data: reportData.map(d => d.total),
                backgroundColor: (context: any) => {
                    const chart = context.chart;
                    const {ctx, chartArea, dataIndex} = chart;
                    if (!chartArea || !reportData[dataIndex]) { return; }

                    const isLive = reportData[dataIndex].source === 'Live';
                    const baseColor = isLive ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)';
                    const lightColor = isLive ? 'rgba(252, 165, 165, 1)' : 'rgba(147, 197, 253, 1)';

                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, baseColor);
                    gradient.addColorStop(1, lightColor);
                    return gradient;
                },
                borderColor: reportData.map(d => d.source === 'Live' ? 'rgba(220, 38, 38, 1)' : 'rgba(37, 99, 235, 1)'),
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { 
                display: false
            },
            title: { 
                display: true, 
                text: `Yearly Registration Trend for ${location}`,
                font: {
                    size: 18,
                }
            },
            datalabels: {
                anchor: 'end' as const,
                align: 'top' as const,
                font: {
                    weight: 'bold' as const,
                },
                color: '#4A5568',
                formatter: (value: number) => {
                    return value > 0 ? value.toLocaleString() : '';
                },
            },
        },
        scales: {
            y: { 
                beginAtZero: true,
                ticks: {
                    padding: 10,
                },
                grid: {
                    drawOnChartArea: false,
                }
            },
            x: {
                 ticks: {
                    padding: 5,
                },
                grid: {
                    display: false,
                }
            }
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>BDC History Report</CardTitle>
                    <CardDescription>
                        Timeline view of blood donation camp registration history for {location}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-center">Registration Trend Chart</h3>
                        <div className="h-96 bg-gray-50 p-4 rounded-lg">
                            <Bar options={chartOptions as any} data={chartData} />
                        </div>
                         <div className="flex justify-center items-center space-x-6 mt-4">
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.7)' }}></div>
                                <span>Historical Data</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.7)' }}></div>
                                <span>Live Data ({CURRENT_YEAR})</span>
                            </div>
                        </div>
                    </div>
                    <div>
                         <h3 className="text-xl font-semibold mb-4">Historical Data Table</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="font-bold">Camp Year</TableHead>
                                        <TableHead className="font-bold">Total Registrations</TableHead>
                                        <TableHead className="font-bold">Data Source</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.map(item => (
                                        <TableRow key={item.year} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{item.year}</TableCell>
                                            <TableCell>{item.total.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    item.source === 'Live' 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {item.source}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
