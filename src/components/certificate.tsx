
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
        // This ensures the div itself isn't invisible
        background: 'rgba(255, 255, 255, 0.01)',
      }}
    >
       <Image
        src="/White and Red Blood Donor Simple Certificate.png"
        alt="Certificate Background"
        layout="fill"
        objectFit="contain" // Use contain to ensure the whole image is visible
        quality={100}
        priority // Prioritize loading this image
      />
      <div
        className="print-field"
        style={{
          top: '97mm',
          left: '0mm',
          right: '0mm',
          textAlign: 'center',
          fontSize: '48px',
          fontFamily: "'Brush Script MT', cursive",
          color: 'black',
          position: 'absolute',
        }}
      >
        {name}
      </div>
      <div
        className="print-field"
        style={{
          bottom: '41mm',
          left: '32mm',
          fontSize: '16px',
          color: 'black',
          position: 'absolute',

        }}
      >
        {date}
      </div>
      <div
        className="print-field"
        style={{
          bottom: '33mm',
          left: '32mm',
          fontSize: '16px',
          color: 'black',
          position: 'absolute',
        }}
      >
        {event}
      </div>
    </div>
  );
}
