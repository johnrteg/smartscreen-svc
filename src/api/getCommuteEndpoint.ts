//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getCommuteEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/commute", false );
        this.datamap =  {   from   : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: true },
                            to     : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: true },
                            mode   : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  {
                            from: Endpoint.InitValue,  
                            to: Endpoint.InitValue,   
                            mode: Endpoint.InitValue,   
                        };                
    }

    declare public request  : getCommuteEndpoint.RequestData;
    declare public reply    : getCommuteEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getCommuteEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getCommuteEndpoint
{
    export interface RequestData
    {
        from    : string;
        to      : string;   // | deliminated
        mode    : string;
    }

    export interface Path
    {
        to       : string;
        distance : number; // miles
        time     : number; // minutes
        delay    : number;
    }

    export interface ReplyData
    {
        paths : Array<Path>;
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