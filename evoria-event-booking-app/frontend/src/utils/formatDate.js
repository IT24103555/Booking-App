export const formatDate = (dateValue) => {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
};
