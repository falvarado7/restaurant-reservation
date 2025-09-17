// backend/src/tables/assignments.service.js
const knex = require("../db/connection");

const MIN = (n) => n * 60 * 1000;
const PRE = Number(process.env.TABLE_PRE_HOLD_MIN || 60);
const DUR = Number(process.env.TABLE_DINE_DURATION_MIN || 90);
const POST = Number(process.env.TABLE_POST_BUFFER_MIN || 10);

// --- helpers (single definitions) ---
function toDateOnly(input) {
  if (!input) return null;
  if (input instanceof Date && !isNaN(input)) {
    const y = input.getFullYear();
    const m = String(input.getMonth() + 1).padStart(2, "0");
    const d = String(input.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof input === "string") {
    // If it's ISO with time, keep only the date part
    if (input.includes("T")) return input.slice(0, 10);
    // Assume already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  }
  return null;
}

// Accepts "HH:mm" or "HH:mm:ss" → returns "HH:mm"
function toHourMinute(input, fallback = "00:00") {
  if (typeof input === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(input)) {
    return input.slice(0, 5);
  }
  return fallback;
}

// Build a JS Date at local time for given date string "YYYY-MM-DD" and "HH:mm"
function atLocalDateTime(dateOnly, hhmm) {
  const [y, m, d] = dateOnly.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  const dt = new Date();
  dt.setFullYear(y, (m || 1) - 1, d || 1);
  dt.setHours(hh || 0, mm || 0, 0, 0);
  return dt;
}

function plannedWindow(reservation) {
  // If backend stored a timestamp in reservation_date (rare), prefer that
  let start;
  if (reservation.reservation_date instanceof Date) {
    // Combine with reservation_time if present, otherwise use the Date as-is
    if (reservation.reservation_time) {
      const dateOnly = toDateOnly(reservation.reservation_date);
      const hhmm = toHourMinute(reservation.reservation_time, "00:00");
      start = atLocalDateTime(dateOnly, hhmm);
    } else {
      start = new Date(reservation.reservation_date.getTime());
    }
  } else if (typeof reservation.reservation_date === "string" && reservation.reservation_date.includes("T")) {
    // ISO string with time
    start = new Date(reservation.reservation_date);
  } else {
    // date-only + time string
    const dateOnly = toDateOnly(reservation.reservation_date);
    const hhmm = toHourMinute(reservation.reservation_time, "00:00");
    if (!dateOnly) {
      const err = new Error("Invalid reservation_date");
      err.status = 400;
      throw err;
    }
    start = atLocalDateTime(dateOnly, hhmm);
  }

  const from  = new Date(start.getTime() - MIN(PRE));
  const until = new Date(start.getTime() + MIN(DUR + POST));
  return { from, until };
}

/* ---------------------------- db helper queries --------------------------- */

async function overlappingAssignments({ table_id, from, until }) {
  return knex("table_assignments")
    .where({ table_id })
    .whereRaw("NOT (reserved_until <= ? OR reserved_from >= ?)", [
      from.toISOString(),
      until.toISOString(),
    ])
    .whereNot("status", "cancelled");
}

/* --------------------------------- ops ------------------------------------ */

async function createAssignment({ table_id, reservation }) {
  const { from, until } = plannedWindow(reservation);
  const conflicts = await overlappingAssignments({ table_id, from, until });
  if (conflicts.length) {
    const err = new Error("Table not available in the selected window");
    err.status = 400;
    throw err;
  }
  return knex("table_assignments")
    .insert({
      table_id,
      reservation_id: reservation.reservation_id,
      reserved_from: from.toISOString(),
      reserved_until: until.toISOString(),
      status: "reserved",
    })
    .returning("*");
}

async function markSeated({ table_id, reservation_id }) {
  const nowISO = new Date().toISOString();

  const reservation = await knex("reservations").where({ reservation_id }).first();
  if (!reservation) {
    const e = new Error("Reservation not found");
    e.status = 404;
    throw e;
  }

  // find existing reserved/seated assignment for this table+reservation
  let a = await knex("table_assignments")
    .where({ table_id, reservation_id })
    .whereIn("status", ["reserved", "seated"])
    .orderBy("assignment_id", "desc")
    .first();

  if (!a) {
    // create reserved window first (conflict-checked)
    [a] = await createAssignment({ table_id, reservation });
  }

  if (a.status === "seated") return [a];

  return knex("table_assignments")
    .where({ assignment_id: a.assignment_id })
    .update({ status: "seated", seated_at: nowISO })
    .returning("*");
}

async function markFinished({ table_id }) {
  const nowISO = new Date().toISOString();
  const a = await knex("table_assignments")
    .where({ table_id })
    .whereIn("status", ["reserved", "seated"])
    .orderBy("assignment_id", "desc")
    .first();

  if (!a) return [];

  return knex("table_assignments")
    .where({ assignment_id: a.assignment_id })
    .update({ status: "finished", finished_at: nowISO })
    .returning("*");
}

module.exports = {
  createAssignment,
  markSeated,
  markFinished,
  plannedWindow,
  overlappingAssignments,
};