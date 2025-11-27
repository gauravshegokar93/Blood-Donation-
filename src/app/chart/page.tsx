
'use client';

import { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { RegistrationStatusChart, BloodGroupChart, AgencyChart } from '@/components/dashboard-charts';
import { LocationRegistrationsChart, YearlyTrendChart } from '@/components/director-charts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface ChartViewData {
    chartType: string;
    chartData: any;
}

export default function ChartViewerPage() {
    const [chartInfo, setChartInfo] = useState<ChartViewData | null>(null);

    useEffect(() => {
        const data = sessionStorage.getItem('chartViewData');
        if (data) {
            const parsedData: ChartViewData = JSON.parse(data);

            // Add a dynamic title to the expanded view
            let titleText = 'Chart';
            if(parsedData.chartData.title) {
                titleText = parsedData.chartData.title;
            } else if (parsedData.chartType === 'RegistrationStatus') {
                titleText = 'Registration Status';
            } else if (parsedData.chartType === 'BloodGroup') {
                titleText = 'Blood Group Distribution';
            } else if (parsedData.chartType === 'Agency') {
                titleText = 'Registrations by Agency';
            } else if (parsedData.chartType === 'YearlyTrend') {
                titleText = 'Yearly Registration Trend';
            }

            // Ensure plugins are present and add title
            if (!parsedData.chartData.options) parsedData.chartData.options = {};
            if (!parsedData.chartData.options.plugins) parsedData.chartData.options.plugins = {};
            
            parsedData.chartData.options.plugins.title = {
                display: true,
                text: titleText,
                font: { size: 24, weight: 'bold' },
                padding: { top: 10, bottom: 30 }
            };
            
            // For Bar charts from director view, we need to pass data differently
            if (parsedData.chartType === 'Bar' && parsedData.chartData.data) {
                 setChartInfo({
                    chartType: 'Bar',
                    chartData: {
                        data: parsedData.chartData.data,
                        options: parsedData.chartData.options,
                    }
                 });
            } else {
                 setChartInfo(parsedData);
            }
        }
    }, []);

    if (!chartInfo) {
        return <div className="flex items-center justify-center h-screen">Loading chart...</div>;
    }

    const renderChart = () => {
        switch (chartInfo.chartType) {
            case 'RegistrationStatus':
                return <RegistrationStatusChart data={chartInfo.chartData.data} />;
            case 'BloodGroup':
                return <BloodGroupChart data={chartInfo.chartData.data} />;
            case 'Agency':
                return <AgencyChart data={chartInfo.chartData.data} />;
            case 'LocationRegistrations':
                 return <LocationRegistrationsChart data={chartInfo.chartData.data} />;
            case 'YearlyTrend':
                 return <YearlyTrendChart data={chartInfo.chartData.data} />;
            case 'Bar':
                return <Bar data={chartInfo.chartData.data} options={chartInfo.chartData.options} />;
             case 'Doughnut':
                return <Doughnut data={chartInfo.chartData.data} options={chartInfo.chartData.options} />;
            default:
                return <p>Unknown chart type</p>;
        }
    };

    return (
        <div className="w-screen h-screen p-8 bg-gray-100">
            {renderChart()}
        </div>
    );
}

    