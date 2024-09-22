import * as React from "react";
//

//
import { Typography, Stack, Box, Button, IconButton} from '@mui/material';




//
import StringUtils from "../../../utils/StringUtils.js";
import AppData from "../../AppData.js";
import { getCalendarEndpoint } from "../../../api/getCalendarEndpoint.js";
import { netClient } from "../../../net/netClient.js";
import { Constants } from "../../../utils/Constants.js";

import MonthlyView from "./MonthlyView.js";


export interface CalendarConfig
{
    days : number;
}

export interface CalendarProps
{
    config  : CalendarConfig;
    warm    : boolean;
}

enum CalendarView
{
    MONTHLY = "monthly",
    WEEKLY  = "weekly",
}


//
//
//
export default function Calendar( props : CalendarProps ) : JSX.Element
{
    const [appdata,setAppData]          = React.useState< AppData >( AppData.instance() );

    //const [login, setLogin]             = React.useState<string>("");
    const [view, setView]               = React.useState<CalendarView>(CalendarView.MONTHLY);
    
    //
    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        //console.log("cal unloaded");
    }


    // ===============================================================================================
    return (
        <Stack direction={"column"} spacing={0} gap={0}>
            { view == CalendarView.MONTHLY ? <MonthlyView warm={props.warm} days={props.config.days} /> : null }
        </Stack>       
    );
    // ===============================================================================================
}

// eof