import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement>;
  accentColor?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  accentColor = '#6366f1',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 36;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / barCount) - 2;

      for (let i = 0; i < barCount; i++) {
        // Calculate dynamic height based on playback state and simulated frequencies
        let barHeight = 4;
        if (isPlaying) {
          const frequency = 0.12;
          const wave1 = Math.sin(i * frequency + phase);
          const wave2 = Math.cos(i * frequency * 0.7 - phase * 1.4);
          const dynamicMultiplier = Math.abs(wave1 * wave2);
          barHeight = Math.max(4, dynamicMultiplier * (height * 0.85));
        } else {
          barHeight = 4 + Math.sin(i * 0.2 + phase * 0.2) * 2;
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        // Gradient for each bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, accentColor);
        gradient.addColorStop(1, '#38bdf8');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, Math.max(2, barWidth), barHeight, 2);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.08;
      } else {
        phase += 0.02;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, accentColor]);

  return (
    <div className="w-full h-10 px-2 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={320}
        height={36}
        className="w-full h-full block"
      />
    </div>
  );
};
