//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class postCalendarEventEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.POST, "/calendar/event", false );
        this.datamap =  {   calendarId  : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.BODY, required: true },
                            start_date  : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.BODY, required: true },
                            end_date    : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.BODY, required: true },
                            summary     : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.BODY, required: true },
                            allday      : { type: Endpoint.PropertyType.BOOLEAN, source: Endpoint.Source.BODY, required: true },
                            colorId     : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.BODY, required: true },
                            time_zone   : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.BODY, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  { 
                            calendarId : Endpoint.InitValue, 
                            start_date: Endpoint.InitValue,   
                            end_date: Endpoint.InitValue,
                            summary: Endpoint.InitValue,
                            allday: Endpoint.InitValue,
                            colorId: Endpoint.InitValue,
                            time_zone: Endpoint.InitValue  
                        };                
    }

    declare public request  : postCalendarEventEndpoint.RequestData;
    declare public reply    : postCalendarEventEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: postCalendarEventEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace postCalendarEventEndpoint
{
    export interface RequestData
    {
        calendarId  : string;
        start_date  : number;    // epoch seconds
        end_date    : number;
        summary     : string;  
        allday      : boolean;
        colorId     : number;
        time_zone   : string;
    }

    export interface ReplyData
    {
        id : string;
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