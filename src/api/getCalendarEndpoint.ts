//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getCalendarEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/calendar", false );
        this.datamap =  {   start_date  : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.QUERY, required: true },
                            end_date    : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.QUERY, required: true },
                            ids         : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },
                        };
    }

    public reset() : void
    {
        this.request =  { 
                            start_date: Endpoint.InitValue,   
                            end_date: Endpoint.InitValue,
                            ids: Endpoint.InitValue   
                        };                
    }

    declare public request  : getCalendarEndpoint.RequestData;
    declare public reply    : getCalendarEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getCalendarEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getCalendarEndpoint
{
    export interface RequestData
    {
        start_date : number;    // epoch seconds
        end_date   : number;
        ids        : string;    // endcoded array
    }

    export interface EventTime
    {
        dt      : string;
        tz?     : string;
        allday? : boolean;
    }

    export interface Event
    {
        calendarId : string;
        id      : string;
        summary : string;
        start   : EventTime;
        end     : EventTime;
        color   : string; // hex color
    }

    export interface ReplyData
    {
        events : Array<Event>;
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