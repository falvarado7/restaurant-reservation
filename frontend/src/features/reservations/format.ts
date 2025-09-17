import type { Reservation } from "./types";

// Safely normalize a single reservation (no-op for now)
function safeFormatOne(r: any): any {
    if (!r || typeof r !== "object") return r;
    // If you want to display as YYYY-MM-DD without timezone issues, uncomment:
    // if (typeof r.reservation_date === "string") {
    //   r = { ...r, reservation_date: r.reservation_date.slice(0, 10) };
    // }
    return r;
}

export function formatReservationDate<T extends Reservation | Reservation[] | undefined | null>(input: T): T {
    if (!input) return input as T;
    return (Array.isArray(input) ? input.map(safeFormatOne) : safeFormatOne(input)) as T;
}

export function formatReservationTime<T extends Reservation | Reservation[] | undefined | null>(input: T): T {
    if (!input) return input as T;
    return (Array.isArray(input) ? input.map(safeFormatOne) : safeFormatOne(input)) as T;
}