function parseAppLogLine(line) {
  const regex = /^\[(.+?)\]\s+INFO:?\s+l'endpoint\s+(.+?)\s+a\s+un\s+niveau\s+de\s+dangerosite\s+<(.+?)>/i;

  const match = line.match(regex);
  if (!match) {
    console.warn("⚠️ Ligne non reconnue :", line);
    return null;
  }

  const [_, dateStr, endpoint, level] = match;
  const datetime = new Date(dateStr.replace(" ", "T"));

  if (isNaN(datetime)) return null;

  return {
    datetime,
    endpoint,
    level: level.toUpperCase()
  };
}

module.exports = parseAppLogLine;
