'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Registration, BloodBank } from '@/lib/mock-data';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Other'];
type SortKey = keyof Registration;
const MOCK_YEAR_FOR_DATA = 2024; // Year used to fetch initial data

function generateRegistrationId(existingRegistrations: Registration[]): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const datePrefix = `REG-${year}${month}${day}-`;

    const todayRegistrations = existingRegistrations.filter(r => typeof r.id === 'string' && r.id.startsWith(datePrefix));
    
    const nextIdNumber = todayRegistrations.length + 1;
    const nextId = nextIdNumber.toString().padStart(4, '0');
    
    return `${datePrefix}${nextId}`;
}


export default function RegistrationPage() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [year, setYear] = useState<string | null>(null);

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [agencies, setAgencies] = useState<BloodBank[]>([]);
    const [stats, setStats] = useState({ registered: 0, accepted: 0, rejected: 0, donated: 0, limit: 0 });

    const initialNewRegState = { name: '', bloodGroup: '', mobile: '', agency: '' };
    const [newRegistration, setNewRegistration] = useState(initialNewRegState);
    const [nextRegId, setNextRegId] = useState('');
    
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
            loadDataForCamp(savedLocation, savedYear);
        }
    }, [router]);
    
    const loadDataForCamp = (loc: string, yr: string) => {
        const allRegistrations: Registration[] = JSON.parse(sessionStorage.getItem('registrations') || '[]');
        const campRegistrations = allRegistrations.filter(r => r.location === loc && (r.year === MOCK_YEAR_FOR_DATA || r.year.toString() === yr));
        setRegistrations(campRegistrations);
        setNextRegId(generateRegistrationId(allRegistrations));

        const allAgencies: BloodBank[] = JSON.parse(sessionStorage.getItem('bloodBanks') || '[]');
        const campAgencies = allAgencies.filter(b => b.location === loc && (b.year === MOCK_YEAR_FOR_DATA || b.year.toString() === yr));
        setAgencies(campAgencies);

        const limit = campAgencies.reduce((sum, bank) => sum + bank.quota, 0);
        setStats({
            registered: campRegistrations.length,
            accepted: campRegistrations.filter(r => r.status === 'ACCEPTED').length,
            rejected: campRegistrations.filter(r => r.status === 'REJECTED').length,
            donated: campRegistrations.filter(r => r.status === 'DONATED').length,
            limit: limit
        });
    };

    const handleAddRegistration = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRegistration.name && newRegistration.bloodGroup && newRegistration.mobile && newRegistration.agency && location && year) {
            const allRegistrations: Registration[] = JSON.parse(sessionStorage.getItem('registrations') || '[]');
            
            const newReg: Registration = {
                id: nextRegId,
                name: newRegistration.name,
                bloodGroup: newRegistration.bloodGroup,
                mobile: newRegistration.mobile,
                agency: newRegistration.agency,
                location: location,
                year: year === '2025-26' ? '2025-26' : MOCK_YEAR_FOR_DATA,
                status: 'REGISTERED',
            };
            
            const updatedRegistrations = [...allRegistrations, newReg];
            sessionStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
            
            setNewRegistration(initialNewRegState); // Reset form
            loadDataForCamp(location, year); // Reload data
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
                                    <Label>Reg. ID</Label>
                                    <Input value={nextRegId} readOnly className="bg-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Limit</Label>
                                    <Input value={stats.limit} readOnly className="bg-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Remaining</Label>
                                    <Input value={stats.limit - stats.accepted} readOnly className="bg-gray-200" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="agency">Agency</Label>
                                    <Select value={newRegistration.agency} onValueChange={(value) => setNewRegistration({...newRegistration, agency: value})} required>
                                        <SelectTrigger id="agency">
                                            <SelectValue placeholder="Select Agency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {agencies.map(a => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
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
                                    <Select value={newRegistration.bloodGroup} onValueChange={(value) => setNewRegistration({...newRegistration, bloodGroup: value})} required>
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
                                        <TableHead className="text-black font-bold cursor-pointer" onClick={() => handleSort('id')}>Reg. ID {renderSortArrow('id')}</TableHead>
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
                                <p className="text-3xl font-bold text-blue-900">{stats.registered}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-200">
                            <CardHeader>
                                <CardTitle className="text-green-800">Accepted</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-900">{stats.accepted}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50 border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-800">Rejected</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-yellow-50 border-yellow-200">
                            <CardHeader>
                                <CardTitle className="text-yellow-800">Donated</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-yellow-900">{stats.donated}</p>
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
