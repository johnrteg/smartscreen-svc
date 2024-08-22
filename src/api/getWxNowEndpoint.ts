//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getWxNowEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/wx/now", false );
        this.datamap =  {   lat : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.QUERY, required: true },
                            lon : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.QUERY, required: true },
                            units : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.QUERY, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  {
                            lat: Endpoint.InitValue,   
                            lon: Endpoint.InitValue,  
                            units: Endpoint.InitValue,   
                        };                
    }

    declare public request  : getWxNowEndpoint.RequestData;
    declare public reply    : getWxNowEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getWxNowEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getWxNowEndpoint
{
    export enum Units
    {
        STANDARD = "standard",
        METRIC = "metric",
        IMPERIAL = "imperial"
    }

    export interface RequestData
    {
        lat : number;
        lon : number;
        units : Units;
    }

    export enum Conditions
    {
        CLEAR = "clear",
        FEW_ClOUDS = "fewclouds",
        SCATTERED_ClOUDS = "scattered_clouds",
        BROKEN_ClOUDS = "broken_clouds",
        SHOWWERS = "showers",
        RAIN = "rain",
        THUNDERSTORM = "thunderstorms",
        SNOW = "snow",
        MIST = "mist",
    }

    export interface Report
    {
        temperature    : number;
        feels_like : number;
        humidity : number;
        conditions : Conditions;
        dew_point : number;
        wind : { speed: number; direction: number, gust : number };
        cloud_coverage : number;        // 0-1 (percent)
    }

    export interface ReplyData
    {
        reports : Array<Report>;
    }

    export enum Error
    {
        INVALID_IDENTIFIER  = Endpoint.Error.INVALID_IDENTIFIER,
        MISSING_OR_BAD_DATA = Endpoint.Error.MISSING_OR_BAD_DATA,
        NOT_AUTHORIZED      = Endpoint.Error.NOT_AUTHORIZED,
    }
}


//
// eof
//