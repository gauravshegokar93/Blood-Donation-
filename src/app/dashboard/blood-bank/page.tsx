'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Printer, Ban, X } from 'lucide-react';

// Mock data, will be replaced with API calls
const mockBloodBanks = [
  { id: 1, name: 'AFMC BLOOD BANK', location: 'PUNE', counter: 2, quota: 350 },
  { id: 2, name: 'SAHYADRI BLOOD BANK', location: 'PUNE', counter: 6, quota: 350 },
  { id: 3, name: 'YCM BLOOD BANK', location: 'PUNE', counter: 1, quota: 350 },
  { id: 4, name: 'PSI BLOOD BANK', location: 'PUNE', counter: 5, quota: 350 },
  { id: 5, name: 'SASOON BLOOD BANK', location: 'PUNE', counter: 3, quota: 350 },
  { id: 6, name: 'DY PATIL BLOOD BANK', location: 'PUNE', counter: 4, quota: 350 },
  { id: 7, name: 'UTTRAKHAND', location: 'UTTRAKHAND', counter: 7, quota: 200 },
  { id: 8, name: 'RADHA LAWN SHEGAON', location: 'SHEGAON', counter: 11, quota: 350 },
  { id: 9, name: 'SDM COLLEGE DHARWAD', location: 'DHARWAD', counter: 9, quota: 300 },
  { id: 10, name: 'CIVIL HOSPITAL DHARWAD', location: 'DHARWAD', counter: 10, quota: 300 },
];

const locations = ['PUNE', 'UTTRAKHAND', 'SHEGAON', 'DHARWAD', 'Mumbai', 'Nagpur'];

export default function BloodBankPage() {
  const router = useRouter();
  const [bloodBanks, setBloodBanks] = useState(mockBloodBanks);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [formState, setFormState] = useState<any>({ id: null, name: '', location: '', counter: '', quota: '' });

  useEffect(() => {
    const savedLocation = sessionStorage.getItem('bdcLocation');
    const savedYear = sessionStorage.getItem('bdcYear');
    if (!savedLocation || !savedYear) {
      router.push('/');
    } else {
      setLocation(savedLocation);
      setYear(savedYear);
      setFormState((prev:any) => ({ ...prev, location: savedLocation }));
    }
  }, [router]);

  useEffect(() => {
    if (selectedBank) {
      setFormState(selectedBank);
      setIsFormOpen(true);
    }
  }, [selectedBank]);
  
  const handleNew = () => {
    setSelectedBank(null);
    setFormState({ id: null, name: '', location: location, counter: '', quota: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (bank: any) => {
    if(selectedBank) {
      setFormState(bank);
      setIsFormOpen(true);
    }
  };

  const handleDelete = (bankId: number) => {
    setBloodBanks(bloodBanks.filter(b => b.id !== bankId));
    handleCancel();
  };
  
  const handleCancel = () => {
    setSelectedBank(null);
    setFormState({ id: null, name: '', location: location, counter: '', quota: '' });
    setIsFormOpen(false);
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.id) { // Editing existing
      setBloodBanks(bloodBanks.map(b => b.id === formState.id ? formState : b));
    } else { // Creating new
      const newId = bloodBanks.length > 0 ? Math.max(...bloodBanks.map(b => b.id)) + 1 : 1;
      setBloodBanks([...bloodBanks, { ...formState, id: newId }]);
    }
    handleCancel();
  };

  const handleClose = () => {
    router.push('/dashboard');
  }

  if (!location || !year) {
    return <div>Loading session...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Blood Bank</CardTitle>
          <div className="flex items-center space-x-1 md:space-x-2">
            <Button size="sm" onClick={handleNew}><PlusCircle className="mr-1 h-4 w-4" /> New</Button>
            <Button size="sm" variant="outline" onClick={() => selectedBank && handleEdit(selectedBank)} disabled={!selectedBank}><Edit className="mr-1 h-4 w-4" /> Edit</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={!selectedBank}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete the blood bank: <span className="font-bold">{selectedBank?.name}</span>. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                   <Button variant="outline" onClick={() => setSelectedBank(null)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => {
                    if (selectedBank) {
                      handleDelete(selectedBank.id);
                    }
                  }}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print</Button>
            <Button size="sm" variant="secondary" onClick={handleCancel}><Ban className="mr-1 h-4 w-4" /> Cancel</Button>
            <Button size="sm" variant="ghost" onClick={handleClose}><X className="mr-1 h-4 w-4" /> Close</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isFormOpen && (
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg mb-6 bg-slate-50">
              <div className="space-y-2">
                <Label htmlFor="srno">SrNo</Label>
                <Input id="srno" value={formState?.id || 'Auto'} readOnly className="bg-gray-200"/>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Blood Bank</Label>
                <Input id="name" placeholder="AFMC BLOOD BANK" value={formState?.name || ''} onChange={(e) => setFormState({...formState, name: e.target.value})} required />
              </div>
               <div className="space-y-2">
                 <Label htmlFor="location">BDC Location</Label>
                 <Select value={formState?.location || ''} onValueChange={(value) => setFormState({...formState, location: value})}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2 invisible">
                <Label htmlFor="location-hidden">BDC Location</Label>
                 <Input id="location-hidden" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="counter">Counter No</Label>
                <Input id="counter" type="number" placeholder="e.g., 2" value={formState?.counter || ''} onChange={(e) => setFormState({...formState, counter: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quota">Quota / Limit</Label>
                <Input id="quota" type="number" placeholder="e.g., 350" value={formState?.quota || ''} onChange={(e) => setFormState({...formState, quota: e.target.value})} />
              </div>
               <div className="md:col-span-5 flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
          )}

          <div className="border rounded-lg overflow-auto max-h-96">
            <Table>
              <TableHeader className="bg-yellow-300">
                <TableRow>
                  <TableHead className="text-black font-bold">SrNo</TableHead>
                  <TableHead className="text-black font-bold">AgencyName</TableHead>
                  <TableHead className="text-black font-bold">CounterNo</TableHead>
                  <TableHead className="text-black font-bold">Limit</TableHead>
                  <TableHead className="text-black font-bold">BDC_Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bloodBanks.map(bank => (
                  <TableRow 
                    key={bank.id} 
                    onClick={() => setSelectedBank(bank)}
                    className={selectedBank?.id === bank.id ? 'bg-blue-200' : 'cursor-pointer hover:bg-blue-100'}
                  >
                    <TableCell>{bank.id}</TableCell>
                    <TableCell>{bank.name}</TableCell>
                    <TableCell>{bank.counter}</TableCell>
                    <TableCell>{bank.quota}</TableCell>
                    <TableCell>{bank.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
