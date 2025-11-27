
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Eye } from 'lucide-react';
import { Registration } from '@/lib/types';
import { Certificate } from '@/components/certificate';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { fetchRegistrations } from '@/lib/api/registrations';

const YEAR = '2026-27';

export default function CertificationPage() {
  const router = useRouter();
  const [location, setLocation] = useState<string | null>(null);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRegistrations = useCallback(async (loc: string) => {
    setIsLoading(true);
    try {
      const data = await fetchRegistrations(loc);
      const nonRejected = data.filter(r => r.status !== 'REJECTED');
      setAllRegistrations(nonRejected);
      setFilteredRegistrations(nonRejected);
    } catch (error: any) {
      console.error(error);
      alert(`Could not load registrations: ${error.message}`);
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
      loadRegistrations(savedLocation);
    }
  }, [router, loadRegistrations]);

  useEffect(() => {
    const results = allRegistrations.filter(reg =>
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRegistrations(results);
  }, [searchTerm, allRegistrations]);

  const handlePrint = (registration: Registration) => {
    setSelectedRegistration(registration);
    setTimeout(() => {
      window.print();
    }, 100); 
  };
  
  const certificateDetails = useMemo(() => {
    if (!selectedRegistration || !location) return null;
    return {
      name: `${selectedRegistration.gender === 'Female' ? 'Ms.' : 'Mr.'} ${selectedRegistration.name}`,
      date: 'April, 1st 2027', 
      event: `Rotary Club of Pimpri, ${location}`
    };
  }, [selectedRegistration, location]);


  if (!location) {
    return <div>Loading session...</div>;
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-8 print-hidden">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Generation</CardTitle>
            <CardDescription>
              Generate and print donation certificates for donors at {location}, {YEAR}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search by Name, Reg. ID, or Blood Group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="border rounded-lg overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg. ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                  ) : filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>{reg.id}</TableCell>
                        <TableCell>{reg.name}</TableCell>
                        <TableCell>{reg.bloodGroup}</TableCell>
                        <TableCell>{reg.agency}</TableCell>
                        <TableCell className="text-right">
                           <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedRegistration(null)}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="mr-2" onClick={() => setSelectedRegistration(reg)}>
                                  <Eye className="mr-1 h-4 w-4" />
                                  Preview
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none">
                                {certificateDetails && (
                                  <Certificate
                                    name={certificateDetails.name}
                                    date={certificateDetails.date}
                                    event={certificateDetails.event}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                          <Button size="sm" onClick={() => handlePrint(reg)}>
                            <Printer className="mr-1 h-4 w-4" />
                            Print
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No matching registrations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div id="print-area" className="hidden print:block">
        {certificateDetails && (
          <Certificate
            name={certificateDetails.name}
            date={certificateDetails.date}
            event={certificateDetails.event}
          />
        )}
      </div>
    </>
  );
}

    