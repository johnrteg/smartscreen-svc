import * as React from "react";

//
import { Typography, Stack, Box } from '@mui/material';
import StringUtils from "../../../utils/StringUtils.js";


export interface ClockConfig
{
    date : "MD" | "DM";
    seconds : boolean;
}

export interface ClockProps
{
    config : ClockConfig;
}


//
//
//
export default function Clock( props : ClockProps ) : JSX.Element
{
    const [time, setTime]       = React.useState<string>("");
    const [seconds, setSeconds] = React.useState<string>("");
    const [date,setDate]        = React.useState< string >( "" );
    const [dow,setDow]          = React.useState< string >( "" );
    const [ampm,setAmPm]        = React.useState< string >( "" );

    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        update();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function update() : void
    {
        const dows   : Array<string> = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months : Array<string> = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        
        const now   : Date = new Date();
        const hours : number = now.getHours() > 12 ? now.getHours()-12 : now.getHours();
        
        setTime( hours + ":" + StringUtils.leadingZero( now.getMinutes(), 2 ) );

        if( props.config.seconds )setSeconds( ":" + StringUtils.leadingZero( now.getSeconds(), 2 ) );
        //setDate( months[ now.getMonth() ] + " " + now.getDate() );

        let display_date : string = months[ now.getMonth() ] + " " + now.getDate();
        if( props.config.date == "DM" )display_date = now.getDate() + " " + months[ now.getMonth() ];
        setDow( dows[ now.getDay() ] +  ", " + display_date  );

        setSeconds( ":" + StringUtils.leadingZero( now.getSeconds(), 2 ) );
        //setDate( months[ now.getMonth() -1 ] + " " + now.getDate() );
        //setDow( dows[ now.getDay() ] );
        setAmPm( now.getHours() >= 12 ? "PM" : "AM" );

        setTimeout( update, 1000 );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        //console.log("clock unloaded");
    }

// 
    // ===============================================================================================
    return (
        <Stack direction={"column"} spacing={0} gap={0}>
            <Stack direction={"row"} justifyContent="flex-start" spacing={1}>
                <Typography sx={{ fontSize: 175, lineHeight:1.0 }} component="div" color="text.primary">{time}</Typography>
                <Stack direction={"column"} justifyContent="flex-start" spacing={3}>
                    <Typography sx={{ fontSize: 34, lineHeight:1.0, paddingTop:"65px" }} component="div" color="text.secondary">{seconds}</Typography>
                    <Typography sx={{ fontSize: 34, lineHeight:1.0 }} component="div" color="text.secondary">{ampm}</Typography>
                </Stack>  
            </Stack>
            <Stack direction={"row"} justifyContent="flex-start" spacing={0} width={"100%"}>
                <Typography align="center" sx={{ fontSize: 42, lineHeight:1.0 }} color="text.secondary" gutterBottom>{dow}</Typography>
            </Stack>
        </Stack>       
    );
    // ===============================================================================================
}

// eof