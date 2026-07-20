"use client";

import { useEffect } from "react";

export default function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      aria-live="assertive"
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div
        role="alert"
        className="rounded-md border border-nocturne-rose bg-nocturne-gray px-5 py-3 text-sm text-nocturne-white shadow-lg"
      >
        {message}
      </div>
    </div>
  );
}
