export interface HistoricalData {
    location: string;
    campYear: string;
    totalRegistrations: number;
}

export const historicalData: HistoricalData[] = [
    // --- 2021-22 ---
    { location: 'Pune', campYear: '2021-22', totalRegistrations: 1250 },
    { location: 'Rudrapur', campYear: '2021-22', totalRegistrations: 800 },
    { location: 'Dharwad', campYear: '2021-22', totalRegistrations: 950 },
    { location: 'Shegaon', campYear: '2021-22', totalRegistrations: 700 },

    // --- 2022-23 ---
    { location: 'Pune', campYear: '2022-23', totalRegistrations: 1400 },
    { location: 'Rudrapur', campYear: '2022-23', totalRegistrations: 850 },
    { location: 'Dharwad', campYear: '2022-23', totalRegistrations: 1100 },
    { location: 'Shegaon', campYear: '2022-23', totalRegistrations: 750 },
    
    // --- 2023-24 ---
    { location: 'Pune', campYear: '2023-24', totalRegistrations: 1550 },
    { location: 'Rudrapur', campYear: '2023-24', totalRegistrations: 920 },
    { location: 'Dharwad', campYear: '2023-24', totalRegistrations: 1200 },
    { location: 'Shegaon', campYear: '2023-24', totalRegistrations: 810 },

    // --- 2024-25 ---
    { location: 'Pune', campYear: '2024-25', totalRegistrations: 1600 },
    { location: 'Rudrapur', campYear: '2024-25', totalRegistrations: 1050 },
    { location: 'Dharwad', campYear: '2024-25', totalRegistrations: 1300 },
    { location: 'Shegaon', campYear: '2024-25', totalRegistrations: 850 },
];
