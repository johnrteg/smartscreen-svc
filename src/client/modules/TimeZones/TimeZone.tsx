import * as React from "react";

//
import { Typography, Stack, Box} from '@mui/material';
import StringUtils from "../../../utils/StringUtils.js";



export interface TimeZoneProps
{
    city : string;
    time : Date;
}


//
//
//
export default function TimeZone( props : TimeZoneProps ) : JSX.Element
{
    const [location, setLocation] = React.useState<string>("New York");
    const [clock, setClock]       = React.useState<string>("12:36 AM");
    const tz_offset               = React.useRef<number>(0);

    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( updateClock, [props.time] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        let parts : Array<string> = props.city.split('/');
        let locale : string = StringUtils.replaceAll( parts[1], "_", " " );
        setLocation( locale );

        updateClock();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function updateClock() : void
    {
        const utc : Date = new Date( props.time.toLocaleString('en', { timeZone: props.city }));
        //console.log( "updateClock ", props.city, props.time.toLocaleTimeString(), utc.toLocaleTimeString() );

        let hrs : number = utc.getHours() >= 12 ? utc.getHours()-12 : utc.getHours();
        if( hrs == 0 )hrs = 12;
        const fmt : string = StringUtils.format( "{0}:{1} {2}", hrs, StringUtils.leadingZero( utc.getMinutes(), 2 ), utc.getHours() >= 12 ? "PM" : "AM" )
        setClock( fmt );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        console.log("TimeZone unloaded");
    }

// align="right" textAlign={"right"} sx={{ fontSize: 24, lineHeight:1.0, paddingTop:"10px" }}
    // ===============================================================================================
    return (
        <Stack direction={"row"} spacing={0} gap={0} sx={{width:"100%", paddingTope:"5px"}}>
            <Box sx={{ width:"50%", paddingLeft: "10px" }} >
                <Typography sx={{ fontSize: 36, lineHeight:1.0 }} component="div" color="text.primary">{location}</Typography>
            </Box>
            <Box sx={{ width:"50%", display: 'flex', justifyContent: 'flex-end', paddingRight: "10px" }} >
                <Typography sx={{ fontSize: 36, lineHeight:1.0 }} component="div" color="text.primary">{clock}</Typography>
            </Box>
        </Stack>       
    );
    // ===============================================================================================
}

// eof