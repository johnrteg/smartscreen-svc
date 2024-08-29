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
        this.datamap =  {   code : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },
                            scope : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },

                            access_token    : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },
                            token_type      : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },
                            expires_in      : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },
                            refresh_token   : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },
                        };
    }

    public reset() : void
    {
        this.request =  {
                            code: Endpoint.InitValue,    
                            scope : Endpoint.InitValue,

                            access_token : Endpoint.InitValue,
                            token_type : Endpoint.InitValue,
                            expires_in : Endpoint.InitValue,
                            refresh_token : Endpoint.InitValue, 
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
        scope : string;

        access_token : string;
        token_type : string;
        expires_in : string;
        refresh_token : string;
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