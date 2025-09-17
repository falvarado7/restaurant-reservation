import { useState } from "react";
import { Button, Card, Input, Label } from "../../../app/components/ui";
import ErrorAlert from "../../../app/components/ErrorAlert";
import { listReservations } from "../api";

export default function SearchPage() {
    const [term, setTerm] = useState("");
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState<unknown>(null);
    const [loading, setLoading] = useState(false);

    const onSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await listReservations({ mobile_number: term });
            setResults(data);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Search</h1>
            <ErrorAlert error={error} />
            <Card className="p-2">
                <form onSubmit={onSearch} className="flex items-end gap-3">
                    <div className="flex-1">
                        <Label>Mobile number</Label>
                        <Input placeholder="Search e.g. 555-555-5555" value={term} onChange={(e) => setTerm(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={loading}
                        className="bg-gray-200 text-zinc-800 border-zinc-50
                            dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-700"
                    >
                        Search
                    </Button>
                </form>
            </Card>

            {results && (
                <Card className="p-3">
                    <h2 className="font-medium">Results</h2>
                    {!results.length ? (
                        <p className="mt-3 text-gray-500 dark:text-gray-400">No records found</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-white/60 dark:divide-white/10">
                            {results.map((r) => (
                                <li key={r.reservation_id} className="py-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                        <p className="font-medium">{r.first_name} {r.last_name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {r.mobile_number} • {r.reservation_date?.slice(0,10)} {r.reservation_time?.slice(0,5)}
                                        </p>
                                        </div>
                                        <span className="text-xs rounded-full px-2 py-1 border bg-gray-200 text-zinc-800 border-zinc-50
                                                dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10"
                                        >
                                            {r.status ?? "booked"}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}
        </div>
    );
}