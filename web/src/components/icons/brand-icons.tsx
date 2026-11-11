import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export function WhatsappIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M3.5 20.5l1.3-4.1A8.5 8.5 0 1 1 8 19.6z" />
      <path d="M9 8.6c.2-.5.5-.6.8-.6h.6c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c-.1.2-.1.4 0 .6.6 1 1.4 1.8 2.4 2.4.2.1.4.1.6 0l.6-.5c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.3.4.5v.6c0 .3-.1.6-.6.8-.8.4-1.9.5-3.4-.2a9 9 0 0 1-4-4c-.7-1.5-.6-2.6-.3-3.5z" />
    </svg>
  );
}

export function InstagramIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function TennisBallIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M5.2 6.8c2.6 1.4 4 3.3 4 5.2s-1.4 3.8-4 5.2" />
      <path d="M18.8 6.8c-2.6 1.4-4 3.3-4 5.2s1.4 3.8 4 5.2" />
    </svg>
  );
}
