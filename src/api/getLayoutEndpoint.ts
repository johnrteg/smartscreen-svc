//
//
//
import { Interfaces } from "../client/Interfaces.js";
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getLayoutEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/layout", false );
        this.datamap =  {  
                        };
    }

    public reset() : void
    {
        this.request =  {   
                        };                
    }

    declare public request  : getLayoutEndpoint.RequestData;
    declare public reply    : getLayoutEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getLayoutEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getLayoutEndpoint
{
    export interface RequestData
    {
    }

    export interface ReplyData
    {
        layout : Interfaces.Layout;
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