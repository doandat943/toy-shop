/**
 * Format a number as VND currency
 * @param {number} price - The price to format
 * @returns {string} Formatted price in VND
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return '0 ₫';
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Format a number with comma separators
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('vi-VN').format(number);
}; 