//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';

//
import { getWxForecastEndpoint }  from '../../../api/getWxForecastEndpoint.js';

import { WxModule } from './WxModule.js';
import { netClient } from '../../../net/netClient.js';
import getWx from './getWx.js';



//
//
//
export default class getWxForecast extends getWxForecastEndpoint
{
    private module : WxModule;

    /////////////////////////////////////////////////////////////////////////////////
    constructor( module : WxModule )
    {
        super();
        this.module = module;
    }

    /*
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
        */

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        //console.log( "getWx", this.module.key, this.request );

        // alternative
        // https://www3.visualcrossing.com/
        //

        // weather radar
        // https://docs.meteoblue.com/en/weather-apis/maps-api/examples

        let reports : Array<getWxForecastEndpoint.Report> = [];

        const endpt : netClient = new netClient( "", null, 1000 );
        const response : netClient.Reply = await endpt.get( "http://api.weatherapi.com/v1/forecast.json",
            {   q     : this.request.location,
                days  : Math.min( this.request.days, 14 ),
                hour  : 13, // 1 pm
                key   : this.module.key } );                
        //console.log( "getWxForecastEndpoint", this.module.key, response.ok, JSON.stringify( response.data, null, 4 ) );

        if( response.ok )
        {
            try
            {
                const nbr : number = response.data.forecast.forecastday.length;
                let i : number;
                let dt : Date;
                for( i=0; i < nbr; i++ )
                {
                    dt = new Date( response.data.forecast.forecastday[i].date_epoch * 1000 );

                    reports.push( { date        : response.data.forecast.forecastday[i].date_epoch,
                                    date_str : response.data.forecast.forecastday[i].date,
                                    min_temp    : response.data.forecast.forecastday[i].day.mintemp_f,
                                    max_temp    : response.data.forecast.forecastday[i].day.maxtemp_f,
                                    humidity    : response.data.forecast.forecastday[i].day.avghumidity,
                                    conditions  : getWx.Coverage( response.data.forecast.forecastday[i].day.condition.code.toString() ),
                                    wind        : response.data.forecast.forecastday[i].day.maxwind_mph,
                                    rain_chance : response.data.forecast.forecastday[i].day.daily_chance_of_rain / 100,
                                    snow_chance : response.data.forecast.forecastday[i].day.daily_chance_of_snow / 100
                                } );
                }
            }
            catch( err: any )
            {
                console.error( "wxforecast: error parsing JSON response" );
            }
 
            
        }
        else
        {
            console.error( response.error );
        }


        // reply
        let reply : getWxForecastEndpoint.ReplyData = { reports : reports };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//