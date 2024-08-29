//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getWordOfDayEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/wordofday", false );
        this.datamap =  {   date     : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  {
                            date: Endpoint.InitValue,   
                        };                
    }

    declare public request  : getWordOfDayEndpoint.RequestData;
    declare public reply    : getWordOfDayEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getWordOfDayEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getWordOfDayEndpoint
{

    export interface RequestData
    {
        date    : string; 
    }


    export interface ReplyData
    {
        word : string;
        definition : string;
        type : string;
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