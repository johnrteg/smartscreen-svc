import * as React from "react";

//
import { Typography, Stack, Box, Card, CardContent, CardActions, Button, Grid } from '@mui/material';


import AppData from "./AppData.js";
import { Interfaces } from "./Interfaces.js";

//
//import AppData from "../../data/AppData.js";
//
import Space            from "./modules/space/Space.js";
import Clock            from "./modules/clock/Clock.js";
import TimeZones        from "./modules/timezones/TimeZones.js";
import Weather          from "./modules/weather/Weather.js";
import WeatherForecast  from "./modules/weather/WeatherForecast.js";
import Calendar         from "./modules/calendar/Calendar.js";
import Exchange         from "./modules/exchange/Exchange.js";
import MapGoogle        from "./modules/map/MapGoogle.js";
import Commute          from "./modules/commute/Commute.js";
import WordOfDay        from "./modules/word/WordOfDay.js";




export interface PageProps
{
    name : string;
    rows : Array<Interfaces.Row>;
    warm : boolean;
}


//
//
//
export default function Page( props : PageProps ) : JSX.Element
{

    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );

    ///////////////////////////////////////////////////////////////////////////////
    async function onLogin() : Promise<void>
    {
        //console.log('button pressed');
        //let response : any = await appdata.server.get('/account');
        //console.log('button pressed', response );
    }

    ///////////////////////////////////////////////////////////////////////////////
    function renderWidget( widget: Interfaces.Widget ) : JSX.Element
    {
        switch( widget.module )
        {
            case "space"        : return <Space/>;
            case "clock"        : return <Clock config={widget.config}/>;
            case "timezones"    : return <TimeZones config={widget.config}/>;
            case "wxnow"        : return <Weather config={widget.config}/>;
            case "wxforecast"   : return <WeatherForecast config={widget.config}/>;
            case "calendar"     : return <Calendar config={widget.config} warm={props.warm}/>;
            case "exchange"     : return <Exchange config={widget.config}/>;
            case "map"          : return <MapGoogle config={widget.config}/>;
            case "commute"      : return <Commute config={widget.config}/>;
            case "word"         : return <WordOfDay config={widget.config}/>;
        }
        return null;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderRow( row_index: number, widgets: Array<Interfaces.Widget> ) : Array<JSX.Element>
    {
        let row : Array<JSX.Element> = [];
        widgets.forEach( ( widget: Interfaces.Widget, index: number ) => { row.push( <Box key={row_index + "." + index} sx={{width:widget.width}} >{renderWidget( widget )}</Box> ) } );
        return row;
    }


      /*
                  <Grid container={true} spacing={2}>
                <Grid item xs={5}>
                    
                </Grid>
                <Grid item xs={3}>
                    
                </Grid>
            </Grid>
      */
    // ===============================================================================================
    return (
        <div style={{width: '100%' }}>
            <Stack direction={"column"} gap={2}>
                { props.rows ? props.rows.map( ( row : Interfaces.Row, index: number ) => { return <Stack key={index} gap={2} direction={"row"}>{ renderRow( index, row.widgets ) }</Stack> } ) : null }
            </Stack>
        </div>
    );
    // ===============================================================================================
}

// eof