import * as React from "react";

//
import { Typography, Stack, Box, Tab, Tabs, AppBar, CardContent, Grid} from '@mui/material';
import StringUtils from "../../../utils/StringUtils.js";
import TimeZone from "./TimeZone.js";



export interface TimeZonesProps
{
    config : any;
}


//
//
//
export default function TimeZones( props : TimeZonesProps ) : JSX.Element
{
    const [tzs, setTimezones]       = React.useState< Array<string> >( [] );
    const [clock, setClock]       = React.useState< Date >( new Date() );


    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        //const zones : Array<string> = ["America/New_York","Europe/Paris","America/Denver","America/Los_Angeles","Pacific/Honolulu"];
        setTimezones( props.config.tzs );

        // to make certain tz time changes on the whole minute with a 1 second buffer
        // 1 second buffer to account for any drift that might happen in the setTimeout call over
        // long periods of time
        const seconds_to_minute : number = 61 - clock.getSeconds();
        setTimeout( updateClock, seconds_to_minute*1000 );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        console.log("TimeZones unloaded");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function updateClock() : void
    {
        setClock( new Date() );
        setTimeout( updateClock, 30000 );
    }


    // ===============================================================================================
    return (
        <Stack direction={"column"} spacing={0} gap={1}>
            { tzs.map( (tz:string, index: number) => { return <TimeZone key={tz} city={tz} time={clock} /> } ) }
        </Stack>       
    );
    // ===============================================================================================
}

// eof