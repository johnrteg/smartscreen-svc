import React from "react";

export const Icon = ( { height = "24px", width = "24px", color = "black" } ) => (
<svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.5 21L12 18M14.5 21L16 18M6.5 21L8 18M8.8 15C6.14903 15 4 12.9466 4 10.4137C4 8.31435 5.6 6.375 8 6C8.75283 4.27403 10.5346 3 12.6127 3C15.2747 3 17.4504 4.99072 17.6 7.5C19.0127 8.09561 20 9.55741 20 11.1402C20 13.2719 18.2091 15 16 15L8.8 15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);