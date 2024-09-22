//
import * as React from "react";

import StringUtils from "../../../utils/StringUtils.js";

export interface WindProps
{
    minSpeed       : number;
    maxSpeed       : number;
    direction   : number;
    size       : number;
    units : string;
}     


//
//
//
export default function Wind( props : WindProps ) : JSX.Element
{
    //const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );
    
    //const [temperature, setTemperature]       = React.useState<string>("");
    //const [diff_temps, setDiffTemps]       = React.useState<boolean>(true);
    const svg_container       = React.useRef< SVGSVGElement >(null);

    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        console.log("wx unloaded");
    }

    

    //                 <text stroke="white" fontSize="16">{"MPH"}</text>

    let speed : string = props.minSpeed + "-" + props.maxSpeed;
    if( props.minSpeed == props.maxSpeed || props.maxSpeed == 0 )speed = props.minSpeed.toString();

    const arrow : Array<string> = [ ((props.size/2)-5)+",0", ((props.size/2)+5)+",0", ((props.size/2))+",15" ];
    const tranform : string = StringUtils.format( "rotate({0} {1} {2})", props.direction, (props.size/2), (props.size/2) );

    // ===============================================================================================
    return (
        <div>
            <svg width={props.size} height={props.size}>
                <g>
                    <circle stroke="white" cx={props.size/2} cy={props.size/2} r={(props.size/2)-2} strokeWidth={2} fillOpacity={0} ></circle> 
                    <text x="50%" y="25%" textAnchor="middle" fill="white" fontSize="10" strokeWidth="2px" dy=".3em">Wind</text>
                    <text x="50%" y="50%" textAnchor="middle" fill="white" fontSize="20" strokeWidth="2px" dy=".3em">{speed}</text>
                    <text x="50%" y="75%" textAnchor="middle" fill="white" fontSize="10" strokeWidth="2px" dy=".3em">{props.units}</text>
                    <polygon points={arrow.join(" ")} fill="white" transform={tranform} />
                    
                </g>
            </svg>
        </div>       
    );
    // ===============================================================================================
}

// eof