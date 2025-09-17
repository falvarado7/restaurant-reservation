import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTable, deleteTableAssignment, listTables, seatReservation } from "./api";
import type { Table } from "./types";

export function useTables() {
    return useQuery({ queryKey: ["tables"], queryFn: () => listTables() });
}
export function useCreateTable() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (t: Table) => createTable(t), onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }) });
}
export function useSeatReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ tableId, reservation_id }: { tableId: number | string; reservation_id: number }) =>
            seatReservation(tableId, reservation_id),
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: ["tables"] });
                qc.invalidateQueries({ queryKey: ["reservations"] });
        },
    });
}
export function useUnseatTable() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (tableId: number | string) => deleteTableAssignment(tableId),
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: ["tables"] });
                qc.invalidateQueries({ queryKey: ["reservations"] });
            },
    });
}