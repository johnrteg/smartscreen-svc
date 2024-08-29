import * as React from "react";

//
import { Typography, Stack } from '@mui/material';

import AppData from "../../AppData.js";

//
import { Constants } from "../../../utils/Constants.js";
import { netClient } from "../../../net/netClient.js";
import { getWxNowEndpoint } from "../../../api/getWxNowEndpoint.js";

//
import Wind from "./Wind.js";
import Humidity from "./Humidity.js";
import { WxIcon } from "./WxIcon.js";



//
export interface WeatherConfig
{
    location : string;
    name : string;
    units : string;
    update_hours : number;
}     

export interface WeatherProps
{
    config : WeatherConfig;
}


//
//
//
export default function Weather( props : WeatherProps ) : JSX.Element
{
    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );
    
    const [icon, setIcon]                       = React.useState<getWxNowEndpoint.Conditions>(getWxNowEndpoint.Conditions.CLEAR);
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
        //console.log("wx unloaded");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function refresh() : Promise<void>
    {
        const endpt : getWxNowEndpoint = new getWxNowEndpoint();
        endpt.request.location = props.config.location;
        endpt.request.units    = props.config.units as getWxNowEndpoint.Units;

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt, { cache: true, lifespan: 15 } ); // 15 minute force update
        if( reply.ok )
        {
            
            const data : getWxNowEndpoint.ReplyData = reply.data;
            //console.log("wx", data );

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

        }

        // google map key: AIzaSyAh7YwRm96CWF8eftoTrnvt1kfhNDYB7fY

        // throttle checks based on the time of day (5AM-9PM)
        setTimeout( refresh, appdata.nextUpdate( props.config.update_hours*Constants.HOURS_TO_MS ) );
    }

// 
    // ===============================================================================================
    return (
        <Stack direction={"column"} spacing={0} gap={0} width={"100%"}>
            <Stack direction={"row"} justifyContent="flex-start" spacing={1} width={"100%"}>
                { WxIcon( icon, 175, "white" ) }
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
        </Stack>       
    );
    // ===============================================================================================
}

// eof