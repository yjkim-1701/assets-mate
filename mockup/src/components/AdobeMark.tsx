/** App mark: `public/logo.svg` (붉은 배경 아이콘) */
export function AdobeMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      decoding="async"
      style={{
        display: 'block',
        flexShrink: 0,
        objectFit: 'contain',
      }}
      aria-hidden
    />
  );
}
