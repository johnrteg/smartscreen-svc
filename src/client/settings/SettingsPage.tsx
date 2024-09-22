import * as React from "react";
import queryString from 'query-string';

import { SketchPicker } from 'react-color';

//
import { Stack, Typography, IconButton, Button, Card, List, ListItem, ListItemButton, ListItemIcon, Checkbox, ListItemText } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Google as GoogleIcon } from '@mui/icons-material';

import { Icon as CircleIcon } from "../modules/calendar/icons/CircleIcon.js";
import { CheckCircleOutline as CheckCircleOutlineIcon } from '@mui/icons-material';

import { getSettingsEndpoint } from "../../api/getSettingsEndpoint.js";
import { getCalendarIdsEndpoint } from "../../api/getCalendarIdsEndpoint.js";
import { putSettingsEndpoint } from "../../api/putSettingsEndpoint.js";

import { netClient } from "../../net/netClient.js";
import StringUtils from "../../utils/StringUtils.js";

//
import AppData          from "../AppData.js";
import TextInput        from "../widgets/TextInput.js";
import TimezoneInput    from "../widgets/TimezoneInput.js";
import SelectInput      from "../widgets/SelectInput.js";
import SliderInput      from "../widgets/SliderInput.js";
import SnackAlert      from "../widgets/SnackAlert.js";



import PersonColor      from "./PersonColor.js";





export interface SettingsPageProps
{
    onClose : () => void;
}


//
//
//
export default function SettingsPage( props : SettingsPageProps ) : JSX.Element
{
    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );

    const [device_id, setDeviceId]                      = React.useState<string>("");
    const [device_name, setDeviceName]                  = React.useState<string>("");

    const [location_address, setLocationAddress]        = React.useState<string>("");
    const [location_tz, setLocationTimezone]            = React.useState<string>("America/New_York");

    const [background_image, setBackgroundImage]        = React.useState<string>("");
    const [background_color, setBackgroundColor]        = React.useState<string>("#121212");
    const [background_color_picker, setBackgroundColorPicker]        = React.useState<boolean>(false);
    const [background_opacity, setBackgroundOpacity]    = React.useState<number|number[]>(100);

    const [calendar_start_dow, setStartDow]             = React.useState<number>(0);
    const [calendar_avail_ids, setCalendarAvailIds]     = React.useState< Array<getCalendarIdsEndpoint.Calendar> >([]);
    const [calendar_ids, setCalendarIds]                = React.useState< Array<string> >([]);

    const [event_duration, setEventDuration]            = React.useState<number>(30);
    const [event_dim_past, setEventDimPast]             = React.useState<number>(0);

    

    const [person_1, setPerson1]         = React.useState<string>("");
    const [person_2, setPerson2]         = React.useState<string>("");
    const [person_3, setPerson3]         = React.useState<string>("");
    const [person_4, setPerson4]         = React.useState<string>("");
    const [person_5, setPerson5]         = React.useState<string>("");
    const [person_6, setPerson6]         = React.useState<string>("");
    const [person_7, setPerson7]         = React.useState<string>("");
    const [person_8, setPerson8]         = React.useState<string>("");
    const [person_9, setPerson9]         = React.useState<string>("");
    const [person_10, setPerson10]       = React.useState<string>("");
    const [person_11, setPerson11]       = React.useState<string>("");

    const [uom, setUom]                  = React.useState< getSettingsEndpoint.UnitsOfMeasure >( getSettingsEndpoint.UnitsOfMeasure.STANDARD );

    const [show_snack, showSnack]        = React.useState<boolean>(false);

    const sectionGap                     = React.useRef<number>(3);

    const oauth_window                   = React.useRef<Window>(null);
    const oauth_timer_id                 = React.useRef<NodeJS.Timeout>(null);

    const loading                 = React.useRef<boolean>(true);

    //
    React.useEffect( onSave, [  location_tz,
                                calendar_ids, calendar_start_dow,
                                event_duration, event_dim_past,
                                background_image, background_opacity,
                                uom
                            ] );
    React.useEffect( () => pageLoaded(), [] );
        
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        getCalIds();

        setDeviceId( appdata.settings.device.id );
        setDeviceName( appdata.settings.device.name );

        setLocationAddress( appdata.settings.location.address );
        setLocationTimezone( appdata.settings.location.timezone );

        setBackgroundColor( appdata.settings.background.color );
        setBackgroundImage( appdata.settings.background.image_url );
        setBackgroundOpacity( appdata.settings.background.opacity );

        setStartDow( appdata.settings.calendar.start_dow );

        setEventDuration( appdata.settings.events.default_duration );
        setEventDimPast( appdata.settings.events.dim_past ? 1 : 0 );

        if( appdata.settings.persons.length > 0 )
        {
            setPerson1( appdata.settings.persons[0] ? appdata.settings.persons[0].name : "" );
            setPerson2( appdata.settings.persons[1] ? appdata.settings.persons[1].name : "" );
            setPerson3( appdata.settings.persons[2] ? appdata.settings.persons[2].name : "" );
            setPerson4( appdata.settings.persons[3] ? appdata.settings.persons[3].name : "" );
            setPerson5( appdata.settings.persons[4] ? appdata.settings.persons[4].name : "" );
            setPerson6( appdata.settings.persons[5] ? appdata.settings.persons[5].name : "" );
            setPerson7( appdata.settings.persons[6] ? appdata.settings.persons[6].name : "" );
            setPerson8( appdata.settings.persons[7] ? appdata.settings.persons[7].name : "" );
            setPerson9( appdata.settings.persons[8] ? appdata.settings.persons[8].name : "" );
            setPerson10( appdata.settings.persons[9] ? appdata.settings.persons[9].name : "" );
            setPerson11( appdata.settings.persons[10] ? appdata.settings.persons[10].name : "" );
        }

        setUom( appdata.settings.units );
    }

    ////////////////////////////////////////////////////////////////////////////
    async function getCalIds() : Promise<void>
    {
        const endpt : getCalendarIdsEndpoint = new getCalendarIdsEndpoint();
        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt ); 
        if( reply.ok )
        {
            const data : getCalendarIdsEndpoint.ReplyData = reply.data;

            //console.log( data.calendars );
            setCalendarAvailIds( data.calendars );

            // set the proper ids
            //console.log( appdata.settings.calendar.ids );
            let i : number;
            let j : number;
            let ids : Array<string> = [];
            for( i=0; i < appdata.settings.calendar.ids.length; i++ )
            {
                if( appdata.settings.calendar.ids[i] == "primary")
                {
                    // get id from primary calendar
                    for( j=0; j < data.calendars.length; j++ )
                    {
                        if( data.calendars[j].primary )
                        {
                            ids.push( data.calendars[j].id );
                            break;
                        }
                    }
                }
                else
                {
                    ids.push( appdata.settings.calendar.ids[i] );
                }
            }
            setCalendarIds( ids );
        }
        else
        {

        }

        loading.current = false;
    }

    ////////////////////////////////////////////////////////////////////////////
    function onBgColor( color : any, event : any ) : void
    {
        setBackgroundColor( color.hex );
    }

    ////////////////////////////////////////////////////////////////////////////
    function togglePicker() : void
    {
        setBackgroundColorPicker(!background_color_picker);
        if( background_color_picker )onSave();
    }

    ////////////////////////////////////////////////////////////////////////////
    function onCalPicked( value : any ) : void
    {
    }

    ////////////////////////////////////////////////////////////////////////////
    function onSave() : void
    {
        if( !loading.current )doSave();
    }

    ////////////////////////////////////////////////////////////////////////////
    function getCalId( id : string ) : getCalendarIdsEndpoint.Calendar
    {
        let i : number;
        for( i=0; i < calendar_avail_ids.length; i++ )
        {
            if( calendar_avail_ids[i].id == id )
            {
                return calendar_avail_ids[i];
            }
        }
        return null;
    }

    ////////////////////////////////////////////////////////////////////////////
    //
    // google search: AIzaSyAdr_Z2SeN097F8K-WpA1TQirvPsEtwKyU
    /*
    <script async src="https://cse.google.com/cse.js?cx=81e9bcabfda6a4b75">
</script>
<div class="gcse-search"></div>
    */
   // https://www.googleapis.com/customsearch/v1?key=AIzaSyAdr_Z2SeN097F8K-WpA1TQirvPsEtwKyU&cx=81e9bcabfda6a4b75:omuauf_lfve&q=lectures
    //
    async function doSave() : Promise<void>
    {
        // fix ids to get "primary"
        let i : number;
        let cal : getCalendarIdsEndpoint.Calendar;
        let calids : Array<string> = [];

        for( i=0; i < calendar_ids.length; i++ )
        {
            cal = getCalId( calendar_ids[i] );
            if( cal.primary )
                calids.push("primary");
            else
                calids.push( cal.id );
        }

        showSnack( false );

        const endpt : putSettingsEndpoint = new putSettingsEndpoint();
        endpt.request.device      = { id: device_id, name: device_name };
        endpt.request.location    = { address : location_address, timezone: location_tz };
        endpt.request.background  = { color: background_color, image_url: background_image, opacity: background_opacity as number };
        endpt.request.calendar    = { ids: calids, start_dow : calendar_start_dow };
        endpt.request.events      = { default_duration: event_duration, dim_past : event_dim_past == 1 };
        endpt.request.persons     = [   {name:person_1,colorId:0},{name:person_2,colorId:1},{name:person_3,colorId:2},{name:person_4,colorId:3},
                                        {name:person_5,colorId:4},{name:person_6,colorId:5},{name:person_7,colorId:6},{name:person_8,colorId:7},
                                        {name:person_9,colorId:8},{name:person_10,colorId:9},{name:person_11,colorId:10}
                                    ];
        endpt.request.units       = uom;

        

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt ); 

        console.log("doSave", reply.ok, endpt.request );

        if( reply.ok )
        {
            const data : putSettingsEndpoint.ReplyData = reply.data;
            //console.log( data );

            // show toaster on save
            showSnack( true );

            // set singleton state
            appdata.settings = endpt.request;
            
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////
    function CalId( cal : getCalendarIdsEndpoint.Calendar, index : number ) : JSX.Element
    {
        return <ListItem   key={cal.id}
        secondaryAction={
              cal.primary ? <CheckCircleOutlineIcon /> : null
          }
        >
        <ListItemButton role={undefined} onClick={onCalPicked} dense>
            <ListItemIcon>
                <Checkbox
                edge="start"
                checked={ calendar_ids.indexOf( cal.id ) >= 0 }
                tabIndex={-1}
                disableRipple
                onChange={ (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => onCalSelect( cal.id, checked ) }
                />
                </ListItemIcon>
                <ListItemText id={cal.id} primary={cal.name} secondary={cal.id} />
            </ListItemButton>
        </ListItem>;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////
    function onCalSelect( id: string, checked : boolean ) : void
    {
        //console.log("onCalSelect", id, checked );
        let cids : Array<string> = calendar_ids.concat();
        const idx : number = cids.indexOf( id );
        if( idx >= 0 )
            cids.splice( idx, 1 );
        else
            cids.push( id );

        setCalendarIds( cids );
    }

    ////////////////////////////////////////////////////////////////////////////
    function closeSnack() : void
    {
        showSnack( false );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onLogin() : void
    {
        googleLogin();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function googleLogin() : Promise<void>
    {
        const params : string = queryString.stringify({
                        client_id    : appdata.config.google.client_id ,
                        redirect_uri : appdata.config.google.redirect_url,
                        scope: [
                        'https://www.googleapis.com/auth/userinfo.email',
                        'https://www.googleapis.com/auth/userinfo.profile',
                        'https://www.googleapis.com/auth/calendar',
                        'https://www.googleapis.com/auth/calendar.readonly',
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

                pageLoaded();
            }
        }
        catch( err: any )
        {
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    function onBack() : void
    {
        props.onClose();
    }

    // https://casesandberg.github.io/react-color/
    // ===============================================================================================
    return (
        <Stack direction={"column"} gap={1}>
            <Stack direction={"row"}>
                <IconButton size="large" onClick={onBack} sx={{ marginTop:"7px" }}><ArrowBackIcon /></IconButton>
                <Typography component="div" color="text.primary" sx={{ fontSize: 32, lineHeight:1.0, paddingTop:2 }}>{"Settings"}</Typography>
            </Stack>

            <Stack direction={"column"} gap={1.5} sx={{marginLeft:2,width:"50%"}}>

                
                <Typography variant="h4" color={"white"}>{"Device"}</Typography>
                    <TextInput  label={"ID"}
                                value={ device_id }
                                onChange={setDeviceId}
                                onBlur={onSave} />
                    <TextInput  label={"Name"}
                                value={ device_name }
                                onChange={setDeviceName}
                                onBlur={onSave} />

                <Typography variant="h4" color={"white"} sx={{marginTop:3}}>{"Location"}</Typography>
                    <TextInput  label={"Address"}
                                value={ location_address }
                                onChange={setLocationAddress}
                                onBlur={onSave} />
                    <TimezoneInput id="timezone"
                                label={"Timezone"}
                                value={ location_tz }
                                onChange={setLocationTimezone} />
                    

                <Typography variant="h4" color={"white"} sx={{marginTop:sectionGap.current}}>{"Background"}</Typography>
                    <Button variant="outlined"
                            startIcon={<CircleIcon color={ background_color } />}
                            sx={{width:"175px"}}
                            size="large"
                            onClick={togglePicker}>{ ( background_color_picker ? "Hide" : "Pick" ) + " Color"}</Button>
                    { background_color_picker ? <SketchPicker   color={background_color}
                                    disableAlpha={true}
                                    onChangeComplete={onBgColor} /> : null }
                    <TextInput  label={"Image"}
                                value={ background_image }
                                onChange={setBackgroundImage} />
                    <SliderInput id="opacity"
                                label={"Opacity"}
                                labelPlacement="top"
                                value={ background_opacity }
                                onChangeCommitted={setBackgroundOpacity} />

                <Typography variant="h4" color={"white"} sx={{marginTop:sectionGap.current}}>{"Calendars"}</Typography>

                    <Button variant="outlined" size="large" onClick={onLogin} startIcon={<GoogleIcon />} sx={{ width: "275px" }} >{"Sign in with Google"}</Button>

                    <Card variant="outlined">
                        <List sx={{ width: '100%' }}>
                            { calendar_avail_ids.map( ( id:getCalendarIdsEndpoint.Calendar,index:number) => { return CalId( id, index ) } ) }
                        </List>
                    </Card>

                    <SelectInput
                                id="start_dow"
                                label={"Start Day of Week"}
                                value={ calendar_start_dow }
                                values={ [  { value: 0, label: "Sunday" },
                                            { value: 1, label: "Monday" },
                                            { value: 2, label: "Tuesday" },
                                            { value: 3, label: "Wednesday" },
                                            { value: 4, label: "Thursday" },
                                            { value: 5, label: "Friday" },
                                            { value: 6, label: "Saturday" } ] }
                                onChange={ ( value : number | string ) => setStartDow( value as number ) } />



                <Typography variant="h4" color={"white"} sx={{marginTop:sectionGap.current}}>{"Events"}</Typography>
                    <SelectInput
                                id="event_duration"
                                label={"Default Duration"}
                                value={ event_duration }
                                values={ [  { value: 15, label: "15 minutes" },
                                            { value: 30, label: "30 minutes" },
                                            { value: 45, label: "45 minutes" },
                                            { value: 60, label: "1 hour" }
                                        ] }
                                onChange={ ( value : number | string ) => setEventDuration( value as number ) } />
<                   SelectInput
                                id="event_dim_past"
                                label={"Dim Past"}
                                value={ event_dim_past }
                                values={ [  { value: 0, label: "No" },
                                            { value: 1, label: "Yes" } ] }
                                onChange={ ( value : number | string ) => setEventDimPast( value as number ) } />


                <Typography variant="h4" color={"white"} sx={{marginTop:sectionGap.current}}>{"Persons"}</Typography>

                <Stack direction={"row"} gap={2}>
                    <Stack direction={"column"} gap={1} >
                        <PersonColor color={ AppData.event_colors[0] } name={ person_1 } onChange={setPerson1} onBlur={onSave}/>
                        <PersonColor color={ AppData.event_colors[1] } name={ person_2 } onChange={setPerson2} onBlur={onSave} />
                        <PersonColor color={ AppData.event_colors[2] } name={ person_3 } onChange={setPerson3} onBlur={onSave} />
                        <PersonColor color={ AppData.event_colors[3] } name={ person_4 } onChange={setPerson4} onBlur={onSave}/>
                        
                    </Stack>
                    <Stack direction={"column"} gap={1} >
                        <PersonColor color={ AppData.event_colors[4] } name={ person_5 } onChange={setPerson5} onBlur={onSave} />
                        <PersonColor color={ AppData.event_colors[5] } name={ person_6 } onChange={setPerson6} onBlur={onSave} />
                        <PersonColor color={ AppData.event_colors[6] } name={ person_7 } onChange={setPerson7} onBlur={onSave} />
                        <PersonColor color={ AppData.event_colors[7] } name={ person_8 } onChange={setPerson8} onBlur={onSave} />
                    </Stack>
                    <Stack direction={"column"} gap={1} >
                        <PersonColor color={ AppData.event_colors[8] } name={ person_9 } onChange={setPerson9}  onBlur={onSave}/>
                        <PersonColor color={ AppData.event_colors[9] } name={ person_10 } onChange={setPerson10}  onBlur={onSave}/>
                        <PersonColor color={ AppData.event_colors[10] } name={ person_11 } onChange={setPerson11}  onBlur={onSave}/>
                    </Stack>
                </Stack>

                <Typography variant="h4" color={"white"} sx={{marginTop:sectionGap.current}}>{"Units"}</Typography>
                    <SelectInput
                                id="uom"
                                label={"Measure"}
                                value={ uom }
                                values={ [  { value: getSettingsEndpoint.UnitsOfMeasure.STANDARD, label: "Standard" },
                                            { value: getSettingsEndpoint.UnitsOfMeasure.METRIC, label: "Metric" } ] }
                                onChange={ ( value : string | number ) => setUom( value as getSettingsEndpoint.UnitsOfMeasure ) } />
            </Stack>

            { show_snack? <SnackAlert message="Settings Saved" severity="success" onClose={closeSnack} /> : null }
        </Stack>
        
    );
    // ===============================================================================================
}

// eof