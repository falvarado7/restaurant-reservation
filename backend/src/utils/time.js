// backend/src/utils/times.js
const MIN = (n) => n * 60 * 1000;

function asDateTime(dateStr, timeStr) {
  // date: "YYYY-MM-DD", time: "HH:mm" or "HH:mm:ss"
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(h, m ?? 0, 0, 0);
  return d;
}

module.exports = { MIN, asDateTime };