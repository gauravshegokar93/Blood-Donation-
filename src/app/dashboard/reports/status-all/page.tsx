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
import type { Registration } from "@/lib/mock-data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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

    const chartData = {
        labels: LOCATIONS,
        datasets: [
            {
                label: 'Accepted',
                data: reportData.map(d => d.accepted),
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
            },
            {
                label: 'Rejected',
                data: reportData.map(d => d.rejected),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
            },
            {
                label: 'Pending',
                data: reportData.map(d => d.pending),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `Registration Status Across All Locations for ${year}` },
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>BDC Status Report - All Locations</CardTitle>
                    <CardDescription>
                        Live registration summary for all camp locations for the year {year}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Location Comparison Chart</h3>
                        <div className="h-96">
                            <Bar options={chartOptions} data={chartData} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Summary Table</h3>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Total Registrations</TableHead>
                                        <TableHead>Accepted</TableHead>
                                        <TableHead>Rejected</TableHead>
                                        <TableHead>Pending</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.map(item => (
                                        <TableRow key={item.location}>
                                            <TableCell className="font-medium">{item.location}</TableCell>
                                            <TableCell>{item.total}</TableCell>
                                            <TableCell className="text-green-600">{item.accepted}</TableCell>
                                            <TableCell className="text-red-600">{item.rejected}</TableCell>
                                            <TableCell className="text-blue-600">{item.pending}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold bg-gray-50">
                                        <TableCell>Grand Total</TableCell>
                                        <TableCell>{reportData.reduce((sum, item) => sum + item.total, 0)}</TableCell>
                                        <TableCell className="text-green-600">{reportData.reduce((sum, item) => sum + item.accepted, 0)}</TableCell>
                                        <TableCell className="text-red-600">{reportData.reduce((sum, item) => sum + item.rejected, 0)}</TableCell>
                                        <TableCell className="text-blue-600">{reportData.reduce((sum, item) => sum + item.pending, 0)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
