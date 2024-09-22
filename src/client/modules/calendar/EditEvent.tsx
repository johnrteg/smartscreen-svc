//
import * as React from "react";

//
import dayjs, { Dayjs } from "dayjs";
//var customParseFormat = require("dayjs/plugin/customParseFormat");
//import customParseFormat from 'dayjs/plugin/customParseFormat';
//dayjs.extend(customParseFormat);

//
import AppData from "../../AppData.js";


//
import { Typography, Stack, Dialog, DialogTitle, DialogActions,
            Button, TextField, DialogContent, Menu,
            ListItemIcon, Checkbox, Popper, Paper,
            FormControlLabel, MenuList, MenuItem } from '@mui/material';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

//
import StringUtils from "../../../utils/StringUtils.js";
import ObjectUtils from "../../../utils/ObjectUtils.js";

import { postCalendarEventEndpoint } from "../../../api/postCalendarEventEndpoint.js";
import { putCalendarEventEndpoint } from "../../../api/putCalendarEventEndpoint.js";

//
import { Icon as CircleIcon } from "./icons/CircleIcon.js";
import { netClient } from "../../../net/netClient.js";
import { Constants } from "../../../utils/Constants.js";
import { EventInfo } from "./MonthlyView.js";



export interface EditEventProps
{
    event    : EventInfo;
    date    : Date;
    onClose : ()=> void;
    onSave  : ()=> void;
}

interface ColorName
{
    name : string;
    color : string;
}


//
//
//
export default function EditEvent( props : EditEventProps ) : JSX.Element
{
    const [appdata,setAppData]          = React.useState< AppData >( AppData.instance() );

    //
    const [summary, setSummary]         = React.useState<string>(props.event ? props.event.summary: "");
    const [start_date, setStartDate]    = React.useState<Dayjs>(null);
    const [end_date, setEndDate]        = React.useState<Dayjs>(null);
    const [all_day, setAllday]          = React.useState<boolean>(props.event ? props.event.allday: true);
    const [color, setColor]             = React.useState<string>(props.event ? props.event.color : AppData.event_colors[0]);
    const [color_name, setColorName]    = React.useState<string>(props.event ? props.event.color:AppData.event_colors[0]);
    const [date_error, setDateError]    = React.useState<string>("Error");

    //
    const [anchorEl, setAnchorEl]           = React.useState<null | HTMLElement>(null);
    //const [open_picker, openColorPicket]    = React.useState<boolean>(false);

    //
    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );
    React.useEffect( dateChanged, [start_date,end_date] );
    if( props.event == null )React.useEffect( allDayChanged, [all_day] );
    React.useEffect( eventChanged, [props.event] );
    React.useEffect( colorChanged, [color] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        setStartDate( dayjs( props.date ) );
        setEndDate( dayjs( props.date ) );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        //console.log("clock unloaded");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function timeToString( date : string, amt : number ) : Date
    {
        let hours   : number = Math.floor( amt / 60 );
        let minutes : number = amt - ( hours*60 );

        const str : string = StringUtils.format( "{0}/{1}/{2} {3}:{4}", date.substring(0,4), date.substring(4,6), date.substring(6,8),
                        StringUtils.leadingZero( hours, 2 ),
                        StringUtils.leadingZero( minutes, 2 ) );
        
        const dt : Date = new Date( str );
        //console.log( "timeToString", str, dt );
        return dt;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function eventChanged() : void
    {
        if( ObjectUtils.notNull( props.event) )
        {
            //setSummary( props.event.summary );
            //setAllday( props.event.allday );

            if( props.event.allday )
            {
                setStartDate( dayjs( props.event.start_date, "YYYYMMDD" ) );
                setEndDate( dayjs( props.event.end_date, "YYYYMMDD" ) );
            }
            else
            {
                setStartDate( dayjs( timeToString( props.event.start_date, props.event.start_time ) ) );
                setEndDate( dayjs( timeToString( props.event.end_date, props.event.end_time ) ) );
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function dateChanged() : void
    {
        //console.log("dateChanged", start_date ? start_date.valueOf() : "null", end_date ? end_date.valueOf() : "null" );
        if( start_date && end_date )
        {
            if( start_date.valueOf() > end_date.valueOf() )
            {
                setDateError("End needs to be after Start date and time");
            }
            else
            {
                setDateError("");
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function allDayChanged() : void
    {
        if( !all_day )
        {
            const now : Date = new Date();
            let start : Date = new Date( start_date.valueOf() );
            start.setHours( now.getHours(), 0, 0, 0 );

            let end : Date = new Date( start );
            end.setMinutes( appdata.settings.events.default_duration, 0, 0 );

            setStartDate( dayjs( start ) );
            setEndDate( dayjs( end ) );
        }
         
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onAllDay( event: React.ChangeEvent<HTMLInputElement>, checked: boolean ) : void
    {
        setAllday( checked );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onClose() : void
    {
        props.onClose();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onSave() : void
    {
        doSave();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function doSave() : Promise<void>
    {
        if( ObjectUtils.notNull( props.event ) )
            await doUpdateSave();
        else
            await doNewSave();

        props.onSave();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function getColorIndex() : number
    {
        let i : number;
        for( i=0; i < AppData.event_colors.length; i++ )
        {
            if( AppData.event_colors[i] == color )return i;
        }
        return 0;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function doUpdateSave() : Promise<void>
    {
        const endpt : putCalendarEventEndpoint = new putCalendarEventEndpoint();
        endpt.request.calendarId = 'primary';       // todo
        endpt.request.id         = props.event.id;
        endpt.request.start_date = start_date.valueOf();    // seconds
        endpt.request.end_date   = all_day ? ( end_date.valueOf() + Constants.DAYS_TO_MS ) : end_date.valueOf();    // +1 day if all day
        endpt.request.summary    = summary;
        endpt.request.allday     = all_day;
        endpt.request.colorId    = getColorIndex() + 1;

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt ); 
        if( reply.ok )
        {
            const data : putCalendarEventEndpoint.ReplyData = reply.data;
        }
        else
        {
            //console.log( "status", reply.error.status );
            switch( reply.error.code )
            {
                case putCalendarEventEndpoint.Error.NOT_AUTHORIZED : /*googleLogin();*/ break;
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function doNewSave() : Promise<void>
    {
        const endpt : postCalendarEventEndpoint = new postCalendarEventEndpoint();
        endpt.request.calendarId = 'primary';
        endpt.request.start_date = start_date.valueOf();    // seconds
        endpt.request.end_date   = all_day ? ( end_date.valueOf() + Constants.DAYS_TO_MS ) : end_date.valueOf();    // +1 day if all day
        endpt.request.summary    = summary;
        endpt.request.allday     = all_day;
        endpt.request.colorId    = getColorIndex() + 1;
        endpt.request.time_zone  = appdata.settings.location.timezone;

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt ); 
        if( reply.ok )
        {
            const data : postCalendarEventEndpoint.ReplyData = reply.data;
        }
        else
        {
            //console.log( "status", reply.error.status );
            switch( reply.error.code )
            {
                case postCalendarEventEndpoint.Error.NOT_AUTHORIZED : /*googleLogin();*/ break;
            }
        }

    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function showColorPicker( event: React.MouseEvent<HTMLElement> ) : void
    {
        setAnchorEl( event.currentTarget );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onCloseMenu() : void
    {
        setAnchorEl( null );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onPickColor( index : number ) : void
    {
        setColor( AppData.event_colors[ index ] );
        onCloseMenu();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function colorChanged() : void
    {
        if( appdata.settings.persons.length > 0 )setColorName( appdata.settings.persons[ getColorIndex() ].name );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function colorMenu() : JSX.Element
    {
        // get colors
        let color_names : Array<ColorName> = [];
        AppData.event_colors.forEach( ( color : string ) => { color_names.push( { color: color, name: "" } ) } );

        // get any names
        let i : number;
        for( i=0; i < appdata.settings.persons.length; i++ )
        {
            if( appdata.settings.persons[i].name != "" )color_names[i].name = appdata.settings.persons[i].name;
        }

        let menu : JSX.Element = <Menu   id="color-menu"
        anchorEl={anchorEl}
        open={ anchorEl != null }
        onClose={onCloseMenu}
        MenuListProps={{'aria-labelledby': 'basic-button'}} >
            { color_names.map( ( cn: ColorName, index: number ) => { return <MenuItem key={"cn_"+index.toString()} onClick={()=>onPickColor(index)}><ListItemIcon><CircleIcon color={cn.color} /></ListItemIcon><Typography variant="inherit">{cn.name}</Typography></MenuItem> } ) }
        </Menu>;

        return menu;
    }

// 
    // ===============================================================================================
    return (
        <Dialog onClose={onClose}  open={true}>
            <DialogTitle>{"Edit Event"}</DialogTitle>
            <DialogContent dividers>
                <Stack direction={"column"} spacing={0} gap={2} width={"100%"}>
                    <TextField  label={"Summary"}
                                variant="outlined"
                                error={ summary == "" }
                                helperText={ summary == "" ? "" : "Summary description missing"}
                                value={ summary }
                                onChange={(event: React.ChangeEvent<HTMLInputElement>)=>setSummary(event.target.value)} />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>

                        { all_day ? 
                        <Stack direction={"row"} spacing={0} gap={1} width={"100%"}>
                            <DatePicker label={"Start"} value={start_date} onChange={setStartDate}/>
                            <Typography sx={{paddingTop:2}}>{"to"}</Typography>
                            <DatePicker label={"End"} value={end_date} onChange={setEndDate} />
                        </Stack> :
                        <Stack direction={"row"} spacing={0} gap={1} width={"100%"}>
                            <DateTimePicker label={"Start"} value={start_date} onChange={setStartDate} />
                            <Typography sx={{paddingTop:2}}>{"to"}</Typography>
                            <DateTimePicker label={"End"} value={end_date} onChange={setEndDate}/>
                        </Stack> }
                    </LocalizationProvider>
                    { date_error ? <Typography color={"error"}>{date_error}</Typography> : null }
                    
                    <Stack direction={"row"} spacing={0} gap={1} width={"100%"}>
                        <FormControlLabel required={false} control={<Checkbox checked={all_day} onChange={onAllDay}/>} label="All Day" />

                        <Button variant="outlined"
                                startIcon={<CircleIcon color={color} />}
                                onClick={showColorPicker}>{color_name}</Button>
                        
                        { colorMenu() }
                        
                    </Stack>
                    
                </Stack>
                
            </DialogContent>
            
            <DialogActions>
                <Button variant="outlined" onClick={onClose}>{"Cancel"}</Button>
                <Button variant="contained" onClick={onSave} disabled={ date_error != "" || summary == "" }>{"Save"}</Button>
            </DialogActions>

        </Dialog>      
    );
    // ===============================================================================================
}

// eof