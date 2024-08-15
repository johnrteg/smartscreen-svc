import * as React from "react";

//
import { Typography, Stack, Box, Tab, Tabs, AppBar, CardContent, Grid} from '@mui/material';
import StringUtils from "../../../utils/StringUtils.js";
import TimeZone from "./TimeZone.js";



export interface TimeZonesProps
{
}


//
//
//
export default function TimeZones( props : TimeZonesProps ) : JSX.Element
{
    //const [time, setTime]       = React.useState<string>("");


    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        console.log("TimeZones unloaded");
    }

// 
    // ===============================================================================================
    return (
        <Stack direction={"column"} spacing={0} gap={0}>
            <TimeZone city="America/New_York" />
            <TimeZone city="Europe/Paris" />
            <TimeZone city="America/Denver" />
            <TimeZone city="America/Los_Angeles" />
            <TimeZone city="Pacific/Honolulu" />
        </Stack>       
    );
    // ===============================================================================================
}

// eof