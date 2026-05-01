export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (Number.isNaN(num)) return '';
  // Simple currency formatting for demo
  return `₹${num.toFixed(2)}`;
};
