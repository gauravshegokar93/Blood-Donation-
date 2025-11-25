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
    [location: string]: {
        [year: string]: number;
    };
}

export default function DirectorPage() {
    const router = useRouter();
    const [liveData, setLiveData] = useState<LiveData | null>(null);
    const [yearlyData, setYearlyData] = useState<YearlyData | null>(null);

    useEffect(() => {
        const liveDataObject: LiveData = {};
        const yearlyDataObject: YearlyData = {};

        // Initialize with historical data
        LOCATIONS.forEach(location => {
            yearlyDataObject[location] = {};
            historicalData.forEach(item => {
                if (item.location === location) {
                    yearlyDataObject[location][item.campYear] = item.totalRegistrations;
                }
            });
        });

        // Process live data for current year
        LOCATIONS.forEach(location => {
            const registrationKey = `registrations_${location}`;
            const campRegistrations: Registration[] = JSON.parse(sessionStorage.getItem(registrationKey) || '[]');
            
            const total = campRegistrations.length;
            const accepted = campRegistrations.filter(r => r.status === 'ACCEPTED').length;
            const rejected = campRegistrations.filter(r => r.status === 'REJECTED').length;

            liveDataObject[location] = { total, accepted, rejected };
            
            // Add live data for the current year to the yearly data object
            if (!yearlyDataObject[location]) {
                yearlyDataObject[location] = {};
            }
            yearlyDataObject[location][CURRENT_YEAR] = total;
        });

        setLiveData(liveDataObject);
        setYearlyData(yearlyDataObject);

    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        router.push('/');
    };

    const openChartInNewWindow = (chartType: string, chartData: any) => {
        sessionStorage.setItem('chartViewData', JSON.stringify({ chartType, chartData }));
        window.open('/chart', '_blank', 'width=1000,height=700');
    };

    if (!liveData || !yearlyData) {
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
                    <h2 className="text-3xl font-bold mb-6 text-center">Live Registrations ({CURRENT_YEAR})</h2>
                    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-center text-lg">Total Registrations</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => openChartInNewWindow('LocationRegistrations', { title: 'Total Registrations', data: chartDataTotal })}>
                                    <Expand className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent><LocationRegistrationsChart data={chartDataTotal} /></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-center text-lg">Accepted Registrations</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => openChartInNewWindow('LocationRegistrations', { title: 'Accepted Registrations', data: chartDataAccepted })}>
                                    <Expand className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent><LocationRegistrationsChart data={chartDataAccepted} /></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-center text-lg">Rejected Registrations</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => openChartInNewWindow('LocationRegistrations', { title: 'Rejected Registrations', data: chartDataRejected })}>
                                    <Expand className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent><LocationRegistrationsChart data={chartDataRejected} /></CardContent>
                        </Card>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-3xl font-bold mb-6 text-center">Year-Wise Registration Trends (2020-2025)</h2>
                     <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                        {LOCATIONS.map(location => (
                             <Card key={location}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-center text-lg">{location}</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => openChartInNewWindow('YearlyTrend', { title: `Yearly Trend for ${location}`, data: yearlyData[location] })}>
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
