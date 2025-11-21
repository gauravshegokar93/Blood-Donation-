'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Droplets, LogOut } from 'lucide-react';
import { Registration } from '@/lib/mock-data';
import { historicalData, HistoricalData } from '@/lib/historical-data';
import { YearlyRegistrationsChart, LocationPerformanceChart, StatusBreakdownChart } from '@/components/director-charts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LOCATIONS = ['Pune', 'Rudrapur', 'Dharwad', 'Shegaon'];
const CURRENT_YEAR = '2025-26';

interface LiveData {
    totalRegistrations: number;
    accepted: number;
    rejected: number;
    pending: number;
    registrationsByLocation: { [location: string]: number };
}

export default function DirectorPage() {
    const router = useRouter();
    const [liveData, setLiveData] = useState<LiveData | null>(null);

    useEffect(() => {
        let totalRegistrations = 0;
        let accepted = 0;
        let rejected = 0;
        let pending = 0;
        const registrationsByLocation: { [location: string]: number } = {};

        LOCATIONS.forEach(location => {
            const registrationKey = `registrations_${location}`;
            const campRegistrations: Registration[] = JSON.parse(sessionStorage.getItem(registrationKey) || '[]');
            
            const locationRegistrations = campRegistrations.length;
            registrationsByLocation[location] = locationRegistrations;
            totalRegistrations += locationRegistrations;
            
            accepted += campRegistrations.filter(r => r.status === 'ACCEPTED').length;
            rejected += campRegistrations.filter(r => r.status === 'REJECTED').length;
            pending += campRegistrations.filter(r => r.status === 'REGISTERED').length;
        });

        setLiveData({
            totalRegistrations,
            accepted,
            rejected,
            pending,
            registrationsByLocation
        });
    }, []);

    const yearlyData = historicalData.reduce((acc, item) => {
        if (!acc[item.campYear]) {
            acc[item.campYear] = 0;
        }
        acc[item.campYear] += item.totalRegistrations;
        return acc;
    }, {} as {[year: string]: number});
    
    if (liveData) {
        yearlyData[CURRENT_YEAR] = liveData.totalRegistrations;
    }

    const handleLogout = () => {
        sessionStorage.clear();
        router.push('/');
    };

    if (!liveData) {
        return <div>Loading analytics...</div>;
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
                <h2 className="text-3xl font-bold mb-6">Management Overview</h2>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                     <Card className="xl:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-center text-lg">Total Registrations (Last 5 Years)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <YearlyRegistrationsChart data={yearlyData} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-center text-lg">Registrations by Location ({CURRENT_YEAR})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LocationPerformanceChart data={liveData.registrationsByLocation} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center text-lg">Accepted vs. Rejected ({CURRENT_YEAR})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StatusBreakdownChart data={{accepted: liveData.accepted, rejected: liveData.rejected, pending: liveData.pending}} />
                        </CardContent>
                    </Card>
                </div>
            </main>
             <footer className="bg-gray-100 text-accent-foreground p-4">
                <div className="container mx-auto text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Blood Bank Management System. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
