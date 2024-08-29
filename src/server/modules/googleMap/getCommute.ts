//
//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';
import { Constants }            from "../../../utils/Constants.js";

//
import { netClient }            from '../../../net/netClient.js';
import { getCommuteEndpoint }   from '../../../api/getCommuteEndpoint.js';
import { GoogleMapModule }      from './GoogleMapModule.js';



//
//
//
export default class getCommute extends getCommuteEndpoint
{
    private module : GoogleMapModule;

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor( module : GoogleMapModule )
    {
        super();
        this.module = module;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        //console.log( "getCommute", this.module.key, this.request, new Date().toLocaleString() );

        let paths : Array<getCommuteEndpoint.Path> = [];

        const desinations : Array<string> = this.request.to.split('|');

        /*
        const client : Client = new Client({});
        const start : LatLng = this.request.from;//{ lat: 39.11775064230138, lng: -77.25144580443207 };

        //const end   : LatLng = this.request.to; //{ lat: 38.93558700618929, lng: -77.18793109754284 }; 
        let request : DirectionsRequest = { params: {   origin      : start,
                                                        destination : "",
                                                        departure_time : new Date().getTime(),
                                                        mode        : TravelMode.driving,
                                                        key         : this.module.key } };//,
                                                        //traffic_model: TrafficModel.pessimistic } };
        

        console.log( request );
        */

        const endpt : netClient = new netClient( "" );
        

        let to          : number;
        //let dirs        : DirectionsResponse;
        let route       : number;
        let leg         : number;
        let distance    : number;
        let time        : number;
        let delay       : number;
        let path        : getCommuteEndpoint.Path;

        
        for( to=0; to < desinations.length; to++ )
        {
            //request.params.destination = desinations[to];
            //console.log( desinations[to] );

            path = { to:  desinations[to], distance: 0, time: 0, delay : 0 };

            try
            {
                const response : netClient.Reply = await endpt.get( "https://maps.googleapis.com/maps/api/directions/json",
                                    {   origin         : this.request.from,
                                        destination    : desinations[to],
                                        departure_time : new Date().getTime(),
                                        mode           : "driving",
                                        traffic_model  : "best_guess", // https://developers.google.com/maps/documentation/routes/traffic-model
                                        key            : this.module.key
                                    } );

                if( response.ok )
                {
                    for( route=0; route < response.data.routes.length; route++ )
                    {
                        distance = 0;
                        time = 0;
                        delay = 0;

                        for( leg=0; leg < response.data.routes[route].legs.length; leg++ )
                        {
                            //console.log( dirs.data.routes[route].legs[leg].distance );
                            if( response.data.routes[route].legs[leg].distance )distance += response.data.routes[route].legs[leg].distance.value;
                            //if( dirs.data.routes[route].legs[leg].duration )time     += dirs.data.routes[route].legs[leg].duration.value;
                            if( response.data.routes[route].legs[leg].duration_in_traffic )
                            {
                                console.log("in traffic", response.data.routes[route].legs[leg].duration_in_traffic );
                                time     += response.data.routes[route].legs[leg].duration_in_traffic.value;
                                delay    += ( response.data.routes[route].legs[leg].duration_in_traffic.value - response.data.routes[route].legs[leg].duration.value );
                            }
                            else if( response.data.routes[route].legs[leg].duration )
                            {
                                time     += response.data.routes[route].legs[leg].duration.value;
                            }
                        }

                        //console.log( to, route, (distance / Constants.MILES_TO_METERS).toFixed(1), (time/60).toFixed(1), (delay/60).toFixed(1) );
                        path.time = time / 60;  // minutes
                        path.delay = delay / 60;
                        path.distance = distance / Constants.MILES_TO_METERS;

                        // todo: need to look at minimum timed route
                        //console.log( "WARNINGS", JSON.stringify( response.data.routes[route].warnings, null, 4 ) );
                    }
                    
                }
                else
                {
                    console.error( "commute: bad", response.error );
                }

                paths.push( path );

            }
            catch( err : any )
            {
                console.error( "commute: " );//, err );
            }
        }
            
        
       //console.log( paths );

        // reply
        let reply : getCommuteEndpoint.ReplyData = { paths : paths };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//