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
  { id: 1, name: 'City General Blood Bank', location: 'Mumbai', counter: 1, quota: 100 },
  { id: 2, name: 'Red Cross Society', location: 'Mumbai', counter: 2, quota: 150 },
  { id: 3, name: 'Community Blood Center', location: 'Pune', counter: 1, quota: 120 },
];

const locations = ['Mumbai', 'Pune', 'Nagpur'];

export default function BloodBankPage() {
  const router = useRouter();
  const [bloodBanks, setBloodBanks] = useState(mockBloodBanks);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);

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

  const handleNew = () => {
    setSelectedBank({ id: null, name: '', location: location, counter: '', quota: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (bank: any) => {
    setSelectedBank(bank);
    setIsFormOpen(true);
  };

  const handleDelete = (bankId: number) => {
    setBloodBanks(bloodBanks.filter(b => b.id !== bankId));
  };
  
  const handleCancel = () => {
    setSelectedBank(null);
    setIsFormOpen(false);
  }

  const handleClose = () => {
    router.push('/dashboard');
  }

  if (!location || !year) {
    return <div>Loading session...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Blood Bank Management</CardTitle>
          <div className="flex items-center space-x-2 pt-4">
            <Button onClick={handleNew}><PlusCircle className="mr-2 h-4 w-4" /> New</Button>
            <Button variant="outline" onClick={() => selectedBank && handleEdit(selectedBank)} disabled={!selectedBank}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={!selectedBank}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete the blood bank: <span className="font-bold">{selectedBank?.name}</span>. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>Cancel</Button>
                  <Button variant="destructive" onClick={() => {
                    if (selectedBank) {
                      handleDelete(selectedBank.id);
                      setSelectedBank(null);
                    }
                  }}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            <Button variant="secondary" onClick={handleCancel}><Ban className="mr-2 h-4 w-4" /> Cancel</Button>
            <Button variant="ghost" onClick={handleClose}><X className="mr-2 h-4 w-4" /> Close</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isFormOpen && (
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg mb-6">
              <div className="md:col-span-3 font-bold text-lg">{selectedBank?.id ? `Editing Sr No: ${selectedBank.id}` : 'Creating New Blood Bank'}</div>
              <div>
                <Label htmlFor="srno">Sr No</Label>
                <Input id="srno" value={selectedBank?.id || 'Auto'} readOnly />
              </div>
              <div>
                <Label htmlFor="name">Blood Bank / Agency Name</Label>
                <Input id="name" placeholder="e.g., City General Hospital" value={selectedBank?.name || ''} onChange={(e) => setSelectedBank({...selectedBank, name: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="location">BDC Location</Label>
                 <Select value={selectedBank?.location || ''} onValueChange={(value) => setSelectedBank({...selectedBank, location: value})}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="counter">Counter No</Label>
                <Input id="counter" type="number" placeholder="e.g., 3" value={selectedBank?.counter || ''} onChange={(e) => setSelectedBank({...selectedBank, counter: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="quota">Quota / Limit</Label>
                <Input id="quota" type="number" placeholder="e.g., 100" value={selectedBank?.quota || ''} onChange={(e) => setSelectedBank({...selectedBank, quota: e.target.value})} />
              </div>
               <div className="md:col-span-3 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button type="submit" onClick={(e) => { e.preventDefault(); /* TODO: Save logic */ setIsFormOpen(false); setSelectedBank(null); }}>Save</Button>
                </div>
            </form>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SrNo</TableHead>
                  <TableHead>Agency Name</TableHead>
                  <TableHead>Counter No</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>BDC Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bloodBanks.map(bank => (
                  <TableRow 
                    key={bank.id} 
                    onClick={() => setSelectedBank(bank)}
                    className={selectedBank?.id === bank.id ? 'bg-muted/50' : 'cursor-pointer'}
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
