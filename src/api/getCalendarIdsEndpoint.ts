//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getCalendarIdsEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/calendar/ids", false );
        this.datamap =  {};
    }

    public reset() : void
    {
        this.request =  {  
                        };                
    }

    declare public request  : getCalendarIdsEndpoint.RequestData;
    declare public reply    : getCalendarIdsEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getCalendarIdsEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getCalendarIdsEndpoint
{
    export interface RequestData
    {
    }

    export interface Calendar
    {
        id : string;
        name : string;
        colorId : number;
        primary : boolean;
    }

    export interface ReplyData
    {
        calendars : Array<Calendar>;
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