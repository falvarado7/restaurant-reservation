import { z } from "zod";
export const TableSchema = z.object({
    table_id: z.number().optional(),
    table_name: z.string().min(1),
    capacity: z.number().int().min(1),
    image_url: z.string().min(1),
    reservation_id: z.number().nullable().optional(),
});
export type Table = z.infer<typeof TableSchema>;