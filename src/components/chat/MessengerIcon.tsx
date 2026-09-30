import React from 'react';

interface MessengerIconProps {
  className?: string;
  size?: number;
}

export const MessengerIcon: React.FC<MessengerIconProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="messenger-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0078FF" />
          <stop offset="60%" stopColor="#00C6FF" />
          <stop offset="100%" stopColor="#A824FB" />
        </linearGradient>
      </defs>
      {/* Speech bubble */}
      <path
        d="M18 2C9.163 2 2 8.716 2 17c0 4.717 2.33 8.91 5.992 11.666V33.5a1 1 0 001.555.832L14.12 31.4A17.26 17.26 0 0018 32c8.837 0 16-6.716 16-15S26.837 2 18 2z"
        fill="url(#messenger-gradient)"
      />
      {/* Lightning bolt */}
      <path
        d="M9.8 19.8l5.8-6.2c.7-.7 1.9-.6 2.5.2l4.2 4.2c.4.4 1 .4 1.4-.1l5.5-5.9c.7-.7-.3-1.8-1.2-1.3l-5.8 3.5c-.7.4-1.6.4-2.2-.2l-4.2-4.2c-.7-.7-1.9-.6-2.5.2L7.5 16.3c-.6.8.4 1.9 1.3 1.5l1-.5v2.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
};
