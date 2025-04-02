
import { CrowdData, CrowdLevel } from '../types';

// Get current crowd level based on time
export const getCurrentCrowdLevel = (crowdData: CrowdData): CrowdLevel => {
  const currentHour = new Date().getHours();
  const timeKey = `${currentHour.toString().padStart(2, '0')}:00`;
  
  // Find the closest time key
  const times = Object.keys(crowdData);
  let closestTime = times[0];
  let smallestDiff = 24;
  
  for (const time of times) {
    const [hours] = time.split(':').map(Number);
    const diff = Math.abs(hours - currentHour);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestTime = time;
    }
  }
  
  const crowdPercentage = crowdData[closestTime];
  
  if (crowdPercentage <= 40) return 'low';
  if (crowdPercentage <= 70) return 'medium';
  return 'high';
};

// Get best time to visit (lowest crowd time)
export const getBestTimeToVisit = (crowdData: CrowdData): string => {
  let bestTime = '';
  let lowestCrowd = 100;
  
  for (const [time, level] of Object.entries(crowdData)) {
    if (level < lowestCrowd) {
      lowestCrowd = level;
      bestTime = time;
    }
  }
  
  // Format time for display
  const [hour] = bestTime.split(':');
  const hourNum = parseInt(hour, 10);
  return hourNum < 12 ? `${hourNum} AM` : hourNum === 12 ? '12 PM' : `${hourNum - 12} PM`;
};

// Format price in Indian Rupees
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

// Calculate distance between two coordinates (in km)
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return Math.round(d);
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Get crowd level color class
export const getCrowdLevelClass = (level: CrowdLevel): string => {
  switch (level) {
    case 'low':
      return 'crowd-low';
    case 'medium':
      return 'crowd-medium';
    case 'high':
      return 'crowd-high';
    default:
      return '';
  }
};

// Get crowd level color for backgrounds
export const getCrowdLevelBgClass = (level: CrowdLevel): string => {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-amber-100 text-amber-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return '';
  }
};

// Get crowd level icon name
export const getCrowdLevelIcon = (level: CrowdLevel): string => {
  switch (level) {
    case 'low':
      return 'users';
    case 'medium':
      return 'users';
    case 'high':
      return 'users';
    default:
      return 'users';
  }
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number (Indian format - 10 digits)
export const isValidPhone = (phone: string): boolean => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
};

// Validate password strength
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password);
};
