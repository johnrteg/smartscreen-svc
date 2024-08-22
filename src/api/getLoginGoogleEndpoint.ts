//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getLoginGoogleEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.POST, "/login/google", false );
        this.datamap =  {   //code : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: false }
                        };
    }

    public reset() : void
    {
        this.request =  {
                            //code: Endpoint.InitValue,    
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
        //code : string;
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