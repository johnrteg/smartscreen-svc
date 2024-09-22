//
import * as React from "react";

//
import {Loader, LoaderOptions} from 'google-maps';
import {APIProvider, Map, MapEvent} from '@vis.gl/react-google-maps';


//
import { Typography, Stack, Box, Grid } from '@mui/material';

import { LocalAirport as LocalAirportIcon } from '@mui/icons-material';
import { Icon as AirplaneIcon } from "./icons/AirplaneIcon.js";
import { Icon as WorkIcon } from "./icons/WorkIcon.js";
import { Icon as ShopIcon } from "./icons/ShopIcon.js";
import { Icon as SchoolIcon } from "./icons/SchoolIcon.js";
import { Icon as TrainIcon } from "./icons/TrainIcon.js";
import { Icon as HospitalIcon } from "./icons/HospitalIcon.js";
import { Icon as GymIcon } from "./icons/GymIcon.js";


import Title from "../../widgets/Title.js";

//
import AppData from "../../AppData.js";

import StringUtils from "../../../utils/StringUtils.js";
import { Constants } from "../../../utils/Constants.js";

enum Direction
{
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical",
}

interface Route
{
    name    : string;
    address : string;
    icon    : string;
}

export interface CommuteConfig
{
    //from         : string;
    to           : Array<Route>;
    update_hours : number;
    direction    : string;
    title        : boolean;
    gap          : number;
}     

export interface CommuteProps
{
    config : CommuteConfig;
}

interface CommuteRoute
{
    name    : string;
    icon    : string;
    distance : number;
    time     : number;
    delay     : number;
}


//
//
//
export default function Commute( props : CommuteProps ) : JSX.Element
{
    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );
    
    const map                       = React.useRef<any>(null);
    const [routes, setRoutes]       = React.useState< Array<CommuteRoute> >( [] );
    const [since, setSince]         = React.useState< string >( "" );
    const last_refresh              = React.useRef<Date>(null);

    const directions                = React.useRef<google.maps.DirectionsService>(null);

    //
    React.useEffect( () => pageLoaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
    }

    ///////////////////////////////////////////////////////////////////////////////////
    async function getRoute( route : Route ) : Promise<CommuteRoute>
    {
        return new Promise( (resolve) => {

            const request : google.maps.DirectionsRequest = {
                drivingOptions  : { departureTime: new Date(),
                                    trafficModel : google.maps.TrafficModel.BEST_GUESS
                                    },
                origin          : appdata.settings.location.address,
                destination     : route.address,
                travelMode      : google.maps.TravelMode['DRIVING']
            };

            directions.current.route( request, function( result : google.maps.DirectionsResult, status : google.maps.DirectionsStatus )
            {
                if( status == 'OK')
                {
                    //console.log( route.address, result.routes[0].legs[0].duration, result.routes[0].legs[0].duration_in_traffic );
                    const rt : CommuteRoute = { name    : route.name,
                                                icon    : route.icon,
                                                distance: result.routes[0].legs[0].distance.value,
                                                time    : result.routes[0].legs[0].duration_in_traffic.value / 60,
                                                delay   : ( result.routes[0].legs[0].duration_in_traffic.value - result.routes[0].legs[0].duration.value ) / 60 };
                    
                    //new_routes.current.push( rt );
                    //console.log( new_routes.current );
                    //if( timer_id.current )clearTimeout( timer_id.current );
                    //timer_id.current = setTimeout( update, 100 );
                    resolve( rt );
                }
                else
                {
                    resolve( null );
                }
            });

        });

    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async function refresh() : Promise<void>
    {
        let rts : Array<CommuteRoute> = [];

        let i : number;
        let rt : CommuteRoute;
        for( i=0; i < props.config.to.length; i++ )
        {
            rt = await getRoute( props.config.to[i] );
            if( rt )rts.push( rt );
        }

        last_refresh.current = new Date();
        setRoutes( rts );
        updateSince();
        
        setTimeout( refresh, appdata.nextUpdate( props.config.update_hours * Constants.HOURS_TO_MS ) );   
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function updateSince() : void
    {
        const now : Date = new Date();
        const min_diff : number = ( now.getTime() - last_refresh.current.getTime() ) / (60*1000);
        //console.log("updateSince", min_diff, hoursLabel( min_diff ) );

        // break to catch if refresh is not triggering due to screen hibernation
        if( min_diff > 180 )refresh();
        
        setSince( hoursLabel( min_diff ) );
        setTimeout( updateSince, Constants.MINUTES_TO_MS );
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderIcon( id : string, size : string ) : JSX.Element
    {
        switch( id )
        {
            case "plane"    : return <AirplaneIcon width={size} height={size} color="white" />; break;
            case "work"     : return <WorkIcon width={size} height={size} color="white"/>; break;
            case "shop"     : return <ShopIcon width={size} height={size} color="white"/>; break;
            case "school"   : return <SchoolIcon width={size} height={size} color="white"/>; break;
            case "train"    : return <TrainIcon width={size} height={size} color="white"/>; break;
            case "hospital" : return <HospitalIcon width={size} height={size} color="white"/>; break;
            case "gym"      : return <GymIcon width={size} height={size} color="white"/>; break;
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function hoursLabel( input_minutes : number ) : string
    {
        const hrs     : number = Math.abs( input_minutes );
        const hour    : number = Math.floor( hrs / 60 );
        const minutes : number = Math.ceil( hrs - hour*60 );
        //console.log( hrs, hrs*60, "hour", hour, "minutes", minutes );
        let label     : string = input_minutes > 0 ? "" : "-";
        if( hour > 0 )
            label = StringUtils.format( "{0}:{1}", hour, StringUtils.leadingZero( minutes, 2 ) );
        else
            label = StringUtils.format( "{0} mins", StringUtils.leadingZero( minutes, 2 ) );
        return label;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderPath( route : CommuteRoute, index : number ) : JSX.Element
    {
        //console.log("path", route );
        const label     : string = hoursLabel( route.time );
        const delay     : string = hoursLabel( route.delay );

        const elem : JSX.Element = <tr key={index}>
            <td>{ renderIcon( route.icon, "25px" ) }</td>
            <td><Typography component="div" color={"text.primary"}>{ route.name }</Typography></td>
            <td><Typography component="div" color={"text.secondary"} >{ label }</Typography></td>
            <td><Typography component="div" color={"error"} >{ route.delay > 1 ? '+' + delay : '' }</Typography></td>
        </tr>;
  
        return elem;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onTileLoaded( event: MapEvent<unknown> ) : void
    {
        if( map.current == null )
        {
            map.current = event.map;
            const trafficLayer : any = new google.maps.TrafficLayer();
            trafficLayer.setMap( map.current );

            directions.current = new google.maps.DirectionsService();

            refresh();
        }
            
    }


    // ===========================================================================================================
    return (
        <Stack direction={ "column" } spacing={0} gap={0} width={"100%"}>
            <div style={ { width: "2", height: "1px" } } >
            <APIProvider apiKey={ appdata.config.google.map.key }>
                <Map 
                        defaultZoom         = { 8 }
                        defaultCenter       = { { lat: 37, lng: -77 } }
                        zoomControl         = { false }
                        mapTypeControl      = { false }
                        scaleControl        = { false }
                        streetViewControl   = { false }
                        fullscreenControl   = { false }
                        onTilesLoaded={ onTileLoaded }
                        >
                </Map>
            </APIProvider>
            </div>  
            { props.config.title ? <Title label={ "Commute: " + since + " ago" } /> : null }
            <table>
                <tbody>
                    { routes.map( ( route : CommuteRoute, index : number ) => { return renderPath( route, index ) } ) }
                </tbody>
            </table>
        </Stack>       
    );
    // ===============================================================================================
}

// eof