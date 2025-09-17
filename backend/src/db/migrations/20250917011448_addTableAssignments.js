/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
    await knex.schema.createTable("table_assignments", (t) => {
        t.increments("assignment_id").primary();
        t
            .integer("table_id")
            .notNullable()
            .references("table_id")
            .inTable("tables")
            .onDelete("CASCADE");
        t
            .integer("reservation_id")
            .notNullable()
            .references("reservation_id")
            .inTable("reservations")
            .onDelete("CASCADE");
        // Window the table is blocked for this reservation (with buffers)
        t.timestamp("reserved_from", { useTz: true }).notNullable();
        t.timestamp("reserved_until", { useTz: true }).notNullable();
        // Live status
        t.timestamp("seated_at", { useTz: true }).nullable();
        t.timestamp("finished_at", { useTz: true }).nullable();
        t
            .enu("status", ["reserved", "seated", "finished", "cancelled"], {
                useNative: false,
                enumName: "assignment_status",
            })
            .notNullable()
            .defaultTo("reserved");
        t.timestamps(true, true);
        t.index(["table_id", "reserved_from", "reserved_until"], "idx_assignments_table_timerange");
        t.unique(["table_id", "reservation_id"], "uq_assignment_table_res");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
    // drop enum first if you used an enum name
    try {
        await knex.schema.dropTableIfExists("table_assignments");
        await knex.raw("DROP TYPE IF EXISTS assignment_status");
    } catch (_) {}
};
