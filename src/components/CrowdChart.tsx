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
import { useAuth } from '../context/AuthContext';

interface CrowdChartProps {
  crowdData: CrowdData;
  className?: string;
  destinationId?: string;
}

const CrowdChart: React.FC<CrowdChartProps> = ({ 
  crowdData, 
  className = '',
  destinationId 
}) => {
  const { currentUser } = useAuth();
  const hasBooking = currentUser?.bookings?.some(b => b.destinationIds.includes(destinationId));

  // For non-premium users without booking
  if (!currentUser?.isPremium && !hasBooking) {
    return (
      <div className={`${className} p-4 bg-gray-50 rounded-lg flex flex-col items-center justify-center h-[250px]`}>
        <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-gray-200 rounded-full">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Premium Feature Locked</h3>
        <p className="text-gray-600 mb-4 text-center">
          {destinationId 
            ? "Book this destination or upgrade to Premium to see crowd data"
            : "Upgrade to Premium to access this feature"}
        </p>
        <button 
          onClick={() => currentUser?.isPremium ? {} : window.location.href = '/pricing'}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
        >
          {currentUser?.isPremium ? 'Book Now' : 'Upgrade to Premium'}
        </button>
      </div>
    );
  }

  // Convert crowd data to chart format
  const chartData = Object.entries(crowdData).map(([time, value]) => {
    const [hours] = time.split(':').map(Number);
    const displayTime = hours === 0 ? '12 AM' : hours === 12 ? '12 PM' : hours > 12 ? `${hours - 12} PM` : `${hours} AM`;
    
    return {
      time: displayTime,
      crowd: value,
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const crowd = payload[0].value;
      const time = payload[0].payload.time;
      
      let crowdLevel = '';
      let textColor = '';
      
      if (crowd <= 40) {
        crowdLevel = 'Low';
        textColor = 'text-green-600';
      } else if (crowd <= 70) {
        crowdLevel = 'Moderate';
        textColor = 'text-yellow-600';
      } else {
        crowdLevel = 'High';
        textColor = 'text-red-600';
      }
      
      return (
        <div className="bg-white p-3 shadow-md rounded-md border">
          <p className="font-medium">{time}</p>
          <p className={`font-bold ${textColor}`}>
            {crowd}% - {crowdLevel} Crowd
          </p>
          {hasBooking && (
            <p className="text-xs text-indigo-600 mt-1">Premium booking insights active</p>
          )}
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
