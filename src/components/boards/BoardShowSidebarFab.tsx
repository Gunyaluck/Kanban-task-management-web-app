import { cn } from "@/lib/utils";

type BoardShowSidebarFabProps = {
  onClick?: () => void;
  className?: string;
};

export default function BoardShowSidebarFab({
  onClick,
  className,
}: BoardShowSidebarFabProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-6 left-4 z-10 md:left-[-19]",
        className
      )}
    >
      <button
        type="button"
        className="pointer-events-auto grid h-12 w-20 place-items-center rounded-full bg-(--color-primary) shadow-[0_4px_6px_rgba(54,78,126,0.1015)] transition-colors hover:bg-(--color-primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 hover:cursor-pointer"
        aria-label="Show sidebar"
        onClick={onClick}
      >
        <img
          src="/icons/icon-show-sidebar.svg"
          alt="Show sidebar"
          width={16}
          height={11}
          className="h-[11px] w-4"
        />
      </button>
    </div>
  );
}
