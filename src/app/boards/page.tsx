import BoardsPageContent from "@/components/boards/BoardsPageContent";

export default function BoardsPage() {
  return (
    <main className="min-h-screen w-full bg-(--color-bg) text-(--color-text)">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col md:max-w-none">
        <BoardsPageContent />
      </div>
    </main>
  );
}
