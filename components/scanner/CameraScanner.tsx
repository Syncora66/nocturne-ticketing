"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

// Cooldown after a successful decode before the same QR text can trigger
// another scan — without this, holding the ticket steady in frame for
// even half a second re-fires the callback dozens of times (once per
// video frame) for what's obviously one scan attempt.
const RESCAN_COOLDOWN_MS = 2000;

export default function CameraScanner({
  onScan,
  paused,
}: {
  onScan: (text: string) => void;
  paused: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastScanRef = useRef<{ text: string; at: number } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // onScan is intentionally excluded from the dependency array below —
  // it's expected to be stable-ish, and re-running this whole effect on
  // every render would tear down and restart the camera stream
  // constantly instead of just once on mount.
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        tick();
      } catch {
        setCameraError(
          "Impossible d'accéder à la caméra. Vérifie les permissions.",
        );
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(frame.data, frame.width, frame.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        const last = lastScanRef.current;
        const now = Date.now();
        const isCooldown =
          last && last.text === code.data && now - last.at < RESCAN_COOLDOWN_MS;

        if (!isCooldown) {
          lastScanRef.current = { text: code.data, at: now };
          onScan(code.data);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cameraError) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-6 text-center text-sm text-nocturne-text">
        {cameraError}
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />
      {/* Scan-area frame — purely visual, doesn't constrain what jsQR
          actually reads (it scans the full frame). */}
      <div
        className="pointer-events-none absolute inset-8 rounded-lg border-2 border-white/70"
        aria-hidden="true"
      />
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-bold text-nocturne-white">
          Scan en pause
        </div>
      )}
    </div>
  );
}
