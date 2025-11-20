'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const rejectionReasons = [
    "Low Hemoglobin",
    "High Blood Pressure",
    "Low Blood Pressure",
    "Did not meet weight criteria",
    "Recent illness",
    "On medication",
    "Other"
];

export default function RejectionPage() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [year, setYear] = useState<string | null>(null);
    const [registrationId, setRegistrationId] = useState('');
    const [reason, setReason] = useState('');

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
    
    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if(registrationId && reason) {
            alert(`Registration ID "${registrationId}" has been rejected. Reason: ${reason}`);
            setRegistrationId(''); 
            setReason('');
        } else {
            alert('Please enter a Registration ID and select a reason.');
        }
    };
    
    if (!location || !year) {
        return <div>Loading session...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Reject Donor</CardTitle>
                    <CardDescription>
                        Enter the Registration ID and reason to mark a donor as rejected for the camp at {location}, {year}.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleReject}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reg-id">Registered No.</Label>
                            <Input 
                                id="reg-id" 
                                placeholder="Enter Registration ID" 
                                value={registrationId}
                                onChange={(e) => setRegistrationId(e.target.value)}
                                required
                                type="number"
                            />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="rejection-reason">Rejection Reason</Label>
                             <Select value={reason} onValueChange={setReason} required>
                                <SelectTrigger id="rejection-reason">
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rejectionReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                             </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Button variant="ghost" onClick={() => router.push('/dashboard')}>Cancel</Button>
                         <Button type="submit" variant="destructive">Reject</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
