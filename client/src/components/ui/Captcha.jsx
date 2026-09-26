import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCw, Volume2, ShieldCheck } from 'lucide-react';

// Charset avoiding easily confused characters (0, O, o, 1, I, l)
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

export const generateCaptchaCode = (length = 6) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
};

export const Captcha = ({ onCaptchaChange, className = '' }) => {
  const canvasRef = useRef(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  const drawCaptcha = useCallback((code) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient - soft paper tint matching Zoho style
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#f0fdf4');
    bgGradient.addColorStop(0.5, '#f4fbf7');
    bgGradient.addColorStop(1, '#ecfdf5');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle noise lines (bezier curves)
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = ['#a7f3d0', '#86efac', '#6ee7b7', '#bbf7d0'][i % 4];
      ctx.beginPath();
      ctx.moveTo(Math.random() * (width / 4), Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        width - Math.random() * (width / 4),
        Math.random() * height
      );
      ctx.stroke();
    }

    // Scatter noise dots
    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = ['#34d399', '#10b981', '#059669', '#6ee7b7'][Math.floor(Math.random() * 4)];
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Distorted text with individual character rotation & distinct colors
    const charCount = code.length;
    const charSpacing = (width - 24) / charCount;

    const textColors = [
      '#047857', // emerald-700
      '#065f46', // emerald-800
      '#0f766e', // teal-700
      '#15803d', // green-700
      '#064e3b', // emerald-900
    ];

    for (let i = 0; i < charCount; i++) {
      const char = code[i];
      ctx.save();

      const x = 14 + i * charSpacing;
      const y = height / 2 + Math.random() * 6 - 3;
      const angle = (Math.random() * 28 - 14) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font = `bold ${Math.floor(Math.random() * 4 + 21)}px "Inter", "Courier New", monospace`;
      ctx.fillStyle = textColors[i % textColors.length];
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Optional fine strike line
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, height * 0.45);
    ctx.lineTo(width - 8, height * 0.55);
    ctx.stroke();
  }, []);

  const refreshCaptcha = useCallback(() => {
    setIsRotating(true);
    const newCode = generateCaptchaCode(6);
    setCaptchaCode(newCode);
    if (onCaptchaChange) {
      onCaptchaChange(newCode);
    }
    setTimeout(() => {
      drawCaptcha(newCode);
      setIsRotating(false);
    }, 150);
  }, [onCaptchaChange, drawCaptcha]);

  useEffect(() => {
    const initialCode = generateCaptchaCode(6);
    setCaptchaCode(initialCode);
    if (onCaptchaChange) {
      onCaptchaChange(initialCode);
    }
    // Small timeout to allow canvas mount
    const timer = setTimeout(() => {
      drawCaptcha(initialCode);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const speakCaptcha = () => {
    if ('speechSynthesis' in window && captchaCode) {
      const spelled = captchaCode.split('').join(' ');
      const utterance = new SpeechSynthesisUtterance(`Captcha characters are: ${spelled}`);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Distorted Captcha Canvas Box */}
      <div className="relative group rounded-lg overflow-hidden border border-emerald-300/80 bg-emerald-50/50 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={136}
          height={40}
          className="cursor-pointer block"
          onClick={refreshCaptcha}
          title="Click to refresh captcha"
        />
        <div className="absolute inset-0 border border-emerald-400/20 rounded-lg pointer-events-none" />
      </div>

      {/* Action Buttons: Refresh & Audio */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={refreshCaptcha}
          className="p-2 rounded-lg text-slate-500 hover:text-zoho-red hover:bg-slate-100 transition-colors border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-zoho-red/20"
          title="Get a new captcha code"
          aria-label="Refresh captcha"
        >
          <RotateCw className={`w-4 h-4 transition-transform duration-500 ${isRotating ? 'rotate-180 text-zoho-red' : ''}`} />
        </button>
        <button
          type="button"
          onClick={speakCaptcha}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-300"
          title="Listen to captcha"
          aria-label="Listen to captcha"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
