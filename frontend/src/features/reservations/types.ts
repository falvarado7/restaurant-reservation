import { z } from "zod";

export const ReservationSchema = z.object({
    reservation_id: z.number().optional(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    mobile_number: z.string().min(7),
    reservation_date: z.string(), // YYYY-MM-DD
    reservation_time: z.string(), // HH:mm
    people: z.number().int().min(1),
    status: z.enum(["booked", "seated", "finished", "cancelled"]).optional(),
});
export type Reservation = z.infer<typeof ReservationSchema>;