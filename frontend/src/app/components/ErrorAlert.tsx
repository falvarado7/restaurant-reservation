export default function ErrorAlert({ error }: { error?: unknown }) {
  if (!error) return null;
    return (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3
            text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {String(error)}
        </div>
  );
}