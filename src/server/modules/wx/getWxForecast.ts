//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Constants }        from '../../../utils/Constants.js';

import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';

//
import { getWxForecastEndpoint }  from '../../../api/getWxForecastEndpoint.js';

import { WxModule } from './WxModule.js';
import { netClient } from '../../../net/netClient.js';
import getWx from './getWx.js';
import { getWxNowEndpoint } from '../../../api/getWxNowEndpoint.js';



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

    
    /*
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        //console.log( "getWx", this.module.key, this.request );

        // alternative
        // https://www3.visualcrossing.com/
        //

        // weather radar
        // https://docs.meteoblue.com/en/weather-apis/maps-api/examples

        await this.altexecute( authenticated );

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
        */

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        let reports : Array<getWxForecastEndpoint.Report> = [];

        const today : Date = new Date();
        today.setHours( 12, 0, 0, 0 );

        const end_date : Date = new Date( today.getTime() + this.request.days * Constants.DAYS_TO_MS );
        const endpt    : netClient = new netClient( "", null, 1000 );
        const url      : string = StringUtils.format( "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{0}/{1}/{2}", this.request.location, today.getTime()/1000, end_date.getTime()/1000 );
        //console.log("url", url );
        const response : netClient.Reply = await endpt.get( url, { key : this.module.key, iconSet : 'icons2' } );

        if( response.ok )
        {
            //console.log( response.data );
            
            try
            {
                const nbr : number = response.data.days.length;
                let i : number;

                for( i=0; i < nbr; i++ )
                {
                    reports.push( { date        : response.data.days[i].datetimeEpoch,
                                    date_str    : response.data.days[i].datetime,
                                    min_temp    : response.data.days[i].tempmin,
                                    max_temp    : response.data.days[i].tempmax,
                                    humidity    : response.data.days[i].humidity,
                                    conditions  : getWx.Coverage( response.data.days[i].icon ),
                                    wind        : response.data.days[i].windspeed,
                                    rain_chance : response.data.days[i].precipprob / 100,
                                    // response.data.days[i].preciptype // rain, snow, freezingrain and ice.
                                    snow_chance : 0
                    } );
                }
            }
            catch( err: any )
            {
                console.error( "wxforecast: error parsing JSON response" );
            }

        }

        // reply
        let reply : getWxForecastEndpoint.ReplyData = { reports : reports };
        return { status: Network.Status.OK, data: reply };
    }

}

//
// eof
//