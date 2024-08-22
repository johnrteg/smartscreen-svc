//
import { FastifyRequest } from "fastify";

//
import StringUtils      from "../utils/StringUtils.js";
import ObjectUtils      from "../utils/ObjectUtils.js";
import { Network }      from "./Network.js";
import { netService }   from "./netService.js";



//
//
export module Endpoint
{

    export enum Headers
    {
        APP_ID         = "x-appid",
        TRANSACTION_ID = "x-transactionid",
        SESSION_ID     = "x-sessionid",
        DEVKEY         = "x-devkey",
    }

    export enum Source
    {
        HEADER  = "header",
        PARAM   = "param",
        QUERY   = "query",
        BODY    = "body"
    }

    //
    // standard set that can be selected from but it can be extended with unique ones
    //
    export enum Error
    {
        NOT_IMPLEMENTED     = "not_implemented",
        MISSING_OR_BAD_DATA = "missing_or_bad_data",
        INVALID_IDENTIFIER  = "invalid_identifier",
        NOT_AUTHORIZED      = "not_authorized",
        NOT_FOUND           = "not_found",
        DELETED             = "deleted",
    }

    export enum SortDirection
    {
        ASCENDING  = "asc",
        DESCENDING = "desc",
    }

    //
    // extend from for request that has data paging
    //
    export interface RequestDataPage<FIELDS>  // FIELDS example: "index" | "name"
    {
        start   : number;
        offset  : number;
        sort_by : FIELDS;
        sort_dir: Endpoint.SortDirection;
    }

    export interface ReplyDataPage
    {
        start  : number;
        offset : number;
        count  : number;
    }

    export interface ErrorReply
    {
        code   : string;
        message? : string;
    }

    export interface Reply
    {
        status : Network.Status;
        data?  : any | ErrorReply;
    }

    export interface DataCheck
    {
        ok       : boolean;
        message? : string;
    }

    export enum PropertyType
    {
        STRING = "string",
        NUMBER = "number",
        ARRAY  = "array",
        OBJECT = "object",
        BOOLEAN = "boolean",
    }

    export interface Authenticated
    {
        transaction_id? : string;
        auth?           :    { id: string; };
    }

    export interface Validate
    {
        source   : Source;
        type     : PropertyType;
        required : boolean;
        field?   : string;      // override field name from the data.key identifier
    }


    export const InitValue : any | string | number = undefined;

    //export const SYS_APP_ID : string = "00000000-0000-0000-0000-000000000000";


//
//
//
export class Definition
{
    public method           : Network.Method = Network.Method.GET; 
    //public service          : string = "";
    public url              : string = "";        // /session/login/:id
    public auth             : boolean;
    //public category         : string = "";        // to be used for access permission to a category of endpoints
    public timeout          : number;
    public net_service    : netService;

    protected datamap       : any;

    //
    // request
    //
    public request          : any = null;

    ////////////////////////////////////////////////////////////////////////////////////////////
    constructor(    method   : Network.Method,
                    //service  : string,
                    //category : string,
                    url      : string,
                    auth     : boolean = true,
                    timeout  : number = null )
    {
        this.method          = method;
        //this.service         = service;
        this.url             = url;
        //this.category        = category;
        this.auth            = auth;
        this.timeout         = timeout;
        this.reset();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////
    public dump() : void
    {
        console.log({method:this.method,url:this.url});
    }

    /////////////////////////////////////////////////////////////////////////////////////////////
    public reset() : void
    {
    }

    /////////////////////////////////////////////////////////////////////////////////////////////
    protected sortBy( sortby : string, default_by : string ) : string
    {
        return sortby  != Endpoint.InitValue ? sortby : default_by;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////
    // overrride by child implementation on the service
    public async execute( auth : Endpoint.Authenticated ) : Promise<Reply>
    {
        return this.failure( Network.Status.NOT_IMPLEMENTED, Error.NOT_IMPLEMENTED,
                            "request not implemented yet " + this.method + " @ " + this.url );
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public validate( request : FastifyRequest ) : Endpoint.Reply
    {
        if( this.method == Network.Method.GET && ObjectUtils.notNull( this.body ) )
        {
            return this.failure( Network.Status.BAD_REQUEST, Endpoint.Error.MISSING_OR_BAD_DATA, "GET cannot have BODY attributes" );
        }
        else
        {
            let check : Endpoint.DataCheck = this.validateData( request );
            if( !check.ok )return this.failure( Network.Status.BAD_REQUEST, Endpoint.Error.MISSING_OR_BAD_DATA, check.message );
        }
        return { status: Network.Status.OK };
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // validates the data from the different sources (headers, parameters, queries, body) back to the request.
    protected validateData( request : FastifyRequest ) : DataCheck
    {
        let reply : DataCheck = { ok: true };
        let key   : string;
        let field : string;

        //console.log( 'validateData', request.body );

        for( key in this.datamap )
        {
            field = ObjectUtils.notNull( this.datamap[key].field ) ? this.datamap[key].field : key;
            //console.log('validate', key, field, this.datamap[key].source, request.headers[field] );
            switch( this.datamap[key].source )
            {
                case Source.HEADER : this.request[key] = request.headers[field]         != undefined ? request.headers[field] as string : null; break;
                case Source.PARAM  : this.request[key] = (request.params as any)[field] != undefined ? (request.params as any)[field]   : null; break;
                case Source.QUERY  : this.request[key] = (request.query as any)[field]  != undefined ? (request.query as any)[field]    : null; break;
                case Source.BODY   : this.request[key] = (request.body as any)[field]   != undefined ? (request.body as any)[field]     : null; break;
                default       : console.warn( 'unknown source of ' + this.datamap[key].source + ' in ' + this.url ); break;
            }

            //console.log( this.url, key, this.request[key], this.datamap[key].required );

            if(   this.datamap[key].required
                && ( this.request[key] == InitValue || this.request[key] == null )
                && reply.ok )
            {
                reply.message = "required data at '" + key+"'/'"+ field + "' in " + this.datamap[key].source + " for " + this.url + " is missing";
                reply.ok = false;
            }
        }

        return reply;
    }

    ///////////////////////////////////////////////////////////////////////////////
    private data( source : Source ) : any
    {
        let data  : any = null;
        let key   : string;
        let field : string;
  
        if( this.request != Endpoint.InitValue )
        {
            for( key in this.datamap )
            {
                // did the map have an over-ride of it's name to a different field name
                field = ObjectUtils.notNull( this.datamap[key].field ) ? this.datamap[key].field : key;
                if( this.datamap[key].source == source )
                {
                    // the request attribute has been set
                    if( this.request[key] != Endpoint.InitValue )
                    {
                        // not set yet, initialize it
                        if( ObjectUtils.isNull( data ) )data = {};

                        // extract the request value to the source object
                        data[field] = this.request[key];
                        //data[key] = this.request[key];
                    }
                    // no reason to warn here since there are usecases
                    // where the value is in the header and not set in the request
                    // but is extracted properly in the sserver.
                    
                    //else if( this.datamap[key].required )
                    //{
                    //    console.warn( "request not defined or missing attr for", source, key, field, this.method, this.url );
                    //}
                }
            }
        } // endif

        return data;
    }

    ///////////////////////////////////////////////////////////////////////////////
    public get headers() : any
    {
        return this.data( Source.HEADER );
    }

    ///////////////////////////////////////////////////////////////////////////////
    public get body() : any
    {
        return this.data( Source.BODY );
    }

    ///////////////////////////////////////////////////////////////////////////////
    public getEndpoint() : string
    {
        return this.url;
    }

    ///////////////////////////////////////////////////////////////////////////////
    public getUrl( ignore_url_service : boolean = false ) : string
    {
        //  combine url with any parameters
        let url_with_params : string = "";
        //if( ignore_url_service || this.service == "" )
        //{
            url_with_params = this.getEndpoint();
        //}
        //else
        //{
        //    url_with_params = "/" + this.service + this.getEndpoint();
        //}
        
        let params  : any = this.data( Source.PARAM );
        let queries : any = this.data( Source.QUERY );
        let key     : string;

        if( params )
        {
            for( key in params )
            {
                url_with_params = StringUtils.replaceAll( url_with_params, ":"+key, params[key] );
            }
        }


        // add in query
        let first_query : boolean = true;
        if( queries )
        {
            for( key in queries )
            {
                if( first_query )
                {
                    url_with_params += '?';
                    first_query = false;
                }
                else
                {
                    url_with_params += '&';
                }    
                url_with_params += key + '=' + queries[key].toString();
            }
        }

        //console.log( this.error_codes. );
        return url_with_params;
    }

    ////////////////////////////////////////////////////////////////////////////
    public errorCode( code: string ) : string
    {
        return code;
    }

    //////////////////////////////////////////////////////////////////////////////////
    public failure( status: Network.Status, code: string, message? : string ) : Reply
    {
        return { status: status, data: { code: code, message: message } };
    }
}


}

//
// eof
//