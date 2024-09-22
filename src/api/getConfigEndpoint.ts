//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getConfigEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/config", false );
        this.datamap =  {  
                        };
    }

    public reset() : void
    {
        this.request =  {   
                        };                
    }

    declare public request  : getConfigEndpoint.RequestData;
    declare public reply    : getConfigEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getConfigEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getConfigEndpoint
{
    export interface RequestData
    {
    }

    export interface ReplyData
    {
        google : {  client_id       : string;
                    redirect_url    : string;
                    map             : { key : string };
         };
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