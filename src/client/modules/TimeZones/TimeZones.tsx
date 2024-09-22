//
import * as React from "react";

//
import { Stack } from '@mui/material';
import TimeZone from "./TimeZone.js";
import { Constants } from "../../../utils/Constants.js";



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
    const [clock, setClock]         = React.useState< Date >( new Date() );
    const timer_id                  = React.useRef<NodeJS.Timeout>( null );


    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        setTimezones( props.config.tzs );

        // to make certain tz time changes on the whole minute with a 1 second buffer
        // 1 second buffer to account for any drift that might happen in the setTimeout call over
        // long periods of time
        const seconds_to_minute : number = 61 - clock.getSeconds();
        setTimeout( startClock, seconds_to_minute*1000 );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        //console.log("TimeZones unloaded");
        clearInterval( timer_id.current );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function startClock() : void
    {
        //console.log("startClock");
        updateClock();
        timer_id.current = setInterval( updateClock, Constants.MINUTES_TO_MS );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function updateClock() : void
    {
        //console.log("updateClock");
        setClock( new Date() );
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