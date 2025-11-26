
'use client';

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
        background: 'white',
        position: 'relative',
        padding: '10mm',
        boxSizing: 'border-box',
        fontFamily: "'Times New Roman', Times, serif",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Borders */}
      <div className="absolute inset-[10mm] border-4 border-red-700"></div>
      <div className="absolute inset-[13mm] border-2 border-yellow-500"></div>

      <div className="relative z-10 w-full h-full flex flex-col items-center text-center px-12">
        {/* Header */}
        <div className="mt-20">
            <h1 className="text-6xl font-bold tracking-widest" style={{fontFamily: "'Playfair Display', serif"}}>
                CERTIFICATE
            </h1>
            <h2 className="text-2xl mt-2 tracking-wider">OF APPRECIATION</h2>
        </div>

        {/* Presented to */}
        <p className="mt-12 text-xl text-gray-700">This certificate is proudly presented to</p>

        {/* Donor Name */}
        <div className="mt-4 w-full">
          <p className="text-6xl" style={{ fontFamily: "'Brush Script MT', 'Snell Roundhand', cursive", color: '#1E293B' }}>
            {name}
          </p>
          <div className="w-3/4 h-px bg-gray-400 mx-auto mt-2"></div>
        </div>

        {/* Body Text */}
        <p className="mt-8 text-lg max-w-2xl mx-auto leading-relaxed text-gray-600">
          for voluntarily donating blood and supporting a noble cause to save lives.
          Your contribution is a great asset to the society.
        </p>

        {/* Signature and Date Section */}
        <div className="mt-auto mb-20 w-full grid grid-cols-3 items-end gap-8 text-sm">
           <div className="flex flex-col items-center">
                <div className="w-3/4 h-px bg-gray-500 mb-2"></div>
                <p className="font-semibold">DATE</p>
                <p>{date}</p>
           </div>
            <div className="flex flex-col items-center">
                 {/* Placeholder for Rotary Logo */}
                <div className="text-5xl text-yellow-500 mb-2">✺</div>
                 <p className="font-bold text-red-700">ROTARY CLUB OF PIMPRI</p>
            </div>
           <div className="flex flex-col items-center">
               <div className="w-3/4 h-px bg-gray-500 mb-2"></div>
                <p className="font-semibold">EVENT / PLACE</p>
                <p>{event}</p>
           </div>
        </div>
        
        {/* Footer Sponsor */}
        <div className="absolute bottom-[20mm] text-center w-full">
            <p className="text-xl font-bold text-gray-800">WADHOKAR GROUP OF COMPANIES</p>
        </div>
      </div>
    </div>
  );
}
