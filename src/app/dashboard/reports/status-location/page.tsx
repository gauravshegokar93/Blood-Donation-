'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Registration } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Expand } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const YEAR = '2026-27';

interface ReportStats {
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
}

export default function BDC_StatusLocationPage() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [stats, setStats] = useState<ReportStats>({ total: 0, accepted: 0, rejected: 0, pending: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const loadReportData = useCallback(async (loc: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/registrations?location=${loc}`);
            if (!response.ok) throw new Error('Failed to load data');
            const campRegistrations: Registration[] = await response.json();
            
            setRegistrations(campRegistrations);

            const total = campRegistrations.length;
            const accepted = campRegistrations.filter(r => r.status === 'ACCEPTED').length;
            const rejected = campRegistrations.filter(r => r.status === 'REJECTED').length;
            const pending = campRegistrations.filter(r => r.status === 'REGISTERED').length;
            setStats({ total, accepted, rejected, pending });

        } catch (error) {
            console.error(error);
            alert('Failed to load report data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        if (!savedLocation) {
            router.push('/');
        } else {
            setLocation(savedLocation);
            loadReportData(savedLocation);
        }
    }, [router, loadReportData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const },
            title: {
                display: true,
                text: `Status Distribution for ${location}`,
                font: { size: 16 }
            }
        }
    };

    const chartData = {
        labels: ['Accepted', 'Rejected', 'Pending'],
        datasets: [
          {
            label: '# of Registrations',
            data: [stats.accepted, stats.rejected, stats.pending],
            backgroundColor: [
              'rgba(34, 197, 94, 0.6)',
              'rgba(239, 68, 68, 0.6)',
              'rgba(59, 130, 246, 0.6)',
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

    const openChartInNewWindow = () => {
        const chartViewData = {
            chartType: 'Doughnut',
            chartData: {
                data: chartData,
                options: chartOptions,
            }
        };
        sessionStorage.setItem('chartViewData', JSON.stringify(chartViewData));
        window.open('/chart', '_blank', 'width=800,height=600');
    };

    if (!location) {
        return <div>Loading session...</div>;
    }

    const year = YEAR;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>BDC Status Report - Location-wise</CardTitle>
                    <CardDescription>
                        Detailed registration status for the camp at {location}, {year}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Total Registrations</CardTitle></CardHeader>
                            <CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-lg text-green-600">Accepted</CardTitle></CardHeader>
                            <CardContent><p className="text-3xl font-bold">{stats.accepted}</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-lg text-red-600">Rejected</CardTitle></CardHeader>
                            <CardContent><p className="text-3xl font-bold">{stats.rejected}</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-lg text-blue-600">Pending</CardTitle></CardHeader>
                            <CardContent><p className="text-3xl font-bold">{stats.pending}</p></CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <h3 className="text-xl font-semibold mb-4">All Registrations</h3>
                            <div className="border rounded-lg overflow-auto max-h-[450px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reg. ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Blood Group</TableHead>
                                            <TableHead>Agency</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                                        ) : registrations.length > 0 ? (
                                            registrations.map(reg => (
                                                <TableRow key={reg.id}>
                                                    <TableCell>{reg.id}</TableCell>
                                                    <TableCell>{reg.name}</TableCell>
                                                    <TableCell>{reg.bloodGroup}</TableCell>
                                                    <TableCell>{reg.agency}</TableCell>
                                                    <TableCell>
                                                        <span className={`font-semibold ${
                                                            reg.status === 'ACCEPTED' ? 'text-green-600' :
                                                            reg.status === 'REJECTED' ? 'text-red-600' :
                                                            reg.status === 'REGISTERED' ? 'text-blue-600' :
                                                            'text-yellow-600'
                                                        }`}>
                                                            {reg.status}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow><TableCell colSpan={5} className="text-center">No registrations found.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <h3 className="text-xl font-semibold">Status Distribution</h3>
                                     <Button variant="ghost" size="icon" onClick={openChartInNewWindow}>
                                        <Expand className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 relative">
                                        <Doughnut data={chartData} options={chartOptions as any} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
