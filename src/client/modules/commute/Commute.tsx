//
import * as React from "react";

//
import {Loader, LoaderOptions} from 'google-maps';


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

import { netClient } from "../../../net/netClient.js";
import { Constants } from "../../../utils/Constants.js";

import { getCommuteEndpoint } from "../../../api/getCommuteEndpoint.js";
import StringUtils from "../../../utils/StringUtils.js";

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
    from         : string;
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
    
    const map               = React.useRef<any>(null);
    const [routes, setRoutes]         = React.useState< Array<CommuteRoute> >( [] );

    //
    React.useEffect( () => pageLoaded(), [] );
    //React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        //load();
        refresh();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function load() : Promise<void>
    {
        const options: LoaderOptions = {};
        const loader : Loader = new Loader('AIzaSyAh7YwRm96CWF8eftoTrnvt1kfhNDYB7fY', options);

        map.current = await loader.load().then( asyncLoad );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function asyncLoad( google : any ) : void
    {
        refresh();
    }

    //////////////////////////////////////////////////////
    function getRoute( destination : string ) : void
    {
        const dir : google.maps.DirectionsService = new google.maps.DirectionsService();
        const request : google.maps.DirectionsRequest = {
                                drivingOptions: { departureTime: new Date(), trafficModel : google.maps.TrafficModel.PESSIMISTIC },
                                origin: props.config.from,
                                destination: destination,
                                travelMode: google.maps.TravelMode['DRIVING']
                            };
          dir.route( request, function(result:google.maps.DirectionsResult, status:google.maps.DirectionsStatus)
          {
            if( status == 'OK')
            {
              console.log( destination, result.routes[0].legs[0].duration, result.routes[0].legs[0].duration_in_traffic );
            }
          });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async function refresh() : Promise<void>
    {
        // destinations
        let to_adr : Array<string> = [];
        props.config.to.forEach( ( rt : Route )=> { to_adr.push( rt.address ) } );

        let i : number;
        for( i=0; i < to_adr.length; i++ )
        {
            getRoute( to_adr[i] );
        }

        /*
        const endpt : getCommuteEndpoint = new getCommuteEndpoint();
        endpt.request.from = props.config.from;
        endpt.request.to   = to_adr.join('|');
        endpt.request.mode = "car";

        //console.log( endpt.request );

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt, { cache: true, lifespan: 240, timeout: endpt.request.to.length*1000 } ); // 240 minute force update
        if( reply.ok )
        {
            
            const data : getCommuteEndpoint.ReplyData = reply.data;

            //console.log("commute", data );

            let rts : Array<CommuteRoute> = [];
            let rt : CommuteRoute;

            let i : number;
            for( i=0; i < data.paths.length; i++ )
            {
                rt = {  name    : props.config.to[i].name,
                        icon    : props.config.to[i].icon,
                        distance: data.paths[i].distance,
                        time    : data.paths[i].time,
                        delay   : data.paths[i].delay
                    };
                rts.push( rt );
            }

            setRoutes( rts );
        }
        else
        {
            console.error("commute", reply.error );
        }
        */
        setTimeout( refresh, appdata.nextUpdate( props.config.update_hours * Constants.HOURS_TO_MS ) );
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
    function hoursLabel( hours : number ) : string
    {
        const hrs     : number = Math.abs( hours );
        const hour    : number = Math.floor( hrs / 60 );
        const minutes : number = Math.ceil( hrs - hour*60 );
        let label     : string = hours > 0 ? "" : "-";
        if( hour > 0 )label = StringUtils.format( "{0} hour{1}", hour, hour > 1 ? "s" : "" );
        label += " ";
        label += StringUtils.format( "{0} mins", StringUtils.leadingZero( minutes, 2 ) );
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
            <td><Typography component="div" color={"error"} >{ route.delay > 1 ? '+'+delay : '' }</Typography></td>
        </tr>;

// <Grid item xs={5}><Typography component="div" color={"text.secondary"} >{ route.delay.toFixed(1) }</Typography></Grid>
        /*
        const elem : JSX.Element = <Stack key={index} direction={"row"} spacing={0} gap={0.5} >
            { renderIcon( route.icon ) }
            <Typography component="div" color={"text.primary"}>{ route.name }</Typography>
            <Typography component="div" color={"text.secondary"} >{ label }</Typography>
        </Stack>;
        */
            
        return elem;
    }

    /*
    <Stack direction={ props.config.direction == Direction.HORIZONTAL ? "row" : "column" } spacing={0} gap={props.config.gap} width={"100%"}>
                { routes.map( ( route : CommuteRoute, index : number ) => { return renderPath( route, index ) } ) }
            </Stack>
    */
    // ===========================================================================================================
    return (
        <Stack direction={ "column" } spacing={0} gap={0} width={"100%"}>
            { props.config.title ? <Title label="Commute" /> : null }
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