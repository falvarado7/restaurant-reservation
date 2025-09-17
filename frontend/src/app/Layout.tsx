import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { Menu, Moon, Sun, UtensilsCrossed, X } from "lucide-react";

const THEME_KEY = "theme"; // "dark" | "light"
type Theme = "light" | "dark";

function useTheme(): [Theme, () => void] {
    // Initial theme: saved -> system
    const getInitial = (): Theme => {
        try {
            const saved = localStorage.getItem(THEME_KEY) as Theme | null;
            if (saved === "light" || saved === "dark") return saved;
            return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } catch {
            return "light";
        }
    };

    const [theme, setTheme] = useState<Theme>(getInitial);

    // Apply class + persist whenever theme changes
    useEffect(() => {
        const isDark = theme === "dark";
        document.documentElement.classList.toggle("dark", isDark);
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {}
    }, [theme]);

    // React to system / other-tab changes
    useEffect(() => {
        const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
        const onMQ = (e: MediaQueryListEvent) => {
            const saved = localStorage.getItem(THEME_KEY); // respect explicit user choice
            if (!saved) setTheme(e.matches ? "dark" : "light");
        };
        mq?.addEventListener?.("change", onMQ);

        const onStorage = (e: StorageEvent) => {
            if (e.key === THEME_KEY && (e.newValue === "light" || e.newValue === "dark")) {
                setTheme(e.newValue as Theme);
            }
        };
        window.addEventListener("storage", onStorage);

        return () => {
            mq?.removeEventListener?.("change", onMQ);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    return [theme, toggle];
}

function NavLinkItem({ to, children }: { to: string; children: React.ReactNode; onClick?: () => void }) {
    const { pathname } = useLocation();
    const active = pathname.startsWith(to);
    return (
        <Link
            to={to}
            className={[
                "rounded-full px-3 py-1 text-sm transition",
                active
                ? "bg-black text-white dark:bg-white dark:text-black shadow-glow"
                : [
                    "bg-gray-200 text-zinc-800 border border-zinc-200 hover:bg-white",
                    "dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10 dark:hover:bg-zinc-700",
                    ].join(" "),
            ].join(" ")}
        >
            {children}
        </Link>
    );
};

export default function Layout() {
    const [theme, toggleDark] = useTheme();
    const [open, setOpen] = useState(false);

    // close mobile menu when route changes
    const { pathname } = useLocation();
    useEffect(() => { setOpen(false); }, [pathname]);

    return (
        <div className="
                min-h-dvh text-zinc-900 dark:text-zinc-100
                bg-gradient-to-br from-gray-200 via-gray-400 to-gray-200
                dark:from-zinc-950 dark:via-zinc-800 dark:to-zinc-950
                transition-colors"
        >
            <header className="sticky top-0 z-20 backdrop-blur-md border-b border-white/60 dark:border-white/10">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link to="/dashboard" className="flex items-center gap-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black border border-zinc-900 shadow-card">
                            <UtensilsCrossed size={20} />
                        </div>
                        <div className="leading-5 whitespace-nowrap">
                            <div className="font-semibold tracking-tight md:text-lg">Table Time</div>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-2">
                        <NavLinkItem to="/dashboard">Dashboard</NavLinkItem>
                        <NavLinkItem to="/reservations/new">New Reservation</NavLinkItem>
                        <NavLinkItem to="/tables/new">New Table</NavLinkItem>
                        <NavLinkItem to="/search">Search</NavLinkItem>

                        <button
                            onClick={toggleDark}
                            className={[
                                "rounded-full px-3 py-1.5 text-sm transition",
                                "border border-zinc-200 bg-gray-200 text-zinc-800 hover:bg-white",
                                "dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-700",
                            ].join(" ")}
                            title="Toggle Theme"
                            aria-label="Toggle Theme"
                        >
                        {   theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    </nav>

                    {/* Mobile actions */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={toggleDark}
                            className="rounded-full p-2 transition bg-gray-200 text-zinc-800 border
                                border-zinc-200 hover:bg-white dark:bg-zinc-900
                                dark:text-zinc-100 dark:border-white/10 dark:hover:bg-zinc-700"
                            aria-label="Toggle Theme"
                        >
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={() => setOpen(v => !v)}
                            className="rounded-xl p-2 transition bg-gray-200 text-zinc-800 border
                                border-zinc-200 hover:bg-white dark:bg-zinc-900 dark:text-zinc-100
                                dark:border-white/10 dark:hover:bg-zinc-700"
                            aria-label="Toggle navigation"
                            aria-expanded={open}
                            aria-controls="mobile-menu"
                        >
                            {open ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile slide-down */}
                <div
                    id="mobile-menu"
                    className={[
                        "md:hidden overflow-hidden transition-[max-height] duration-300 ease-out",
                        open ? "max-h-96" : "max-h-0",
                    ].join(" ")}
                >
                    <div className="mx-auto max-w-6xl px-4 pb-3">
                        <div className="grid grid-cols-2 gap-2">
                        <NavLinkItem to="/dashboard" onClick={() => setOpen(false)}>Dashboard</NavLinkItem>
                        <NavLinkItem to="/reservations/new" onClick={() => setOpen(false)}>New Reservation</NavLinkItem>
                        <NavLinkItem to="/tables/new" onClick={() => setOpen(false)}>New Table</NavLinkItem>
                        <NavLinkItem to="/search" onClick={() => setOpen(false)}>Search</NavLinkItem>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                <Outlet />
            </main>

            <Toaster richColors position="top-right" />
        </div>
    );
}