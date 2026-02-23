const variants = {
  primary:
    'bg-header-bg text-white active:brightness-90',
  secondary:
    'bg-button-bg text-text-primary border border-button-border active:bg-[#E5E5EA]',
  danger:
    'bg-accent-negative text-white active:brightness-90',
};

const sizes = {
  sm: 'min-h-[40px] px-4 py-2 text-sm',
  md: 'min-h-[48px] px-5 py-3 text-base',
  lg: 'min-h-[56px] px-6 py-3.5 text-lg',
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
        w-full flex items-center justify-center
        font-medium rounded-xl
        transition-transform duration-150 ease-out
        active:scale-[0.97]
        focus:outline-none focus:ring-2 focus:ring-header-bg/40 focus:ring-offset-2 focus:ring-offset-white
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
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
