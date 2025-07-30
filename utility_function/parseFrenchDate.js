function parseFrenchDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const [datePart, timePart] = dateStr.trim().split(' ');
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');

  // Vérifie que tous les morceaux sont valides
  if ([day, month, year, hour, minute, second].some(part => isNaN(part))) return null;

  return new Date(year, month - 1, day, hour, minute, second);
}

module.exports = parseFrenchDate;