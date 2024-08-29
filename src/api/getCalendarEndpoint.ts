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
        this.datamap =  {   start_date : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: true },
                            end_date   : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  { 
            start_date: Endpoint.InitValue,   
            end_date: Endpoint.InitValue,   
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
        start_date : string;
        end_date : string;
    }

    export interface EventTime
    {
        dt      : string;
        tz?     : string;
        allday? : boolean;
    }

    export interface Event
    {
        id      : string;
        summary : string;
        start   : EventTime;
        end     : EventTime;
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