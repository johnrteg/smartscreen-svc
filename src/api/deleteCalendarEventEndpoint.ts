//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class deleteCalendarEventEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.DELETE, "/calendar/event/:calendarId/:id", false );
        this.datamap =  {   calendarId  : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.PARAM, required: true },
                            id          : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.PARAM, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  { 
                            calendarId  : Endpoint.InitValue,
                            id : Endpoint.InitValue,
                        };                
    }

    declare public request  : deleteCalendarEventEndpoint.RequestData;
    declare public reply    : deleteCalendarEventEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: deleteCalendarEventEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace deleteCalendarEventEndpoint
{
    export interface RequestData
    {
        calendarId  : string;
        id          : string;
    }

    export interface ReplyData
    {
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