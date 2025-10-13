const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const knex = require("../db/connection");
const tService = require("./tables.service");
const aService = require("./assignments.service");
const { read } = require("../reservations/reservations.controller");

/* ------------ shared validators --------------- */
function hasData(req, _res, next) {
    if (req.body && req.body.data) return next();
    next({ status: 400, message: "Request body must have data property." });
}

async function tableExists(req, res, next) {
    const table = await tService.read(req.params.table_id);
    if (table) {
      res.locals.table = table;
      return next();
    }
    next({ status: 404, message: `Table with id: ${req.params.table_id} does not exist.` });
}

/* ------------ validators for creating a table --------------- */
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

/* --------------- validators for seat/finish flow ----------------- */
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

/* ------------ route handlers --------------- */
// create table
async function create(req, res) {
    const { table_name, capacity } = req.body.data;
    const newTable = { table_name, capacity };
    const created = await tService.create(newTable);
    res.status(201).json({ data: created });
}

// read (by middleware)
function readTable(req, res) {
    res.json({ data: res.locals.table });
}

// list with syntehtic reservation occupancy flag
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

// seat reservtion at table
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

// finish (clear) table
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

function validateTablePatch(req, res, next) {
    const {table_name, capacity, image_url} = req.body.data;
    if (table_name !== undefined && String(table_name).trim().length < 2) {
    return next({ status: 400, message: "table_name must be at least 2 characters." });
    }
    if (capacity !== undefined && !(Number.isInteger(Number(capacity)) && Number(capacity) >= 1)) {
        return next({ status: 400, message: "capacity must be an integer >= 1." });
    }
    if (image_url !== undefined && typeof image_url !== "string") {
        return next({ status: 400, message: "image_url must be a string URL." });
    }
    next();
}

async function updateTable(req, res, next) {
    const updatedTable = req.body.data;
    const data = await tService.update(updatedTable);
    res.json({ data });
}

async function destroyTable(req, res, next) {
    const { table } = res.locals;
    const count = await tService.destroyTable(table.table_id);
    if (!count) {
      return next({ status: 404, message: `Table not found.` });
    }
    res.sendStatus(204);
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
  read: [asyncErrorBoundary(tableExists), readTable],
  // PUT /tables/:table_id/seat
  seat: [
    hasData,
    asyncErrorBoundary(tableExists),
    hasReservationId,
    asyncErrorBoundary(reservationExists),
    tableHasCapacityForReservation,
    asyncErrorBoundary(loadActiveAssignmentForTableNow),
    asyncErrorBoundary(seat),
  ],
  update: [
    hasData,
    asyncErrorBoundary(tableExists),
    validateTablePatch,
    asyncErrorBoundary(updateTable),
  ],
  // DELETE /tables/:table_id/seat
  finish: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(loadActiveAssignmentForTableNow),
    asyncErrorBoundary(finish),
  ],
  delete: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(destroyTable),
  ],
};