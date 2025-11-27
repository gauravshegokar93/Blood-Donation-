'use server';

import type { BloodBank } from '@/lib/types';

const getApiUrl = (path: string) => {
    // This is a placeholder for a more robust solution, e.g., using environment variables
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${path}`;
};

// Fetch all blood banks for a location
export async function fetchBloodBanks(location: string): Promise<BloodBank[]> {
    const response = await fetch(getApiUrl(`/api/blood-banks?location=${location}`), { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch blood banks');
    }
    return response.json();
}

// Create or update a blood bank
export async function saveBloodBank(data: Partial<BloodBank>): Promise<{ message: string }> {
    const response = await fetch(getApiUrl('/api/blood-banks'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
     if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save blood bank' }));
        throw new Error(errorData.message);
    }
    return response.json();
}

// Delete a blood bank by ID
export async function deleteBloodBank(id: number): Promise<{ message: string }> {
    const response = await fetch(getApiUrl(`/api/blood-banks?id=${id}`), {
        method: 'DELETE',
    });
     if (!response.ok) {
        throw new Error('Failed to delete blood bank');
    }
    return response.json();
}
