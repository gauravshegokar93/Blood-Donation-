
'use client';

import Image from 'next/image';

interface CertificateProps {
  name: string;
  date: string;
  event: string;
}

export function Certificate({ name, date, event }: CertificateProps) {
  return (
    <div
      style={{
        width: '297mm',
        height: '210mm',
        position: 'relative',
        fontFamily: "'Times New Roman', Times, serif",
        background: 'white',
      }}
    >
       <Image
        src="/certificate-bg.png"
        alt="Certificate Background"
        layout="fill"
        objectFit="contain"
        quality={100}
        priority
      />
      {/* Donor Name */}
      <div
        className="print-field"
        style={{
          top: '90mm',
          left: '0mm',
          right: '0mm',
          textAlign: 'center',
          fontSize: '48px',
          fontFamily: "'Brush Script MT', 'Snell Roundhand', cursive",
          color: '#333',
        }}
      >
        {name}
      </div>

       {/* Date */}
      <div
        className="print-field"
        style={{
          bottom: '50.5mm',
          left: '32mm',
          fontSize: '15px',
          color: 'black',
        }}
      >
        {date}
      </div>

      {/* Event */}
      <div
        className="print-field"
        style={{
          bottom: '43.5mm',
          left: '32mm',
          fontSize: '15px',
          color: 'black',
        }}
      >
        {event}
      </div>
    </div>
  );
}
