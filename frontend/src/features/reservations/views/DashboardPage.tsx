import { Link, useSearchParams } from "react-router-dom";
import { useReservations } from "../hooks";
import { useTables } from "../../../features/tables/hooks";
import ErrorAlert from "../../../app/components/ErrorAlert";
import { format, addDays, parseISO } from "date-fns";
import { Button, Card } from "../../../app/components/ui";
import { Clock, UsersRound, Phone, CheckCircle2 } from "lucide-react";

const colors = [
  "bg-red-500/80",
  "bg-emerald-500/80",
  "bg-indigo-500/80",
  "bg-pink-500/80",
  "bg-amber-500/80",
  "bg-purple-500/80",
  "bg-sky-500/80",
  "bg-blue-500/80",
  "bg-red-500/80",
];

function Avatar({ name }: { name: string }) {
    const initials = name.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();
    // simple hash → index
    const hash = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    return (
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${color} text-white shadow-card`}>
            {initials}
        </div>
    );
}

export default function DashboardPage() {
    const [sp, setSp] = useSearchParams();
    // still keep API date as ISO string
    const todayIso = format(new Date(), "yyyy-MM-dd");
    const dateIso = sp.get("date") || todayIso;

    const { data: reservations, isLoading, error } = useReservations(dateIso);
    const { data: tables } = useTables();

    // navigation still in ISO
    const nextDay = () => setSp({ date: format(addDays(parseISO(dateIso), 1), "yyyy-MM-dd") });
    const prevDay = () => setSp({ date: format(addDays(parseISO(dateIso), -1), "yyyy-MM-dd") });

    // format just for display
    const dateDisplay = format(parseISO(dateIso), "MM-dd-yyyy");
    const freeTables = (tables ?? []).filter(t => !t.reservation_id).length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold tracking-tight text">Dashboard</h1>
                <div className="flex items-center sm:gap-2 gap-1.5">
                    <Button onClick={prevDay}>
                        Prev
                    </Button>
                    <Button onClick={() => setSp({ date: todayIso })}>
                        Today
                    </Button>
                    <Button onClick={nextDay}>
                        Next
                    </Button>
                </div>
            </div>

            <ErrorAlert error={error} />

            {/* Reservations */}
            <Card className="p-5 max-h-[428px] sm:max-h-[380px] overflow-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Reservations — {dateDisplay}</h2>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        Free tables now: <span className="font-semibold">{freeTables}</span>
                    </div>
                </div>

                {isLoading ? (
                    <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading…</p>
                ) : !(reservations?.length) ? (
                    <p className="mt-4 text-zinc-600 dark:text-zinc-400">No reservations.</p>
                ) : (
                    <ul className="mt-4 divide-y divide-white/60 dark:divide-white/10">
                        {reservations!.map(r => {
                            const canSeat = (r.status ?? "booked") === "booked";
                            const fullName = `${r.first_name} ${r.last_name}`;
                            return (
                                <li key={r.reservation_id} className="py-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={fullName} />
                                            <div>
                                                <p className="font-medium">{fullName}</p>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock size={14}/>{r.reservation_time?.slice(0,5)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <UsersRound size={14}/>{r.people} {r.people===1?"person":"people"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Phone size={14}/>{r.mobile_number}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-1.5 border
                                                    bg-gray-200 text-zinc-800 border-zinc-50
                                                    dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10"
                                                data-reservation-id-status={r.reservation_id}
                                            >
                                                <CheckCircle2 size={14} className={r.status==="seated" ? "text-emerald-500" : "text-zinc-400"} />
                                                <span className="capitalize">{r.status ?? "booked"}</span>
                                            </span>
                                            <Link
                                                to={`/reservations/${r.reservation_id}/edit`}
                                                className="rounded-xl border px-3 py-1 text-sm bg-gray-200 text-zinc-800 border-zinc-50
                                                    dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-700"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                to={`/reservations/${r.reservation_id}/seat`}
                                                className={
                                                "rounded-xl px-3 py-1 text-sm bg-gray-200 dark:bg-zinc-900 " +
                                                (canSeat
                                                    ? "border border-brand-600 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-950"
                                                    : "border border-zinc-200/70 dark:border-zinc-800 text-zinc-400 pointer-events-none")
                                                }
                                                aria-disabled={!canSeat}
                                            >
                                                Seat
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>

            {/* Tables */}
            <Card className="p-5">
                <h2 className="text-lg font-medium">Tables (current status)</h2>
                    {!tables?.length ? (
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">No tables.</p>
                ) : (
                    <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {tables.map(t => {
                            const photo = t.image_url;
                            const occupied = !!t.reservation_id;
                            return (
                                <li
                                    key={t.table_id}
                                    className="overflow-hidden rounded-2xl border border-white/60
                                        dark:border-white/10 bg-gray-200 dark:bg-zinc-900/60
                                        backdrop-blur-md shadow-card"
                                >
                                    <div className="relative h-32 w-full overflow-hidden">
                                        <img
                                            src={photo}
                                            alt={t.table_name}
                                            className="h-full w-full object-cover brightness-100 contrast-105
                                                dark:brightness-[.75] dark:contrast-110"
                                        />
                                        {/* top gradient for legibility */}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b
                                            from-black/0 to-black/0 dark:from-black/10 dark:to-black/0
                                            border-b dark:border-zinc-700"
                                        />
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{t.table_name}</p>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300">Capacity {t.capacity}</p>
                                        </div>
                                        <span
                                            className={[
                                            "text-xs rounded-full px-2 py-1 border bg-white/70 dark:bg-zinc-900/60",
                                            occupied
                                                ? "border-amber-400 text-amber-700 dark:border-amber-500/70 dark:text-amber-300"
                                                : "border-emerald-600 text-emerald-700 dark:border-emerald-500/70 dark:text-emerald-300",
                                            ].join(" ")}
                                            data-table-id-status={t.table_id}
                                        >
                                            {occupied ? "Occupied" : "Free"}
                                        </span>
                                        </div>

                                        {!occupied && (
                                            <Link
                                                to="/search"
                                                className="mt-3 inline-flex rounded-xl border px-3 py-1 text-sm
                                                    bg-gray-200 dark:bg-zinc-900
                                                    hover:bg-blue-200 dark:hover:bg-blue-950
                                                    border-brand-600 text-blue-700 dark:text-blue-400
                                                    "
                                            >
                                                Seat…
                                            </Link>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>
        </div>
    );
}