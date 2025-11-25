export interface HistoricalData {
    location: string;
    campYear: string;
    totalRegistrations: number;
}

// Data based on the provided image for a single location (assumed Pune for example)
// This data will be used for all locations for demonstration purposes.
const baseHistory = [
    { campYear: '2010-11', totalRegistrations: 150 },
    { campYear: '2011-12', totalRegistrations: 275 },
    { campYear: '2012-13', totalRegistrations: 375 },
    { campYear: '2013-14', totalRegistrations: 625 },
    { campYear: '2014-15', totalRegistrations: 1068 },
    { campYear: '2015-16', totalRegistrations: 898 },
    { campYear: '2016-17', totalRegistrations: 860 },
    { campYear: '2017-18', totalRegistrations: 1018 },
    { campYear: '2018-19', totalRegistrations: 1213 },
    { campYear: '2019-20', totalRegistrations: 1600 },
    { campYear: '2020-21', totalRegistrations: 0 }, // COVID year
    { campYear: '2021-22', totalRegistrations: 250 },
    { campYear: '2022-23', totalRegistrations: 1230 },
    { campYear: '2023-24', totalRegistrations: 1637 },
    { campYear: '2024-25', totalRegistrations: 1397 },
    { campYear: '2025-26', totalRegistrations: 1963 }, // Note: This will be overwritten by live data for the current year.
];

const locations = ['Pune', 'Rudrapur', 'Dharwad', 'Shegaon'];

export const historicalData: HistoricalData[] = locations.flatMap(location => 
    baseHistory.map(historyItem => ({
        ...historyItem,
        location: location,
        // To make the demo more interesting, we can slightly vary the data per location
        totalRegistrations: Math.round(historyItem.totalRegistrations * (
            location === 'Pune' ? 1
            : location === 'Dharwad' ? 0.8
            : location === 'Rudrapur' ? 0.6
            : 0.5
        ))
    }))
);
