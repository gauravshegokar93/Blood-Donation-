'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Droplets, Users, BarChart, Calendar, LogOut, Menu, X, Banknote, UserPlus, CheckCircle, XCircle, FileText, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { Registration, BloodBank } from "@/lib/mock-data";

const YEAR = '2025-26';

export default function Dashboard() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        totalRegistrations: 0,
        totalAccepted: 0,
        totalRejected: 0,
        campDonated: 0,
        campPending: 0,
        campBloodBanks: 0,
        recent: [] as Registration[],
    });

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        
        if (!savedLocation) {
            router.push('/');
        } else {
            setLocation(savedLocation);
            const year = YEAR;

            const registrationKey = `registrations_${savedLocation}`;
            const bloodBankKey = `bloodBanks_${savedLocation}`;

            const campRegistrations: Registration[] = JSON.parse(sessionStorage.getItem(registrationKey) || '[]');
            const campBloodBanks: BloodBank[] = JSON.parse(sessionStorage.getItem(bloodBankKey) || '[]');

            const campRegisteredCount = campRegistrations.length;
            const campAcceptedCount = campRegistrations.filter(r => r.status === 'ACCEPTED').length;
            const campRejectedCount = campRegistrations.filter(r => r.status === 'REJECTED').length;
            const campDonatedCount = campRegistrations.filter(r => r.status === 'DONATED').length;

            setStats({
                totalRegistrations: campRegisteredCount, // Only show current location stats
                totalAccepted: campAcceptedCount,
                totalRejected: campRejectedCount,
                campDonated: campDonatedCount,
                campPending: campRegisteredCount - campAcceptedCount - campRejectedCount - campDonatedCount,
                campBloodBanks: campBloodBanks.length,
                recent: campRegistrations.slice(-5).reverse(),
            });
        }
    }, [router]);

    const handleLogout = () => {
        sessionStorage.clear();
        router.push('/');
    };
    
    if (!location) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }
    const year = YEAR;
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
        <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-40">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <Droplets className="h-8 w-8" />
                    <h1 className="text-xl font-bold hidden md:block">Blood Donation Camp</h1>
                    <div className="ml-4 pl-4 border-l border-primary-foreground/50">
                        <span className="font-semibold">{location}, {year}</span>
                    </div>
                </div>
                <nav className="hidden md:flex items-center space-x-4">
                    <Link href="/home" className="hover:underline">Home</Link>
                    <Link href="/dashboard" className="font-bold hover:underline">Dashboard</Link>
                    <button onClick={handleLogout} className="flex items-center space-x-1 hover:underline">
                        <LogOut className="h-4 w-4"/>
                        <span>Exit</span>
                    </button>
                </nav>
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>
        </header>

        {isMenuOpen && (
            <div className="md:hidden bg-primary text-primary-foreground p-4">
                <nav className="flex flex-col space-y-2">
                    <Link href="/home" className="hover:underline">Home</Link>
                    <Link href="/dashboard" className="font-bold hover:underline">Dashboard</Link>
                    <button onClick={handleLogout} className="flex items-center space-x-1 hover:underline">
                        <LogOut className="h-4 w-4"/>
                        <span>Exit</span>
                    </button>
                </nav>
            </div>
        )}

        <div className="flex flex-1">
            <aside className="w-64 bg-white border-r p-4 hidden lg:block">
                 <h2 className="text-lg font-bold mb-4">Menu</h2>
                 <nav className="flex flex-col space-y-2">
                    <Link href="/dashboard/blood-bank" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"><Banknote className="h-5 w-5"/><span>Blood Bank</span></Link>
                    <Link href="/dashboard/registration" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"><UserPlus className="h-5 w-5"/><span>Registration</span></Link>
                    <Link href="/dashboard/acceptance" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"><CheckCircle className="h-5 w-5"/><span>Acceptance</span></Link>
                    <Link href="/dashboard/rejection" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"><XCircle className="h-5 w-5"/><span>Rejection</span></Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex w-full items-center justify-between space-x-2 p-2 rounded-md hover:bg-gray-100 text-sm">
                           <div className="flex items-center space-x-2">
                             <FileText className="h-5 w-5"/><span>Reports</span>
                           </div>
                           <ChevronDown className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 ml-2">
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/reports/status-all">BDC Status - All</Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                                <Link href="/dashboard/reports/status-location">BDC Status - Location-wise</Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                                <Link href="/dashboard/reports/history">BDC History</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </nav>
            </aside>
            <main className="flex-grow p-4 md:p-8">
                <h2 className="text-3xl font-bold mb-6">Welcome, Admin - ({location}, {year})</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Registrations
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
                    <p className="text-xs text-muted-foreground">
                        Donors registered in {location}
                    </p>
                    </CardContent>
                </Card>
                 <Card className="border-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-600">
                        Accepted
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stats.totalAccepted}</div>
                    <p className="text-xs text-muted-foreground">
                        Donors approved in {location}
                    </p>
                    </CardContent>
                </Card>
                 <Card className="border-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-600">
                        Rejected
                    </CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRejected}</div>
                    <p className="text-xs text-muted-foreground">
                        Donors declined in {location}
                    </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Camp Donations
                    </CardTitle>
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stats.campDonated} Units</div>
                    <p className="text-xs text-muted-foreground">
                        for {location}, {year}
                    </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Camp Pending
                    </CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stats.campPending}</div>
                    <p className="text-xs text-muted-foreground">
                        waiting in {location}, {year}
                    </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Camp Blood Banks
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stats.campBloodBanks}</div>
                    <p className="text-xs text-muted-foreground">
                        in {location} for {year}
                    </p>
                    </CardContent>
                </Card>
                </div>
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Registrations ({location}, {year})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.recent.length > 0 ? (
                                <ul className="space-y-2">
                                    {stats.recent.map(reg => (
                                        <li key={reg.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                                            <div>
                                                <p className="font-semibold">{reg.name} <span className="font-normal text-muted-foreground">({reg.bloodGroup})</span></p>
                                                <p className="text-sm text-gray-600">{reg.agency}</p>
                                            </div>
                                            <div className={`text-sm font-bold ${
                                                reg.status === 'REGISTERED' ? 'text-blue-600' :
                                                reg.status === 'ACCEPTED' ? 'text-green-600' :
                                                reg.status === 'REJECTED' ? 'text-red-600' :
                                                'text-yellow-600'
                                            }`}>
                                                {reg.status}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No recent registrations for this camp.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
       <footer className="bg-gray-100 text-accent-foreground p-4">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Blood Bank Management System. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
