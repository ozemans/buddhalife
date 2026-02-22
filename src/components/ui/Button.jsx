const variants = {
  primary:
    'bg-saffron-500 hover:bg-saffron-600 active:bg-saffron-700 text-white shadow-md hover:shadow-lg',
  secondary:
    'border-2 border-saffron-500 text-saffron-400 hover:bg-saffron-500/10 active:bg-saffron-500/20',
  danger:
    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-md hover:shadow-lg',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-base rounded-lg',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  children,
  className = '',
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:ring-offset-2 focus:ring-offset-charcoal-900
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
        cursor-pointer select-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
