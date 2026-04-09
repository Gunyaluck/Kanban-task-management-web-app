type BoardEmptyStateProps = {
  onAddColumn: () => void;
};

export default function BoardEmptyState({ onAddColumn }: BoardEmptyStateProps) {
  return (
    <section className="grid min-h-[calc(100vh-64px)] place-items-center px-4">
      <div className="flex max-w-88 flex-col items-center text-center">
        <p className="text-muted text-[18px] font-bold leading-[23px]">
          This board is empty. Create a new column to get started.
        </p>

        <div className="mt-6">
          <button
            type="button"
            className="btn btn-l btn-primary hover:btn-primary-hover w-[178px]"
            aria-label="Add new column"
            onClick={onAddColumn}
          >
            + Add New Column
          </button>
        </div>
      </div>
    </section>
  );
}
