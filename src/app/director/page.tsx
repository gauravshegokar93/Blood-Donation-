
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Droplets, LogOut, Expand } from 'lucide-react';
import { Registration } from '@/lib/types';
import { historicalData as staticHistoricalData, HistoricalData } from '@/lib/historical-data';
import { YearlyTrendChart } from '@/components/director-charts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { fetchRegistrations } from '@/lib/api/registrations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);


const LOCATIONS = ['Pune', 'Rudrapur', 'Dharwad', 'Shegaon'];
const CURRENT_YEAR = '2026';
const CURRENT_YEAR_FULL = '2026-27';

interface LocationStats {
    location: string;
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
}

interface YearlyTotal {
    year: string;
    total: number;
    source: 'Historical' | 'Live';
}

const locationColors: { [key: string]: { base: string, light: string, border: string } } = {
    'Pune':     { base: 'rgba(59, 130, 246, 1)',  light: 'rgba(147, 197, 253, 1)', border: 'rgba(37, 99, 235, 1)' },
    'Rudrapur': { base: 'rgba(34, 197, 94, 1)',   light: 'rgba(134, 239, 172, 1)', border: 'rgba(22, 163, 74, 1)' },
    'Dharwad':  { base: 'rgba(249, 115, 22, 1)',  light: 'rgba(253, 186, 116, 1)', border: 'rgba(217, 119, 6, 1)'},
    'Shegaon':  { base: 'rgba(168, 85, 247, 1)', light: 'rgba(216, 180, 254, 1)', border: 'rgba(147, 51, 234, 1)'},
};

export default function DirectorPage() {
    const router = useRouter();
    const [reportData, setReportData] = useState<LocationStats[]>([]);
    const [aggregatedHistory, setAggregatedHistory] = useState<YearlyTotal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadDirectorData = useCallback(async () => {
        setIsLoading(true);
        try {
            // --- Process All Locations Status for the current year ---
            const locationPromises = LOCATIONS.map(async (location) => {
                try {
                    const campRegistrations = await fetchRegistrations(location);
                    
                    const total = campRegistrations.length;
                    const rejected = campRegistrations.filter(r => r.status === 'REJECTED').length;
                    const accepted = campRegistrations.filter(r => r.status === 'ACCEPTED').length;
                    const pending = total - rejected - accepted;
                    
                    return { location, total, accepted, rejected, pending };
                } catch (error) {
                     console.error(`Failed to fetch data for ${location}`);
                    return { location, total: 0, accepted: 0, rejected: 0, pending: 0 };
                }
            });

            const allStats = await Promise.all(locationPromises);
            setReportData(allStats);
            
            // --- Process Aggregated History ---
            const liveDataTotalForCurrentYear = allStats.reduce((sum, loc) => sum + loc.total, 0);

            const yearlyTotals: { [year: string]: number } = {};
            staticHistoricalData.forEach(item => {
                yearlyTotals[item.campYear] = item.totalRegistrations;
            });
            
            // Overwrite historical value for the current year with live data
            yearlyTotals[CURRENT_YEAR] = liveDataTotalForCurrentYear;

            const combinedData: YearlyTotal[] = Object.entries(yearlyTotals).map(([year, total]) => ({
                year,
                total,
                source: year === CURRENT_YEAR ? 'Live' : 'Historical',
            }));
            
            setAggregatedHistory(combinedData.sort((a, b) => a.year.localeCompare(b.year)));

        } catch (error) {
            console.error('Failed to load director dashboard data:', error);
            alert('Could not load all data for the Director Dashboard.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDirectorData();
    }, [loadDirectorData]);

    const handleLogout = () => {
        sessionStorage.clear();
        router.push('/');
    };

    const openChartInNewWindow = (chartType: string, chartData: any, title?: string) => {
        const data = {
            chartType,
            chartData: { ...chartData, title: title }
        }
        sessionStorage.setItem('chartViewData', JSON.stringify(data));
        window.open('/chart', '_blank', 'width=1000,height=700');
    };

    const getStatusChartOptions = (location: string) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            datalabels: {
                anchor: 'end' as const,
                align: 'top' as const,
                color: '#4A5568',
                font: { weight: 'bold' as const, size: 14 },
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
                ticks: { color: '#333', font: { weight: 'bold' as const } }
            }
        },
        elements: { bar: { borderRadius: 4 } }
    });

    const getStatusChartData = (item: LocationStats) => {
      const colors = {
        total:    locationColors[item.location] || { base: 'rgba(100,100,100,1)', light: 'rgba(150,150,150,1)', border: 'rgba(80,80,80,1)' },
        accepted: { base: 'rgba(34, 197, 94, 1)',   light: 'rgba(134, 239, 172, 1)', border: 'rgba(22, 163, 74, 1)' },
        rejected: { base: 'rgba(239, 68, 68, 1)',   light: 'rgba(252, 165, 165, 1)', border: 'rgba(220, 38, 38, 1)' }
      };
      const barColors = [colors.total, colors.accepted, colors.rejected];

      return {
        labels: ['Total', 'Accepted', 'Rejected'],
        datasets: [{
                label: 'Registrations',
                data: [item.total, item.accepted, item.rejected],
                backgroundColor: (context: any) => {
                    const { ctx, chartArea, dataIndex } = context.chart;
                    if (!chartArea) { return; }
                    const selectedColor = barColors[dataIndex];
                    if(!selectedColor) return 'rgba(0,0,0,0.1)';
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, selectedColor.base);
                    gradient.addColorStop(1, selectedColor.light);
                    return gradient;
                },
                borderColor: barColors.map(c => c.border),
                borderWidth: 2,
            }],
      };
    };

    const openAllLocationsChartInNewWindow = (item: LocationStats) => {
        const chartViewData = {
            chartType: 'Bar',
            chartData: {
                data: getStatusChartData(item),
                options: { ...getStatusChartOptions(item.location),
                    plugins: { ...getStatusChartOptions(item.location).plugins,
                        title: { display: true, text: `Registration Status for ${item.location}`, font: { size: 18 } }
                    }
                }
            }
        };
        sessionStorage.setItem('chartViewData', JSON.stringify(chartViewData));
        window.open('/chart', '_blank', 'width=800,height=600');
    };
    
    const aggregatedChartData = {
        labels: aggregatedHistory.map(d => d.year),
        datasets: [{
            label: 'Total Registrations',
            data: aggregatedHistory.map(d => d.total)
        }]
    };
    
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading director analytics...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans">
             <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-40">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Droplets className="h-8 w-8" />
                        <h1 className="text-xl font-bold">Director's Dashboard</h1>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <Link href="/" className="hover:underline">Login</Link>
                        <Link href="/dashboard" className="hover:underline">Staff Dashboard</Link>
                        <button onClick={handleLogout} className="flex items-center space-x-1 hover:underline">
                            <LogOut className="h-4 w-4"/>
                            <span>Exit</span>
                        </button>
                    </nav>
                </div>
            </header>

            <main className="flex-grow p-4 md:p-8">
                 <section className="mb-12">
                    <h2 className="text-3xl font-bold mb-6 text-center">BDC Status Report - All Locations ({CURRENT_YEAR_FULL})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {reportData.map(item => (
                            <Card key={item.location} className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4" style={{borderLeftColor: locationColors[item.location]?.base}}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle style={{color: locationColors[item.location]?.base}}>{item.location}</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => openAllLocationsChartInNewWindow(item)}>
                                        <Expand className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 relative">
                                        <Bar options={getStatusChartOptions(item.location) as any} data={getStatusChartData(item)} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold mb-6 text-center">BDC History Report (2010-Present)</h2>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-center text-lg">All Locations - Registration Trend</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => openChartInNewWindow('YearlyTrend', { data: Object.fromEntries(aggregatedHistory.map(item => [item.year, item.total])) }, `Yearly Trend for All Locations`)}>
                                <Expand className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3">
                                <h3 className="text-md font-semibold mb-2 text-center text-gray-600">Registration Trend Chart</h3>
                                <YearlyTrendChart data={Object.fromEntries(aggregatedHistory.map(item => [item.year, item.total]))} />
                            </div>
                            <div className="lg:col-span-2">
                                <h3 className="text-md font-semibold mb-2 text-center text-gray-600">Historical Data Table</h3>
                                <div className="border rounded-lg overflow-auto max-h-96">
                                    <Table>
                                        <TableHeader className="bg-gray-100">
                                            <TableRow>
                                                <TableHead className="font-bold">Year</TableHead>
                                                <TableHead className="font-bold text-right">Total Registrations</TableHead>
                                                <TableHead className="font-bold text-center">Source</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {aggregatedHistory.map(item => (
                                                <TableRow key={item.year}>
                                                    <TableCell>{item.year}</TableCell>
                                                    <TableCell className="text-right">{item.total.toLocaleString()}</TableCell>
                                                     <TableCell className="text-center">
                                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
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
                </section>
            </main>
             <footer className="bg-gray-100 text-accent-foreground p-4 mt-8">
                <div className="container mx-auto text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Blood Bank Management System. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
