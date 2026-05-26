import { cn } from "@/shared/lib/utils";

type DishImagePlaceholderProps = {
  className?: string;
};

export function DishImagePlaceholder({ className }: DishImagePlaceholderProps) {
  return (
    <div
      className={cn("flex size-full items-center justify-center", className)}
      role="img"
      aria-label="Нет фото блюда"
    >
      <svg
        viewBox="0 0 120 120"
        className="text-muted-foreground h-[42%] w-[42%] min-h-14 min-w-14 max-h-28 max-w-28"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="60" cy="60" r="52" fill="currentColor" opacity="0.22" />
        <circle cx="60" cy="60" r="44" fill="currentColor" opacity="0.14" />
        <circle cx="44" cy="48" r="7" fill="currentColor" opacity="0.35" />
        <circle cx="72" cy="52" r="6" fill="currentColor" opacity="0.35" />
        <circle cx="56" cy="72" r="7" fill="currentColor" opacity="0.35" />
        <circle cx="80" cy="70" r="5" fill="currentColor" opacity="0.35" />
        <circle cx="40" cy="68" r="5" fill="currentColor" opacity="0.35" />
        <circle cx="65" cy="42" r="5" fill="currentColor" opacity="0.35" />
        <path
          d="M60 10v100M10 60h100M24 24l72 72M96 24L24 96"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.28"
        />
      </svg>
    </div>
  );
}
