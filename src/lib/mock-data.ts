export interface BloodBank {
    id: number;
    name: string;
    location: string;
    year: string; // Always '2026-27'
    counter: number;
    quota: number;
}

export interface Registration {
    id: string; // e.g. PUN-0001
    name: string;
    bloodGroup: string;
    mobile: string;
    agency: string;
    location: string;
    year: string; // Always '2026-27'
    status: 'REGISTERED' | 'ACCEPTED' | 'REJECTED' | 'DONATED';
    rejectionReason?: string;
    rejectionDate?: string;
    // Added for rejection list requirement
    gender?: 'Male' | 'Female' | 'Other';
    age?: number;
}

const allBloodBanks: Omit<BloodBank, 'id' | 'year'>[] = [
  // Pune
  { name: 'AFMC BLOOD BANK', location: 'Pune', counter: 2, quota: 350 },
  { name: 'SAHYADRI BLOOD BANK', location: 'Pune', counter: 6, quota: 350 },
  { name: 'YCM BLOOD BANK', location: 'Pune', counter: 1, quota: 350 },
  // Rudrapur
  { name: 'Rudrapur Community Hospital', location: 'Rudrapur', counter: 1, quota: 200 },
  { name: 'Himalayan Blood Bank', location: 'Rudrapur', counter: 2, quota: 250 },
  // Dharwad
  { name: 'Dharwad District Hospital', location: 'Dharwad', counter: 1, quota: 300 },
  { name: 'KIMS Hubli Blood Bank', location: 'Dharwad', counter: 3, quota: 400 },
   // Shegaon
  { name: 'SGGS Blood Bank', location: 'Shegaon', counter: 1, quota: 150 },
  { name: 'Anand Sagar Hospital', location: 'Shegaon', counter: 1, quota: 100 },
];

const allRegistrations: Omit<Registration, 'id' | 'year' | 'status'>[] = [
    // Pune
    { name: 'Suresh Kumar', bloodGroup: 'O+', mobile: '9876543210', agency: 'AFMC BLOOD BANK', location: 'Pune', gender: 'Male', age: 28 },
    { name: 'Anjali Sharma', bloodGroup: 'A-', mobile: '9876543211', agency: 'SAHYADRI BLOOD BANK', location: 'Pune', gender: 'Female', age: 35 },
    { name: 'Rohan Patil', bloodGroup: 'B+', mobile: '9876543212', agency: 'YCM BLOOD BANK', location: 'Pune', gender: 'Male', age: 22 },
    // Rudrapur
    { name: 'Manoj Singh', bloodGroup: 'AB+', mobile: '9988776655', agency: 'Rudrapur Community Hospital', location: 'Rudrapur', gender: 'Male', age: 40 },
    // Dharwad
    { name: 'Lakshmi Desai', bloodGroup: 'O-', mobile: '8877665544', agency: 'Dharwad District Hospital', location: 'Dharwad', gender: 'Female', age: 31 },
];

function generateRegistrationId(location: string, existing: Registration[]): string {
    const locationPrefix = location.substring(0, 3).toUpperCase();
    const nextIdNumber = existing.filter(r => r.id.startsWith(locationPrefix)).length + 1;
    const nextId = nextIdNumber.toString().padStart(4, '0');
    return `${locationPrefix}-${nextId}`;
}


export function initializeMockData(location: string) {
    const year = '2026-27';
    const initKey = `initialized_${location}_${year}`;

    if (!sessionStorage.getItem(initKey)) {
        // Namespace data per location
        const bloodBankKey = `bloodBanks_${location}`;
        const registrationKey = `registrations_${location}`;

        const locationBloodBanks: BloodBank[] = allBloodBanks
            .filter(b => b.location === location)
            .map((b, index) => ({ ...b, id: index + 1, year: year }));

        const initialRegistrations: Registration[] = [];
        const locationRegistrations = allRegistrations
            .filter(r => r.location === location)
            .map((r, index) => {
                const newReg = { 
                    ...r, 
                    id: generateRegistrationId(location, initialRegistrations),
                    year: year, 
                    status: index % 3 === 0 ? 'ACCEPTED' : index % 3 === 1 ? 'REJECTED' : 'REGISTERED' as Registration['status'],
                    rejectionReason: index % 3 === 1 ? 'Low Hemoglobin' : undefined,
                    rejectionDate: index % 3 === 1 ? new Date().toISOString().split('T')[0] : undefined
                };
                initialRegistrations.push(newReg);
                return newReg;
            });

        sessionStorage.setItem(bloodBankKey, JSON.stringify(locationBloodBanks));
        sessionStorage.setItem(registrationKey, JSON.stringify(locationRegistrations));
        sessionStorage.setItem(initKey, 'true');
    }
}
