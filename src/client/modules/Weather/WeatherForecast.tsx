import * as React from "react";

//
import { Typography, Stack, Box } from '@mui/material';

//
import AppData from "../../AppData.js";

import { netClient } from "../../../net/netClient.js";
import { Constants } from "../../../utils/Constants.js";

import { getWxForecastEndpoint } from "../../../api/getWxForecastEndpoint.js";

import Title from "../../widgets/Title.js";

// icons
import { WxIcon } from "./WxIcon.js";

enum Direction
{
    HORIZONTAL  = "horizontal",
    VERTICAL    = "vertical",
}

export interface WeatherForecastConfig
{
    location    : string;
    name        : string;
    units       : string;
    update_hours : number;
    direction   : Direction;
    days        : number;
    title       : boolean;
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

    const dow                       = React.useRef< Array<string> >( ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] );
    
    const [forecast, setForecast]   = React.useState< Array<getWxForecastEndpoint.Report> >( [] );

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
        const endpt : getWxForecastEndpoint = new getWxForecastEndpoint();
        endpt.request.location = props.config.location;
        endpt.request.units    = props.config.units as getWxForecastEndpoint.Units;
        endpt.request.days     = props.config.days;

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt, { cache: true, lifespan: 60 } ); // 60 minute force update
        if( reply.ok )
        {
            //console.log("wx forecast", reply.data );
            const data : getWxForecastEndpoint.ReplyData = reply.data;
            setForecast( data.reports ); 
        }

        setTimeout( refresh, appdata.nextUpdate( props.config.update_hours*Constants.HOURS_TO_MS ) );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function renderWx( day : getWxForecastEndpoint.Report, index : number ) : JSX.Element
    {
        let date : Date = new Date();
        date.setTime( ( day.date * 1000 ) + date.getTimezoneOffset()*Constants.MINUTES_TO_MS );
        //console.log("dt", day.date_str, day.date, date, date.getTimezoneOffset() );

        let elem : JSX.Element = 
            <Box key={ day.date } sx={ { display:'flex', justifyContent:'center', alignItems:'center' } } width={"80px"} >
                <Stack direction={"column"} spacing={0} gap={0.5} sx={ { display:'flex', justifyContent:'center',alignItems:'center'} } width={"100%"}>
                    <Typography component="div" color={"text.primary"}>{ index == 0 ? "Today" : dow.current[ date.getDay() ] }</Typography>
                    { WxIcon( day.conditions, 75 ) }
                    <Stack direction={"row"} spacing={0} gap={0} width={"100%"}>
                        <Typography component="div" color={"text.secondary"} sx={{ fontSize: 12, lineHeight:1.0, paddingTop:"4px" }}>{ Math.floor( day.min_temp ) + "°" }</Typography>
                        <Box sx={{ flexGrow: 1 }} ></Box>
                        <Typography component="div" color={"text.primary"} sx={{ fontSize: 18, lineHeight:1.0 }}>{ Math.ceil( day.max_temp ) + "°" }</Typography>
                    </Stack>
                </Stack>
            </Box>;
        return elem;
    }

    // ===============================================================================================
    return (
        <Stack direction={"column"} spacing={0} gap={0} width={"100%"}>
            { props.config.title ? <Title label={"Forecast: " + props.config.name } /> : null }
            <Stack direction={ props.config.direction == Direction.HORIZONTAL ? "row" : "column" } spacing={0} gap={5} >
                { forecast.map( ( day : getWxForecastEndpoint.Report, index : number ) => { return renderWx( day, index ) } ) }
            </Stack>
        </Stack>       
    );
    // ===============================================================================================
}

// eof