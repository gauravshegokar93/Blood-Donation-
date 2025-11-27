
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Printer, Ban, X } from 'lucide-react';
import { BloodBank } from '@/lib/types';
import { fetchBloodBanks, saveBloodBank, deleteBloodBank } from '@/lib/api/blood-banks';

const YEAR = '2026-27';

export default function BloodBankPage() {
  const router = useRouter();
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<BloodBank | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialFormState: Partial<Omit<BloodBank, 'id'>> = { name: '', location: '', counter: 0, quota: 0, year: YEAR };
  const [formState, setFormState] = useState<Partial<BloodBank>>(initialFormState);

  const loadBloodBanks = useCallback(async (loc: string) => {
    setIsLoading(true);
    try {
      const data = await fetchBloodBanks(loc);
      setBloodBanks(data);
    } catch (error: any) {
      console.error(error);
      alert(`Could not load blood banks: ${error.message}`);
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
      loadBloodBanks(savedLocation);
      setFormState(prev => ({ ...prev, location: savedLocation, year: YEAR }));
    }
  }, [router, loadBloodBanks]);
  
  const handleNew = () => {
    if (!location) return;
    setSelectedBank(null);
    setFormState({ ...initialFormState, location: location, year: YEAR });
    setIsFormOpen(true);
  };

  const handleEdit = () => {
    if (selectedBank) {
      setFormState(selectedBank);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async () => {
    if (selectedBank && location) {
        try {
            await deleteBloodBank(selectedBank.id);
            await loadBloodBanks(location);
            setIsDeleteDialogOpen(false);
            setSelectedBank(null);
        } catch (error: any) {
            console.error(error);
            alert(`Failed to delete blood bank: ${error.message}`);
        }
    }
  };
  
  const handleCancel = () => {
    if (!location) return;
    setSelectedBank(null);
    setFormState({ ...initialFormState, location: location, year: YEAR });
    setIsFormOpen(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !formState.name) return;

    try {
        await saveBloodBank(formState);
        await loadBloodBanks(location);
        handleCancel();
    } catch (error: any) {
        console.error(error);
        alert(`Failed to save blood bank: ${error.message}`);
    }
  };

  const handleClose = () => {
    router.push('/dashboard');
  }

  if (!location) {
    return <div>Loading session...</div>;
  }

  const year = YEAR;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Blood Bank Management ({location}, {year})</CardTitle>
          <div className="flex items-center space-x-1 md:space-x-2">
            <Button size="sm" onClick={handleNew}><PlusCircle className="mr-1 h-4 w-4" /> New</Button>
            <Button size="sm" variant="outline" onClick={handleEdit} disabled={!selectedBank}><Edit className="mr-1 h-4 w-4" /> Edit</Button>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                   <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print</Button>
            <Button size="sm" variant="secondary" onClick={handleCancel} disabled={!isFormOpen}><Ban className="mr-1 h-4 w-4" /> Cancel</Button>
            <Button size="sm" variant="ghost" onClick={handleClose}><X className="mr-1 h-4 w-4" /> Close</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isFormOpen && (
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg mb-6 bg-slate-50">
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
                 <Input id="location" value={location || ''} readOnly className="bg-gray-200"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="counter">Counter No</Label>
                <Input id="counter" type="number" placeholder="e.g., 2" value={formState?.counter || ''} onChange={(e) => setFormState({...formState, counter: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quota">Quota / Limit</Label>
                <Input id="quota" type="number" placeholder="e.g., 350" value={formState?.quota || ''} onChange={(e) => setFormState({...formState, quota: parseInt(e.target.value) || 0})} />
              </div>
               <div className="md:col-span-4 flex justify-end space-x-2 pt-2">
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
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                ) : bloodBanks.length > 0 ? (
                  bloodBanks.map(bank => (
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
                  ))
                ) : (
                   <TableRow><TableCell colSpan={5} className="text-center">No blood banks found for this location.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    