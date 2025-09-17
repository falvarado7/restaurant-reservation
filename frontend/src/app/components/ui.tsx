import { forwardRef } from "react";
import type { ComponentProps } from "react";

/** simple className combiner */
export function cn(...a: (string | undefined | false)[]) {
    return a.filter(Boolean).join(" ");
}

export const Label = (p: ComponentProps<"label">) => (
    <label
        {...p}
            className={cn(
            "block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300 pl-2",
            p.className
        )}
    />
);

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
    ({ className, ...p }, ref) => (
        <input
            ref={ref}
            {...p}
            className={cn(
                "w-full rounded-xl border bg-white/70 dark:bg-zinc-900/60",
                "border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm",
                "shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                className
            )}
        />
    )
);
Input.displayName = "Input";

export const Select = forwardRef<
    HTMLSelectElement,
    ComponentProps<"select">
>(({ className, ...p }, ref) => (
    <select
        ref={ref}
        {...p}
        className={cn(
            "w-full rounded-xl border bg-white/70 dark:bg-zinc-900/60",
            "border-zinc-200 dark:border-zinc-800 px- py-2 text-sm",
            "shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500",
            className
        )}
    />
));
Select.displayName = "Select";

export const Button = ({ className, ...p }: ComponentProps<"button">) => (
    <button
        {...p}
        className={cn(
            "inline-flex items-center gap-2 rounded-xl sm:px-4 sm:py-2 px-2.5 py-1.5 text-sm font-medium transition",
            "bg-gray-200 text-zinc-800 border border-zinc-200 hover:bg-white",
            "dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10 dark:hover:bg-zinc-700",
            className
        )}
    />
);

export const Card = ({ className, ...p }: ComponentProps<"div">) => (
    <div
        {...p}
            className={cn(
            "rounded-2xl border border-white/60 dark:border-white/10",
            "bg-zinc-200/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-card",
            className
        )}
    />
);