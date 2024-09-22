//
import * as React from "react";


//
import { getWxNowEndpoint } from "../../../api/getWxNowEndpoint.js";


// icons
import { Icon as SnowIcon } from "./icons/SnowIcon.js";
import { Icon as CloudyAltIcon } from "./icons/CloudyAltIcon.js";

import { Icon as ThunderstormIcon } from "./icons/ThunderstormIcon.js";
import { Icon as ShowersIcon } from "./icons/ShowersIcon.js";
import { Icon as RainIcon } from "./icons/RainIcon.js";
import { Icon as FewCloudsIcon } from "./icons/FewCloudsIcon.js";
import { Icon as FogIcon } from "./icons/FogIcon.js";
import { Icon as SunIcon } from "./icons/SunAltIcon.js";
import { Icon as SleetIcon } from "./icons/SleetIcon.js";
import { Icon as DrizzleIcon } from "./icons/DrizzleIcon.js";
import { Icon as MistIcon } from "./icons/MistIcon.js";
import { Icon as WindIcon } from "./icons/WindIcon.js";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export function WxIcon( value : getWxNowEndpoint.Conditions, size : number, color : string = "white" ) : JSX.Element
{
    //console.log("Icon", value );
    switch( value )
    {
        case getWxNowEndpoint.Conditions.CLEAR              : return <SunIcon color={color} width={size+"px"} height={size+"px"} />; break;

        case getWxNowEndpoint.Conditions.PARTLY_ClOUDY      : return <FewCloudsIcon color={color} width={size+"px"} height={size+"px"} />; break;
        case getWxNowEndpoint.Conditions.CLOUDY             : return <CloudyAltIcon color={color} width={size+"px"} height={size+"px"} />; break;
        case getWxNowEndpoint.Conditions.OVERCAST           : return <CloudyAltIcon color={color} width={size+"px"} height={size+"px"} />; break;

        case getWxNowEndpoint.Conditions.MIST               : return <MistIcon color={color} width={size+"px"} height={size+"px"} />; break;
        case getWxNowEndpoint.Conditions.DRIZZLE            : return <DrizzleIcon color={color} width={size+"px"} height={size+"px"} />; break;            
        case getWxNowEndpoint.Conditions.SHOWERS            : return <ShowersIcon color={color} width={size+"px"} height={size+"px"} />; break;
        case getWxNowEndpoint.Conditions.RAIN               : return <RainIcon color={color} width={size+"px"} height={size+"px"} />; break;
        case getWxNowEndpoint.Conditions.THUNDERSTORM       : return <ThunderstormIcon color={color} width={size+"px"} height={size+"px"} />;break;

        case getWxNowEndpoint.Conditions.SNOW               : return <SnowIcon color={color} width={size+"px"} height={size+"px"} />; break;
        case getWxNowEndpoint.Conditions.SLEET              : return <SleetIcon color={color} width={size+"px"} height={size+"px"} />; break; 

        case getWxNowEndpoint.Conditions.FOG                : return <FogIcon color={color} width={size+"px"} height={size+"px"} />; break;
        case getWxNowEndpoint.Conditions.WIND               : return <WindIcon color={color} width={size+"px"} height={size+"px"} />; break;
        default : return <SunIcon color={color} width={size+"px"} height={size+"px"} />;
    }
    
}