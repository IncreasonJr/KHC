// /home/caleb/Desktop/PROJECTS/KHC/src/utils/helpers.js

/**
 * Format numeric value as currency (USD default)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'GH₵0.00';
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS'
  }).format(num);
};

/**
 * Format string date representation into readable layout (e.g. "Aug 29, 2026")
 * @param {string} dateStr 
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC' // Keep date exact as stored
  });
};

/**
 * Generate initials from first and last name
 * @param {string} firstName 
 * @param {string} lastName 
 * @returns {string}
 */
export const getInitials = (firstName = '', lastName = '') => {
  const f = firstName.trim().charAt(0) || '';
  const l = lastName.trim().charAt(0) || '';
  return `${f}${l}`.toUpperCase();
};

/**
 * Generate a deterministic gradient accent background based on text value length
 * @param {string} str 
 * @returns {string} CSS background property value
 */
export const getAvatarBg = (str = '') => {
  const colors = [
    'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Blue
    'linear-gradient(135deg, #065f46 0%, #10b981 100%)', // Emerald
    'linear-gradient(135deg, #78350f 0%, #d97706 100%)', // Amber
    'linear-gradient(135deg, #581c87 0%, #8b5cf6 100%)', // Violet
    'linear-gradient(135deg, #831843 0%, #ec4899 100%)', // Pink
    'linear-gradient(135deg, #0f172a 0%, #334155 100%)'  // Slate
  ];
  
  if (!str) return colors[0];
  const index = str.length % colors.length;
  return colors[index];
};

/**
 * Truncate long descriptions
 * @param {string} text 
 * @param {number} max 
 * @returns {string}
 */
export const truncateText = (text = '', max = 100) => {
  if (text.length <= max) return text;
  return text.substring(0, max) + '...';
};
export default { formatCurrency, formatDate, getInitials, getAvatarBg, truncateText };
