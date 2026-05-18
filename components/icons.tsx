type IconProps = {
  size?: number;
  className?: string;
};

export function IconUploadCloud({ size = 64, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M44 39.5c4.8 0 8.5-3.8 8.5-8.5s-3.7-8.5-8.5-8.5c-.5 0-.9.04-1.4.12C40.9 18.6 36 15 30 15c-7.2 0-13 5.8-13 13 0 .3.02.7.05 1C14.2 30.2 10.5 34.7 10.5 40c0 3.9 3.1 7 7 7H44z"
        fill="#c1121f"
        fillOpacity="0.12"
        stroke="#c1121f"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="32"
        y1="51"
        x2="32"
        y2="33"
        stroke="#c1121f"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <polyline
        points="23,42 32,33 41,42"
        fill="none"
        stroke="#c1121f"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconFilm({ size = 48, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="5"
        y="9"
        width="38"
        height="30"
        rx="3.5"
        fill="#c1121f"
        fillOpacity="0.1"
        stroke="#c1121f"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <rect x="8"  y="9"  width="4.5" height="6" rx="1" fill="#c1121f" fillOpacity="0.25" />
      <rect x="16" y="9"  width="4.5" height="6" rx="1" fill="#c1121f" fillOpacity="0.25" />
      <rect x="24" y="9"  width="4.5" height="6" rx="1" fill="#c1121f" fillOpacity="0.25" />
      <rect x="32" y="9"  width="4.5" height="6" rx="1" fill="#c1121f" fillOpacity="0.25" />
      <rect x="8"  y="33" width="4.5" height="6" rx="1" fill="#c1121f" fillOpacity="0.25" />
      <rect x="16" y="33" width="4.5" height="6" rx="1" fill="#c1121f" fillOpacity="0.25" />
      <rect x="24" y="33" width="4.5" height="6" rx="1" fill="#c1121f" fillOpacity="0.25" />
      <rect x="32" y="33" width="4.5" height="6" rx="1" fill="#c1121f" fillOpacity="0.25" />
      <path
        d="M20 18.5L29 24L20 29.5V18.5Z"
        fill="#c1121f"
        fillOpacity="0.55"
      />
    </svg>
  );
}

export function IconCheck({ size = 56, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="28"
        cy="28"
        r="22"
        fill="#c1121f"
        fillOpacity="0.1"
        stroke="#c1121f"
        strokeWidth="2.2"
      />
      <path
        d="M17 28L24 35.5L39 20"
        stroke="#c1121f"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDownload({ size = 20, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 3v10M6 9l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
