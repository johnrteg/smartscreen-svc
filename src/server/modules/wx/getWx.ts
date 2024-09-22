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
        //console.log( "icon", value );
        switch( value )
        {
            case "clear-day"   : return getWxNowEndpoint.Conditions.CLEAR;
            case "clear-night" : return getWxNowEndpoint.Conditions.CLEAR;

            case "partly-cloudy-day" : return getWxNowEndpoint.Conditions.PARTLY_ClOUDY;
            case "partly-cloudy-night" : return getWxNowEndpoint.Conditions.PARTLY_ClOUDY;
            case "cloudy" : return getWxNowEndpoint.Conditions.CLOUDY;

            //case "1030" : return getWxNowEndpoint.Conditions.MIST;
            //case "1072" : return getWxNowEndpoint.Conditions.DRIZZLE;

            case "showers-day" : return getWxNowEndpoint.Conditions.SHOWERS;
            case "showers-night" : return getWxNowEndpoint.Conditions.SHOWERS;   

            case "rain" : return getWxNowEndpoint.Conditions.RAIN;      // PATCHY LIGHT RAIN
            
            case "thunder-rain"         : return getWxNowEndpoint.Conditions.THUNDERSTORM;
            case "thunder-showers-day"  : return getWxNowEndpoint.Conditions.THUNDERSTORM;  
            case "thunder-showrs-night" : return getWxNowEndpoint.Conditions.THUNDERSTORM; 

            case "snow" : return getWxNowEndpoint.Conditions.SNOW;
            case "snow-showers-day" : return getWxNowEndpoint.Conditions.SNOW;  
            case "snow-shoers-night" : return getWxNowEndpoint.Conditions.SNOW; 

            case "wind" : return getWxNowEndpoint.Conditions.WIND; 

            // "1069" : return getWxNowEndpoint.Conditions.SLEET;

            case "fog" : return getWxNowEndpoint.Conditions.FOG; 
            default : console.warn("unknown condition", value ); break;
        }

        return getWxNowEndpoint.Conditions.CLEAR;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        let reports : Array<getWxNowEndpoint.Report> = [];

        const today : Date = new Date();
        today.setMilliseconds( 0 );

        const endpt    : netClient = new netClient( "", null, 1000 );
        const url      : string = StringUtils.format( "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{0}/{1}", this.request.location, today.getTime()/1000 );
        //.log("url", url );
        const response : netClient.Reply = await endpt.get( url, { key : this.module.key, iconSet : 'icons2' } );

        //console.log( "getWx", this.request, response.ok, today.toLocaleString() );
        //console.log( "getWx", response.data );
        if( response.ok )
        {
            try
            {
 
                reports.push( { temperature : response.data.days[0].temp,
                                feels_like  : response.data.days[0].feelslike,
                                humidity    : response.data.days[0].humidity,
                                dew_point   : response.data.days[0].dew,
                                conditions  : getWx.Coverage( response.data.days[0].icon ),
                                wind        : { speed: response.data.days[0].windspeed,
                                                direction: response.data.days[0].winddir,
                                                gust: response.data.days[0].windgust },
                                cloud_coverage : response.data.days[0].cloudcover / 100,
                                percipitation : response.data.days[0].precipprob / 100
                            } );
                         
                    /*
                    reports.push( { temperature : response.data.current.temp_f, // temp_c
                                    feels_like : response.data.current.feelslike_f, // feelslike_c
                                    humidity : response.data.current.humidity,
                                    dew_point : response.data.current.dewpoint_f, // dewpoint_c
                                    percipitation: response.data.current.precip_in, // precip_mm
                                    conditions : getWx.Coverage( response.data.current.condition.code ),
                                    wind : { speed: response.data.current.wind_mph, direction: response.data.current.wind_degree, gust : response.data.current.gust_mph }, // gust_kph
                                    cloud_coverage : ( response.data.current.cloud / 100 )
                                } );
                                 */
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