import type { BadgeTier } from "../types/index";

// ─── Color helpers ────────────────────────────────────────────────────────────

function tierColors(tier: BadgeTier): {
  from: string;
  to: string;
  text: string;
  accent: string;
} {
  const map: Record<
    BadgeTier,
    { from: string; to: string; text: string; accent: string }
  > = {
    bronze: {
      from: "#c87941",
      to: "#7a4620",
      text: "#f5e6d0",
      accent: "#e8a060",
    },
    silver: {
      from: "#b8c4cc",
      to: "#6a7a88",
      text: "#eef2f5",
      accent: "#d0dce8",
    },
    gold: {
      from: "#e8b840",
      to: "#a06818",
      text: "#2a1808",
      accent: "#f5d060",
    },
    diamond: {
      from: "#6ab4e8",
      to: "#2848a8",
      text: "#e8f4ff",
      accent: "#a8d8ff",
    },
  };
  return map[tier];
}

// ─── Draw badge on canvas ─────────────────────────────────────────────────────

function drawBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  day: number,
  tier: BadgeTier,
) {
  const colors = tierColors(tier);

  // Glow ring
  const glowGrad = ctx.createRadialGradient(
    x,
    y,
    radius * 0.6,
    x,
    y,
    radius * 1.4,
  );
  glowGrad.addColorStop(0, `${colors.accent}55`);
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Badge circle gradient
  const grad = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.3,
    radius * 0.1,
    x,
    y,
    radius,
  );
  grad.addColorStop(0, colors.from);
  grad.addColorStop(1, colors.to);

  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = colors.accent;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Badge border
  ctx.strokeStyle = `${colors.from}99`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Day number
  ctx.save();
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${radius * 0.7}px "General Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(day), x, y - radius * 0.05);
  ctx.font = `${radius * 0.25}px "General Sans", sans-serif`;
  ctx.fillStyle = `${colors.text}bb`;
  ctx.fillText("DAYS", x, y + radius * 0.48);
  ctx.restore();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function createShareImage(
  userName: string,
  activityName: string,
  streakDay: number,
  tier: BadgeTier,
): Promise<Blob> {
  const size = 800;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  // Background
  const bgGrad = ctx.createRadialGradient(
    size / 2,
    size * 0.4,
    0,
    size / 2,
    size / 2,
    size * 0.8,
  );
  bgGrad.addColorStop(0, "#2a1a60");
  bgGrad.addColorStop(0.5, "#1a1040");
  bgGrad.addColorStop(1, "#0d0820");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle star field
  ctx.save();
  for (let i = 0; i < 60; i++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    const sr = Math.random() * 1.5 + 0.3;
    const alpha = Math.random() * 0.5 + 0.2;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Gold decorative border
  const borderPad = 28;
  const borderRadius = 20;
  ctx.save();
  const borderGrad = ctx.createLinearGradient(0, 0, size, size);
  borderGrad.addColorStop(0, "#e8b840");
  borderGrad.addColorStop(0.5, "#c89038");
  borderGrad.addColorStop(1, "#e8c858");
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(
    borderPad,
    borderPad,
    size - borderPad * 2,
    size - borderPad * 2,
    borderRadius,
  );
  ctx.stroke();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = "#f5d060";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(
    borderPad + 6,
    borderPad + 6,
    size - (borderPad + 6) * 2,
    size - (borderPad + 6) * 2,
    borderRadius - 4,
  );
  ctx.stroke();
  ctx.restore();

  // "VAJRA" wordmark
  ctx.save();
  ctx.fillStyle = "#e8c060";
  ctx.font = `bold ${size * 0.065}px "General Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#c89038";
  ctx.fillText("VAJRA", size / 2, 70);
  ctx.restore();

  // Separator
  ctx.save();
  ctx.strokeStyle = "#c8903866";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(size * 0.2, 130);
  ctx.lineTo(size * 0.8, 130);
  ctx.stroke();
  ctx.restore();

  // Badge artwork
  drawBadge(ctx, size / 2, size * 0.44, size * 0.2, streakDay, tier);

  // Achievement text
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  ctx.fillStyle = "#e8c060";
  ctx.font = `bold ${size * 0.042}px "General Sans", sans-serif`;
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#c89038";
  ctx.fillText("MILESTONE UNLOCKED", size / 2, size * 0.66);

  const name = userName.length > 20 ? `${userName.slice(0, 18)}…` : userName;
  const activity =
    activityName.length > 24 ? `${activityName.slice(0, 22)}…` : activityName;
  ctx.fillStyle = "#f0e8d8";
  ctx.font = `${size * 0.032}px "General Sans", sans-serif`;
  ctx.shadowBlur = 0;
  ctx.fillText(`${name} achieved ${streakDay} days of`, size / 2, size * 0.725);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${size * 0.038}px "General Sans", sans-serif`;
  ctx.fillText(activity, size / 2, size * 0.77);

  const colors = tierColors(tier);
  ctx.fillStyle = colors.from;
  ctx.font = `bold ${size * 0.028}px "General Sans", sans-serif`;
  ctx.fillText(`${tier.toUpperCase()} TIER`, size / 2, size * 0.832);

  ctx.restore();

  // Footer branding
  ctx.save();
  ctx.fillStyle = "#c0a060aa";
  ctx.font = `${size * 0.022}px "General Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Built with Suraj", size / 2, size - 48);
  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image blob"));
      },
      "image/png",
      0.95,
    );
  });
}

export async function shareAchievement(
  userName: string,
  activityName: string,
  streakDay: number,
  tier: BadgeTier,
): Promise<void> {
  const blob = await createShareImage(userName, activityName, streakDay, tier);

  if (navigator.share && navigator.canShare) {
    const file = new File([blob], `vajra-${streakDay}-days.png`, {
      type: "image/png",
    });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `${streakDay} Day Streak — Vajra`,
        text: `I've achieved ${streakDay} days of ${activityName}! 🔥`,
        files: [file],
      });
      return;
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vajra-${streakDay}-days.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
