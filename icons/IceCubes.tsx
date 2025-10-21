import { IconProps } from "../utils/types";

const UsdtTrc20: React.FC<IconProps> = ({ size = 24, className = "" }) => {
   const svgSize = `${size}px`;

   // Colors
   const mainColor = "#26A17B";
   const darkColor = "#1A6E52"; 
   const lightColor = "#53C4A3";

   return (
       <svg 
           width={svgSize}
           height={svgSize}
           viewBox="0 0 24 24"
           xmlns="http://www.w3.org/2000/svg"
           className={className}
       >
           <defs>
               <linearGradient
                   id="mainGradient"
                   x1="0%"
                   y1="0%"
                   x2="0%"
                   y2="100%"
                   gradientUnits="userSpaceOnUse"
               >
                   <stop offset="0%" stopColor={lightColor} />
                   <stop offset="50%" stopColor={mainColor} />
                   <stop offset="100%" stopColor={darkColor} />
               </linearGradient>

               <filter id="innerShadow">
                   <feOffset dx="0" dy="1" />
                   <feGaussianBlur stdDeviation="1" result="offset-blur" />
                   <feComposite
                       operator="out"
                       in="SourceGraphic"
                       in2="offset-blur"
                       result="inverse"
                   />
                   <feFlood floodColor="black" floodOpacity="0.2" result="color" />
                   <feComposite
                       operator="in"
                       in="color"
                       in2="inverse"
                       result="shadow"
                   />
                   <feComposite
                       operator="over"
                       in="shadow"
                       in2="SourceGraphic"
                   />
               </filter>
           </defs>
           
           {/* Base circle */}
           <circle 
               cx="12" 
               cy="12" 
               r="11.5" 
               fill="url(#mainGradient)"
               filter="url(#innerShadow)"
           />

           {/* USDT T Symbol */}
           <path
               d="M7.5 8.5h9M12 8v8"
               stroke="white"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
           />
       </svg>
   );
};

export default UsdtTrc20;