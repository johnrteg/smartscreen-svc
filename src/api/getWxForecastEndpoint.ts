//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";
import { getWxNowEndpoint } from "./getWxNowEndpoint.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getWxForecastEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/wx/forecast", false );
        this.datamap =  {   location : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: true },
                            units : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: true },
                            days : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.QUERY, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  {
                            location: Endpoint.InitValue,  
                            units: Endpoint.InitValue, 
                            days : Endpoint.InitValue
                        };                
    }

    declare public request  : getWxForecastEndpoint.RequestData;
    declare public reply    : getWxForecastEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getWxForecastEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getWxForecastEndpoint
{
    export enum Units
    {
        STANDARD    = "standard",
        METRIC      = "metric",
        IMPERIAL    = "imperial"
    }

    export interface RequestData
    {
        location    : string;
        units       : Units;
        days        : number;
    }

   

    export interface Report
    {
        date        : number;
        date_str    : string;
        min_temp    : number;
        max_temp    : number;

        humidity    : number;
        conditions  : getWxNowEndpoint.Conditions;
        wind        : number;
        rain_chance : number;        // 0-1 (percent)
        snow_chance : number;        // 0-1 (percent)
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