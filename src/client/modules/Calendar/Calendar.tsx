import * as React from "react";
//
import queryString from 'query-string';

//
import { Typography, Stack, Box, Button, IconButton} from '@mui/material';

import { Google as GoogleIcon } from '@mui/icons-material';
import { ArrowCircleLeftOutlined as ArrowCircleLeftOutlinedIcon } from '@mui/icons-material';
import { ArrowCircleRightOutlined as ArrowCircleRightOutlinedIcon } from '@mui/icons-material';


//
import StringUtils from "../../../utils/StringUtils.js";
import AppData from "../../AppData.js";
import { getCalendarEndpoint } from "../../../api/getCalendarEndpoint.js";
import { netClient } from "../../../net/netClient.js";
import { Constants } from "../../../utils/Constants.js";
import { getLoginGoogleEndpoint } from "../../../api/getLoginGoogleEndpoint.js";

import MonthlyView from "./MonthlyView.js";


export interface CalendarConfig
{
    days : number;
}

export interface CalendarProps
{
    config : CalendarConfig;
    warm : boolean;
}


//
//
//
export default function Calendar( props : CalendarProps ) : JSX.Element
{
    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );

    const [login, setLogin]       = React.useState<string>("");
    //const [seconds, setSeconds] = React.useState<string>("");
    //const [date,setDate]        = React.useState< string >( "" );
    //const [dow,setDow]          = React.useState< string >( "" );
    //const [ampm,setAmPm]        = React.useState< string >( "" );
    const [start_date, setStartDate]         = React.useState<Date>(null);

    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        console.log( "config", props.config );

        let today : Date = new Date();
        let start : Date = new Date( today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0 );
        setStartDate( start );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function refresh() : Promise<void>
    {
        const now : Date = new Date();
        const until : Date = new Date( now.getTime() + 30*Constants.DAYS_TO_MS );

        // AIzaSyB57DgYEFg8UT2jek_GQBKd07OTGPXpiIM
        // key: 251787141802-2kkgk02405mb3p0jslkogb7c6nec16ku.apps.googleusercontent.com
        // <iframe src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&bgcolor=%23ffffff&src=amxhanJ0QGdtYWlsLmNvbQ&src=ZW4udXNhI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%23cca300&color=%230B8043" style="border:solid 1px #777" width="800" height="600" frameborder="0" scrolling="no"></iframe>
        // https://calendar.google.com/calendar/ical/jlajrt%40gmail.com/private-26d71f3e1239d646f4cc2470477562b6/basic.ics

        const endpt : getCalendarEndpoint = new getCalendarEndpoint();
        endpt.request.address = "jlajrt@gmail.com";
        endpt.request.service = "google";
        endpt.request.start_date = now.toDateString();
        endpt.request.end_date = until.toDateString();

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt );
        if( reply.ok )
        {
            console.log("cal", reply.data );
            const data : getCalendarEndpoint.ReplyData = reply.data;

        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        console.log("cal unloaded");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onLogin() : void
    {
        console.log("login");
        googleLogin();
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onToday() : void
    {
        let today : Date = new Date();
        let start : Date = new Date( today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0 );
        setStartDate( start );
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onPrevious() : void
    {
        let prev : Date = new Date( start_date.getTime() - 1*Constants.DAYS_TO_MS );
        prev.setDate( 1 );
        setStartDate( prev );
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onNext() : void
    {
        let next : Date = new Date( start_date.getTime() + 32*Constants.DAYS_TO_MS );
        next.setDate( 1 );
        setStartDate( next );
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function googleLogin() : Promise<void>
    {
        /*
        let endpt : getLoginGoogleEndpoint = new getLoginGoogleEndpoint();
        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt );
        if( reply.ok )
        {
            console.log("login", reply.data );

        }
        */

        const params : string = queryString.stringify({
                        client_id: "251787141802-8lm7p0g9r8ph27lt54v0tjl0if521bjp.apps.googleusercontent.com",
                        redirect_uri: 'http://localhost:8080/auth/google',
                        scope: [
                        'https://www.googleapis.com/auth/userinfo.email',
                        'https://www.googleapis.com/auth/userinfo.profile',
                        'https://www.googleapis.com/auth/calendar.events'
                        ].join(' '), // space seperated string
                        response_type: 'code',
                        access_type: 'offline',
                        prompt: 'consent',
                    });

        const url : string = StringUtils.format( "https://accounts.google.com/o/oauth2/v2/auth?{0}", params );

        //setLogin( StringUtils.format("<iframe src=\"{0}\" width=\"100%\" height=\"300px\"></iframe>", url ) );
        //setLogin( url );

        var win = window.open( url, '_blank', "width=600,height=700,location=false" );
        win.focus();
    }

    // ===============================================================================================
    return (
        <Stack direction={"column"} spacing={0} gap={0}>
            <Stack direction={"row"} spacing={0} gap={0} justifyContent="center" alignItems="center">
                <Button variant="outlined" size="large" onClick={onLogin} startIcon={<GoogleIcon />} sx={{ width: "250px" }} >{"Google Login"}</Button>

                { props.warm ? <div>
                    <IconButton size="large" onClick={onPrevious}><ArrowCircleLeftOutlinedIcon /></IconButton>
                    <Button variant="outlined" color="primary" size="large" onClick={onToday} sx={{ width: "100px" }} >{"Today"}</Button>
                    <IconButton size="large" onClick={onNext}><ArrowCircleRightOutlinedIcon /></IconButton>
                </div> : null }
                
            </Stack>
            
            <MonthlyView start_date={start_date} days={props.config.days} />
        </Stack>       
    );
    // ===============================================================================================
}

// eof