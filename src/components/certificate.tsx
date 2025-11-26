
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
        fontFamily: 'sans-serif',
      }}
    >
      <Image
        src="/White and Red Blood Donor Simple Certificate.png"
        alt="Certificate Background"
        layout="fill"
        objectFit="cover"
        priority
      />
      <div
        style={{
          position: 'absolute',
          top: '97mm',
          left: '0mm',
          right: '0mm',
          textAlign: 'center',
          fontSize: '48px',
          fontFamily: "'Brush Script MT', cursive",
          color: '#333',
        }}
      >
        {name}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '41mm',
          left: '32mm',
          fontSize: '16px',
          color: '#333',
        }}
      >
        {date}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '33mm',
          left: '32mm',
          fontSize: '16px',
          color: '#333',
        }}
      >
        {event}
      </div>
    </div>
  );
}
