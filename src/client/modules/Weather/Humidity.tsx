import * as React from "react";

//
import * as d3 from "d3";

//
import { Typography, Stack, SvgIcon } from '@mui/material';

export interface HumidityProps
{
    value       : number;
    size       : number;
}     


//
//
//
export default function Humidity( props : HumidityProps ) : JSX.Element
{
    //const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );
    
    //const [temperature, setTemperature]       = React.useState<string>("");
    //const [diff_temps, setDiffTemps]       = React.useState<boolean>(true);
    //const svg_container       = React.useRef< SVGSVGElement >(null);

    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        console.log("humidity unloaded");
    }

    function polarToCartesian(centerX : number , centerY : number, radius : number, angleInDegrees : number ) : any
    {
        var angleInRadians : number = (angleInDegrees-90) * Math.PI / 180.0;
      
        return {
          x: centerX + (radius * Math.cos(angleInRadians)),
          y: centerY + (radius * Math.sin(angleInRadians))
        };
      }

    function describeArc(x:number, y:number, radius:number, spread:number, startAngle:number, endAngle: number ) : string
    {
        var innerStart : any = polarToCartesian(x, y, radius, endAngle);
        var innerEnd   : any  = polarToCartesian(x, y, radius, startAngle);
        var outerStart : any  = polarToCartesian(x, y, radius + spread, endAngle);
        var outerEnd   : any    = polarToCartesian(x, y, radius + spread, startAngle);
    
        var largeArcFlag : string = endAngle - startAngle <= 180 ? "0" : "1";
    
        var d = [
            "M", outerStart.x, outerStart.y,
            "A", radius + spread, radius + spread, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
            "L", innerEnd.x, innerEnd.y, 
            "A", radius, radius, 0, largeArcFlag, 1, innerStart.x, innerStart.y, 
            "L", outerStart.x, outerStart.y, "Z"
        ].join(" ");
    
        return d;
    }

    let color : string = "white";
    if( props.value >= 30 && props.value <= 55 )
        color = "green";
    else if( props.value > 55 && props.value <= 75 )
        color = "yellow";
    else if( props.value > 75 )
        color = "red";

    // ===============================================================================================
    // note 359.9 is used for ring since 360 also is 0 and no ring would be shown
    return (
        <div>
            <svg width={props.size} height={props.size}>
                <g>
                    <path d={ describeArc(props.size/2,props.size/2,(props.size/2)-9, 6, 0, 359.9*(props.value/100)) } fill={color} fillOpacity={0.6} />
                    <circle stroke="white" cx={props.size/2} cy={props.size/2} r={(props.size/2)-2} strokeWidth={2} fillOpacity={0} ></circle> 
                    <text x="50%" y="30%" textAnchor="middle" fill="white" fontSize="10" strokeWidth="2px" dy=".3em">{"Humidity"}</text>
                    <text x="50%" y="60%" textAnchor="middle" fill="white" fontSize="20" strokeWidth="2px" dy=".3em">{props.value}{"%"}</text>
                </g>
            </svg>
        </div>       
    );
    // ===============================================================================================
}

// eof