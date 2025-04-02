
import React from 'react';
import { CrowdData } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface CrowdChartProps {
  crowdData: CrowdData;
  className?: string;
}

const CrowdChart: React.FC<CrowdChartProps> = ({ crowdData, className = '' }) => {
  // Convert crowd data to format needed by recharts
  const chartData = Object.entries(crowdData).map(([time, value]) => {
    // Convert 24-hour format to 12-hour format
    const [hours] = time.split(':').map(Number);
    const displayTime = hours === 0 ? '12 AM' : hours === 12 ? '12 PM' : hours > 12 ? `${hours - 12} PM` : `${hours} AM`;
    
    return {
      time: displayTime,
      crowd: value,
      // Add color based on crowd level
      color: value <= 40 ? '#22c55e' : value <= 70 ? '#f59e0b' : '#ef4444',
    };
  });

  // Sort data by time
  const sortedData = [...chartData].sort((a, b) => {
    const timeA = a.time.includes('AM') ? 
      (a.time.includes('12') ? 0 : parseInt(a.time)) : 
      (a.time.includes('12') ? 12 : parseInt(a.time) + 12);
      
    const timeB = b.time.includes('AM') ? 
      (b.time.includes('12') ? 0 : parseInt(b.time)) : 
      (b.time.includes('12') ? 12 : parseInt(b.time) + 12);
      
    return timeA - timeB;
  });

  // Function to determine color based on crowd level
  const getStrokeColor = (value: number) => {
    if (value <= 40) return '#22c55e';
    if (value <= 70) return '#f59e0b';
    return '#ef4444';
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const crowd = payload[0].value;
      const time = payload[0].payload.time;
      
      let crowdLevel = '';
      let textColor = '';
      
      if (crowd <= 40) {
        crowdLevel = 'Low';
        textColor = 'text-crowd-low';
      } else if (crowd <= 70) {
        crowdLevel = 'Moderate';
        textColor = 'text-crowd-medium';
      } else {
        crowdLevel = 'High';
        textColor = 'text-crowd-high';
      }
      
      return (
        <div className="bg-white p-3 shadow-md rounded-md border">
          <p className="font-medium">{time}</p>
          <p className={`font-bold ${textColor}`}>
            {crowd}% - {crowdLevel} Crowd
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${className}`}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={sortedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            label={{ value: 'Crowd %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="crowd"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ stroke: '#6366f1', strokeWidth: 2, r: 4, fill: '#fff' }}
            activeDot={{ stroke: '#6366f1', strokeWidth: 2, r: 6, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CrowdChart;
