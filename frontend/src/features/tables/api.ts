import { api, requestJson } from "../../lib/ky";
import { TableSchema } from "./types";
import type { Table } from "./types";

export async function listTables() {
    return requestJson<Table[]>(api.get("tables"));
}

export async function createTable(payload: Table) {
    const parsed = TableSchema.parse(payload);
    return requestJson<Table>(api.post("tables", { json: { data: { ...parsed, capacity: Number(parsed.capacity) } } }));
}

export async function seatReservation(tableId: number | string, reservation_id: number) {
    return requestJson<Table>(api.put(`tables/${tableId}/seat`, { json: { data: { reservation_id } } }));
}

export async function deleteTableAssignment(tableId: number | string) {
  // 204 No Content -> requestJson returns `undefined`
    return requestJson<void>(api.delete(`tables/${tableId}/seat`));
}