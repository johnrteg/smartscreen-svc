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
    private Coverage( value : string ) : getWxNowEndpoint.Conditions
    {
        switch( value.substring(0,2) )
        {
            case "01" : return getWxNowEndpoint.Conditions.CLEAR;
            case "02" : return getWxNowEndpoint.Conditions.FEW_ClOUDS;
            case "03" : return getWxNowEndpoint.Conditions.SCATTERED_ClOUDS;
            case "04" : return getWxNowEndpoint.Conditions.BROKEN_ClOUDS;
            case "09" : return getWxNowEndpoint.Conditions.SHOWWERS;
            case "10" : return getWxNowEndpoint.Conditions.RAIN;
            case "11" : return getWxNowEndpoint.Conditions.THUNDERSTORM;
            case "13" : return getWxNowEndpoint.Conditions.SNOW;
            case "50" : return getWxNowEndpoint.Conditions.MIST;
        }

        return getWxNowEndpoint.Conditions.CLEAR;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        //console.log( "getWx", this.module.key, this.request );

        let reports : Array<getWxNowEndpoint.Report> = [];

        const endpt : netClient = new netClient( "" );
        const response : netClient.Reply = await endpt.get( "https://api.openweathermap.org/data/2.5/weather",
                        {   lat     : this.request.lat,
                            lon     : this.request.lon,
                            units   : this.request.units,
                            appid   : this.module.key } );                   
        //.log( "gotWx", JSON.stringify( response.data, null, 4 ) );
        if( response.ok )
        {
            try
            {
                reports.push( { temperature : response.data.main.temp,
                                feels_like : response.data.main.feels_like,
                                humidity : response.data.main.humidity,
                                dew_point : 0,
                                conditions :this.Coverage( response.data.weather[0].icon ),
                                wind : { speed: response.data.wind.speed, direction: response.data.wind.deg, gust : response.data.wind.gust ? response.data.wind.gust : 0 },
                                cloud_coverage : ( response.data.clouds.all / 100 )
                            } );
            }
            catch( err: any )
            {
                console.error( "wx: error parsing JSON response" );
            }
            
        }

        // reply
        let reply : getWxNowEndpoint.ReplyData = { reports : reports };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//