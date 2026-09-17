interface MaxLogoProps {
  size?: number
  className?: string
  /** App icon on gradient tile, or plain mark */
  variant?: 'app' | 'mark'
}

/** Official MAX messenger mark (speech-bubble outline). */
export function MaxLogo({
  size = 48,
  className = '',
  variant = 'app',
}: MaxLogoProps) {
  const gradientId = `max-grad-${size}-${variant}`

  if (variant === 'mark') {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 720 720"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#471AFF" />
            <stop offset="55%" stopColor="#6E1AFF" />
            <stop offset="100%" stopColor="#9500FF" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gradientId})`}
          d="M350.4,9.6C141.8,20.5,4.1,184.1,12.8,390.4c3.8,90.3,40.1,168,48.7,253.7,2.2,22.2-4.2,49.6,21.4,59.3,31.5,11.9,79.8-8.1,106.2-26.4,9-6.1,17.6-13.2,24.2-22,27.3,18.1,53.2,35.6,85.7,43.4,143.1,34.3,299.9-44.2,369.6-170.3C799.6,291.2,622.5-4.6,350.4,9.6h0ZM269.4,504c-11.3,8.8-22.2,20.8-34.7,27.7-18.1,9.7-23.7-.4-30.5-16.4-21.4-50.9-24-137.6-11.5-190.9,16.8-72.5,72.9-136.3,150-143.1,78-6.9,150.4,32.7,183.1,104.2,72.4,159.1-112.9,316.2-256.4,218.6h0Z"
        />
      </svg>
    )
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="8%" y1="0%" x2="92%" y2="100%">
          <stop offset="0%" stopColor="#471AFF" />
          <stop offset="45%" stopColor="#6E1AFF" />
          <stop offset="100%" stopColor="#9500FF" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
      <g transform="translate(8 8) scale(0.0667)">
        <path
          fill="#fff"
          d="M350.4,9.6C141.8,20.5,4.1,184.1,12.8,390.4c3.8,90.3,40.1,168,48.7,253.7,2.2,22.2-4.2,49.6,21.4,59.3,31.5,11.9,79.8-8.1,106.2-26.4,9-6.1,17.6-13.2,24.2-22,27.3,18.1,53.2,35.6,85.7,43.4,143.1,34.3,299.9-44.2,369.6-170.3C799.6,291.2,622.5-4.6,350.4,9.6h0ZM269.4,504c-11.3,8.8-22.2,20.8-34.7,27.7-18.1,9.7-23.7-.4-30.5-16.4-21.4-50.9-24-137.6-11.5-190.9,16.8-72.5,72.9-136.3,150-143.1,78-6.9,150.4,32.7,183.1,104.2,72.4,159.1-112.9,316.2-256.4,218.6h0Z"
        />
      </g>
    </svg>
  )
}
