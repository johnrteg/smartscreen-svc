//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getExchangeEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/exchange", false );
        this.datamap =  {   base        : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: true },
                            targets     : { type: Endpoint.PropertyType.STRING, source: Endpoint.Source.QUERY, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  {
                            base: Endpoint.InitValue,  
                            targets: Endpoint.InitValue,   
                        };                
    }

    declare public request  : getExchangeEndpoint.RequestData;
    declare public reply    : getExchangeEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getExchangeEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getExchangeEndpoint
{

    export interface RequestData
    {
        base    : string;   // USD
        targets : string;   // comma delimin "EUR,GBP"
    }

    export interface Rate
    {
        currency     : string;
        conversion      : number;
    }

    export interface ReplyData
    {
        rates : Array<Rate>;
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