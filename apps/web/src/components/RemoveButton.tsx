"use client";

import { useEffect, useRef, useState, useTransition } from "react";

export function RemoveButton({
  onRemove,
  confirm = true,
  itemLabel,
}: {
  onRemove: () => void | Promise<void>;
  confirm?: boolean;
  itemLabel?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming) {
      confirmRef.current?.focus();
    } else if (wasConfirming.current) {
      // Moving focus back must happen after React re-mounts the trigger button;
      // doing it synchronously in the cancel handler would target a stale/unmounted ref.
      triggerRef.current?.focus();
    }
    wasConfirming.current = confirming;
  }, [confirming]);

  function handleRemove() {
    startTransition(async () => {
      await onRemove();
      setConfirming(false);
    });
  }

  function cancel() {
    setConfirming(false);
  }

  const removeLabel = itemLabel ? `הסרת ${itemLabel}` : "הסרה";

  if (confirm && confirming) {
    const question = itemLabel ? `להסיר את ${itemLabel}?` : "להסיר?";
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs">
        <span className="text-ink-soft">{question}</span>
        <button
          ref={confirmRef}
          type="button"
          disabled={isPending}
          onClick={handleRemove}
          className="rounded px-2 py-1 font-medium text-warn hover:bg-warn-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight disabled:opacity-50"
        >
          {isPending ? "מסיר..." : "כן, הסר"}
        </button>
        <button
          type="button"
          onClick={cancel}
          className="rounded px-2 py-1 text-ink-soft transition-colors duration-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
        >
          ביטול
        </button>
      </span>
    );
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-label={removeLabel}
      onClick={() => (confirm ? setConfirming(true) : handleRemove())}
      className="rounded px-2 py-1 text-ink-soft transition-colors hover:bg-warn-soft hover:text-warn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
    >
      <span aria-hidden="true">✕</span>
    </button>
  );
}
