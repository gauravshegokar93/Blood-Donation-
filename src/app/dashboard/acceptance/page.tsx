'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Registration } from '@/lib/types';

const YEAR = '2026-27';

export default function AcceptancePage() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [registrationId, setRegistrationId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        if (!savedLocation) {
            router.push('/');
        } else {
            setLocation(savedLocation);
        }
    }, [router]);
    
    const handleAccept = async (e: React.FormEvent) => {
        e.preventDefault();
        const regId = registrationId.trim();
        if (!regId || !location) {
            alert('Please enter a valid Registration ID.');
            return;
        }

        setIsLoading(true);

        try {
            // First, get the registration to check its status
            const getRes = await fetch(`/api/registrations?id=${regId}`);
            
            if (!getRes.ok) {
                if (getRes.status === 404) {
                    alert(`Registration ID "${regId}" not found.`);
                } else {
                    alert('Failed to fetch registration details. Please try again.');
                }
                setIsLoading(false);
                return;
            }

            const registration: Registration = await getRes.json();

            if (registration.status === 'REJECTED') {
                alert(`Registration ID "${regId}" has been rejected and cannot be accepted.`);
                setIsLoading(false);
                return;
            }

            if(registration.status !== 'REGISTERED') {
                alert(`Registration ID "${regId}" cannot be accepted. Current status: ${registration.status}.`);
                setIsLoading(false);
                return;
            }

            // If status is REGISTERED, proceed to accept
            const updateRes = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: regId,
                    status: 'ACCEPTED',
                    location: location, // Include location and year for context if needed by API
                    year: YEAR,
                })
            });

            if (!updateRes.ok) {
                 throw new Error('Failed to update registration status');
            }
            
            alert(`Registration ID "${regId}" has been accepted. The dashboard statistics will be updated.`);
            setRegistrationId(''); // Reset input
        } catch (error) {
            console.error('Error accepting registration:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                         <Button type="submit" disabled={isLoading}>{isLoading ? 'Accepting...' : 'Accept'}</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
