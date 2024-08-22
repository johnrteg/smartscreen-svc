import * as React from "react";

//
import { Typography, Stack, SvgIcon } from '@mui/material';
import AppData from "../../AppData.js";
import { getWxForecastEndpoint } from "../../../api/getWxForecastEndpoint.js";
import { netClient } from "../../../net/netClient.js";

import Wind from "./Wind.js";
import Humidity from "./Humidity.js";


// icons
import { Icon as CloudIcon } from "./icons/CloudIcon.js";
import { Icon as SnowIcon } from "./icons/SnowIcon.js";
import { Icon as ScatteredCloudsIcon } from "./icons/ScatteredCloudsIcon.js";
import { Icon as ThunderstormIcon } from "./icons/ThunderstormIcon.js";
import { Icon as ShowersIcon } from "./icons/ShowersIcon.js";
import { Icon as RainIcon } from "./icons/RainIcon.js";
import { Icon as FewCloudsIcon } from "./icons/FewCloudsIcon.js";
import { Icon as FogIcon } from "./icons/FogIcon.js";
import { Icon as SunIcon } from "./icons/SunIcon.js";
import { Constants } from "../../../utils/Constants.js";


export interface WeatherForecastConfig
{
    lat : number;
    lon : number;
    name : string;
    units : string;
    update : number;
    days : number;
}     

export interface WeatherForecastProps
{
    config : WeatherForecastConfig;
}


//
//
//
export default function WeatherForecast( props : WeatherForecastProps ) : JSX.Element
{
    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );
    
    const [icon, setIcon]                       = React.useState<getWxForecastEndpoint.Conditions>(getWxForecastEndpoint.Conditions.CLEAR);
    const [temperature, setTemperature]         = React.useState<string>("");
    const [feels_like, setFeelsLike]            = React.useState<string>("");
    const [diff_temps, setDiffTemps]            = React.useState<boolean>(true);
    const [wind_speed, setWindSpeed]            = React.useState<number>(0);
    const [wind_gust, setWindGust]              = React.useState<number>(0);
    const [wind_direction, setWindDirection]    = React.useState<number>(0);
    const [humidity, setHumidity]               = React.useState<number>(0);

    //
    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        refresh();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        console.log("wx unloaded");
    }

    /*
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function Icon( value : getWxEndpoint.Conditions, size : number, color : string = "white" ) : JSX.Element
    {
        console.log("Icon", value );
        switch( value )
        {
            case getWxEndpoint.Conditions.CLEAR             : return <SunIcon color={color} width={size+"px"} height={size+"px"} />; break;
            case getWxEndpoint.Conditions.FEW_ClOUDS        : return <FewCloudsIcon color={color} width={size+"px"} height={size+"px"} />; break;
            case getWxEndpoint.Conditions.SCATTERED_ClOUDS  : return <ScatteredCloudsIcon color={color} width={size+"px"} height={size+"px"} />; break;
            case getWxEndpoint.Conditions.BROKEN_ClOUDS     : return <CloudIcon color={color} width={size+"px"} height={size+"px"} />; break;
            case getWxEndpoint.Conditions.SHOWWERS          : return <ShowersIcon color={color} width={size+"px"} height={size+"px"} />; break;
            case getWxEndpoint.Conditions.RAIN              : return <RainIcon color={color} width={size+"px"} height={size+"px"} />; break;
            case getWxEndpoint.Conditions.THUNDERSTORM      : return <ThunderstormIcon color={color} width={size+"px"} height={size+"px"} />;break;
            case getWxEndpoint.Conditions.SNOW              : return <SnowIcon color={color} width={size+"px"} height={size+"px"} />; break;
            case getWxEndpoint.Conditions.MIST              : return <FogIcon color={color} width={size+"px"} height={size+"px"} />; break;
            default : return <SunIcon color={color} width={size+"px"} height={size+"px"} />;
        }
        
    }
        */

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function refresh() : Promise<void>
    {
        const endpt : getWxForecastEndpoint = new getWxForecastEndpoint();
        endpt.request.lat   = props.config.lat;
        endpt.request.lon   = props.config.lon;
        endpt.request.units = props.config.units as getWxForecastEndpoint.Units;
        endpt.request.days  = props.config.days;

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt, { cache: true, lifespan: 15 } ); // 15 minute force update
        if( reply.ok )
        {
            console.log("wx", reply.data );
            const data : getWxForecastEndpoint.ReplyData = reply.data;

            /*
            const temp : number = Math.ceil( data.reports[0].temperature );
            const like : number = Math.ceil( data.reports[0].feels_like );

            setTemperature( temp.toString() + "°" );
            setFeelsLike( like.toString() + "°" );
            setDiffTemps( Math.abs( temp - like ) > 2 );        // shoe feels like if temps are more than 2 degrees
            setIcon( data.reports[0].conditions );
            setWindSpeed( Math.ceil( data.reports[0].wind.speed ) );
            setWindGust( Math.ceil( data.reports[0].wind.gust ) );
            setWindDirection( data.reports[0].wind.direction );
            setHumidity( data.reports[0].humidity );

            setTimeout( refresh, 0.25*Constants.HOURS_TO_MS );
            */
        }
    }

// 
/*
<Stack direction={"row"} justifyContent="flex-start" spacing={1} width={"100%"}>
                { Icon( icon, 175, "white" ) }
                <Stack direction={"column"} alignContent="center" spacing={1}>
                    <Typography sx={{ fontSize: 87, lineHeight:1.0 }} component="div" color="text.primary">{temperature}</Typography>
                    { diff_temps ? <Typography sx={{ fontSize: 20, lineHeight:1.0 }} component="div" color="text.secondary">Feels Like</Typography> : null }
                    { diff_temps ? <Typography sx={{ fontSize: 40, lineHeight:1.0 }} component="div" color="text.secondary">{feels_like}</Typography> : null }
                </Stack>
                
            </Stack>
            <Stack direction={"row"} alignContent="flex-start" spacing={1} width={"100%"}>
                { wind_speed > 0 || wind_gust > 0 ? <Wind size={75} minSpeed={wind_speed} maxSpeed={wind_gust} direction={wind_direction} units={"MPH"}/> : null }
                <Humidity size={75} value={humidity} />
            </Stack>
*/
    // ===============================================================================================
    return (
        <Stack direction={"column"} spacing={0} gap={0} width={"100%"}>
            Forecast
        </Stack>       
    );
    // ===============================================================================================
}

// eof