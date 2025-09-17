const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const reservationsRouter = require("./reservations/reservations.router");
const tablesRouter = require("./tables/tables.router");

const app = express();

const allowList = (process.env.CORS_ORIGIN || "")
    .split(",").filter(Boolean);
// if no CORS_ORIGIN set, allow localhost dev ports by default
const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"];

app.use(helmet());
app.use(
  cors({
    origin: allowList.length ? allowList : defaultOrigins,
    credentials: true,
  })
);
app.use(express.json());

// healthcheck for uptime monitors and quick sanity checks
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/reservations", reservationsRouter);
app.use("/tables", tablesRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
