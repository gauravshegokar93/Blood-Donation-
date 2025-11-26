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
                width: '8.5mm', 
                height: '10mm', 
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                fontSize: '0.25mm', // Scaled down font size
                lineHeight: '1.2'
            }}
        >
            <div 
                className="absolute"
                style={{ top: '0.5mm', left: '0.5mm', whiteSpace: 'nowrap' }}
            >
                <span className="font-normal">Reg:</span> {registration.id}
            </div>
            <div 
                className="absolute"
                style={{ top: '0.5mm', right: '0.5mm', whiteSpace: 'nowrap' }}
            >
                <span className="font-normal">Sr:</span> {srNo > 0 ? srNo : '-'}
            </div>
            
            <div 
                className="absolute w-full text-center"
                style={{ top: '1.5mm', left: '0', fontWeight: 'bold' }}
            >
                {registration.name}
            </div>

            <div 
                className="absolute"
                style={{ top: '3mm', left: '0.5mm', width: '7.5mm', wordWrap: 'break-word' }}
            >
                <span className="font-normal">Bank:</span>
                <div style={{ fontWeight: 'bold' }}>{agency?.name || 'N/A'}</div>
            </div>

            <div 
                className="absolute"
                style={{ top: '5.5mm', left: '0.5mm', whiteSpace: 'nowrap' }}
            >
                <span className="font-normal">Counter:</span> <span style={{ fontWeight: 'bold' }}>{agency?.counter || 'N/A'}</span>
            </div>

            <div 
                className="absolute"
                style={{ 
                    top: '7mm', 
                    right: '0.5mm', 
                    fontWeight: 'bold',
                    border: '0.1mm solid black',
                    borderRadius: '50%',
                    width: '2mm',
                    height: '2mm',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7mm'
                }}
            >
                {registration.bloodGroup}
            </div>
        </div>
    );
}
