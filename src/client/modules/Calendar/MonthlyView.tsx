//
import * as React from "react";
//
import dayjs from "dayjs";


import { Typography, Stack, Box, Button, IconButton} from '@mui/material';

import { ArrowCircleLeftOutlined as ArrowCircleLeftOutlinedIcon } from '@mui/icons-material';
import { ArrowCircleRightOutlined as ArrowCircleRightOutlinedIcon } from '@mui/icons-material';

//
import StringUtils from "../../../utils/StringUtils.js";
import ObjectUtils from "../../../utils/ObjectUtils.js";

import { Constants } from "../../../utils/Constants.js";

import { netClient } from "../../../net/netClient.js";
import { getCalendarEndpoint } from "../../../api/getCalendarEndpoint.js";

import AlertPrompt from "../../widgets/AlertPrompt.js";
import { AlertAction } from "../../widgets/AlertPrompt.js";

import AppData      from "../../AppData.js";
import EditEvent    from "./EditEvent.js";
import ListEvents   from "./ListEvents.js";




export interface MonthlyViewProps
{
    days : number;
    warm : boolean;
}





export interface EventInfo
{
    id        : string;
    calendar  : string;
    summary   : string;
    color     : string;
    start     : number;
    start_date : string;    // YYYYMMDD
    start_time : number;    // minutes since 12MN
    end_date   : string;    // YYYYMMDD
    end_time  : number;     // minutes since 12MN
    allday    : boolean;
    days      : number;
}

interface EventCell
{
    date    : string;          // YYYYMMDD
    events  : Array<EventInfo>;
}


//
//
//
export default function MonthlyView( props : MonthlyViewProps ) : JSX.Element
{
    const [appdata,setAppData]              = React.useState< AppData >( AppData.instance() );

    const view                              = React.useRef<any>(null);

    const dow                               = React.useRef< Array<string> >( ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] );
    const month                             = React.useRef< Array<string> >( ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug", "Sep", "Oct", "Nov", "Dec"] );
    const cells                             = React.useRef< Array<EventCell> >( [] );
    const max_events_per_day                = React.useRef<number>( 4 );

    const [start_date, setStartDate]        = React.useState<Date>(null);
    const [edit_date, setEditdate]          = React.useState<string>(null);

    const [events, setEvents]               = React.useState< Array<EventCell> >( [] );

    const [show_editor, showEditor]         = React.useState< boolean >( false );
    const [show_list, showList]             = React.useState< boolean >( false );
    const [edit_events, setEditEvents]      = React.useState< Array<EventInfo> >( [] );
    const [edit_event, setEditEvent]        = React.useState< EventInfo >( null );

    const [request_login, requestLogin]     = React.useState< boolean >( false );

    //
    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( onStartChange, [start_date] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        onToday();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        //console.log("cal unloaded");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function refresh() : void
    {
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    function startChanged() : void
    {
        //console.log("startChanged", props.start_date );
        if( start_date )
        {
            let start : Date = new Date( start_date.getTime() - 7*Constants.DAYS_TO_MS  );//props.start_date.getFullYear(), props.start_date.getMonth(), props.start_date.getDate(), 0, 0, 0, 0 );
            //start.setTime( start.getTime() - 7*Constants.DAYS_TO_MS );
            //console.log("startChanged", props.start_date, start );
            // goto sunday
            if( start.getDay() != 0 )start.setTime( start.getTime() - start.getDay() * Constants.DAYS_TO_MS );
            start.setHours( 0,0,0,0 );

            cells.current = [];
            setStartDate( start );
            setEvents([]);
        }
        
    }
    */

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function createDate( value : string ) : Date
    {
        let dtstr : string = value.indexOf('T') > 0 ? value : StringUtils.replaceAll( value, "-", "/" );
        return new Date( dtstr );
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    function clearCellRows( ) : void
    {
        let j : number;
        for( j=0; j < cells.current.length; j++ )
        {
            cells.current[j].events = [];
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    function addCellRow( ) : void
    {
        let j : number;
        for( j=0; j < cells.current.length; j++ )
        {
            cells.current[j].events.push( null );
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    function minutesSinceMidnight( date : Date ) : number
    {
        let day : Date = new Date( date.getTime() );
        day.setHours( 0, 0, 0, 0 );
        return ( date.getTime() - day.getTime() ) / Constants.MINUTES_TO_MS;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    function orderEvent( a : EventInfo, b: EventInfo ) : number
    {
        if( a.start < b.start )
            return -1;
        else if ( a.start > b.start )
            return 1;
        else
            return 0;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderEvents( past_date : boolean, celldate_id : string, row : number, col : number ) : Array<JSX.Element>
    {
        if( events.length == 0 )return null;

        const max_nbr_events : number = 3;
        let event_elements  : Array<JSX.Element> = [];
        const idx           : number = ( row * 7 ) + col;
        //console.log("renderEvents", idx, idx < events.length ? events[idx] : null );
        //console.log( "view", view.current.offsetWidth );
        const cell_width : number = Math.ceil( view.current.offsetWidth / 7 ) + 1;

        let line        : number;
        let evt         : EventInfo;
        let width       : string = cell_width + "px";
        let days        : number;
        const bar_edge_width : number = 7;  // pixels
        let color       : string;
        let nbr_events  : number = 0;
        const opacity   : number = past_date && appdata.settings.events.dim_past ? 0.33 : 1.0;

        for( line=0; line < events[idx].events.length; line++ )
        {
            // if no event or event not starting on this date
            if( events[idx].events[line] == null )
            {
                // blank
                width = ( cell_width + "px" );
                event_elements.push( <Box key={ [row,col,line].join("-") } component="section" width={ width } height={"20px"} >
                                        <Typography sx={{ fontSize: 12, lineHeight:1.0, padding:0.5 }} component="div" color="text.primary"></Typography>
                                    </Box> );
            }
            else
            {
                evt = events[idx].events[line];
                days = evt.days;
 
                color = evt.color ? evt.color : "#616161";
                if( events[idx].events[line].start_date == celldate_id || col == 0 )
                { 
                    // "#424242" 876159530
                    // "#616161"
                    if( nbr_events < max_nbr_events )
                    {
                        event_elements.push( <Stack key={ evt.id + "_stk" } direction={"row"} spacing={0} gap={0} width={ cell_width + "px" }>
                                                <Box key={ evt.id + "_indicator" } component="section" width={ bar_edge_width + "px" } height={"20px"} sx={ { borderRadius:0, bgcolor: "#424242", opacity: opacity, borderRight: 1, borderRightColor: "#bdbdbd" } }>
                                                </Box>
                                                <Box key={ evt.id } component="section" width={ (cell_width-bar_edge_width) + "px" } height={"20px"} sx={ { borderRadius:0, bgcolor: color, opacity: opacity } }>
                                                    <Typography noWrap={true} sx={{ fontSize: 12, lineHeight:1.0, padding:0.5 }} component="div" color="text.primary">{ evt.summary }</Typography>
                                                </Box>
                                            </Stack> );
                    }
                    
                    nbr_events++;
                }
                else
                {
                    event_elements.push( <Box key={ evt.id } component="section" width={ cell_width + "px" } height={"20px"} sx={ { borderRadius:0, bgcolor: color, opacity: opacity } }></Box> );
                }
                 
            }
            
        }

        if( nbr_events > max_nbr_events )
        {
            event_elements.push( <Box key={ [row,col,line].join("-") } component="section" width={ width } height={"20px"} >
                                        <Typography sx={{ fontSize: 12, lineHeight:1.0, padding:0.5 }} component="div" color="text.primary">{(nbr_events-max_nbr_events) + " more..."}</Typography>
                                    </Box> );
        }

        return event_elements;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderCellInside( today : string, cell_date : string, row : number, col : number ) : JSX.Element
    {
        let label      : string = "";
        let date_color : string = "text.primary";

        const cdt : any = AppData.splitDateId( cell_date );
        //console.log("split", cell_date, cdt );

        // show month on the first cell and the first day of each month
        if( cdt.date == 1 || ( row == 0 && col == 0 ) )
        {
            label = StringUtils.format( "{0} ", month.current[ cdt.month ] );
            date_color = "primary";
        }  
        label += cdt.date;

        // banner
        let banner : any = {display:'flex', justifyContent:'center', paddingTop:0.5, paddingRight:0.5, paddingBottom:0.5 };
        
        if( today == cell_date )date_color = "error";
        const past_date : boolean = cell_date < today;

        return  <Stack direction={"column"} spacing={0} gap={0.3} width={"100%"}>
                    <Box key={ "in_" + cell_date } sx={ banner }>
                        <Typography sx={{ fontSize: 40, lineHeight:1.0, padding:0 }} component="div" color={date_color}>{ label }</Typography>
                    </Box>
                    { renderEvents( past_date, cell_date, row, col ) }
                </Stack>;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderCell( today : string, date : string, row : number, col : number, maxRow : number  ) : JSX.Element
    {
        let sx : any = { p: 0.0, borderTop: '1px solid grey' };//, borderLeft: '1px solid grey' };
        if( row == maxRow-1 )sx['borderBottom'] = '1px solid grey';

        //                                                                       , row, col
        return <Box key={ date } onClick={ (evt:any) => onDateClick( date ) } component="section" width={"100%"} height={"140px"} sx={ sx }>{ renderCellInside( today, date, row, col ) }</Box>; //, row, col)}</Box>;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderRow( today : string, start_of_week_dt : any, row : number, maxRow : number ) : JSX.Element
    {
        let rowel : JSX.Element = <Stack key={start_of_week_dt.valueOf()} direction={"row"} spacing={0} gap={0} width={"100%"}>
            { dow.current.map( ( dow : string, col : number ) => { return renderCell( today, datedId( start_of_week_dt.add( col, 'day' ) ), row, col, maxRow ) } ) }
        </Stack>;

        return rowel;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderDow( dow : string  ) : JSX.Element
    {
        return  <Box key={dow} component="section" width={"100%"} sx={{display:'flex', justifyContent:'center'}} >
                    <Typography sx={{ fontSize: 42, lineHeight:1.0, padding:1 }} component="div" color="text.primary">{dow.charAt(0)}</Typography>
                </Box>;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderHeader() : JSX.Element
    {
        // reorder dow based on settings
        let dows : Array<string> = [];
        let i : number;
        for( i=appdata.settings.calendar.start_dow; i < dow.current.length; i++ )
        {
            dows.push( dow.current[i] );
        }
        // get sun on
        if( appdata.settings.calendar.start_dow > 0 )
        {
            for( i=0; i < appdata.settings.calendar.start_dow; i++ )
            {
                dows.push( dow.current[i] );
            }
        }
        
        return <Stack key={"header"} direction={"row"} spacing={0} gap={0} width={"100%"}>
            { dows.map( ( dow : string ) => { return renderDow( dow )} ) }
        </Stack>;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function dateId( date : Date ) : string
    {
        return StringUtils.format("{0}{1}{2}", date.getFullYear(), StringUtils.leadingZero( date.getMonth()+1, 2 ), StringUtils.leadingZero( date.getDate(), 2 ) );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function datedId( dt : any ) : string
    {
        return StringUtils.format("{0}{1}{2}", dt.year(), StringUtils.leadingZero( dt.month()+1, 2 ), StringUtils.leadingZero( dt.date(), 2 ) );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderWeeks() : Array<JSX.Element>
    {
        if( start_date == null )return null;

        // pass today
        const nbr_weeks : number = Math.ceil( props.days / 7 );
        let weeks       : Array<JSX.Element> = [];
        let w           : number;

        // fill in the empty map of events for each day
        const nbr_cells : number = nbr_weeks * 7;
        let i           : number;
        let date        : Date = new Date( start_date );
        date.setHours( 0, 0, 0, 0 );

        let dt : any = dayjs( date );
        //console.log( "start", dt.valueOf() );
        //console.log('original start_date', start_date );

        // fill cells
        cells.current = [];
        for( i=0; i < nbr_cells; i++ )
        {
            //console.log( "cell", i, datedId( dt ), dt );
            cells.current.push( { date: datedId( dt ), events: [] } );
            dt = dt.add( 1, 'day' );
            
        }
        //console.log('original cells', cells.current );
       
        //
        // add in header
        let today : Date = new Date();
        today.setHours( 0, 0, 0, 0 );

        // reset
        dt = dayjs( date );

        //
        weeks.push( renderHeader() );
        for( w = 0; w < nbr_weeks; w++ )
        {
            weeks.push( renderRow( dateId( today ), dt, w, nbr_weeks ) );
            dt = dt.add( 7, 'day' );
        }
        return weeks;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onStartChange() : void
    {
        getEvents();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onToday() : void
    {
        let today : Date = new Date();
        today.setHours( 0, 0, 0, 0 );

        // 1 week prior
        let start : Date = new Date( today.getTime() - 7*Constants.DAYS_TO_MS  );

        cells.current = [];
        setStartDate( adjustDate( start ) );
        setEvents([]);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onPrevious() : void
    {
        let month : number = start_date.getMonth() - 1;
        let year  : number = start_date.getFullYear();
        if( month < 0 )
        {
            month = 11;
            year--;
        }
           
        let prev : Date = new Date();
        prev.setFullYear( year );
        prev.setMonth( month );
        setStartDate( adjustDate( prev ) );
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onNext() : void
    {
        let month : number = start_date.getMonth() + 1;
        let year  : number = start_date.getFullYear();
        if( month > 11 )
        {
            month = 0;
            year++;
        }

        let next : Date = new Date();
        next.setFullYear( year );
        next.setMonth( month );
        setStartDate( adjustDate( next ) );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function adjustDate( date : Date ) : Date
    {
        date.setDate( 1 );
        date.setHours( 0, 0, 0, 0 );

        if( date.getDay() != appdata.settings.calendar.start_dow )
        {
            date.setTime( date.getTime() - ( date.getDay() - appdata.settings.calendar.start_dow ) * Constants.DAYS_TO_MS );
        }
        
        // still stuck on same month
        if( ObjectUtils.notNull( start_date ) && date.getMonth() == start_date.getMonth() )
        {
            let m : number = date.getMonth() + 1;
            if( m > 11 )
            {
                m = 0;
                date.setFullYear( date.getFullYear() + 1 );
            }
                
            date.setMonth( m );
        }

        return date;
    }

    ////////////////////////////////////////////////////////////////////////////
    async function getEvents() : Promise<void>
    {
        if( start_date == null )return;

        let start : Date = new Date( start_date.getTime() );

        // for monthly:

        const nbr_weeks : number = Math.ceil( props.days / 7 );
        //console.log( "nbr_weeks", nbr_weeks );


        let end : Date = new Date( start.getTime() + ( ( ( nbr_weeks * 7 ) - 1 ) * Constants.DAYS_TO_MS ) );
        // goto midnight of the end
        end.setHours( 23, 59, 59, 0 );

        //
        //console.log( start, end );

        const endpt : getCalendarEndpoint = new getCalendarEndpoint();
        endpt.request.start_date = start.getTime()/1000;    // seconds
        endpt.request.end_date   = end.getTime()/1000;

        let ids : Array<string> = [];
        if( appdata.settings.calendar.ids.length == 0 )
            ids.push('primary');
        else
            appdata.settings.calendar.ids.forEach( ( id: string )=> { ids.push( encodeURIComponent(id) ) } );

        endpt.request.ids = ids.join(',');

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt );
        if( reply.ok )
        {
            const data : getCalendarEndpoint.ReplyData = reply.data;
            //console.log("event", data.events );

            // convert here...
            updateEvents( data.events );
        }
        else
        {
            console.log( "status", reply.error.status );
            switch( reply.error.code )
            {
                case getCalendarEndpoint.Error.NOT_AUTHORIZED : requestLogin( true ); break;
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function updateEvents( updated_events : Array<getCalendarEndpoint.Event> ) : void
    {
        //console.log("updateEvents", props.events );
        let ordered_events : Array<EventInfo> = [];

        //
        let i     : number;
        let start : Date;
        let end   : Date;

        for( i=0; i < updated_events.length; i++ )
        {
            start = createDate( updated_events[i].start.dt );
            end   = createDate( updated_events[i].end.dt );
            //console.log("start", updated_events[i].start.dt, dateId( start ), updated_events[i].end.dt, dateId( end ) );

            // Fix when end is +1 day from start and is a full day
            if( updated_events[i].start.allday )
            {
                // subtrack 1 day
                end.setTime( end.getTime() - Constants.DAYS_TO_MS );
            }

            ordered_events.push( {  id          : updated_events[i].id,
                                    calendar    : updated_events[i].calendarId,
                                    summary     : updated_events[i].summary,
                                    color       : updated_events[i].color,
                                    start       : start.getTime()/Constants.MINUTES_TO_MS,
                                    start_date  : dateId( start ),
                                    start_time  : updated_events[i].start.allday ? 0 : minutesSinceMidnight( start ),
                                    end_date    : dateId( end ),
                                    end_time    : updated_events[i].start.allday ? Constants.MINUTES_TO_DAY : minutesSinceMidnight( end ),
                                    allday      : updated_events[i].start.allday,
                                    days        : Math.floor( ( end.getTime() - start.getTime() ) / Constants.DAYS_TO_MS ) + 1 } );
        }
        ordered_events.sort( orderEvent );
        
        //console.log( "ordered", ordered_events );
        //console.log('cells', cells.current );

        clearCellRows();

        let j         : number;
        let k         : number;
        let row       : number;
        let row_found : number;
        
        for( i=0; i < ordered_events.length; i++ )
        {
            // find the date cell this ordered event starts in
            for( j=0; j < cells.current.length; j++ )
            {
                if( cells.current[j].date == ordered_events[i].start_date )
                {
                    // find next space to add this
                    row_found = -1;
                    for( row=0; row < cells.current[j].events.length; row++ )
                    {
                        if( cells.current[j].events[row] == null )
                        {
                            row_found = row;

                            // if multiple days, is this row open for each of those days?
                            // TODO
                            break;
                        }
                    }

                    // no space found
                    if( row_found < 0 )
                    {
                        addCellRow();
                        row_found = cells.current[j].events.length - 1;
                    }

                    cells.current[j].events[ row_found ] = ordered_events[i];

                    // end date not the same as start date -> multiple day event
                    if( ordered_events[i].days > 1 )
                    {
                        //console.log( "nbr_days", ordered_events[i].summary, ordered_events[i].days );
                        for( k=1; k < ordered_events[i].days; k++ )
                        {
                            if( j+k < cells.current.length )cells.current[j+k].events[ row_found ] = ordered_events[i];
                        }
                    }

                    // TODO: if multiple days, fill in the place for each of those days

                    break;
                } // endif
            }

        }

        // clear spaces
        // map events into cells
        //console.log('added cells', cells.current );
        setEvents( cells.current );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function onDateClick( cell_date : string ) : void
    {
        //const idx       : number = row*7 + col;
        let line        : number;
        let e_events    : Array<EventInfo> = [];
        let idx : number;

        for( idx=0; idx < events.length; idx++ )
        {
            if( events[idx].date == cell_date )
            {
                for( line=0; line < events[idx].events.length; line++ )
                {
                    // if no event or event not starting on this date
                    if( events[idx].events[line] != null && events[idx].events[line].calendar === "primary" )
                    {
                        e_events.push( events[idx].events[line] );
                    }
                }
                break;
            }
            
        }

        setEditEvents( e_events );

        //console.log( idx, e_events.length );
        // if no events, create

        // has events, list
        setEditdate( cell_date );

        if( e_events.length > 0 )
            showList( true );
        else
        {
            setEditEvent( null );
            showEditor( true );
        } 
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function onEditClose() : void
    {
        showEditor( false );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function onListClose() : void
    {
        showList( false );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function onAddEvent() : void
    {
        showList( false );
        setEditEvent( null );
        showEditor( true );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function onEdit( id : string ) : void
    {
        // get event
        let i : number;
        let j : number;
        for( i=0; i < events.length; i++ )
        {
            for( j=0; j < events[i].events.length; j++ )
            {
                if( ObjectUtils.notNull( events[i].events[j] ) && events[i].events[j].id == id )
                {
                    setEditEvent( events[i].events[j] );
                    break;
                }
            }
        }

        showList( false );
        showEditor( true );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function onEditSave() : void
    {
        showEditor( false );
        getEvents();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function onDeleted() : void
    {
        showList( false );
        getEvents();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onLoginRequest( action : AlertAction ) : void
    {
        requestLogin( false );
    }

 
    // ===============================================================================================
    return (
        <div>
            <Stack ref={view} direction={"column"} spacing={0} gap={0} width={"100%"}>
                <Stack direction={"row"} spacing={0} gap={0} justifyContent="center" alignItems="center">
                    
                    { props.warm ? <div>
                        <IconButton size="large" onClick={onPrevious}><ArrowCircleLeftOutlinedIcon /></IconButton>
                        <Button variant="outlined" color="primary" size="large" onClick={onToday} sx={{ width: "100px" }} >{"Today"}</Button>
                        <IconButton size="large" onClick={onNext}><ArrowCircleRightOutlinedIcon /></IconButton>
                    </div> : null }
                    
                </Stack>

                { renderWeeks() }
            </Stack>
            { show_editor ? <EditEvent  event={edit_event}
                                        date={edit_date}
                                        onClose={onEditClose}
                                        onSave={onEditSave}/> : null }
            { show_list ? <ListEvents   date={edit_date}
                                        events={edit_events}
                                        onClose={onListClose}
                                        onSave={onEditSave}
                                        onEdit={onEdit}
                                        onDeleted={onDeleted}
                                        onAdd={onAddEvent}/> : null }
            { request_login ? <AlertPrompt  open={true}
                                                title={"Login Required"}
                                                message={"Google access expired. Please go to Settings and refresh Google access."}
                                                yesText={"OK"}
                                                onAction={onLoginRequest}/> : null }
        </div>
        
    );
    // ===============================================================================================
}

// eof