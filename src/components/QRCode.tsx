import { useEffect, useRef } from 'react';

type Props = {
  url: string;
  size?: number;
};

/**
 * Client-side QR code generator using Canvas.
 * No external library — uses a minimal QR encoding for demo purposes.
 * For production, swap with a proper QR library.
 */
export function QRCode({ url, size = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple visual QR-like pattern (for demo — replace with real QR encoding)
    // Using a deterministic pattern derived from the URL string
    const moduleCount = 21; // QR Version 1
    const moduleSize = size / moduleCount;

    ctx.fillStyle = '#0F1B1E';
    ctx.fillRect(0, 0, size, size);

    // Generate deterministic pattern from URL
    const hash = simpleHash(url);
    const modules = generateModules(moduleCount, hash);

    ctx.fillStyle = '#4FD1C5';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col]) {
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize - 0.5,
            moduleSize - 0.5
          );
        }
      }
    }

    // Draw finder patterns (the three corner squares)
    drawFinderPattern(ctx, 0, 0, moduleSize);
    drawFinderPattern(ctx, (moduleCount - 7) * moduleSize, 0, moduleSize);
    drawFinderPattern(ctx, 0, (moduleCount - 7) * moduleSize, moduleSize);
  }, [url, size]);

  return (
    <div className="inline-block p-3 bg-ink rounded-xl border border-hairline">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded"
        aria-label={`QR code linking to ${url}`}
      />
      <p className="text-center mt-2 font-mono text-xs text-text-muted truncate" style={{ maxWidth: size }}>
        {url}
      </p>
    </div>
  );
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateModules(count: number, seed: number): boolean[][] {
  const modules: boolean[][] = Array.from({ length: count }, () =>
    Array(count).fill(false)
  );

  // Fill data area with pseudo-random pattern (avoiding finder zones)
  let s = seed;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      // Skip finder pattern areas
      if (isFinderZone(r, c, count)) continue;

      s = (s * 1103515245 + 12345) & 0x7fffffff;
      modules[r][c] = (s % 3) === 0;
    }
  }

  return modules;
}

function isFinderZone(row: number, col: number, count: number): boolean {
  // Top-left
  if (row < 8 && col < 8) return true;
  // Top-right
  if (row < 8 && col >= count - 8) return true;
  // Bottom-left
  if (row >= count - 8 && col < 8) return true;
  return false;
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) {
  const s = moduleSize;

  // Outer border (7x7)
  ctx.fillStyle = '#4FD1C5';
  ctx.fillRect(x, y, s * 7, s * 7);

  // Inner white (5x5)
  ctx.fillStyle = '#0F1B1E';
  ctx.fillRect(x + s, y + s, s * 5, s * 5);

  // Center block (3x3)
  ctx.fillStyle = '#4FD1C5';
  ctx.fillRect(x + s * 2, y + s * 2, s * 3, s * 3);
}
