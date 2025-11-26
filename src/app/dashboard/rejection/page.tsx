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

    const loadData = (loc: string) => {
        const registrationKey = `registrations_${loc}`;
        const currentRegistrations: Registration[] = JSON.parse(sessionStorage.getItem(registrationKey) || '[]');
        setAllCampRegistrations(currentRegistrations);

        const campRejectedDonors = currentRegistrations.filter(r => r.status === 'REJECTED');
        setRejectedDonors(campRejectedDonors);
    };

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        if (!savedLocation) {
            router.push('/');
        } else {
            setLocation(savedLocation);
            loadData(savedLocation);
        }
    }, [router]);

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

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        const regId = registrationId;
        if (!regId || !reason || !location) {
            alert('Please enter a Registration ID and select a reason.');
            return;
        }

        const registrationKey = `registrations_${location}`;
        const registrationIndex = allCampRegistrations.findIndex(r => r.id === regId);

        if (registrationIndex === -1) {
            alert(`Registration ID "${regId}" not found for this camp.`);
            return;
        }
        
        if(allCampRegistrations[registrationIndex].status !== 'REGISTERED' && allCampRegistrations[registrationIndex].status !== 'ACCEPTED') {
            alert(`Registration ID "${regId}" cannot be rejected. Current status: ${allCampRegistrations[registrationIndex].status}.`);
            return;
        }
        
        const updatedRegistrations = [...allCampRegistrations];
        updatedRegistrations[registrationIndex].status = 'REJECTED';
        updatedRegistrations[registrationIndex].rejectionReason = reason;
        updatedRegistrations[registrationIndex].rejectionDate = new Date().toISOString().split('T')[0];
        
        sessionStorage.setItem(registrationKey, JSON.stringify(updatedRegistrations));
        
        alert(`Registration ID "${registrationId}" has been rejected. Reason: ${reason}.`);
        
        // Reset form and reload data
        setRegistrationId(''); 
        setReason('');
        loadData(location);
    };

    const handleRowClick = (donor: Registration) => {
        setRegistrationId(donor.id);
        setDonorName(donor.name);
        setReason(donor.rejectionReason || '');
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
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Age</TableHead>
                                    <TableHead>Blood Group</TableHead>
                                    <TableHead>Agency</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rejectedDonors.length > 0 ? (
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
