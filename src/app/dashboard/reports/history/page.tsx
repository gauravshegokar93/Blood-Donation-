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
import { historicalData } from "@/lib/historical-data";
import type { Registration } from "@/lib/mock-data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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
            
            // Combine and sort, ensuring current year is included
            const combinedData = [...locationHistory];
            const currentYearIndex = combinedData.findIndex(d => d.year === CURRENT_YEAR);

            if (currentYearIndex > -1) {
                // If historical data contains current year, update it with live data
                combinedData[currentYearIndex] = liveDataForCurrentYear;
            } else {
                 // Otherwise, add the live data
                combinedData.push(liveDataForCurrentYear);
            }
            
            setReportData(combinedData.sort((a, b) => a.year.localeCompare(b.year)));
        }
    }, [router]);

    if (!location) {
        return <div>Loading session...</div>;
    }
    
    const chartData = {
        labels: reportData.map(d => d.year.split('-')[0]), // Show only the first year for labels like '2025-26'
        datasets: [
            {
                label: `Total Registrations in ${location}`,
                data: reportData.map(d => d.total),
                backgroundColor: reportData.map(d => d.source === 'Live' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)'),
                borderColor: reportData.map(d => d.source === 'Live' ? 'rgba(220, 38, 38, 1)' : 'rgba(37, 99, 235, 1)'),
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `Yearly Registration Trend for ${location}` },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>BDC History Report</CardTitle>
                    <CardDescription>
                        Timeline view of blood donation camp registration history for {location}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Registration Trend Chart</h3>
                        <div className="h-96">
                            <Bar options={chartOptions} data={chartData} />
                        </div>
                    </div>
                    <div>
                         <h3 className="text-xl font-semibold mb-4">Historical Data Table</h3>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Camp Year</TableHead>
                                        <TableHead>Total Registrations</TableHead>
                                        <TableHead>Data Source</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.map(item => (
                                        <TableRow key={item.year}>
                                            <TableCell className="font-medium">{item.year}</TableCell>
                                            <TableCell>{item.total}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    item.source === 'Live' 
                                                    ? 'bg-green-100 text-green-800' 
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
