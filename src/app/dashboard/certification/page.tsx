
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Eye } from 'lucide-react';
import { Registration } from '@/lib/mock-data';
import { Certificate } from '@/components/certificate';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

const YEAR = '2025-26';

export default function CertificationPage() {
  const router = useRouter();
  const [location, setLocation] = useState<string | null>(null);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    const savedLocation = sessionStorage.getItem('bdcLocation');
    if (!savedLocation) {
      router.push('/');
    } else {
      setLocation(savedLocation);
      const registrationKey = `registrations_${savedLocation}`;
      const registrations: Registration[] = JSON.parse(sessionStorage.getItem(registrationKey) || '[]');
      const acceptedRegistrations = registrations.filter(r => r.status === 'ACCEPTED' || r.status === 'DONATED');
      setAllRegistrations(acceptedRegistrations);
      setFilteredRegistrations(acceptedRegistrations);
    }
  }, [router]);

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
      date: 'April, 1st 2026', 
      event: `Rotary Club of Pimpri, ${location}`
    };
  }, [selectedRegistration, location]);


  if (!location) {
    return <div>Loading session...</div>;
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-8 print:hidden">
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
                  {filteredRegistrations.length > 0 ? (
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
                              <DialogContent className="max-w-4xl p-0 border-0">
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
