'use client';

import { Registration, BloodBank } from '@/lib/mock-data';

interface PrintCardProps {
    registration: Registration;
    agency?: BloodBank;
}

export function PrintCard({ registration, agency }: PrintCardProps) {
    const registrationsForAgency: Registration[] = JSON.parse(sessionStorage.getItem(`registrations_${registration.location}`) || '[]')
        .filter((r: Registration) => r.agency === (agency ? agency.name : ''));
    
    const srNo = registrationsForAgency.findIndex(r => r.id === registration.id) + 1;

    return (
        <div 
            id="print-card" 
            className="relative box-border bg-white text-black"
            style={{ 
                width: '85.6mm', 
                height: '54mm', 
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                fontSize: '8pt', // smaller base font size for landscape
                lineHeight: '1.2'
            }}
        >
            {/* Header */}
            <div className="absolute w-full text-center" style={{top: '3mm'}}>
                <div style={{fontSize: '8pt', fontWeight: 'bold'}}>BLOOD DONATION CAMP {registration.year}</div>
            </div>

             <div 
                className="absolute"
                style={{ 
                    top: '3mm', 
                    left: '26mm', 
                    fontWeight: 'bold',
                    border: '2px solid black',
                    borderRadius: '50%',
                    width: '14mm',
                    height: '14mm',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10pt'
                }}
            >
                {registration.bloodGroup}
            </div>
            
            {/* Reg and Sr No */}
            <div className="absolute" style={{ top: '10mm', left: '4mm', fontSize: '8pt' }}>
                <span className="font-normal">Reg. No:</span> <span style={{fontWeight: 'bold'}}>{registration.id}</span>
            </div>
            <div className="absolute" style={{ top: '10mm', right: '4mm', fontSize: '8pt' }}>
                <span className="font-normal">Sr. No:</span> <span style={{fontWeight: 'bold'}}>{srNo > 0 ? srNo : '-'}</span>
            </div>

            {/* Donor Name */}
            <div className="absolute w-full" style={{ top: '18mm', left: '4mm', fontSize: '8pt' }}>
                 <span className="font-normal">Donor Name:</span>
                 <div style={{ fontWeight: 'bold', fontSize: '11pt', marginTop: '1mm', paddingRight: '4mm' }}>{registration.name}</div>
            </div>
            
            {/* Blood Bank */}
            <div className="absolute w-full" style={{ top: '30mm', left: '4mm', fontSize: '8pt' }}>
                 <span className="font-normal">Blood Bank:</span>
                 <div style={{ fontWeight: 'bold', fontSize: '9pt', marginTop: '1mm', paddingRight: '4mm' }}>{agency?.name || 'N/A'}</div>
            </div>

            {/* Counter Number */}
            <div className="absolute" style={{ top: '42mm', left: '4mm', fontSize: '8pt' }}>
                <span className="font-normal">Counter No:</span> <span style={{ fontWeight: 'bold', fontSize: '10pt' }}>{agency?.counter || 'N/A'}</span>
            </div>

            {/* Footer */}
            <div className="absolute w-full text-center" style={{bottom: '2mm', fontSize: '7pt', color: '#555'}}>
                 * This card is valid for the specified camp and date only *
            </div>
        </div>
    );
}
