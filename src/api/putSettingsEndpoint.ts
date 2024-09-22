//
//
//
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";
import { getSettingsEndpoint  } from "./getSettingsEndpoint.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class putSettingsEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.PUT, "/settings", false );
        this.datamap =  {  
                            device  : { type: Endpoint.PropertyType.OBJECT, source: Endpoint.Source.BODY, required: true },
                            location  : { type: Endpoint.PropertyType.OBJECT, source: Endpoint.Source.BODY, required: true },
                            background  : { type: Endpoint.PropertyType.OBJECT, source: Endpoint.Source.BODY, required: true },
                            calendar  : { type: Endpoint.PropertyType.OBJECT, source: Endpoint.Source.BODY, required: true },
                            events  : { type: Endpoint.PropertyType.OBJECT, source: Endpoint.Source.BODY, required: true },
                            persons  : { type: Endpoint.PropertyType.OBJECT, source: Endpoint.Source.BODY, required: true },
                            units  : { type: Endpoint.PropertyType.OBJECT, source: Endpoint.Source.BODY, required: true },
                        };
    }

    public reset() : void
    {
        this.request =  { 
                            device      : Endpoint.InitValue,
                            location    : Endpoint.InitValue,
                            background  : Endpoint.InitValue,
                            calendar    : Endpoint.InitValue,
                            events      : Endpoint.InitValue,
                            persons     : Endpoint.InitValue,
                            units       : Endpoint.InitValue
                        };                
    }

    declare public request  : putSettingsEndpoint.RequestData;
    declare public reply    : putSettingsEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: putSettingsEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace putSettingsEndpoint
{
    export interface RequestData extends getSettingsEndpoint.ReplyData
    {
    }

    export interface ReplyData
    {
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