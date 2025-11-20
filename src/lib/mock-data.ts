export interface BloodBank {
    id: number;
    name: string;
    location: string;
    year: number;
    counter: number;
    quota: number;
}

export interface Registration {
    id: number;
    name: string;
    bloodGroup: string;
    mobile: string;
    agency: string;
    location: string;
    year: number;
    status: 'REGISTERED' | 'ACCEPTED' | 'REJECTED' | 'DONATED';
}

const initialBloodBanks: BloodBank[] = [
  // Pune 2024
  { id: 1, name: 'AFMC BLOOD BANK', location: 'Pune', year: 2024, counter: 2, quota: 350 },
  { id: 2, name: 'SAHYADRI BLOOD BANK', location: 'Pune', year: 2024, counter: 6, quota: 350 },
  { id: 3, name: 'YCM BLOOD BANK', location: 'Pune', year: 2024, counter: 1, quota: 350 },
  // Mumbai 2024
  { id: 4, name: 'City General Blood Bank', location: 'Mumbai', year: 2024, counter: 1, quota: 100 },
  { id: 5, name: 'Red Cross Society', location: 'Mumbai', year: 2024, counter: 2, quota: 150 },
  // Nagpur 2024
  { id: 6, name: 'LifeSource Blood Center', location: 'Nagpur', year: 2024, counter: 1, quota: 200 },
  // Mumbai 2023
  { id: 7, name: 'LifeLine Blood Services', location: 'Mumbai', year: 2023, counter: 1, quota: 80 },
];

const initialRegistrations: Registration[] = [
    // Pune 2024
    { id: 1, name: 'Suresh Kumar', bloodGroup: 'O+', mobile: '9876543210', agency: 'AFMC BLOOD BANK', location: 'Pune', year: 2024, status: 'ACCEPTED' },
    { id: 2, name: 'Anjali Sharma', bloodGroup: 'A-', mobile: '9876543211', agency: 'SAHYADRI BLOOD BANK', location: 'Pune', year: 2024, status: 'REGISTERED' },
    { id: 3, name: 'Rohan Patil', bloodGroup: 'B+', mobile: '9876543212', agency: 'YCM BLOOD BANK', location: 'Pune', year: 2024, status: 'DONATED' },
    // Mumbai 2024
    { id: 4, name: 'Amit Sharma', bloodGroup: 'O+', mobile: '9876543210', status: 'ACCEPTED', agency: 'City General Blood Bank', location: 'Mumbai', year: 2024 },
    { id: 5, name: 'Priya Singh', bloodGroup: 'A+', mobile: '9876543211', status: 'REJECTED', agency: 'City General Blood Bank', location: 'Mumbai', year: 2024 },
    // Mumbai 2023
    { id: 6, name: 'Vikram Rathod', bloodGroup: 'B-', mobile: '7654321098', status: 'DONATED', agency: 'LifeLine Blood Services', location: 'Mumbai', year: 2023 },
];

export function initializeMockData(location: string, year: number) {
    if (!sessionStorage.getItem('initialized')) {
        sessionStorage.setItem('bloodBanks', JSON.stringify(initialBloodBanks));
        sessionStorage.setItem('registrations', JSON.stringify(initialRegistrations));
        sessionStorage.setItem('initialized', 'true');
    }
}
