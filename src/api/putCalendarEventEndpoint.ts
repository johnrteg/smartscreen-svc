//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class putCalendarEventEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.PUT, "/calendar/event/:calendarId/:id", false );
        this.datamap =  {   calendarId  : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.PARAM, required: true },
                            id          : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.PARAM, required: true },
                            start_date  : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.BODY, required: true },
                            end_date    : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.BODY, required: true },
                            summary     : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.BODY, required: true },
                            allday      : { type: Endpoint.PropertyType.BOOLEAN, source: Endpoint.Source.BODY, required: true },
                            colorId     : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.BODY, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  { 
                            calendarId  : Endpoint.InitValue,
                            id : Endpoint.InitValue, 
                            start_date: Endpoint.InitValue,   
                            end_date: Endpoint.InitValue,
                            summary: Endpoint.InitValue,
                            allday: Endpoint.InitValue,
                            colorId: Endpoint.InitValue,
                        };                
    }

    declare public request  : putCalendarEventEndpoint.RequestData;
    declare public reply    : putCalendarEventEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: putCalendarEventEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace putCalendarEventEndpoint
{
    export interface RequestData
    {
        calendarId  : string;
        id          : string;
        start_date  : number;    // epoch seconds
        end_date    : number;
        summary     : string;  
        allday      : boolean;
        colorId     : number;
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