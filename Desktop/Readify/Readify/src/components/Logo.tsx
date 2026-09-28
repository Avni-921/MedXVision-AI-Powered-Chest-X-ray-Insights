import { cn } from '@/lib/utils';;

interface LogoProps {
    className?: string;
    variant?: 'default' | 'light';
    size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, variant = 'default', size = 'md' }: LogoProps) {
    const isLight = variant === 'light';

    const sizeClasses = {
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-10'
    };

    const textClasses = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl'
    };

    return (
        <div className={cn("flex items-center gap-2 font-serif font-bold select-none", className)}>
            <div className={cn("relative aspect-square flex items-center justify-center", sizeClasses[size])}>
                <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    {/* Vertical Spine / Stem of R */}
                    <path
                        d="M6 4C4.89543 4 4 4.89543 4 6V26C4 27.1046 4.89543 28 6 28H10C11.1046 28 12 27.1046 12 26V6C12 4.89543 11.1046 4 10 4H6Z"
                        className={isLight ? "fill-white/90" : "fill-primary"}
                    />

                    {/* Top Page (Bowl of R) */}
                    <path
                        d="M14 6H20C24.4183 6 28 9.58172 28 14C28 18.4183 24.4183 22 20 22H14V6Z"
                        className={isLight ? "fill-white/70" : "fill-primary/80"}
                    />

                    {/* Bottom Page (Leg of R) - Fanning out */}
                    <path
                        d="M16 22L24.5 28"
                        stroke={isLight ? "currentColor" : "currentColor"}
                        strokeWidth="4"
                        strokeLinecap="round"
                        className={isLight ? "text-secondary" : "text-secondary"}
                    />

                    {/* Page Detail Line inside Bowl (optional, keeps it clean without) */}
                </svg>
            </div>
            <span className={cn(
                "tracking-tight",
                textClasses[size],
                isLight ? "text-white" : "text-primary"
            )}>
                Readify
            </span>
        </div>
    );
}
