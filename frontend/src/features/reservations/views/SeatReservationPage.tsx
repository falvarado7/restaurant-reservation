import { useParams, useNavigate } from "react-router-dom";
import { useReservation } from "../hooks";
import { useTables, useSeatReservation } from "../../../features/tables/hooks";
import { Button, Card, Label, Select } from "../../../app/components/ui";
import ErrorAlert from "../../../app/components/ErrorAlert";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

export default function SeatReservationPage() {
    const { reservation_id } = useParams();
    const nav = useNavigate();
    const { data: reservation, error: rErr, isLoading: rLoading } = useReservation(reservation_id!);
    const { data: tables, error: tErr, isLoading: tLoading } = useTables();
    const { mutateAsync, isPending } = useSeatReservation();
    const [sp] = useSearchParams();
    const preselect = sp.get("table_id") ?? "";

    const eligibleTables =
        (tables ?? [])
        .filter((t) => !t.reservation_id) // free now
        .filter((t) => (reservation?.people ?? 0) <= (t.capacity ?? 0)); // capacity fits

    const onSeat = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const tableId = form.get("table_id") as string;
        if (!tableId) return;
        try {
            await mutateAsync({ tableId, reservation_id: Number(reservation_id) });
            toast.success("Reservation seated");
            nav(`/dashboard?date=${(reservation?.reservation_date || "").slice(0,10)}`);
        } catch (e) {
            toast.error(String(e));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Seat Reservation</h1>
            <ErrorAlert error={rErr || tErr} />

            <Card className="p-2">
                {rLoading || tLoading ? (
                    <p className="text-gray-500 dark:text-gray-400">Loading…</p>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 pl-2">
                            {reservation?.first_name} {reservation?.last_name} • {reservation?.people} people •{" "}
                            {(reservation?.reservation_date || "").slice(0,10)} {reservation?.reservation_time?.slice(0,5)}
                        </p>

                        <form onSubmit={onSeat} className="flex items-end gap-3">
                            <div className="flex-1">
                                <Label htmlFor="table_id">Select table</Label>
                                <Select id="table_id" name="table_id" defaultValue={preselect}>
                                    <option value="" disabled>— choose a table —</option>
                                    {eligibleTables.map((t) => (
                                        <option key={t.table_id} value={t.table_id!}>
                                        {t.table_name} — cap {t.capacity}
                                        </option>
                                    ))}
                                </Select>
                                {!eligibleTables.length && (
                                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
                                        No eligible tables are free right now. Free a table or create a new one.
                                    </p>
                                )}
                            </div>
                            <Button type="submit" disabled={isPending || !eligibleTables.length}
                                className="bg-gray-200 text-zinc-800 border-zinc-50
                                dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10
                                hover:bg-white dark:hover:bg-zinc-700"
                            >
                                Seat
                            </Button>
                            <Button
                                type="button"
                                className="bg-gray-200 text-zinc-800 border-zinc-50
                                dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-700"
                                onClick={() => nav(-1)}
                            >
                                Cancel
                            </Button>
                        </form>
                    </>
                )}
            </Card>
        </div>
    );
}