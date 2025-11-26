'use client';

import { Registration, BloodBank } from '@/lib/mock-data';

interface PrintCardProps {
    registration: Registration;
    agency?: BloodBank;
}

export function PrintCard({ registration, agency }: PrintCardProps) {
    // Find the serial number for the registration within its agency
    const registrationsForAgency: Registration[] = JSON.parse(sessionStorage.getItem(`registrations_${registration.location}`) || '[]')
        .filter((r: Registration) => r.agency === (agency ? agency.name : ''));
    
    const srNo = registrationsForAgency.findIndex(r => r.id === registration.id) + 1;


    return (
        <div id="print-card" className="relative">
            <div className="print-field" style={{ top: '0.5in', left: '0.25in', fontSize: '14pt' }}>
                <span className="font-normal">Reg. No:</span> {registration.id}
            </div>
            <div className="print-field" style={{ top: '0.5in', right: '0.25in', fontSize: '14pt' }}>
                <span className="font-normal">Sr. No:</span> {srNo > 0 ? srNo : '-'}
            </div>
            
            <div className="print-field" style={{ top: '1.2in', left: '0.25in', fontSize: '16pt' }}>
                <span className="font-normal">Name:</span> {registration.name}
            </div>

             <div className="print-field" style={{ top: '1.9in', left: '0.25in', fontSize: '14pt' }}>
                <span className="font-normal">Blood Bank:</span> {agency?.name || 'N/A'}
            </div>

            <div className="print-field" style={{ top: '2.6in', left: '0.25in', fontSize: '14pt' }}>
                <span className="font-normal">Counter No:</span> {agency?.counter || 'N/A'}
            </div>

             <div className="print-field" style={{ top: '2.6in', right: '0.25in', fontSize: '24pt' }}>
                {registration.bloodGroup}
            </div>
            
            <div style={{position: 'absolute', bottom: '0.1in', left: '0.25in', fontSize: '8pt', color: 'gray'}}>
                WADHOKAR GROUP - BLOOD DONATION CAMP {registration.year}
            </div>
        </div>
    );
}
