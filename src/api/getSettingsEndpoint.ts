//
//
//
import { Interfaces } from "../client/Interfaces.js";
import { Endpoint } from "../net/Endpoint.js";
import { Network  } from "../net/Network.js";

// -------------------------------------------------------------------------------------------------------------
//
//
export class getSettingsEndpoint extends Endpoint.Definition
{
    constructor()
    {
        super( Network.Method.GET, "/settings", false );
        this.datamap =  {  
                        };
    }

    public reset() : void
    {
        this.request =  {   
                        };                
    }

    declare public request  : getSettingsEndpoint.RequestData;
    declare public reply    : getSettingsEndpoint.ReplyData;

    // overrride
    public failure( status : Network.Status, code: getSettingsEndpoint.Error, message? : string ) : Endpoint.Reply
    { return super.failure( status, code, message );}
}

export namespace getSettingsEndpoint
{
    export interface RequestData
    {
    }

    export interface Person
    {
        name : string;
        colorId : number;
    }

    export enum UnitsOfMeasure
    {
        STANDARD = "standard",
        METRIC   = "metric"
    }

    export interface ReplyData
    {
        device      : { id: string; name: string; };
        location    : { address : string, timezone: string; };
        background  : { color: string; image_url: string; opacity: number; };
        calendar    : { ids: Array<string>; start_dow : number; };
        events      : { default_duration: number; dim_past : boolean};
        persons     : Array<Person>;
        units       : UnitsOfMeasure;
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