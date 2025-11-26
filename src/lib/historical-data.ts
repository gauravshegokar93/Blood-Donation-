
export interface HistoricalData {
    location: string;
    campYear: string;
    totalRegistrations: number;
}

// Data based on the provided user input, sorted by year.
const baseHistory = [
    { campYear: '2010', totalRegistrations: 150 },
    { campYear: '2011', totalRegistrations: 275 },
    { campYear: '2012', totalRegistrations: 375 },
    { campYear: '2013', totalRegistrations: 625 },
    { campYear: '2014', totalRegistrations: 1068 },
    { campYear: '2015', totalRegistrations: 898 },
    { campYear: '2016', totalRegistrations: 860 },
    { campYear: '2017', totalRegistrations: 1018 },
    { campYear: '2018', totalRegistrations: 1213 },
    { campYear: '2019', totalRegistrations: 1600 },
    { campYear: '2020', totalRegistrations: 0 }, // Representing "2020-Covid"
    { campYear: '2021', totalRegistrations: 250 },
    { campYear: '2022', totalRegistrations: 1230 },
    { campYear: '2023', totalRegistrations: 1637 },
    { campYear: '2024', totalRegistrations: 1397 },
    { campYear: '2025', totalRegistrations: 1963 },
    { campYear: '2026', totalRegistrations: 0 },
];

const locations = ['Pune', 'Rudrapur', 'Dharwad', 'Shegaon'];

// This expands the base history for each location. 
// The Director Dashboard will aggregate this data to show the combined totals.
export const historicalData: HistoricalData[] = locations.flatMap(location => 
    baseHistory.map(historyItem => ({
        ...historyItem,
        location: location,
        // The totalRegistrations are now divided by the number of locations 
        // so that when aggregated in the director view, they sum up to the correct total.
        totalRegistrations: Math.round(historyItem.totalRegistrations / locations.length)
    }))
);
