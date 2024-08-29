//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';

//
import { getWxNowEndpoint }  from '../../../api/getWxNowEndpoint.js';
import { WxModule } from './WxModule.js';
import { netClient } from '../../../net/netClient.js';



//
//
//
export default class getWx extends getWxNowEndpoint
{
    private module : WxModule;

    /////////////////////////////////////////////////////////////////////////////////
    constructor( module : WxModule )
    {
        super();
        this.module = module;
    }

    //////////////////////////////////////////////////////////////////////
    // https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
    public static Coverage( value : string ) : getWxNowEndpoint.Conditions
    {
        switch( value )
        {
            case "1000" : return getWxNowEndpoint.Conditions.CLEAR;

            case "1003" : return getWxNowEndpoint.Conditions.PARTLY_ClOUDY;
            case "1006" : return getWxNowEndpoint.Conditions.CLOUDY;
            case "1009" : return getWxNowEndpoint.Conditions.OVERCAST;

            case "1030" : return getWxNowEndpoint.Conditions.MIST;

            case "1072" : return getWxNowEndpoint.Conditions.DRIZZLE;
            case "1150" : return getWxNowEndpoint.Conditions.DRIZZLE;   // PATCHY LIGHT DRIZZLE
            case "1153" : return getWxNowEndpoint.Conditions.DRIZZLE;   // LIGHT DRIZZLE
            case "1168" : return getWxNowEndpoint.Conditions.DRIZZLE;   // FREEZING DRIZZLE
            case "1171" : return getWxNowEndpoint.Conditions.DRIZZLE;   // HEAVY FREEZING DRIZZLE

            case "1063" : return getWxNowEndpoint.Conditions.SHOWERS;
            case "1240" : return getWxNowEndpoint.Conditions.SHOWERS;      // LIGHT RAIN SHOWERS
            case "1243" : return getWxNowEndpoint.Conditions.SHOWERS;      // MODERATE-HEAVY RAIN SHOWERS
            case "1246" : return getWxNowEndpoint.Conditions.SHOWERS;      // TORRENTIAL RAIN SHOWERS

            case "1180" : return getWxNowEndpoint.Conditions.RAIN;      // PATCHY LIGHT RAIN
            case "1183" : return getWxNowEndpoint.Conditions.RAIN;      // LIGHT RAIN
            case "1186" : return getWxNowEndpoint.Conditions.RAIN;      // MODERATE LIGHT RAIN
            case "1189" : return getWxNowEndpoint.Conditions.RAIN;      // MODERATE RAIN
            case "1192" : return getWxNowEndpoint.Conditions.RAIN;      // HEAVY RAIN AT TIMES
            case "1195" : return getWxNowEndpoint.Conditions.RAIN;      // HEAVY RAIN
            case "1198" : return getWxNowEndpoint.Conditions.RAIN;      // LIGHT FREEZING RAIN
            case "1201" : return getWxNowEndpoint.Conditions.RAIN;      // MODERATE-HEAVY FREEZING RAIN
            
            case "1087" : return getWxNowEndpoint.Conditions.THUNDERSTORM;
            case "1273" : return getWxNowEndpoint.Conditions.THUNDERSTORM;  // PATCHY LIGHT RAIN WITH THUNDER
            case "1276" : return getWxNowEndpoint.Conditions.THUNDERSTORM;  // MODERATE-HEAVY RAIN WITH THUNDER

            case "1066" : return getWxNowEndpoint.Conditions.SNOW;
            case "1114" : return getWxNowEndpoint.Conditions.SNOW;  // BLOWING SNOW
            case "1117" : return getWxNowEndpoint.Conditions.SNOW;  // BLIZZARD
            case "1210" : return getWxNowEndpoint.Conditions.SNOW;  // PATCHY LIGHT SNOW
            case "1213" : return getWxNowEndpoint.Conditions.SNOW;  // LIGHT SNOW
            case "1216" : return getWxNowEndpoint.Conditions.SNOW;  // PATCHY MODERATE SNOW
            case "1219" : return getWxNowEndpoint.Conditions.SNOW;  // MODERATE SNOW
            case "1222" : return getWxNowEndpoint.Conditions.SNOW;  // PATCHY HEAVY SNOW
            case "1225" : return getWxNowEndpoint.Conditions.SNOW;  // HEAVY SNOW
            case "1255" : return getWxNowEndpoint.Conditions.SNOW;  // LIGHT SNOW SHOWERS
            case "1258" : return getWxNowEndpoint.Conditions.SNOW;  // MODERATE-HEAVY SNOW SHOWERS
            case "1279" : return getWxNowEndpoint.Conditions.SNOW;  // PATCHY LIGHT SNOW WITH THUNDER
            case "1282" : return getWxNowEndpoint.Conditions.SNOW;  // MODERATE-HEAVY SNOW WITH THUNDER

            case "1069" : return getWxNowEndpoint.Conditions.SLEET;
            case "1204" : return getWxNowEndpoint.Conditions.SLEET; // LIGHT SLEET
            case "1207" : return getWxNowEndpoint.Conditions.SLEET; // MODERATE-HEAVY SLEET
            case "1237" : return getWxNowEndpoint.Conditions.SLEET; // ICE PELLETS
            case "1249" : return getWxNowEndpoint.Conditions.SLEET; // LIGHT SLEET SHOWERS
            case "1252" : return getWxNowEndpoint.Conditions.SLEET; // MODERATE-HEAVY SLEET SHOWERS
            case "1261" : return getWxNowEndpoint.Conditions.SLEET; // LIGHT SHOWERS OF ICE PELLETS
            case "1264" : return getWxNowEndpoint.Conditions.SLEET; // MODERATE-HEAVY SHOWERS OF ICE PELLETS

            case "1135" : return getWxNowEndpoint.Conditions.FOG;
            case "1147" : return getWxNowEndpoint.Conditions.FOG;   // FREEZING FOG
        }

        return getWxNowEndpoint.Conditions.CLEAR;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        let reports : Array<getWxNowEndpoint.Report> = [];

        const endpt : netClient = new netClient( "" );
        const response : netClient.Reply = await endpt.get( "http://api.weatherapi.com/v1/current.json",
            {   q     : this.request.location,
                alerts : "yes",
                key   : this.module.key }, null, 1500 );                   
        //console.log( "gotWx", JSON.stringify( response.data, null, 4 ) );

        console.log( "getWx", this.request, response.ok, new Date().toLocaleString() );

        if( response.ok )
        {
            try
            {
                    reports.push( { temperature : response.data.current.temp_f, // temp_c
                                    feels_like : response.data.current.feelslike_f, // feelslike_c
                                    humidity : response.data.current.humidity,
                                    dew_point : response.data.current.dewpoint_f, // dewpoint_c
                                    percipitation: response.data.current.precip_in, // precip_mm
                                    conditions : getWx.Coverage( response.data.current.condition.code ),
                                    wind : { speed: response.data.current.wind_mph, direction: response.data.current.wind_degree, gust : response.data.current.gust_mph }, // gust_kph
                                    cloud_coverage : ( response.data.current.cloud / 100 )
                                } );
            }
            catch( err: any )
            {
                console.error( "wx: error parsing JSON response" );
            }
                
        }
        else
        {
            console.error( response.error );
        }

        // reply
        let reply : getWxNowEndpoint.ReplyData = { reports : reports };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//