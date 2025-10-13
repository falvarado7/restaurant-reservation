import { Link } from 'react-router-dom';
import { Card } from '../../../app/components/ui';
import { useTables } from '../hooks';

function DashboardTables() {
    const { data: tables } = useTables();

    return (
        <div>
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

                                        {/*{occupied && (
                                            <button className="mt-3 inline-flex rounded-xl border px-3 py-1 text-sm
                                                    bg-gray-200 dark:bg-zinc-900
                                                    hover:bg-green-200 dark:hover:bg-green-950
                                                    border-green-600 text-green-700 dark:text-green-400
                                                    ">
                                                Clean Up
                                            </button>
                                        )}*/}

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

                                        {<Link
                                            to={`/tables/${t.table_id}/edit`}
                                            className="mt-3 ml-1 inline-flex rounded-xl border px-3 py-1 text-sm
                                                bg-gray-200 dark:bg-zinc-900
                                                hover:bg-yellow-200 dark:hover:bg-yellow-950
                                                border-yellow-600 text-yellow-700 dark:text-yellow-400
                                                "
                                        >
                                            Edit
                                        </Link>}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>
        </div>
    )
}

export default DashboardTables