'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Registration } from '@/lib/mock-data';

const YEAR = '2026-27';

export default function AcceptancePage() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [registrationId, setRegistrationId] = useState('');

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        if (!savedLocation) {
            router.push('/');
        } else {
            setLocation(savedLocation);
        }
    }, [router]);
    
    const handleAccept = (e: React.FormEvent) => {
        e.preventDefault();
        const regId = registrationId;
        if (!regId || !location) {
            alert('Please enter a valid Registration ID.');
            return;
        }

        const registrationKey = `registrations_${location}`;
        const campRegistrations: Registration[] = JSON.parse(sessionStorage.getItem(registrationKey) || '[]');
        const registrationIndex = campRegistrations.findIndex(r => r.id === regId);

        if (registrationIndex === -1) {
            alert(`Registration ID "${regId}" not found for this camp.`);
            return;
        }
        
        const currentStatus = campRegistrations[registrationIndex].status;

        if (currentStatus === 'REJECTED') {
            alert(`Registration ID "${regId}" has been rejected and cannot be accepted.`);
            return;
        }

        if(currentStatus !== 'REGISTERED') {
            alert(`Registration ID "${regId}" cannot be accepted. Current status: ${currentStatus}.`);
            return;
        }
        
        campRegistrations[registrationIndex].status = 'ACCEPTED';
        sessionStorage.setItem(registrationKey, JSON.stringify(campRegistrations));
        
        alert(`Registration ID "${regId}" has been accepted. The dashboard statistics will be updated.`);
        setRegistrationId(''); // Reset input
    };
    
    if (!location) {
        return <div>Loading session...</div>;
    }

    const year = YEAR;

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
                                placeholder="Enter Registration ID (e.g., PUN-0001)" 
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
