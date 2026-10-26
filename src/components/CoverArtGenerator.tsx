import React, { useRef, useEffect } from 'react';
import { Sparkles, Download } from 'lucide-react';

interface CoverArtGeneratorProps {
  title: string;
  topic: string;
  category?: string;
  languageName?: string;
  host1Name: string;
  host2Name: string;
  artworkPrompt?: string;
  onDownload?: () => void;
}

export const CoverArtGenerator: React.FC<CoverArtGeneratorProps> = ({
  title,
  topic,
  category = 'AI Studio Podcast',
  languageName = 'Indian English',
  host1Name,
  host2Name,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate dynamic generative canvas artwork based on title & topic hash
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 600;
    canvas.width = size;
    canvas.height = size;

    // Seeded color generation from title string
    let hash = 0;
    const seed = title + topic;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 60) % 360;
    const hue3 = (hue1 + 180) % 360;

    // 1. Rich Radial / Linear Background Gradient
    const bgGradient = ctx.createRadialGradient(size * 0.3, size * 0.3, 50, size * 0.5, size * 0.5, size * 0.8);
    bgGradient.addColorStop(0, `hsl(${hue1}, 80%, 25%)`);
    bgGradient.addColorStop(0.5, `hsl(${hue2}, 75%, 14%)`);
    bgGradient.addColorStop(1, '#070a12');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, size, size);

    // 2. Futuristic geometric orbs and soundwave rings
    ctx.save();
    for (let r = 0; r < 5; r++) {
      ctx.beginPath();
      ctx.arc(size * 0.5, size * 0.42, 80 + r * 35, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue3}, 90%, 65%, ${0.15 - r * 0.025})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Glowing central energy sphere
    const glowGradient = ctx.createRadialGradient(size * 0.5, size * 0.42, 10, size * 0.5, size * 0.42, 120);
    glowGradient.addColorStop(0, `hsla(${hue1}, 95%, 70%, 0.8)`);
    glowGradient.addColorStop(0.4, `hsla(${hue2}, 85%, 55%, 0.4)`);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.42, 120, 0, Math.PI * 2);
    ctx.fill();

    // 4. Stylized Podcast Microphone & Waveform Icon in center
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = `hsl(${hue1}, 100%, 75%)`;
    ctx.shadowBlur = 18;

    // Draw central sound bars
    const barCount = 13;
    const barWidth = 6;
    const barGap = 6;
    const startX = size * 0.5 - ((barCount * (barWidth + barGap)) / 2);
    for (let b = 0; b < barCount; b++) {
      const barHeight = Math.sin((b / barCount) * Math.PI) * 70 + 15;
      const x = startX + b * (barWidth + barGap);
      const y = size * 0.42 - barHeight / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 3);
      ctx.fill();
    }
    ctx.restore();

    // 5. Dark gradient scrim at bottom for high-contrast typography
    const scrim = ctx.createLinearGradient(0, size * 0.45, 0, size);
    scrim.addColorStop(0, 'rgba(7, 10, 18, 0)');
    scrim.addColorStop(0.4, 'rgba(7, 10, 18, 0.85)');
    scrim.addColorStop(1, 'rgba(7, 10, 18, 0.98)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, size * 0.45, size, size * 0.55);

    // 6. Header Badges
    // Brand pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(40, 40, 140, 32, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('ECHO CAST AI', 58, 61);

    // Language / Duration tag
    ctx.fillStyle = `hsl(${hue1}, 90%, 65%)`;
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${languageName.toUpperCase()}`, size - 40, 61);
    ctx.textAlign = 'left';

    // 7. Title Typography (Multi-line wrap)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    const maxWidth = size - 80;
    const words = title.split(' ');
    let line = '';
    const lines: string[] = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Limit to 3 lines max
    const displayLines = lines.slice(0, 3);
    let titleY = size * 0.72;
    displayLines.forEach((l) => {
      ctx.fillText(l.trim(), 40, titleY);
      titleY += 34;
    });

    // 8. Host Credits Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Hosted by ${host1Name} & ${host2Name} • Powered by Sarvam Bulbul`, 40, size - 42);

  }, [title, topic, category, languageName, host1Name, host2Name]);

  const handleDownloadCover = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}-cover.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900 aspect-square max-w-[340px] mx-auto sm:max-w-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
      />
      
      {/* Floating Quick Action Overlay */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleDownloadCover}
          title="Download Artwork"
          className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors shadow-lg"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-3 right-3 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3 h-3" />
          AI Artwork
        </span>
      </div>
    </div>
  );
};
