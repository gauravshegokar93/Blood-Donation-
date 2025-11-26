'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Droplets, LogOut, Expand } from 'lucide-react';
import { Registration } from '@/lib/mock-data';
import { historicalData } from '@/lib/historical-data';
import { LocationRegistrationsChart, YearlyTrendChart } from '@/components/director-charts';
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
const CURRENT_YEAR = '2025-26';

interface LiveLocationData {
    total: number;
    accepted: number;
    rejected: number;
}

interface LiveData {
    [location: string]: LiveLocationData;
}

interface YearlyData {
    [year: string]: number;
}

interface AllYearlyData {
    [location: string]: YearlyData;
}

interface LocationStats {
    location: string;
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
}

const locationColors: { [key: string]: { base: string, light: string, border: string } } = {
    'Pune':     { base: 'rgba(59, 130, 246, 1)',  light: 'rgba(147, 197, 253, 1)', border: 'rgba(37, 99, 235, 1)' },
    'Rudrapur': { base: 'rgba(34, 197, 94, 1)',   light: 'rgba(134, 239, 172, 1)', border: 'rgba(22, 163, 74, 1)' },
    'Dharwad':  { base: 'rgba(249, 115, 22, 1)',  light: 'rgba(253, 186, 116, 1)', border: 'rgba(217, 119, 6, 1)'},
    'Shegaon':  { base: 'rgba(168, 85, 247, 1)', light: 'rgba(216, 180, 254, 1)', border: 'rgba(147, 51, 234, 1)'},
};

export default function DirectorPage() {
    const router = useRouter();
    const [liveData, setLiveData] = useState<LiveData | null>(null);
    const [yearlyData, setYearlyData] = useState<AllYearlyData | null>(null);
    const [reportData, setReportData] = useState<LocationStats[]>([]);

    useEffect(() => {
        const liveDataObject: LiveData = {};
        const allYearlyDataObject: AllYearlyData = {};
        const allStats: LocationStats[] = [];

        // Process live and historical data for each location
        LOCATIONS.forEach(location => {
            // Initialize yearly data for the location
            allYearlyDataObject[location] = {};

            // Populate with historical data
            historicalData.forEach(item => {
                if (item.location === location) {
                    allYearlyDataObject[location][item.campYear] = item.totalRegistrations;
                }
            });

            // Process live data for current year
            const registrationKey = `registrations_${location}`;
            const campRegistrations: Registration[] = JSON.parse(sessionStorage.getItem(registrationKey) || '[]');
            
            const total = campRegistrations.length;
            const rejected = campRegistrations.filter(r => r.status === 'REJECTED').length;
            const accepted = total - rejected;
            const pending = campRegistrations.filter(r => r.status === 'REGISTERED').length;


            liveDataObject[location] = { total, accepted, rejected };
            
            // Add/overwrite live data for the current year
            allYearlyDataObject[location][CURRENT_YEAR] = total;

            allStats.push({ location, total, accepted, rejected, pending });
        });

        setLiveData(liveDataObject);
        setYearlyData(allYearlyDataObject);
        setReportData(allStats);

    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        router.push('/');
    };

    const openChartInNewWindow = (chartType: string, chartData: any, title?: string) => {
        const data = {
            chartType,
            chartData: {
                ...chartData,
                title: title
            }
        }
        sessionStorage.setItem('chartViewData', JSON.stringify(data));
        window.open('/chart', '_blank', 'width=1000,height=700');
    };

    const getChartOptions = (location: string) => ({
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
                borderRadius: 4,
            }
        }
    });

    const getChartData = (item: LocationStats) => {
      const colors = {
        total:    locationColors[item.location] || { base: 'rgba(100,100,100,1)', light: 'rgba(150,150,150,1)', border: 'rgba(80,80,80,1)' },
        accepted: { base: 'rgba(34, 197, 94, 1)',   light: 'rgba(134, 239, 172, 1)', border: 'rgba(22, 163, 74, 1)' },
        rejected: { base: 'rgba(239, 68, 68, 1)',   light: 'rgba(252, 165, 165, 1)', border: 'rgba(220, 38, 38, 1)' }
      };
      
      const barColors = [colors.total, colors.accepted, colors.rejected];

      return {
        labels: ['Total', 'Accepted', 'Rejected'],
        datasets: [
            {
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
            },
        ],
      };
    };

    const openAllLocationsChartInNewWindow = (item: LocationStats) => {
        const chartViewData = {
            chartType: 'Bar',
            chartData: {
                data: getChartData(item),
                options: {
                    ...getChartOptions(item.location),
                    plugins: {
                        ...getChartOptions(item.location).plugins,
                        title: {
                            display: true,
                            text: `Registration Status for ${item.location}`,
                            font: { size: 18 }
                        }
                    }
                }
            }
        };
        sessionStorage.setItem('chartViewData', JSON.stringify(chartViewData));
        window.open('/chart', '_blank', 'width=800,height=600');
    };


    if (!liveData || !yearlyData || reportData.length === 0) {
        return <div>Loading analytics...</div>;
    }

    const chartDataTotal = {
        Pune: liveData.Pune.total,
        Dharwad: liveData.Dharwad.total,
        Rudrapur: liveData.Rudrapur.total,
        Shegaon: liveData.Shegaon.total,
    };
    const chartDataAccepted = {
        Pune: liveData.Pune.accepted,
        Dharwad: liveData.Dharwad.accepted,
        Rudrapur: liveData.Rudrapur.accepted,
        Shegaon: liveData.Shegaon.accepted,
    };
     const chartDataRejected = {
        Pune: liveData.Pune.rejected,
        Dharwad: liveData.Dharwad.rejected,
        Rudrapur: liveData.Rudrapur.rejected,
        Shegaon: liveData.Shegaon.rejected,
    };

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
                    <h2 className="text-3xl font-bold mb-6 text-center">BDC Status Report - All Locations ({CURRENT_YEAR})</h2>
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
                                        <Bar options={getChartOptions(item.location) as any} data={getChartData(item)} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold mb-6 text-center">Live Registrations ({CURRENT_YEAR})</h2>
                    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-center text-lg">Total Registrations</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => openChartInNewWindow('LocationRegistrations', { data: chartDataTotal }, 'Total Registrations')}>
                                    <Expand className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent><LocationRegistrationsChart data={chartDataTotal} /></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-center text-lg">Accepted Registrations</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => openChartInNewWindow('LocationRegistrations', { data: chartDataAccepted }, 'Accepted Registrations')}>
                                    <Expand className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent><LocationRegistrationsChart data={chartDataAccepted} /></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-center text-lg">Rejected Registrations</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => openChartInNewWindow('LocationRegistrations', { data: chartDataRejected }, 'Rejected Registrations')}>
                                    <Expand className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent><LocationRegistrationsChart data={chartDataRejected} /></CardContent>
                        </Card>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-3xl font-bold mb-6 text-center">Year-Wise Registration Trends (2010-Present)</h2>
                     <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                        {LOCATIONS.map(location => (
                             <Card key={location}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-center text-lg">{location}</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => openChartInNewWindow('YearlyTrend', { data: yearlyData[location] }, `Yearly Trend for ${location}`)}>
                                        <Expand className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent><YearlyTrendChart data={yearlyData[location]} /></CardContent>
                            </Card>
                        ))}
                    </div>
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
