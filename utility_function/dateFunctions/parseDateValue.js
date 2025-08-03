function parseDateValue(input) {
  if (!input) return null;

  // Ajout gestion format LDAP Generalized Time (ex: 20250717130629.0Z)
  if (typeof input === 'string') {
    const ldapMatch = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z$/.exec(input.trim());
    if (ldapMatch) {
      const [_, year, month, day, hour, minute, second] = ldapMatch;
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    }
  }

  // 1. Si c’est un NT timestamp (valeur entière très grande)
  if (typeof input === 'string' && /^\d{15,}$/.test(input.trim())) {
    try {
      const ntTime = parseInt(input);
      if (isNaN(ntTime) || ntTime === 0) return null;

      const epochDiff = 116444736000000000;
      const msSince1970 = (ntTime - epochDiff) / 10000;
      return new Date(msSince1970);
    } catch {
      return null;
    }
  }

  // 2. Si c’est une date texte format français "JJ/MM/AAAA HH:mm:ss"
  if (typeof input === 'string') {
    const [datePart, timePart] = input.trim().split(' ');
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');

    if ([day, month, year, hour, minute, second].some(part => isNaN(part))) return null;

    return new Date(year, month - 1, day, hour, minute, second);
  }

  return null; // Cas inattendu
}

module.exports = parseDateValue;
