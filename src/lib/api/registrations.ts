'use server';

import type { Registration } from '@/lib/types';

const getApiUrl = (path: string) => {
    // This is a placeholder for a more robust solution, e.g., using environment variables
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${path}`;
};


// Fetch all registrations for a location
export async function fetchRegistrations(location: string): Promise<Registration[]> {
    const response = await fetch(getApiUrl(`/api/registrations?location=${location}`), { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch registrations');
    }
    return response.json();
}

// Fetch a single registration by ID
export async function fetchRegistrationById(id: string): Promise<Registration> {
    const response = await fetch(getApiUrl(`/api/registrations?id=${id}`), { cache: 'no-store' });
     if (!response.ok) {
        if(response.status === 404) throw new Error('Registration not found');
        throw new Error('Failed to fetch registration');
    }
    return response.json();
}

// Create or update a registration
export async function saveRegistration(registrationData: Partial<Registration>): Promise<{ message: string; registrationId?: string }> {
    const response = await fetch(getApiUrl('/api/registrations'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save registration' }));
        throw new Error(errorData.message);
    }
    return response.json();
}


// Delete a registration by ID
export async function deleteRegistration(id: string): Promise<{ message: string }> {
    const response = await fetch(getApiUrl(`/api/registrations?id=${id}`), {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete registration');
    }
    return response.json();
}
