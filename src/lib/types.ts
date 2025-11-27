
export interface BloodBank {
    id: number;
    name: string;
    location: string;
    year: string;
    counter: number;
    quota: number;
}

export interface Registration {
    id: string; 
    name: string;
    bloodGroup: string;
    mobile: string;
    agency: string;
    location: string;
    year: string; 
    status: 'REGISTERED' | 'ACCEPTED' | 'REJECTED';
    rejectionReason?: string;
    rejectionDate?: string;
    gender?: 'Male' | 'Female' | 'Other';
    age?: number;
    createdAt: string; 
}
