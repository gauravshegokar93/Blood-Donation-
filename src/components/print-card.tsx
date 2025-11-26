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
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
        >
            <div 
                className="absolute"
                style={{ top: '10mm', left: '5mm', fontSize: '8pt' }}
            >
                <span className="font-normal">Reg. No:</span> {registration.id}
            </div>
            <div 
                className="absolute"
                style={{ top: '10mm', right: '5mm', fontSize: '8pt' }}
            >
                <span className="font-normal">Sr. No:</span> {srNo > 0 ? srNo : '-'}
            </div>
            
            <div 
                className="absolute w-full text-center"
                style={{ top: '22mm', left: '0', fontSize: '12pt', fontWeight: 'bold' }}
            >
                {registration.name}
            </div>

            <div 
                className="absolute"
                style={{ top: '35mm', left: '5mm', fontSize: '9pt' }}
            >
                <span className="font-normal">Blood Bank:</span>
                <div style={{ fontWeight: 'bold' }}>{agency?.name || 'N/A'}</div>
            </div>

            <div 
                className="absolute"
                style={{ top: '50mm', left: '5mm', fontSize: '9pt' }}
            >
                <span className="font-normal">Counter No:</span> <span style={{ fontWeight: 'bold' }}>{agency?.counter || 'N/A'}</span>
            </div>

            <div 
                className="absolute"
                style={{ 
                    top: '48mm', 
                    right: '5mm', 
                    fontSize: '14pt', 
                    fontWeight: 'bold',
                    border: '2px solid black',
                    borderRadius: '50%',
                    width: '15mm',
                    height: '15mm',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {registration.bloodGroup}
            </div>
            
            <div 
                className="absolute w-full text-center"
                style={{ bottom: '3mm', left: '0', fontSize: '6pt', color: 'gray'}}
            >
                WADHOKAR GROUP - BLOOD DONATION CAMP {registration.year}
            </div>
        </div>
    );
}
