'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowUp, ArrowDown, PlusCircle, Edit, Trash2, Printer, Ban, X } from 'lucide-react';
import { Registration, BloodBank } from '@/lib/mock-data';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Other'];
type SortKey = keyof Registration;
const MOCK_YEAR_FOR_DATA = 2024; // This is a constant for the mock data structure, not the displayed year.

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
    const [agencyCounts, setAgencyCounts] = useState<{[key: string]: number}>({});

    const initialNewRegState = { name: '', bloodGroup: '', mobile: '', agency: '' };
    const [formState, setFormState] = useState(initialNewRegState);
    const [nextRegId, setNextRegId] = useState('');
    
    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const loadDataForCamp = (loc: string, yr: string) => {
        const allRegistrations: Registration[] = JSON.parse(sessionStorage.getItem('registrations') || '[]');
        const campYear = yr === '2025-26' ? '2025-26' : parseInt(yr, 10);
        const campRegistrations = allRegistrations.filter(r => r.location === loc && (r.year === campYear || r.year.toString() === yr));
        setRegistrations(campRegistrations);
        setNextRegId(generateRegistrationId(allRegistrations));

        const allAgencies: BloodBank[] = JSON.parse(sessionStorage.getItem('bloodBanks') || '[]');
        const campAgencies = allAgencies.filter(b => b.location === loc && (b.year === campYear || b.year.toString() === yr));
        setAgencies(campAgencies);

        const limit = campAgencies.reduce((sum, bank) => sum + bank.quota, 0);
        const campAccepted = campRegistrations.filter(r => r.status === 'ACCEPTED').length;
        setStats({
            registered: campRegistrations.length,
            accepted: campAccepted,
            rejected: campRegistrations.filter(r => r.status === 'REJECTED').length,
            donated: campRegistrations.filter(r => r.status === 'DONATED').length,
            limit: limit
        });
        
        const counts: {[key: string]: number} = {};
        campAgencies.forEach(agency => {
            counts[agency.name] = campRegistrations.filter(reg => reg.agency === agency.name).length;
        });
        setAgencyCounts(counts);
    };

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        const savedYear = sessionStorage.getItem('bdcYear');
        if (!savedLocation || !savedYear) {
            router.push('/');
            return;
        }
        
        setLocation(savedLocation);
        setYear(savedYear);
        loadDataForCamp(savedLocation, savedYear);
    }, [router]);
    
    const handleSaveRegistration = (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.name && formState.bloodGroup && formState.mobile && formState.agency && location && year) {
            const allRegistrations: Registration[] = JSON.parse(sessionStorage.getItem('registrations') || '[]');
            
            let updatedRegistrations;
            const yearToSave = '2025-26';

            if (isEditing && selectedRegistration) {
                 updatedRegistrations = allRegistrations.map(r => r.id === selectedRegistration.id ? { ...selectedRegistration, ...formState, year: yearToSave } : r);
            } else {
                const newReg: Registration = {
                    id: nextRegId,
                    name: formState.name,
                    bloodGroup: formState.bloodGroup,
                    mobile: formState.mobile,
                    agency: formState.agency,
                    location: location,
                    year: yearToSave,
                    status: 'REGISTERED',
                };
                updatedRegistrations = [...allRegistrations, newReg];
            }
            
            sessionStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
            handleCancel();
            loadDataForCamp(location, year);
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

    const handleNew = () => {
        setIsEditing(false);
        setSelectedRegistration(null);
        setFormState(initialNewRegState);
    };

    const handleEdit = () => {
        if (selectedRegistration) {
            setIsEditing(true);
            setFormState({
                name: selectedRegistration.name,
                bloodGroup: selectedRegistration.bloodGroup,
                mobile: selectedRegistration.mobile,
                agency: selectedRegistration.agency
            });
        }
    };
    
    const handleDelete = () => {
        if (selectedRegistration && location && year) {
            const allRegistrations: Registration[] = JSON.parse(sessionStorage.getItem('registrations') || '[]');
            const updatedRegistrations = allRegistrations.filter(r => r.id !== selectedRegistration.id);
            sessionStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
            
            setIsDeleteDialogOpen(false);
            setSelectedRegistration(null);
            loadDataForCamp(location, year);
        }
    };

    const handlePrint = () => {
        if(selectedRegistration){
            window.print();
        } else {
            alert("Please select a registration to print.");
        }
    }
    
    const handleCancel = () => {
        setIsEditing(false);
        setSelectedRegistration(null);
        setFormState(initialNewRegState);
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
                         <div className="flex items-center space-x-1 md:space-x-2 mb-4 p-2 bg-gray-50 border rounded-md">
                            <Button size="sm" onClick={handleNew}><PlusCircle className="mr-1 h-4 w-4" /> New</Button>
                            <Button size="sm" variant="outline" onClick={handleEdit} disabled={!selectedRegistration}><Edit className="mr-1 h-4 w-4" /> Edit</Button>
                            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive" disabled={!selectedRegistration}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                    <DialogTitle>Are you sure?</DialogTitle>
                                    <DialogDescription>
                                        This will permanently delete the registration for <span className="font-bold">{selectedRegistration?.name}</span>.
                                    </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button size="sm" variant="outline" onClick={handlePrint} disabled={!selectedRegistration}><Printer className="mr-1 h-4 w-4" /> Print</Button>
                            <Button size="sm" variant="secondary" onClick={handleCancel}><Ban className="mr-1 h-4 w-4" /> Cancel</Button>
                            <Button size="sm" variant="ghost" onClick={() => router.push('/dashboard')}><X className="mr-1 h-4 w-4" /> Close</Button>
                        </div>
                        <form onSubmit={handleSaveRegistration} className="p-4 border rounded-lg bg-slate-50 space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Reg. ID</Label>
                                    <Input value={isEditing ? selectedRegistration?.id || '' : nextRegId} readOnly className="bg-gray-200" />
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
                                    <Select value={formState.agency} onValueChange={(value) => setFormState({...formState, agency: value})} required>
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
                                    <Input id="name" placeholder="Enter donor's name" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} required/>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bloodGroup">Blood Group</Label>
                                    <Select value={formState.bloodGroup} onValueChange={(value) => setFormState({...formState, bloodGroup: value})} required>
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
                                    <Input id="mobile" type="tel" placeholder="Enter 10-digit number" value={formState.mobile} onChange={e => setFormState({...formState, mobile: e.target.value})} required pattern="[0-9]{10}" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-sm text-muted-foreground">Press Enter or click {isEditing ? 'Save' : 'Add'} to save</p>
                                <Button type="submit">{isEditing ? 'Save' : 'Add'}</Button>
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
                                        <TableRow 
                                            key={reg.id}
                                            onClick={() => setSelectedRegistration(reg)}
                                            className={selectedRegistration?.id === reg.id ? 'bg-blue-200' : 'cursor-pointer hover:bg-blue-100'}
                                        >
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Blood Bank Agencies (Current Location)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>AgencyName</TableHead>
                                            <TableHead className="text-right">TotalCount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(agencyCounts).map(([agencyName, count]) => (
                                            <TableRow key={agencyName}>
                                                <TableCell className="font-medium">{agencyName}</TableCell>
                                                <TableCell className="text-right">{count}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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

    