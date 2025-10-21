import { IconProps } from "../utils/types";

const UsdtTrc20: React.FC<IconProps> = ({ size = 24, className = "" }) => {
    const svgSize = `${size}px`;

    return (
        <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Base circular exterior con sombra */}
            <circle cx="12" cy="12" r="11" fill="#26A17B" filter="url(#shadow)" />
            
            {/* Círculo interior con gradiente refinado */}
            <circle cx="12" cy="12" r="10" fill="url(#circleGradient)" />
            
            {/* T central mejorada */}
            <path
                d="M7.5 8.5h9M12 8v8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
            />
            
            {/* Efecto de brillo superior refinado */}
            <path
                d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5h-19A9.5 9.5 0 0 1 12 2.5z"
                fill="url(#shine)"
                opacity="0.15"
            />
            
            {/* Definición de efectos */}
            <defs>
                {/* Gradiente principal mejorado */}
                <linearGradient
                    id="circleGradient"
                    x1="12"
                    y1="2"
                    x2="12"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#53C4A3" />
                    <stop offset="0.5" stopColor="#26A17B" />
                    <stop offset="1" stopColor="#1A6E52" />
                </linearGradient>
                
                {/* Brillo superior refinado */}
                <linearGradient
                    id="shine"
                    x1="12"
                    y1="2"
                    x2="12"
                    y2="12"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="white" stopOpacity="0.8" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
                
                {/* Sombra exterior mejorada */}
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                    <feOffset dx="0" dy="1" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                
                {/* Resplandor suave para la T */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.2" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="1.5" />
                    </feComponentTransfer>
                </filter>
            </defs>
        </svg>
    );
};

export default UsdtTrc20;