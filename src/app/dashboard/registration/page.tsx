'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Printer, Ban, X, ArrowUp, ArrowDown } from 'lucide-react';

const mockRegistrations = [
    { id: 1, name: 'Suresh Kumar', bloodGroup: 'O+', mobile: '9876543210', agency: 'AFMC BLOOD BANK' },
    { id: 2, name: 'Anjali Sharma', bloodGroup: 'A-', mobile: '9876543211', agency: 'SAHYADRI BLOOD BANK' },
    { id: 3, name: 'Rohan Patil', bloodGroup: 'B+', mobile: '9876543212', agency: 'YCM BLOOD BANK' },
];

const mockAgencies = ['AFMC BLOOD BANK', 'SAHYADRI BLOOD BANK', 'YCM BLOOD BANK', 'PSI BLOOD BANK', 'SASOON BLOOD BANK'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];


type SortKey = 'id' | 'name' | 'bloodGroup' | 'mobile' | 'agency';

export default function RegistrationPage() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [year, setYear] = useState<string | null>(null);

    const [registrations, setRegistrations] = useState(mockRegistrations);
    const [newRegistration, setNewRegistration] = useState({ name: '', bloodGroup: '', mobile: '', agency: '' });
    
    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');


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

    const handleAddRegistration = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRegistration.name && newRegistration.bloodGroup && newRegistration.mobile && newRegistration.agency) {
            const newId = registrations.length > 0 ? Math.max(...registrations.map(r => r.id)) + 1 : 1;
            setRegistrations([...registrations, { id: newId, ...newRegistration }]);
            setNewRegistration({ name: '', bloodGroup: '', mobile: '', agency: '' }); // Reset form
        }
    };
    
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const sortedRegistrations = [...registrations].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    
    const renderSortArrow = (key: SortKey) => {
        if (sortKey !== key) return null;
        return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-1 inline" /> : <ArrowDown className="h-4 w-4 ml-1 inline" />;
    };

    if (!location || !year) {
        return <div>Loading session...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Donor Registration</CardTitle>
                    <CardDescription>Register new donors for the blood donation camp at {location}, {year}.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Registration Form Column */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleAddRegistration} className="p-4 border rounded-lg bg-slate-50 space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Sr No</Label>
                                    <Input value={registrations.length + 1} readOnly className="bg-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Limit</Label>
                                    <Input value="350" readOnly className="bg-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Remaining</Label>
                                    <Input value={350 - 20} readOnly className="bg-gray-200" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="agency">Agency</Label>
                                    <Select value={newRegistration.agency} onValueChange={(value) => setNewRegistration({...newRegistration, agency: value})}>
                                        <SelectTrigger id="agency">
                                            <SelectValue placeholder="Select Agency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockAgencies.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Enter donor's name" value={newRegistration.name} onChange={e => setNewRegistration({...newRegistration, name: e.target.value})} required/>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bloodGroup">Blood Group</Label>
                                    <Select value={newRegistration.bloodGroup} onValueChange={(value) => setNewRegistration({...newRegistration, bloodGroup: value})}>
                                        <SelectTrigger id="bloodGroup">
                                            <SelectValue placeholder="Select Blood Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile No</Label>
                                    <Input id="mobile" type="tel" placeholder="Enter 10-digit number" value={newRegistration.mobile} onChange={e => setNewRegistration({...newRegistration, mobile: e.target.value})} required pattern="[0-9]{10}" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-sm text-muted-foreground">Press Enter or click Add to save</p>
                                <Button type="submit">ADD</Button>
                            </div>
                        </form>

                        <div className="mt-6 border rounded-lg overflow-auto max-h-80">
                            <Table>
                                <TableHeader className="bg-yellow-300">
                                    <TableRow>
                                        <TableHead className="text-black font-bold cursor-pointer" onClick={() => handleSort('id')}>SrNo {renderSortArrow('id')}</TableHead>
                                        <TableHead className="text-black font-bold cursor-pointer" onClick={() => handleSort('name')}>Name {renderSortArrow('name')}</TableHead>
                                        <TableHead className="text-black font-bold cursor-pointer" onClick={() => handleSort('bloodGroup')}>BloodGroup {renderSortArrow('bloodGroup')}</TableHead>
                                        <TableHead className="text-black font-bold cursor-pointer" onClick={() => handleSort('mobile')}>MobNo {renderSortArrow('mobile')}</TableHead>
                                        <TableHead className="text-black font-bold cursor-pointer" onClick={() => handleSort('agency')}>Agency {renderSortArrow('agency')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedRegistrations.map(reg => (
                                        <TableRow key={reg.id}>
                                            <TableCell>{reg.id}</TableCell>
                                            <TableCell>{reg.name}</TableCell>
                                            <TableCell>{reg.bloodGroup}</TableCell>
                                            <TableCell>{reg.mobile}</TableCell>
                                            <TableCell>{reg.agency}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    {/* Stats Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-800">Registered</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-blue-900">150</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-200">
                            <CardHeader>
                                <CardTitle className="text-green-800">Accepted</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-900">120</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50 border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-800">Rejected</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-red-900">20</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-yellow-50 border-yellow-200">
                            <CardHeader>
                                <CardTitle className="text-yellow-800">Donated</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-yellow-900">100</p>
                            </CardContent>
                        </Card>
                         <div className="flex flex-col space-y-2 mt-4">
                            <Button variant="outline" onClick={() => router.push('/dashboard/blood-bank')}>Blood Bank Master</Button>
                            <Button variant="secondary" onClick={() => router.push('/dashboard')}>Close</Button>
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
