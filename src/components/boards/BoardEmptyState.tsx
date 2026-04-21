type BoardEmptyStateProps =
  | {
      variant: "no-boards";
      onCreateBoard: () => void;
    }
  | {
      variant: "no-columns";
      onAddColumn: () => void;
    };

export default function BoardEmptyState(props: BoardEmptyStateProps) {
  const bodyCopy =
    props.variant === "no-boards"
      ? "You don’t have any boards yet. Create your first board to get started."
      : "This board is empty. Create a new column to get started.";

  const buttonLabel =
    props.variant === "no-boards" ? "+ Create New Board" : "+ Add New Column";

  const buttonAriaLabel =
    props.variant === "no-boards" ? "Create new board" : "Add new column";

  const onClick =
    props.variant === "no-boards" ? props.onCreateBoard : props.onAddColumn;

  return (
    <section className="grid min-h-[calc(100vh-64px)] place-items-center px-4">
      <div className="flex max-w-88 flex-col items-center text-center">
        <p className="text-muted text-[18px] font-bold leading-[23px]">
          {bodyCopy}
        </p>

        <div className="mt-6">
          <button
            type="button"
            className="btn btn-l btn-primary hover:btn-primary-hover w-[178px] hover:cursor-pointer"
            aria-label={buttonAriaLabel}
            onClick={onClick}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
