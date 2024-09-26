//
import * as React from "react";

//
import AppData from "../../AppData.js";


//
import { Dialog, DialogTitle, DialogActions, Button, IconButton, DialogContent, ListItemText, ListItemIcon, List, ListItem } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Edit as EditIcon } from '@mui/icons-material';
//
import StringUtils from "../../../utils/StringUtils.js";
import { deleteCalendarEventEndpoint } from "../../../api/deleteCalendarEventEndpoint.js";

//
import { netClient } from "../../../net/netClient.js";
import { Constants } from "../../../utils/Constants.js";
import { EventInfo } from "./MonthlyView.js";
import AlertPrompt from "../../widgets/AlertPrompt.js";
import { AlertAction } from "../../widgets/AlertPrompt.js";


export interface ListEventsProps
{
    date        : string;
    events      : Array<EventInfo>;
    onAdd       : ()=> void;
    onClose     : ()=> void;
    onEdit      : ( id : string ) => void;
    onSave      : ()=> void;
    onDeleted   : ()=> void;
}


//
//
//
export default function ListEvents( props : ListEventsProps ) : JSX.Element
{
    const [appdata,setAppData]          = React.useState< AppData >( AppData.instance() );

    //
    const [delete_event, setDeleteEvent]    = React.useState<EventInfo>(null);

    React.useEffect( () => pageLoaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onClose() : void
    {
        props.onClose();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onAdd() : void
    {
        props.onAdd();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onSave() : void
    {
        doSave();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function doSave() : Promise<void>
    {
        props.onSave();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function doUpdateSave() : Promise<void>
    {
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function doNewSave() : Promise<void>
    {
        /*
        const endpt : postCalendarEventEndpoint = new postCalendarEventEndpoint();
        endpt.request.calendarId = 'primary';
        endpt.request.start_date = start_date.valueOf();    // seconds
        endpt.request.end_date   = all_day ? ( end_date.valueOf() + Constants.DAYS_TO_MS ) : end_date.valueOf();    // +1 day if all day
        endpt.request.summary    = summary;
        endpt.request.allday     = all_day;
        endpt.request.colorId    = 2;
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
                case postCalendarEventEndpoint.Error.NOT_AUTHORIZED : break;
            }
        }
        */

    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function toDateString( dt : string ) : string
    {
        return StringUtils.format( "{0}/{1}", dt.substring(4,6), dt.substring(6,8) );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function eventDate( event : EventInfo ) : string
    {
        let str : string = toDateString( event.start_date );
        if( event.end_date != event.start_date )
        {
            str += " - ";
            str += toDateString( event.end_date );
        }
        return str;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onDelete( event : EventInfo ) : void
    {
        setDeleteEvent( event );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onEventClick( id : string ) : void
    {
        props.onEdit( id );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onDeleteEvent( action : AlertAction ) : void
    {
        if( action == AlertAction.YES )
        {
            doDelete();
        }
        setDeleteEvent( null );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function doDelete() : Promise<void>
    {
        const endpt : deleteCalendarEventEndpoint = new deleteCalendarEventEndpoint();
        endpt.request.calendarId = 'primary';
        endpt.request.id         = delete_event.id;    // seconds

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt ); 
        if( reply.ok )
        {
            //const data : deleteCalendarEventEndpoint.ReplyData = reply.data;
            props.onDeleted();
        }
        else
        {
            //console.log( "status", reply.error.status );
            switch( reply.error.code )
            {
                case deleteCalendarEventEndpoint.Error.NOT_AUTHORIZED : /*googleLogin();*/ break;
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function dateHeader( str : string ) : string
    {
        const dt : any = AppData.splitDateId( str );
        return [ dt.month, dt.date, dt.year ].join(' / ');
    }


    // ===============================================================================================

    return (
        <div>
            <Dialog onClose={onClose} open={true} sx={{width:575,left:(window.outerWidth-575)/2}} fullWidth={true}>
                <DialogTitle>{"Events: " + dateHeader( props.date ) }</DialogTitle>
                <DialogContent dividers>

                    <List sx={{ width: '100%', maxWidth: 550, bgcolor: 'background.paper' }}>
                        { props.events.map( (event: EventInfo, index:number)=>{ return <ListItem key={event.id} secondaryAction={ <IconButton edge="end" aria-label="delete" onClick={(evt:any)=>onDelete( event )}><DeleteIcon /></IconButton> }>
                                <IconButton sx={{marginRight:2}} onClick={(evt:any)=>onEventClick( event.id )}><EditIcon /></IconButton>
                                <ListItemText primary={event.summary} secondary={ eventDate( event ) } />
                            </ListItem> } ) }
                    </List>
                    
                </DialogContent>
                
                <DialogActions>
                    <Button variant="outlined" onClick={onAdd}>{"Add"}</Button>
                    <Button variant="contained" onClick={onClose} >{"Close"}</Button>
                </DialogActions>

            </Dialog> 

            { delete_event != null ? <AlertPrompt  open={true}
                                                title={"Delete Event"}
                                                message={"Are you certain you want to delete '" + delete_event.summary + "'"}
                                                canelText={"Cancel"}
                                                yesText={"Delete"}
                                                onAction={onDeleteEvent}/> : null }
        </div>
             
    );
    // ===============================================================================================
}

// eof