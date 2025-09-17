const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * Validation functions for the create handler
 */
function hasData(req, res, next) {
  if (req.body.data) {
    return next();
  }
  next({ status: 400, message: "Request body must have data property." });
}

function initializingErrorsObject(req, res, next) {
  let errors = {
    status: 400,
    message: [],
  };
  res.locals.errors = errors;
  return next();
}

function hasFirstName(req, res, next) {
  const firstName = req.body.data.first_name;
  if (firstName) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push("Reservation must include a first_name.");
  return next();
}

function hasLastName(req, res, next) {
  const lastName = req.body.data.last_name;
  if (lastName) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push("Reservation must include a last_name.");
  return next();
}

function hasMobileNumberInProperFormat(req, res, next) {
  const mobileNumber = req.body.data.mobile_number;
  if (mobileNumber) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push(
    "Reservation must include a mobile_number formatted as XXX-XXX-XXXX or XXX-XXXX."
  );
  return next();
}

function hasReservationDateInProperFormat(req, res, next) {
  const reservationDate = req.body.data.reservation_date;
  const regex = new RegExp(/\d{4}-\d{2}-\d{2}/);
  res.locals.reservationDate = reservationDate;
  if (reservationDate && regex.test(reservationDate)) {
    return next();
  }
  const { errors } = res.locals;
  errors.message.push(
    "Reservation must include a reservation_date in this format: MM/DD/YYYY."
  );
  return next();
}

function reservationDateNotInPast(req, res, next) {
  const { reservationDate, errors } = res.locals;
  const { reservation_time } = req.body.data;

  if (reservationDate) {
    const currentDateAndTime = Date.now();
    const reservationDateAndTime = new Date(
      `${reservationDate} ${reservation_time}`
    ).valueOf();

    if (reservationDateAndTime < currentDateAndTime) {
      errors.message.push(
        "Reservations cannot be made in the past. Only future reservations are allowed."
      );
      return next();
    }
  }
  return next();
}

function reservationDateNotATuesday(req, res, next) {
  const { reservationDate, errors } = res.locals;

  if (reservationDate) {
    const weekDay = new Date(reservationDate).getUTCDay();

    if (weekDay === 2) {
      errors.message.push(
        "Reservations cannot be made on a Tuesday, when the restuarant is closed."
      );
      return next();
    }
  }
  return next();
}

function hasReservationTimeInProperFormat(req, res, next) {
  const reservationTime = req.body.data.reservation_time;
  const regex = new RegExp(/[0-9]{2}:[0-9]{2}/);
  res.locals.reservationTime = reservationTime;

  if (reservationTime && regex.test(reservationTime)) {
    return next();
  }

  const { errors } = res.locals;
  errors.message.push(
    "Reservation must include a reservation_time in this format: HH:MM."
  );
  return next();
}

function hasReservationTimeWithinEligibleTimeframe(req, res, next) {
  const { reservationTime, errors } = res.locals;

  if (reservationTime) {
    const resTimeNum = reservationTime.replace(":", "");

    if (Number(resTimeNum) < 1030 || Number(resTimeNum) > 2130) {
      errors.message.push(
        "The reservation time cannot be before 10:30 AM or after 9:30 PM."
      );
      return next();
    }
  }

  return next();
}

function hasPeopleInProperFormat(req, res, next) {
  const people = req.body.data.people;
  const regex = new RegExp(/[^1-6]/);
  if (people && !regex.test(people) && typeof people === "number") {
    return next();
  }

  const { errors } = res.locals;
  errors.message.push(
    "Reservation must indicate the number of people in a party, ranging from 1 to 6."
  );
  return next();
}

function captureValidationErrors(req, res, next) {
  const { errors } = res.locals;
  const uniqueErrorMessages = errors.message.filter((message, index, array) => {
    return array.indexOf(message) === index;
  });
  errors.message = uniqueErrorMessages;

  if (errors.message.length > 1) {
    next(errors);
  } else if (errors.message.length) {
    errors.message = errors.message[0];
    next(errors);
  }

  return next();
}

/**
 * Validation function for the read and update handlers
 */
async function reservationExists(req, res, next) {
  const reservation = await service.read(req.params.reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation with id: ${req.params.reservation_id} does not exist.`,
  });
}

/**
 * Validation function for create and updateReservationStatus handlers
 */
function hasValidStatus(req, res, next) {
  const { status } = req.body.data;
  const validStatuses = ["booked", "seated", "finished", "cancelled"];

  if (req.method === "POST" && status && status !== "booked") {
    next({
      status: 400,
      message: `New reservation cannot have status of ${status}.`,
    });
  }

  if (req.method === "PUT" && status && !validStatuses.includes(status)) {
    next({
      status: 400,
      message: `A reservation cannot be updated if it has a status of ${status}.`,
    });
  }

  return next();
}

/**
 * Validation function for update handlers
 */
function statusIsNotFinished(req, res, next) {
  const { reservation } = res.locals;
  if (reservation && reservation.status !== "booked") {
    next({
      status: 400,
      message: `A ${reservation.status} reservation cannot be updated or cancelled.`,
    });
  }

  return next();
}

/**
 * Create handler for reservations resources
 */
async function create(req, res, next) {
  const newReservation = {
    ...req.body.data,
    status: "booked",
  };
  const createdReservation = await service.create(newReservation);
  res.status(201).json({
    data: createdReservation,
  });
}

/**
 * Read handler for reservations resources
 */
function read(req, res) {
  res.json({ data: res.locals.reservation });
}

/**
 * Update reservation handler for reservations resources
 */
async function updateReservation(req, res) {
  const updatedReservation = req.body.data;
  const data = await service.update(updatedReservation);
  res.json({ data });
}

/**
 * Update reservation status for reservations resources
 */
async function updateReservationStatus(req, res) {
  const { reservation } = res.locals;
  const reservationWithNewStatus = {
    ...reservation,
    status: req.body.data.status,
  };
  const data = await service.update(reservationWithNewStatus);
  res.json({ data });
}

/**
 * List handler for reservations resources
 */
async function list(req, res) {
  const { date, mobile_number } = req.query;
  if (date) {
    const data = await service.listReservationsOnQueriedDate(date);
    res.json({ data });
  } else if (mobile_number) {
    const data = await service.searchReservationByPhone(mobile_number);
    res.json({ data });
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasData,
    hasValidStatus,
    initializingErrorsObject,
    hasFirstName,
    hasLastName,
    hasMobileNumberInProperFormat,
    hasReservationDateInProperFormat,
    reservationDateNotInPast,
    reservationDateNotATuesday,
    hasReservationTimeInProperFormat,
    hasReservationTimeWithinEligibleTimeframe,
    hasPeopleInProperFormat,
    captureValidationErrors,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), read],
  updateReservation: [
    asyncErrorBoundary(reservationExists),
    statusIsNotFinished,
    initializingErrorsObject,
    hasFirstName,
    hasLastName,
    hasMobileNumberInProperFormat,
    hasReservationDateInProperFormat,
    reservationDateNotInPast,
    reservationDateNotATuesday,
    hasReservationTimeInProperFormat,
    hasReservationTimeWithinEligibleTimeframe,
    hasPeopleInProperFormat,
    captureValidationErrors,
    asyncErrorBoundary(updateReservation),
  ],
  updateReservationStatus: [
    asyncErrorBoundary(reservationExists),
    hasValidStatus,
    statusIsNotFinished,
    asyncErrorBoundary(updateReservationStatus),
  ],
};
