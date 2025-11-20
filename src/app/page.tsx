'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import { initializeMockData } from '@/lib/mock-data';

// Placeholder data - we will fetch this from the database later
const locations = ['Mumbai', 'Pune', 'Nagpur'];
const years = ['2023', '2024', '2025'];

export default function SessionStartPage() {
  const router = useRouter();
  const [location, setLocation] = useState<string>('');
  const [year, setYear] = useState<string>('');

  const handleStart = () => {
    if (location && year) {
      sessionStorage.setItem('bdcLocation', location);
      sessionStorage.setItem('bdcYear', year);
      initializeMockData(location, parseInt(year));
      router.push('/dashboard');
    } else {
      alert('Please select both a location and a year.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 p-4 font-sans">
       <header className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Droplets className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Blood Bank Management</h1>
          </div>
          <nav className="space-x-4">
             <a href="/home" className="hover:underline">Home</a>
             <a href="/dashboard" className="hover:underline">Dashboard</a>
          </nav>
        </div>
      </header>
      <main className="flex flex-col items-center">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">WADHOKAR GROUP OF COMPANIES</h1>
            <p className="text-xl text-accent-foreground mt-2">Blood Donation Camp</p>
        </div>
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Start Your Session</CardTitle>
            <CardDescription>Select the camp location and year to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="location-select" className="text-sm font-medium">BDC Location</label>
                <Select onValueChange={setLocation} value={location}>
                  <SelectTrigger id="location-select">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="year-select" className="text-sm font-medium">BDC Year</label>
                <Select onValueChange={setYear} value={year}>
                  <SelectTrigger id="year-select">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStart} className="w-full bg-primary hover:bg-red-700">
                Start
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
       <footer className="absolute bottom-0 left-0 right-0 bg-gray-100 text-accent-foreground p-4">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Blood Bank Management System. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
