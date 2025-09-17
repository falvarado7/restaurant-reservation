const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const knex = require("../db/connection");   // ✅ add this line
const aService = require("./assignments.service");

/**
 * Validation function for the create handler:
 */

function hasData(req, _res, next) {
  if (req.body && req.body.data) return next();
  next({ status: 400, message: "Request body must have data property." });
}

function initErrors(req, res, next) {
  res.locals.errors = { status: 400, message: [] };
  next();
}

function hasTableName(req, res, next) {
  const table_name = req.body.data.table_name;
  res.locals.table_name = table_name;
  if (!table_name) res.locals.errors.message.push("New table must be given a table_name.");
  next();
}

function tableNameMin2(req, res, next) {
  const { table_name, errors } = res.locals;
  if (table_name && table_name.length < 2) errors.message.push("The table_name must be at least 2 characters long.");
  next();
}

async function tableNameIsNew(_req, res, next) {
  const { table_name, errors } = res.locals;
  if (!table_name) return next();
  const existing = await knex("tables").where({ table_name }).first();
  if (existing) errors.message.push("This table name exists already. Please choose a new one.");
  next();
}

function hasCapacity(req, res, next) {
  const cap = req.body.data.capacity;
  if (!(typeof cap === "number" && cap >= 1)) {
    res.locals.errors.message.push("New table capacity must be at least 1.");
  }
  next();
}

function finalizeErrors(_req, res, next) {
  const errors = res.locals.errors;
  const unique = [...new Set(errors.message)];
  if (unique.length > 1) return next({ status: errors.status, message: unique });
  if (unique.length === 1) return next({ status: errors.status, message: unique[0] });
  next();
}

async function tableExists(req, res, next) {
  const table = await knex("tables").where({ table_id: req.params.table_id }).first();
  if (!table) return next({ status: 404, message: `Table with id: ${req.params.table_id} does not exist.` });
  res.locals.table = table;
  next();
}

function hasReservationId(req, res, next) {
  const { reservation_id } = req.body.data || {};
  if (!reservation_id) return next({ status: 400, message: "The reservation_id is missing from the request body." });
  res.locals.reservation_id = Number(reservation_id);
  next();
}

async function reservationExists(_req, res, next) {
  const reservation = await knex("reservations").where({ reservation_id: res.locals.reservation_id }).first();
  if (!reservation) return next({ status: 404, message: `Reservation with id: ${res.locals.reservation_id} does not exist.` });
  res.locals.reservation = reservation;
  next();
}

function tableHasCapacityForReservation(_req, res, next) {
  const { table, reservation } = res.locals;
  if (table.capacity < reservation.people) {
    return next({ status: 400, message: `This table does not have sufficient capacity for this reservation (party of ${reservation.people}).` });
  }
  next();
}

/**
 * For time-window occupancy: active means now is inside [reserved_from, reserved_until) and status in reserved|seated
 */
async function loadActiveAssignmentForTableNow(req, res, next) {
  const nowISO = new Date().toISOString();
  const active = await knex("table_assignments")
    .where({ table_id: res.locals.table.table_id })
    .andWhere("reserved_from", "<=", nowISO)
    .andWhere("reserved_until", ">", nowISO)
    .whereIn("status", ["reserved", "seated"])
    .orderBy("assignment_id", "desc")
    .first();
  res.locals.activeAssignment = active || null;
  next();
}

/**
 * Handlers
 */

async function create(req, res) {
  const [created] = await knex("tables").insert(req.body.data).returning("*");
  res.status(201).json({ data: created });
}

/**
 * PUT /tables/:table_id/seat
 * - If there is an existing assignment for this reservation → mark seated (idempotent).
 * - If no assignment yet → create a time-window assignment (conflict-checked) and mark seated.
 * - Also updates reservation.status = 'seated'.
 */
async function seat(_req, res, next) {
  const { table, reservation, reservation_id, activeAssignment } = res.locals;

  // If table is "active now" for some other reservation, block seating
  if (activeAssignment && activeAssignment.reservation_id !== reservation_id) {
    return next({ status: 400, message: `Table ${table.table_name} is currently occupied.` });
  }

  const [seatedAssignment] = await aService.markSeated({ table_id: table.table_id, reservation_id });
  await knex("reservations").where({ reservation_id }).update({ status: "seated" });
  res.json({ data: seatedAssignment });
}

/**
 * DELETE /tables/:table_id/seat
 * - Finishes the current active assignment (if any) and sets its reservation to 'finished'.
 * - If none, respond 400 "Table is currently not occupied."
 */
async function finish(_req, res, next) {
  const { table, activeAssignment } = res.locals;

  if (!activeAssignment) {
    return next({ status: 400, message: "Table is currently not occupied." });
  }

  const [finished] = await aService.markFinished({ table_id: table.table_id });

  if (finished?.reservation_id) {
    await knex("reservations").where({ reservation_id: finished.reservation_id }).update({ status: "finished" });
  }

  res.status(204).send();
}

/**
 * GET /tables
 * - Returns tables and a synthetic "reservation_id" flag for current occupancy to keep FE compatibility.
 */
async function list(_req, res) {
  const tables = await knex("tables").select("*").orderBy("table_name");
  const nowISO = new Date().toISOString();
  const active = await knex("table_assignments")
    .select("table_id")
    .where("reserved_from", "<=", nowISO)
    .andWhere("reserved_until", ">", nowISO)
    .whereIn("status", ["reserved", "seated"]);

  const activeSet = new Set(active.map((r) => r.table_id));
  // keep shape: reservation_id set to -1 if active now, otherwise null
  const data = tables.map((t) => ({ ...t, reservation_id: activeSet.has(t.table_id) ? -1 : null }));
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasData,
    initErrors,
    hasTableName,
    tableNameMin2,
    asyncErrorBoundary(tableNameIsNew),
    hasCapacity,
    finalizeErrors,
    asyncErrorBoundary(create),
  ],
  // PUT /tables/:table_id/seat
  update: [
    hasData,
    asyncErrorBoundary(tableExists),
    hasReservationId,
    asyncErrorBoundary(reservationExists),
    tableHasCapacityForReservation,
    asyncErrorBoundary(loadActiveAssignmentForTableNow),
    asyncErrorBoundary(seat),
  ],
  // DELETE /tables/:table_id/seat
  delete: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(loadActiveAssignmentForTableNow),
    asyncErrorBoundary(finish),
  ],
};