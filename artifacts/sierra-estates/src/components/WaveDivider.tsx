interface WaveDividerProps {
  fromColor: string;
  toColor: string;
  flip?: boolean;
  height?: number;
}

export default function WaveDivider({ fromColor, toColor, flip = false, height = 72 }: WaveDividerProps) {
  return (
    <div style={{ background: fromColor, lineHeight: 0, marginBottom: -1 }}>
      <svg
        viewBox="0 0 1440 72"
        style={{ display: "block", width: "100%", height, transform: flip ? "scaleX(-1)" : undefined }}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,36 C180,72 360,0 540,36 C720,72 900,0 1080,36 C1260,72 1350,18 1440,36 L1440,72 L0,72 Z"
          fill={toColor}
        />
      </svg>
    </div>
  );
}
