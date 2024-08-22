import * as React from "react";
//

import { Typography, Stack, Box, Button} from '@mui/material';

//
import StringUtils from "../../../utils/StringUtils.js";
import { Constants } from "../../../utils/Constants.js";

import AppData from "../../AppData.js";


export interface MonthlyViewProps
{
    days : number;
    start_date : Date;
}

interface Event
{
    id         : string;
    start_date : number;    // seconds since 1970
    end_date   : number;
    title      : string;
}


//
//
//
export default function MonthlyView( props : MonthlyViewProps ) : JSX.Element
{
    const [appdata,setAppData]              = React.useState< AppData >( AppData.instance() );

    const dow                               = React.useRef< Array<string> >( ["S","M","T","W","T","F","S"] );
    const month                             = React.useRef< Array<string> >( ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug", "Sep", "Oct", "Nov", "Dec"] );

    const [start_date, setStartDate]         = React.useState<Date>(null);
    //const [number_of_days, setNumbereOfDays] = React.useState<number>( 90 );

    const [events, setEvents]         = React.useState< Array<Event> >( [] );


    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( startChanged, [props.start_date] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        const today : number = new Date().getTime()/1000;
        setEvents( [    { id: "1234", start_date: today, end_date: today + ( Constants.HOURS_TO_MS / 1000), title: "New Event" },
                        { id: "5678", start_date: today, end_date: today + ( Constants.HOURS_TO_MS / 1000), title: "Gym" },
                        { id: "abcd", start_date: today, end_date: today + ( Constants.DAYS_TO_MS  / 1000), title: "Swim Meet" },
                        { id: "efgh", start_date: today, end_date: today + ( Constants.HOURS_TO_MS / 1000), title: "Car wash" }
         ] );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        //console.log("cal unloaded");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function startChanged() : void
    {
        //console.log("startChanged", props.start_date );
        if( props.start_date )
        {
            let start : Date = new Date( props.start_date.getFullYear(), props.start_date.getMonth(), 1, 0, 0, 0, 0 );
            start.setTime( start.getTime() - start.getDay() * Constants.DAYS_TO_MS );   // move back to sundary of that week
            setStartDate( start );
        }
        
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderEvents( date_seconds : number, row : number, col : number ) : Array<JSX.Element>
    {
        let event_elements : Array<JSX.Element> = null;

        let i : number;

        for( i=0; i < events.length; i++ )
        {
            if( events[i].start_date >= date_seconds ) //&& events[i].end_date < date_seconds + ( Constants.DAYS_TO_MS/1000 ) )
            {
                if( event_elements == null )event_elements = [];

                // already has 3
                if( event_elements.length == 3 )
                {
                    event_elements.push( <Box key={ "more_" + date_seconds.toString() } component="section" width={"100%"} height={"20px"} >
                        <Typography sx={{ fontSize: 12, lineHeight:1.0, padding:0.5 }} component="div" color="text.secondary">{ "More..." }</Typography>
                        </Box> );
                    break;
                }
                else
                {
                    event_elements.push( <Box key={ events[i].id } component="section" width={"100%"} height={"20px"} sx={ { borderRadius:1, bgcolor: "#616161" } }>
                        <Typography sx={{ fontSize: 12, lineHeight:1.0, padding:0.5 }} component="div" color="text.primary">{ events[i].title }</Typography>
                        </Box> );
                }
                
            }
        }

        return event_elements;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderCellInside( today : Date, cell_date : Date, row : number, col : number  ) : JSX.Element
    {
        let label : string = "";
        let date_color : string = "text.primary";

        // show month on the first cell and the first day of each month
        if( cell_date.getDate() == 1 || ( row == 0 && col == 0 ) )
        {
            label = StringUtils.format( "{0} ", month.current[ cell_date.getMonth() ] );
            date_color = "primary";
        }  
        label += cell_date.getDate();

        // banner
        let banner : any = {display:'flex', justifyContent:'center', paddingTop:0.5, paddingRight:0.5, paddingBottom:0.5 };//, bgcolor: "#00a152" };
        //if( cell_date.getMonth() % 2 == 0 )banner['bgcolor'] = "#1c54b2"; // 10%
        //if( today.getTime() == cell_date.getTime() )banner['bgcolor'] = '#b22a00';
        
        if( today.getTime() == cell_date.getTime() )date_color = "error";

        return  <Stack direction={"column"} spacing={0} gap={0.3} width={"100%"}>
                    <Box key={ "in_" + cell_date.getTime()/1000 } sx={ banner }>
                        <Typography sx={{ fontSize: 40, lineHeight:1.0, padding:0 }} component="div" color={date_color}>{ label }</Typography>
                    </Box>
                    { renderEvents( cell_date.getTime()/1000, row, col ) }
                </Stack>;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderCell( today : Date, date : number, row : number, col : number, maxRow : number  ) : JSX.Element
    {
        const cell_date : Date = new Date( start_date.getTime() + ( (row*7 + col) * Constants.DAYS_TO_MS ) );

        let sx : any = { p: 0.0, borderTop: '1px solid grey' };//, borderLeft: '1px solid grey' };
        //if( col == 6 )sx['borderRight'] = '1px solid grey';
        if( row == maxRow-1 )sx['borderBottom'] = '1px solid grey';

        //sx['bgcolor'] = "#00e676";
        //if( cell_date.getMonth() % 2 == 0 )sx['bgcolor'] = '#2979ff'; // 10%
        //if( today.getTime() == cell_date.getTime() )sx['bgcolor'] = '#ff6333'; // orange 40%

        return <Box key={ cell_date.getTime() } component="section" width={"100%"} height={"140px"} sx={ sx }>{ renderCellInside( today, cell_date, row,col)}</Box>;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderRow( today : Date, date : number, row : number, maxRow : number ) : JSX.Element
    {
        let rowel : JSX.Element = <Stack key={row} direction={"row"} spacing={0} gap={0} width={"100%"}>
            { dow.current.map( ( dow : string, col : number ) => { return renderCell( today, date, row, col, maxRow ) } ) }
        </Stack>;

        return rowel;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderDow( dow : string  ) : JSX.Element
    {
        return  <Box key={dow} component="section" width={"100%"} sx={{display:'flex', justifyContent:'center'}} >
                    <Typography sx={{ fontSize: 42, lineHeight:1.0, padding:1 }} component="div" color="text.primary">{dow}</Typography>
                </Box>;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderHeader() : JSX.Element
    {
        let header : JSX.Element = <Stack key={"header"} direction={"row"} spacing={0} gap={0} width={"100%"}>
            { dow.current.map( ( dow : string ) => { return renderDow( dow )} ) }
        </Stack>;
        return header;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderWeeks() : Array<JSX.Element>
    {
        if( start_date == null )return null;

        // pass today
        let today : Date = new Date();
        today.setHours( 0, 0, 0, 0 );

        const nbr_weeks : number = Math.ceil( props.days / 7 );
        let weeks   : Array<JSX.Element> = [];
        let w       : number;
        let date    : number = start_date.getTime();

        weeks.push( renderHeader() );

        for( w = 0; w < nbr_weeks; w++ )
        {
            weeks.push( renderRow( today, date, w, nbr_weeks ) );
        }

        return weeks;
    }
 
    // ===============================================================================================
    

    return (
        <Stack direction={"column"} spacing={0} gap={0} width={"100%"}>
            { renderWeeks() }
        </Stack>
             
    );
    // ===============================================================================================
}

// eof