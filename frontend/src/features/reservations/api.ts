import { api, requestJson } from "../../lib/ky";
import { ReservationSchema } from "./types";
import type { Reservation } from "./types";
import { formatReservationDate, formatReservationTime } from "./format";

export async function listReservations(params: Record<string, string | number>) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => qs.append(k, String(v)));
    const data = await requestJson<Reservation[]>(api.get(`reservations?${qs.toString()}`));
    return formatReservationTime(formatReservationDate(data));
}

export async function readReservation(id: number | string) {
    const data = await requestJson<Reservation>(api.get(`reservations/${id}`));
    return formatReservationTime(formatReservationDate(data));
}

export async function createReservation(payload: Reservation) {
    const parsed = ReservationSchema.parse(payload);
    return requestJson<Reservation>(api.post("reservations", { json: { data: { ...parsed, people: Number(parsed.people) } } }));
}

export async function updateReservation(payload: Reservation) {
    const parsed = ReservationSchema.parse(payload);
    return requestJson<Reservation>(api.put(`reservations/${parsed.reservation_id}`, { json: { data: { ...parsed, people: Number(parsed.people) } } }));
}

export async function setReservationStatus(id: number | string, status: "booked" | "seated" | "finished" | "cancelled") {
    return requestJson<Reservation>(api.put(`reservations/${id}/status`, { json: { data: { status } } }));
}