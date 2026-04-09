import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeSwitch from "@/components/ui/ThemeSwitch";

type MobileNavbarProps = {
  title: string;
  boards?: { id: string; name: string }[];
  activeBoardId?: string;
  onBoardSelect?: (boardId: string) => void;
  onCreateBoardClick?: () => void;
  showDesktopBrand?: boolean;
  onAddTaskClick?: () => void;
  onEditBoardClick?: () => void;
  onDeleteBoardClick?: () => void;
};

export default function MobileNavbar({
  title,
  boards = [],
  activeBoardId,
  onBoardSelect,
  onCreateBoardClick,
  showDesktopBrand = false,
  onAddTaskClick,
  onEditBoardClick,
  onDeleteBoardClick,
}: MobileNavbarProps) {
  const [boardsMenuOpen, setBoardsMenuOpen] = useState(false);

  return (
    <header className="surface flex h-[64px] md:h-[97px] w-full items-center justify-between px-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        {/* Mobile: logo + boards dropdown */}
        <div className={showDesktopBrand ? "flex items-center gap-3" : ""}>
          <img
            src="/logos/logo-mobile.svg"
            alt="Kanban logo"
            className={showDesktopBrand ? "h-6 w-auto" : "h-6 w-auto md:hidden"}
          />
          {showDesktopBrand ? (
            <span className="hidden text-xl font-bold tracking-[-0.5px] md:block">
              kanban
            </span>
          ) : null}
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 md:hidden"
          aria-label="Open boards menu"
          onClick={() => setBoardsMenuOpen((v) => !v)}
        >
          <h1 className="text-[18px] font-bold leading-none tracking-[-0.25px]">
            {title}
          </h1>
          <img
            src={
              boardsMenuOpen
                ? "/icons/icon-chevron-up.svg"
                : "/icons/icon-chevron-down.svg"
            }
            alt="Boards dropdown"
            width={10}
            height={7}
            className="h-2 w-auto"
          />
        </button>

        {/* Tablet/Desktop: no logo, no boards dropdown (sidebar handles boards) */}
        <h1 className="hidden truncate text-xl font-bold tracking-[-0.5px] md:block">
          {title}
        </h1>
      </div>

      {/* Mobile boards menu panel */}
      {boardsMenuOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50"
            aria-label="Close boards menu"
            onClick={() => setBoardsMenuOpen(false)}
          />
          <div className="surface fixed top-[72px] left-4 right-4 z-50 max-w-[20rem] rounded-lg p-4 shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
            <div className="text-muted text-xs font-bold tracking-[0.15em]">
              ALL BOARDS ({boards.length})
            </div>
            <div className="mt-4 flex flex-col">
              {boards.map((b) => {
                const active = b.id === activeBoardId;
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={`flex items-center gap-3 rounded-r-full py-2.5 pr-4 pl-4 text-sm font-bold ${
                      active
                        ? "bg-(--color-primary) text-white"
                        : "text-muted hover:bg-(--color-surface-2) hover:text-(--color-text)"
                    }`}
                    onClick={() => {
                      onBoardSelect?.(b.id);
                      setBoardsMenuOpen(false);
                    }}
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
                className="mt-2 flex items-center gap-3 rounded-r-full py-2.5 pr-4 pl-4 text-sm font-bold text-(--color-primary) hover:bg-(--color-surface-2)"
                onClick={() => {
                  onCreateBoardClick?.();
                  setBoardsMenuOpen(false);
                }}
              >
                <span aria-hidden>+</span>
                <span> Create New Board</span>
              </button>
            </div>

            <div className="mt-4">
              <ThemeSwitch />
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex flex-row gap-4 items-center">
      <button
        type="button"
        className="inline-flex h-8 w-12 items-center justify-center gap-2 rounded-full bg-(--color-primary) text-white transition-colors hover:bg-(--color-primary-hover) md:h-12 md:w-auto md:px-6 hover:cursor-pointer"
        aria-label="Add new item"
        onClick={() => onAddTaskClick?.()}
      >
       <img
        src="/icons/icon-add-task-mobile.svg"
        alt="add task mobile icon"
        className="h-3 w-auto"
      />
        <span className="hidden text-[15px] font-bold md:inline">
          Add New Task
        </span>
      </button>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="text-muted hover:text-(--color-text) grid h-8 w-8 place-items-center rounded transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 hover:cursor-pointer"
            aria-label="Board options"
          >
            <img
              src="/icons/icon-vertical-ellipsis.svg"
              alt="Board options"
              width={5}
              height={20}
              className="h-5 w-[5px]"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="end">
          <DropdownMenuItem
            className="text-muted data-highlighted:text-(--color-text)"
            onSelect={() => onEditBoardClick?.()}
          >
            Edit Board
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-(--color-danger) data-highlighted:bg-(--color-surface-2) data-highlighted:text-(--color-danger)"
            onSelect={() => onDeleteBoardClick?.()}
          >
            Delete Board
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}
