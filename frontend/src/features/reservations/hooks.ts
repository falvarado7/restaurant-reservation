import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createReservation, listReservations, readReservation, setReservationStatus, updateReservation } from "./api";
import type { Reservation } from "./types";

export function useReservations(date: string) {
    return useQuery({ queryKey: ["reservations", { date }], queryFn: () => listReservations({ date }) });
}

export function useReservation(id?: number | string) {
    return useQuery({ queryKey: ["reservation", id], queryFn: () => readReservation(id!), enabled: !!id });
}

export function useCreateReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (r: Reservation) => createReservation(r),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
    });
}

export function useUpdateReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (r: Reservation) => updateReservation(r),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
    });
}

export function useSetReservationStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number | string; status: Reservation["status"] }) =>
        setReservationStatus(id, status!),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
    });
}