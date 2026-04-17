import { Button, type ButtonProps } from '@react-spectrum/s2';

/** Spectrum accent-600 fill (기본 accent 버튼은 accent-900). 스타일은 index.css `.s2-accent-fill-600` */
export function AccentButton({ UNSAFE_className, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      variant="accent"
      UNSAFE_className={[UNSAFE_className, 's2-accent-fill-600'].filter(Boolean).join(' ')}
    />
  );
}
