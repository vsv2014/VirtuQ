interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label, className = '' }: SpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-gray-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600" />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
}
