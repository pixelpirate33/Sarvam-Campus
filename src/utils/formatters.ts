export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function generateId(prefix = 'ep'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export function formatTranscriptMarkdown(
  title: string,
  summary: string,
  script: { speaker: string; speakerName: string; text: string; startTime?: number }[]
): string {
  let md = `# ${title}\n\n`;
  md += `> **Episode Summary**: ${summary}\n\n`;
  md += `## Full Dialogue Transcript\n\n`;

  for (const line of script) {
    const time = line.startTime !== undefined ? `[${formatTime(line.startTime)}] ` : '';
    md += `**${line.speakerName} (${line.speaker})** ${time}:\n${line.text}\n\n`;
  }

  return md;
}
