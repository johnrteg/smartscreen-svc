//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
// clientid: 1067509946324-up5h3eqksr1hkihtb1ujte4h4i93iutj.apps.googleusercontent.com
// client secret: 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
//
export class getLoginGoogleEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.POST, "/login/google", false );
        this.datamap =  {   access_token    : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },
                            token_type      : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },
                            expires_in      : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },
                            refresh_token   : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false },
                            scope           : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false }
                        };
    }

    public reset() : void
    {
        this.request =  {
                            access_token : Endpoint.InitValue,
                            token_type : Endpoint.InitValue,
                            expires_in : Endpoint.InitValue,
                            refresh_token : Endpoint.InitValue, 
                            scope : Endpoint.InitValue,   
                        };                
    }

    declare public request  : getLoginGoogleEndpoint.RequestData;
    declare public reply    : getLoginGoogleEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getLoginGoogleEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getLoginGoogleEndpoint
{
    export interface RequestData
    {
        access_token : string;
        token_type : string;
        expires_in : string;
        refresh_token : string;
        scope : string;
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