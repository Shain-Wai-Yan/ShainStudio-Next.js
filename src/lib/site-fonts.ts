import {Inter, Playfair_Display} from 'next/font/google';
// These faces cover Latin. Explicit local CJK fallbacks render Chinese without
// another font download; their metrics remain platform-specific.
export const inter=Inter({subsets:['latin'],variable:'--font-sans',display:'swap',fallback:['PingFang SC','Microsoft YaHei','Noto Sans CJK SC','sans-serif']});
export const playfair=Playfair_Display({subsets:['latin'],variable:'--font-serif',display:'swap',fallback:['Songti SC','SimSun','Noto Serif CJK SC','serif']});
