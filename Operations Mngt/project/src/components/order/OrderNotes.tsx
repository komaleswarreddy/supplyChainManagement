import React from 'react';

export default function OrderNotes({ notes, onAdd }: { notes: any[]; onAdd?: (note: string) => void }) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold">Order Notes & History</h2>
      {notes?.length ? (
        <ul className="list-disc ml-6">
          {notes.map((n, i) => (
            <li key={i}>{n.text} <span className="text-xs text-muted-foreground">({n.createdAt})</span></li>
          ))}
        </ul>
      ) : <div className="text-muted-foreground">No notes yet.</div>}
      {onAdd && (
        <form className="flex gap-2 mt-2" onSubmit={e => { e.preventDefault(); const form = e.target as any; onAdd(form.note.value); form.note.value = ''; }}>
          <input name="note" className="border rounded px-2 py-1 flex-1" placeholder="Add note..." />
          <button type="submit" className="bg-primary text-white rounded px-4 py-1">Add</button>
        </form>
      )}
    </div>
  );
} 