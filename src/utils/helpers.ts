
// Helper functions for the app

// Format price in INR currency format
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

// Get CSS class based on crowd level
export const getCrowdLevelClass = (level: string): string => {
  switch (level) {
    case 'low':
      return 'text-crowd-low';
    case 'medium':
      return 'text-crowd-medium';
    case 'high':
      return 'text-crowd-high';
    default:
      return '';
  }
};

// Get background CSS class based on crowd level
export const getCrowdLevelBgClass = (level: string): string => {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Format time from 24-hour format to 12-hour format
export const formatTime = (time: string): string => {
  const [hours] = time.split(':').map(Number);
  
  if (hours === 0) return '12 AM';
  if (hours === 12) return '12 PM';
  
  return hours > 12 ? `${hours - 12} PM` : `${hours} AM`;
};

// Get today's date formatted as YYYY-MM-DD
export const getTodayFormatted = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Calculate days between two dates
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
};

// Truncate string to a certain length
export const truncateString = (str: string, num: number): string => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

// Validate phone number
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};
