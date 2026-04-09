interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export function LoadingSpinner({
  size = "medium",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} ${className || ""}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
