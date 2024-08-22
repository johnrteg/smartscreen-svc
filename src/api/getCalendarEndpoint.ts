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
        this.datamap =  {   address : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.QUERY, required: true },
                            service : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.QUERY, required: true },
                            start_date : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.QUERY, required: true },
                            end_date : { type: Endpoint.PropertyType.NUMBER, source: Endpoint.Source.QUERY, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  {
            address: Endpoint.InitValue,   
            service: Endpoint.InitValue,  
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
        address : string;
        service : string;
        start_date : string;
        end_date : string;
    }

    export interface ReplyData
    {
        //reports : Array<Report>;
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