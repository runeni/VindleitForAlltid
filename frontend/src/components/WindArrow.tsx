/** Renders a wind direction arrow rotated to point in the direction the wind is coming FROM. */
interface WindArrowProps {
  degrees: number;
  size?: number;
}

export function WindArrow({ degrees, size = 18 }: WindArrowProps) {
  // Arrow points downward (↓) = wind from north (0°).
  // We rotate by the wind-from-direction degrees.
  return (
    <span
      title={`${Math.round(degrees)}°`}
      style={{ display: 'inline-block', transform: `rotate(${degrees}deg)`, fontSize: size }}
      aria-label={`Wind from ${Math.round(degrees)}°`}
    >
      ↓
    </span>
  );
}
