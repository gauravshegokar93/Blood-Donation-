'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Registration } from '@/lib/mock-data';

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

    const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
    const [rejectedDonors, setRejectedDonors] = useState<Registration[]>([]);
    
    const [registrationId, setRegistrationId] = useState('');
    const [donorName, setDonorName] = useState('');
    const [reason, setReason] = useState('');
    const [isIdValid, setIsIdValid] = useState(false);

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        const savedYear = sessionStorage.getItem('bdcYear');
        if (!savedLocation || !savedYear) {
            router.push('/');
        } else {
            setLocation(savedLocation);
            setYear(savedYear);
            loadData(savedLocation, savedYear);
        }
    }, [router]);

    useEffect(() => {
        if (registrationId && allRegistrations.length > 0) {
            const campYear = year === '2025-26' ? '2025-26' : parseInt(year as string, 10);
            const donor = allRegistrations.find(r => 
                r.id === registrationId && 
                r.location === location && 
                (r.year === campYear || r.year.toString() === year)
            );
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
    }, [registrationId, allRegistrations, location, year]);

    const loadData = (loc: string, yr: string) => {
        const currentRegistrations: Registration[] = JSON.parse(sessionStorage.getItem('registrations') || '[]');
        setAllRegistrations(currentRegistrations);
        const campYear = yr === '2025-26' ? '2025-26' : parseInt(yr, 10);

        const campRejectedDonors = currentRegistrations.filter(r => 
            r.status === 'REJECTED' && 
            r.location === loc &&
            (r.year === campYear || r.year.toString() === yr)
        );
        setRejectedDonors(campRejectedDonors);
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        const regId = registrationId;
        if (!regId || !reason || !location || !year) {
            alert('Please enter a Registration ID and select a reason.');
            return;
        }

        const registrationIndex = allRegistrations.findIndex(r => r.id === regId && r.location === location && (r.year.toString() === year || r.year === (year === '2025-26' ? '2025-26' : parseInt(year, 10))));

        if (registrationIndex === -1) {
            alert(`Registration ID "${regId}" not found for this camp.`);
            return;
        }
        
        if(allRegistrations[registrationIndex].status !== 'REGISTERED') {
            alert(`Registration ID "${regId}" cannot be rejected. Current status: ${allRegistrations[registrationIndex].status}.`);
            return;
        }
        
        const updatedRegistrations = [...allRegistrations];
        updatedRegistrations[registrationIndex].status = 'REJECTED';
        updatedRegistrations[registrationIndex].rejectionReason = reason;
        updatedRegistrations[registrationIndex].rejectionDate = new Date().toISOString().split('T')[0];
        
        sessionStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
        
        alert(`Registration ID "${registrationId}" has been rejected. Reason: ${reason}.`);
        
        // Reset form and reload data
        setRegistrationId(''); 
        setReason('');
        loadData(location, year);
    };
    
    if (!location || !year) {
        return <div>Loading session...</div>;
    }

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
                         <Button type="submit" variant="destructive" disabled={!isIdValid}>Reject</Button>
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
                                    <TableHead>Agency</TableHead>
                                    <TableHead>Blood Group</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rejectedDonors.length > 0 ? (
                                    rejectedDonors.map(donor => (
                                        <TableRow key={donor.id}>
                                            <TableCell>{donor.id}</TableCell>
                                            <TableCell>{donor.name}</TableCell>
                                            <TableCell>{donor.agency}</TableCell>
                                            <TableCell>{donor.bloodGroup}</TableCell>
                                            <TableCell>{donor.rejectionReason}</TableCell>
                                            <TableCell>{donor.rejectionDate}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No rejected donors found for this camp.</TableCell>
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
