import React from "react";

export const Icon = ( { height = "24px", width = "24px", color = "black" } ) => (
<svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 11L10 16H15L12 21M6 16.4438C4.22194 15.5683 3 13.7502 3 11.6493C3 9.20008 4.8 6.9375 7.5 6.5C8.34694 4.48637 10.3514 3 12.6893 3C15.684 3 18.1317 5.32251 18.3 8.25C19.8893 8.94488 21 10.6503 21 12.4969C21 14.0582 20.206 15.4339 19 16.2417" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);