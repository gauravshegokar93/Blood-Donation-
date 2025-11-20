'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Droplets, Users, BarChart, Calendar, LogOut, Menu, X, Banknote, UserPlus, CheckCircle, XCircle, FileText, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from "next/link";

export default function Dashboard() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [year, setYear] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        const savedYear = sessionStorage.getItem('bdcYear');

        if (!savedLocation || !savedYear) {
            router.push('/');
        } else {
            setLocation(savedLocation);
            setYear(savedYear);
        }
    }, [router]);

    const handleLogout = () => {
        sessionStorage.removeItem('bdcLocation');
        sessionStorage.removeItem('bdcYear');
        router.push('/');
    };
    
    if (!location || !year) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

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
                <h2 className="text-3xl font-bold mb-6">Welcome, Admin</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Donors
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">1,254</div>
                    <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                    </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Units Available (O+)
                    </CardTitle>
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">150 Units</div>
                    <p className="text-xs text-muted-foreground">
                        Most common blood group
                    </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Recent Registrations
                    </CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">+52</div>
                    <p className="text-xs text-muted-foreground">
                        in the last 24 hours
                    </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Upcoming Camps
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                        scheduled this month
                    </p>
                    </CardContent>
                </Card>
                </div>
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Donors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>A table of recent donors will be displayed here.</p>
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
