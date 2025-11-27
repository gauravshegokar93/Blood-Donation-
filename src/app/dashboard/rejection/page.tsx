'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Registration } from '@/lib/types';

const rejectionReasons = [
    "Low Hemoglobin",
    "High Blood Pressure",
    "Low Blood Pressure",
    "Did not meet weight criteria",
    "Recent illness",
    "On medication",
    "Other"
];

const YEAR = '2026-27';

export default function RejectionPage() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);

    const [allCampRegistrations, setAllCampRegistrations] = useState<Registration[]>([]);
    const [rejectedDonors, setRejectedDonors] = useState<Registration[]>([]);
    
    const [registrationId, setRegistrationId] = useState('');
    const [donorName, setDonorName] = useState('');
    const [reason, setReason] = useState('');
    const [isIdValid, setIsIdValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async (loc: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/registrations?location=${loc}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const currentRegistrations: Registration[] = await response.json();
            
            setAllCampRegistrations(currentRegistrations);

            const campRejectedDonors = currentRegistrations.filter(r => r.status === 'REJECTED');
            setRejectedDonors(campRejectedDonors);
        } catch(error) {
            console.error(error);
            alert("Failed to load rejection data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        if (!savedLocation) {
            router.push('/');
        } else {
            setLocation(savedLocation);
            loadData(savedLocation);
        }
    }, [router, loadData]);

    useEffect(() => {
        if (registrationId) {
            const donor = allCampRegistrations.find(r => r.id === registrationId);
            if (donor) {
                setDonorName(donor.name);
                setIsIdValid(true);
            } else {
                setDonorName('');
                setIsIdValid(false);
            }
        } else {
            setDonorName('');
            setIsIdValid(false);
        }
    }, [registrationId, allCampRegistrations]);

    const handleReject = async (e: React.FormEvent) => {
        e.preventDefault();
        const regId = registrationId.trim();
        if (!regId || !reason || !location) {
            alert('Please enter a Registration ID and select a reason.');
            return;
        }
        
        const registrationToReject = allCampRegistrations.find(r => r.id === regId);
        if (!registrationToReject) {
             alert(`Registration ID "${regId}" not found for this camp.`);
            return;
        }

        if(registrationToReject.status !== 'REGISTERED' && registrationToReject.status !== 'ACCEPTED') {
            alert(`Registration ID "${regId}" cannot be rejected. Current status: ${registrationToReject.status}.`);
            return;
        }
        
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: regId,
                    status: 'REJECTED',
                    rejectionReason: reason,
                    location,
                    year: YEAR,
                })
            });

            if (!response.ok) throw new Error('Failed to reject registration');

            alert(`Registration ID "${registrationId}" has been rejected. Reason: ${reason}.`);
            
            // Reset form and reload data
            setRegistrationId(''); 
            setReason('');
            await loadData(location);

        } catch (error) {
            console.error(error);
            alert('An error occurred while rejecting the donor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRowClick = (donor: Registration) => {
        setRegistrationId(donor.id);
        setDonorName(donor.name);
        setReason(donor.rejectionReason || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (!location) {
        return <div>Loading session...</div>;
    }
    const year = YEAR;

    return (
        <div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>Reject Donor</CardTitle>
                    <CardDescription>
                        Enter the Registration ID and reason to mark a donor as rejected for the camp at {location}, {year}.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleReject}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="reg-id">Registered No.</Label>
                                <Input 
                                    id="reg-id" 
                                    placeholder="Enter Registration ID" 
                                    value={registrationId}
                                    onChange={(e) => setRegistrationId(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="donor-name">Donor Name</Label>
                                <Input 
                                    id="donor-name" 
                                    value={donorName}
                                    readOnly
                                    className="bg-gray-100"
                                />
                            </div>
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
                         <Button type="submit" variant="destructive" disabled={!isIdValid || isSubmitting}>
                            {isSubmitting ? 'Rejecting...' : 'Reject'}
                         </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card className="w-full max-w-4xl mt-8">
                <CardHeader>
                    <CardTitle>Rejected Donors List</CardTitle>
                    <CardDescription>List of all donors rejected for the camp at {location}, {year}.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="border rounded-lg overflow-auto max-h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reg. ID</TableHead>
                                    <TableHead>Donor Name</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Age</TableHead>
                                    <TableHead>Blood Group</TableHead>
                                    <TableHead>Agency</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
                                ) : rejectedDonors.length > 0 ? (
                                    rejectedDonors.map(donor => (
                                        <TableRow key={donor.id} onClick={() => handleRowClick(donor)} className="cursor-pointer hover:bg-gray-100">
                                            <TableCell>{donor.id}</TableCell>
                                            <TableCell>{donor.name}</TableCell>
                                            <TableCell>{donor.gender}</TableCell>
                                            <TableCell>{donor.age}</TableCell>
                                            <TableCell>{donor.bloodGroup}</TableCell>
                                            <TableCell>{donor.agency}</TableCell>
                                            <TableCell>{donor.rejectionReason}</TableCell>
                                            <TableCell>{donor.rejectionDate}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">No rejected donors found for this camp.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
