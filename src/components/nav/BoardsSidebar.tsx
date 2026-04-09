"use client";

import { useRouter } from "next/navigation";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BoardsSidebarProps = {
  boards: { id: string; name: string }[];
  activeBoardId: string;
  onBoardSelect: (boardId: string) => void;
  onCreateBoardClick: () => void;
  onHideSidebar: () => void;
};

export default function BoardsSidebar({
  boards,
  activeBoardId,
  onBoardSelect,
  onCreateBoardClick,
  onHideSidebar,
}: BoardsSidebarProps) {
  const router = useRouter();

  return (
    <aside className="surface hidden h-screen w-[260px] shrink-0 flex-col border-r border-token md:sticky md:top-0 md:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <img
          src="/logos/logo-mobile.svg"
          alt="Kanban logo"
          className="h-6 w-auto"
        />
        <span className="text-xl font-bold tracking-[-0.5px]">kanban</span>
      </div>

      <div className="px-6 pb-4">
        <p className="text-muted text-xs font-bold tracking-[0.15em]">
          ALL BOARDS ({boards.length})
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 pr-6">
        {boards.map((b) => {
          const active = b.id === activeBoardId;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onBoardSelect(b.id)}
              className={`flex items-center gap-3 rounded-r-full py-3 pr-4 pl-6 text-sm font-bold transition-colors hover:cursor-pointer ${
                active
                  ? "bg-(--color-primary) text-white"
                  : "text-muted hover:bg-(--color-surface-2) hover:text-(--color-text)"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <img
                src="/icons/icon-board.svg"
                alt="Board"
                width={16}
                height={16}
                className="h-4 w-4"
              />
              <span className="truncate">{b.name}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onCreateBoardClick}
          className="mt-1 flex items-center gap-3 rounded-r-full py-3 pr-4 pl-6 text-sm font-bold text-(--color-primary) transition-colors hover:bg-(--color-surface-2) hover:cursor-pointer"
        >
          <span aria-hidden>+</span>
          <span> Create New Board</span>
        </button>

        <button
          type="button"
          onClick={async () => {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="mt-1 flex items-center gap-3 rounded-r-full py-3 pr-4 pl-6 text-sm font-bold text-(--color-danger) transition-colors hover:bg-(--color-surface-2) hover:cursor-pointer"
        >
          <span>Logout</span>
        </button>
      </nav>

      <div className="px-6 pb-4">
        <ThemeSwitch />
      </div>

      <button
        type="button"
        onClick={onHideSidebar}
        className="text-muted flex items-center gap-3 px-6 py-4 text-sm font-bold transition-colors hover:text-(--color-text) hover:cursor-pointer"
      >
        <img
          src="/icons/icon-hide-sidebar.svg"
          alt="Hide sidebar"
          width={18}
          height={16}
          className="h-4 w-[18px]"
        />
        <span>Hide Sidebar</span>
      </button>
    </aside>
  );
}

