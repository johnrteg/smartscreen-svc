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
//import { getLoginGoogleEndpoint } from "../../../api/getLoginGoogleEndpoint.js";

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

    const [login, setLogin]             = React.useState<string>("");
    const [view, setView]               = React.useState<CalendarView>(CalendarView.MONTHLY);
    const [events, setEvents]           = React.useState< Array<getCalendarEndpoint.Event> >([]);
    

    const oauth_window                  = React.useRef<Window>(null);
    const oauth_timer_id                = React.useRef<NodeJS.Timeout>(null);

    const [start_date, setStartDate]    = React.useState<Date>(null);

    //
    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );
    React.useEffect( onStartChange, [start_date] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        //console.log( "config", props.config );
        let today : Date = new Date();
        let start : Date = new Date( today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0 );
        setStartDate( start );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        //console.log("cal unloaded");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onLogin() : void
    {
        googleLogin();
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onToday() : void
    {
        let today : Date = new Date();
        today.setHours( 0, 0, 0, 0 )
        setStartDate( today );
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
        const params : string = queryString.stringify({
                        client_id: "1067509946324-up5h3eqksr1hkihtb1ujte4h4i93iutj.apps.googleusercontent.com",
                        redirect_uri: 'http://localhost:8080/auth/google',
                        scope: [
                        'https://www.googleapis.com/auth/userinfo.email',
                        'https://www.googleapis.com/auth/userinfo.profile',
                        'https://www.googleapis.com/auth/calendar.events'
                        ].join(' '), // space seperated string
                        response_type: 'code', // 'token', // code
                        include_granted_scopes: true,
                        access_type: 'offline',
                        prompt: 'consent',
                    });

        const url : string = StringUtils.format( "https://accounts.google.com/o/oauth2/v2/auth?{0}", params );

        oauth_window.current = window.open( url, '_blank', "width=600,height=750,top=100,left=100,location=false" );
        oauth_window.current.focus();
        //oauth_window.current.onclose = onClose;

        // add timer to capture exit
        oauth_timer_id.current = setInterval( onCheckWindow, 500 );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onCheckWindow() : void
    {
        try
        {
            //console.log("auth change", oauth_window.current.location );
            if( oauth_window.current.location.host === "localhost:8080" )
            {
                clearInterval( oauth_timer_id.current );
                oauth_timer_id.current  = null;
                oauth_window.current.close();
            }
        }
        catch( err: any )
        {
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onClose( event : any ) : void
    {
        if( oauth_timer_id.current )clearInterval( oauth_timer_id.current );
        oauth_timer_id.current  = null;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onStartChange() : void
    {
        console.log("onStartChange", start_date );
        getEvents();
    }

    ////////////////////////////////////////////////////////////////////////////
    async function getEvents() : Promise<void>
    {
        if( start_date == null )return;

        let end_date : Date = new Date( start_date.getTime() + 30*Constants.DAYS_TO_MS );

        const endpt : getCalendarEndpoint = new getCalendarEndpoint();
        endpt.request.start_date = start_date.toISOString();
        endpt.request.end_date   = end_date.toISOString();

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt, { cache: true, lifespan: 15 } ); // 15 minute force update
        if( reply.ok )
        {
            const data : getCalendarEndpoint.ReplyData = reply.data;
            console.log("event", data );

            // convert here...
            setEvents( data.events );
        }
    }



    // ===============================================================================================
    return (
        <Stack direction={"column"} spacing={0} gap={0}>
            <Stack direction={"row"} spacing={0} gap={0} justifyContent="center" alignItems="center">
                <Button variant="outlined" size="large" onClick={onLogin} startIcon={<GoogleIcon />} sx={{ width: "275px" }} >{"Sign in with Google"}</Button>

                { props.warm ? <div>
                    <IconButton size="large" onClick={onPrevious}><ArrowCircleLeftOutlinedIcon /></IconButton>
                    <Button variant="outlined" color="primary" size="large" onClick={onToday} sx={{ width: "100px" }} >{"Today"}</Button>
                    <IconButton size="large" onClick={onNext}><ArrowCircleRightOutlinedIcon /></IconButton>
                </div> : null }
                
            </Stack>
            
            { view == CalendarView.MONTHLY ? <MonthlyView start_date={start_date} days={props.config.days} events={events} /> : null }
        </Stack>       
    );
    // ===============================================================================================
}

// eof