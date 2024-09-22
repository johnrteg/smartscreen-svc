import * as React from "react";

import {APIProvider, Map, MapEvent} from '@vis.gl/react-google-maps';

import AppData          from "../../AppData.js";


export interface MapConfig
{
    height : string;
    zoom : number;
    lat : number;
    lon : number;
    zoomControl : boolean;
    mapTypeControl : boolean;
    scaleControl : boolean;
    streetViewControl : boolean;
    fullscreenControl : boolean;
}     

export interface MapGoogleProps
{
    config : MapConfig;
}


//
//
//
export default function MapGoogle( props : MapGoogleProps ) : JSX.Element
{
    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );

    const map               = React.useRef<any>(null);
    const styles               = React.useRef<Array<any>>([{ elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "poi",elementType: "labels.text.fill",stylers: [{ color: "#d59563" }],},
        { featureType: "poi.park",elementType: "geometry",stylers: [{ color: "#263c3f" }],},
        { featureType: "poi.park",elementType: "labels.text.fill",stylers: [{ color: "#6b9a76" }],},
        { featureType: "road",elementType: "geometry",stylers: [{ color: "#38414e" }],},
        { featureType: "road",elementType: "geometry.stroke",stylers: [{ color: "#212a37" }],},
        { featureType: "road",elementType: "labels.text.fill",stylers: [{ color: "#9ca5b3" }],},
        { featureType: "road.highway",elementType: "geometry",stylers: [{ color: "#746855" }],},
        { featureType: "road.highway",elementType: "geometry.stroke",stylers: [{ color: "#1f2835" }],},
        { featureType: "road.highway",elementType: "labels.text.fill",stylers: [{ color: "#f3d19c" }],},
        { featureType: "transit",elementType: "geometry",stylers: [{ color: "#2f3948" }],},
        { featureType: "transit.station",elementType: "labels.text.fill",stylers: [{ color: "#d59563" }],},
        { featureType: "water",elementType: "geometry",stylers: [{ color: "#17263c" }],},
        { featureType: "water",elementType: "labels.text.fill",stylers: [{ color: "#515c6d" }],},
        { featureType: "water",elementType: "labels.text.stroke",stylers: [{ color: "#17263c" }],}
    ]);

    //
    React.useEffect( () => pageLoaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        loadMap();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function loadMap() : Promise<void>
    {
        //refresh();
        //const options: LoaderOptions = {};
        //const loader : Loader = new Loader('AIzaSyAh7YwRm96CWF8eftoTrnvt1kfhNDYB7fY', options );

        //const google : any = await loader.load().then( asyncMap );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    async function asyncMap( google : any ) : Promise<void>
    {
        const styles : Array<any> = [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "poi",elementType: "labels.text.fill",stylers: [{ color: "#d59563" }],},
        { featureType: "poi.park",elementType: "geometry",stylers: [{ color: "#263c3f" }],},
        { featureType: "poi.park",elementType: "labels.text.fill",stylers: [{ color: "#6b9a76" }],},
        { featureType: "road",elementType: "geometry",stylers: [{ color: "#38414e" }],},
        { featureType: "road",elementType: "geometry.stroke",stylers: [{ color: "#212a37" }],},
        { featureType: "road",elementType: "labels.text.fill",stylers: [{ color: "#9ca5b3" }],},
        { featureType: "road.highway",elementType: "geometry",stylers: [{ color: "#746855" }],},
        { featureType: "road.highway",elementType: "geometry.stroke",stylers: [{ color: "#1f2835" }],},
        { featureType: "road.highway",elementType: "labels.text.fill",stylers: [{ color: "#f3d19c" }],},
        { featureType: "transit",elementType: "geometry",stylers: [{ color: "#2f3948" }],},
        { featureType: "transit.station",elementType: "labels.text.fill",stylers: [{ color: "#d59563" }],},
        { featureType: "water",elementType: "geometry",stylers: [{ color: "#17263c" }],},
        { featureType: "water",elementType: "labels.text.fill",stylers: [{ color: "#515c6d" }],},
        { featureType: "water",elementType: "labels.text.stroke",stylers: [{ color: "#17263c" }],}
    ];

        const options : google.maps.MapOptions = {  center              : { lat: props.config.lat, lng: props.config.lon },
                                                    zoom                : props.config.zoom,
                                                    styles              : styles,
                                                    zoomControl         : props.config.zoomControl,
                                                    mapTypeControl      : props.config.mapTypeControl,
                                                    scaleControl        : props.config.scaleControl,
                                                    streetViewControl   : props.config.streetViewControl,
                                                    fullscreenControl   : props.config.fullscreenControl
                                                };

        //const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        map.current = new google.maps.Map( document.getElementById('map'), options );

        const trafficLayer : any = new google.maps.TrafficLayer();
        trafficLayer.setMap( map.current );

    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function apiLoaded() : void
    {
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onTileLoaded( event: MapEvent<unknown> ) : void
    {
        if( map.current == null )
        {
            map.current = event.map;
            const trafficLayer : any = new google.maps.TrafficLayer();
            trafficLayer.setMap( map.current );
        }
            
    }

    // ===============================================================================================
    return <div id={"map"} style={ { width: "100%", height: props.config.height } } >
            <APIProvider apiKey={ appdata.config.google.map.key } onLoad={apiLoaded}>
                <Map 
                        defaultZoom         = { props.config.zoom }
                        defaultCenter       = { { lat: props.config.lat, lng: props.config.lon } }
                        styles              = { styles.current }
                        zoomControl         = { props.config.zoomControl }
                        mapTypeControl      = { props.config.mapTypeControl }
                        scaleControl        = { props.config.scaleControl }
                        streetViewControl   = { props.config.streetViewControl }
                        fullscreenControl   = { props.config.fullscreenControl }
                        onTilesLoaded       = { onTileLoaded }
                    >
                </Map>
            </APIProvider>
    </div>
    ;
    // ===============================================================================================
}

// eof