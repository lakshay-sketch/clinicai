// Generates a consistent, professional-looking avatar per doctor using
// DiceBear's free public API (no key needed, no copyright risk — it's
// algorithmically generated, not a real photo). Colored initials in our
// own brand palette, seeded by the doctor's name so it's stable across
// renders.

export function DoctorAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const seed = encodeURIComponent(name);
  const src = `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=12233d,1f6f6b,a8720a&backgroundType=solid&fontFamily=Georgia&fontWeight=600`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-full shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
