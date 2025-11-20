'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Registration } from '@/lib/mock-data';

export default function AcceptancePage() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [year, setYear] = useState<string | null>(null);
    const [registrationId, setRegistrationId] = useState('');

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
    
    const handleAccept = (e: React.FormEvent) => {
        e.preventDefault();
        const regId = registrationId;
        if (!regId || !location || !year) {
            alert('Please enter a valid Registration ID.');
            return;
        }

        const allRegistrations: Registration[] = JSON.parse(sessionStorage.getItem('registrations') || '[]');
        const registrationIndex = allRegistrations.findIndex(r => r.id === regId && r.location === location && r.year === parseInt(year));

        if (registrationIndex === -1) {
            alert(`Registration ID "${regId}" not found for this camp.`);
            return;
        }
        
        if(allRegistrations[registrationIndex].status !== 'REGISTERED') {
            alert(`Registration ID "${regId}" cannot be accepted. Current status: ${allRegistrations[registrationIndex].status}.`);
            return;
        }
        
        allRegistrations[registrationIndex].status = 'ACCEPTED';
        sessionStorage.setItem('registrations', JSON.stringify(allRegistrations));
        
        alert(`Registration ID "${regId}" has been accepted.`);
        setRegistrationId(''); // Reset input
    };
    
    if (!location || !year) {
        return <div>Loading session...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Accept Donor</CardTitle>
                    <CardDescription>
                        Enter the Registration ID to mark a donor as accepted for the camp at {location}, {year}.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleAccept}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reg-id">Registered No.</Label>
                            <Input 
                                id="reg-id" 
                                placeholder="Enter Registration ID (e.g., REG-YYYYMMDD-XXXX)" 
                                value={registrationId}
                                onChange={(e) => setRegistrationId(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Button variant="ghost" onClick={() => router.push('/dashboard')}>Cancel</Button>
                         <Button type="submit">Accept</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
