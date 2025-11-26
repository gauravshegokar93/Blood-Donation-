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
                width: '54mm', 
                height: '85.6mm', 
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                fontSize: '10pt',
                lineHeight: '1.4'
            }}
        >
            {/* Header with Title */}
            <div className="absolute w-full text-center" style={{top: '4mm'}}>
                <div style={{fontSize: '11pt', fontWeight: 'bold', color: '#C00000'}}>WADHOKAR GROUP OF COMPANIES</div>
                <div style={{fontSize: '9pt', fontWeight: 'bold', marginTop: '1mm'}}>BLOOD DONATION CAMP {registration.year}</div>
            </div>

            {/* Registration and Sr No */}
            <div className="absolute" style={{ top: '15mm', left: '4mm', fontSize: '9pt' }}>
                <span className="font-normal">Reg. No:</span> <span style={{fontWeight: 'bold'}}>{registration.id}</span>
            </div>
            <div className="absolute" style={{ top: '15mm', right: '4mm', fontSize: '9pt' }}>
                <span className="font-normal">Sr. No:</span> <span style={{fontWeight: 'bold'}}>{srNo > 0 ? srNo : '-'}</span>
            </div>
            
            {/* Donor Name */}
            <div className="absolute w-full text-center" style={{ top: '25mm', left: '0', fontSize: '14pt', fontWeight: 'bold' }}>
                {registration.name}
            </div>

            {/* Blood Bank */}
            <div className="absolute w-full" style={{ top: '38mm', left: '4mm', fontSize: '9pt' }}>
                 <span className="font-normal">Blood Bank:</span>
                 <div style={{ fontWeight: 'bold', fontSize: '10pt', marginTop: '1mm', paddingRight: '4mm' }}>{agency?.name || 'N/A'}</div>
            </div>

            {/* Counter Number */}
            <div className="absolute" style={{ top: '55mm', left: '4mm', fontSize: '9pt' }}>
                <span className="font-normal">Counter No:</span> <span style={{ fontWeight: 'bold', fontSize: '12pt' }}>{agency?.counter || 'N/A'}</span>
            </div>

            {/* Blood Group */}
            <div 
                className="absolute"
                style={{ 
                    top: '52mm', 
                    right: '4mm', 
                    fontWeight: 'bold',
                    border: '2px solid black',
                    borderRadius: '50%',
                    width: '18mm',
                    height: '18mm',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12pt'
                }}
            >
                {registration.bloodGroup}
            </div>

            {/* Footer */}
            <div className="absolute w-full text-center" style={{bottom: '4mm', fontSize: '8pt', color: '#555'}}>
                 * This card is valid for the specified camp and date only *
            </div>
        </div>
    );
}
