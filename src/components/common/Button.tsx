
const Button = ({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false , type='button'} : {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void | Promise<any>;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    }) => {
        const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
        const variants = {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
            secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
            danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
        };
        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base'
        };

    return (
        <button
        onClick={onClick}
        disabled={disabled}
        type={type}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
        {children}
        </button>
    );
};

export default Button;
