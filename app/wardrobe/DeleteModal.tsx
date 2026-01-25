export default function DeleteModal({ deleteTarget, remove, setDeleteTarget }: any) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="rounded-[26px] border border-white/12 bg-black p-6 w-full max-w-md">
        <h3 className="text-2xl font-extrabold text-white">
          Delete item?
        </h3>

        <p className="text-white/60 mt-2">
          This cannot be undone.
        </p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setDeleteTarget(null)}
            className="flex-1 rounded-full border border-white/12 bg-white/8 px-5 py-3"
          >
            Cancel
          </button>

          <button
            onClick={remove}
            className="flex-1 rounded-full bg-white text-black font-extrabold px-5 py-3"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
