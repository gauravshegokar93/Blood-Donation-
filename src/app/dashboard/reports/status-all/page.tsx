'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BDC_StatusAllPage() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [year, setYear] = useState<string | null>(null);

    useEffect(() => {
        const savedLocation = sessionStorage.getItem('bdcLocation');
        const savedYear = sessionStorage.getItem('bdcYear');
        if (!savedLocation || !savedYear) {
            router.push('/');
        } else {
            setLocation(savedLocation);
            setYear(savedYear);
        }
    }, [router]);

    if (!location || !year) {
        return <div>Loading session...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>BDC Status Report - All Locations</CardTitle>
                    <CardDescription>
                        Summary for all locations and years for the camp at {location}, {year}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>BDC Status - All report content will be displayed here.</p>
                    {/* Placeholder for summary table and bar chart */}
                </CardContent>
            </Card>
        </div>
    );
}
