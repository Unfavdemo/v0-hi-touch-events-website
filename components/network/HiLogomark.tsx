import { cn } from "@/lib/network/utils";

/** Official HiTouch "Hi" logomark — serif H with the right stem as a dotted i. */
export function HiLogomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 729 960"
      className={cn("overflow-visible", className)}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* tittle of the i */}
      <circle cx="555" cy="97" r="97" />
      {/* left top serif */}
      <rect x="0" y="138" width="349" height="58" />
      {/* left stem */}
      <rect x="98" y="196" width="154" height="700" />
      {/* left bottom serif */}
      <rect x="0" y="896" width="349" height="64" />
      {/* crossbar */}
      <rect x="98" y="500" width="534" height="100" />
      {/* right stem with concave cradle under the tittle */}
      <path d="M477 300C477 268 512 241 555 241s78 27 78 59v596H477V300Z" />
      {/* right bottom serif */}
      <rect x="380" y="896" width="349" height="64" />
    </svg>
  );
}
