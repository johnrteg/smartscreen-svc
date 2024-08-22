//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getAuthGoogleEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/auth/google", false );
        this.datamap =  {   code : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false }
                        };
    }

    public reset() : void
    {
        this.request =  {
                            code: Endpoint.InitValue,    
                        };                
    }

    declare public request  : getAuthGoogleEndpoint.RequestData;
    declare public reply    : getAuthGoogleEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getAuthGoogleEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getAuthGoogleEndpoint
{
    export interface RequestData
    {
        code : string;
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