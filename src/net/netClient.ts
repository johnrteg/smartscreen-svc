
//
//
//
import axios, { Axios, AxiosError, HeadersDefaults } from "axios";

import StringUtils      from '../utils/StringUtils.js';
import ObjectUtils      from "../utils/ObjectUtils.js";
import { Constants }    from "../utils/Constants.js";

import { Endpoint }     from './Endpoint.js';
import { Network }      from "./Network.js";

//
//
//
interface EndpointCache
{
    endpoint    : Endpoint.Definition;
    last_access : number;   // ms from 1970
    lifespan    : number; // minutes
    reply       : netClient.Reply;
}


//
//
//
export class netClient
{
    private base_url: string;
    private default_headers: any;
    private default_timeout : number;

    private client : Axios;

    private cache : Array<EndpointCache>;

    private timer : NodeJS.Timeout;

    public static SHARED_HEADERS : Array<Endpoint.Headers> = [  Endpoint.Headers.APP_ID,
                                                                Endpoint.Headers.DEVKEY,
                                                                Endpoint.Headers.TRANSACTION_ID];

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor( base_url : string , default_headers: any = {}, timeout: number = 1000 )
    {
        this.base_url = base_url;
        //this.default_headers = { ...default_headers, ContentType: "application/json" };
        this.default_headers = default_headers;
        this.default_timeout = timeout;
        this.cache = [];
        this.client = axios.create( { baseURL: base_url, headers: this.default_headers } );
        this.timer = null;
        this.checkCache = this.checkCache.bind( this );
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    public passHeaders( headers: any, names : Array<string> ) : void
    {
        let i : number;
        for( i=0; i < names.length; i++ )
        {
            if( headers[ names[i] ] )
            {
                this.setHeader( names[i], headers[ names[i] ] );
            }
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    public setHeader( name: string, value : string ) : void
    {
        this.default_headers[name] = value;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    public deleteHeader( name: string ) : void
    {
        //if( ObjectUtils.notNull( this.client.defaults.headers.common[name] ) )
        //{
        //    delete this.client.defaults.headers.common[name];
        //}
        if( ObjectUtils.notNull( this.default_headers[name] ) )
        {
            delete this.default_headers[name];
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    public clear() : void
    {
        this.cache = [];
        if( ObjectUtils.notNull( this.timer ) )
        {
            clearInterval( this.timer );
            this.timer = null;
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    public getHeaders() : HeadersDefaults
    {
        return this.default_headers;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    private compareEndpts( endpt1 : Endpoint.Definition, endpt2 : Endpoint.Definition ) : boolean
    {
        // same urll and method
        if( endpt1.url == endpt2.url && endpt1.method == endpt2.method )
        {
            // same class, so campare requests
            //console.log("compare Endpts", JSON.stringify( endpt1.request ), JSON.stringify( endpt2.request ) );
            if( JSON.stringify( endpt1.request ) === JSON.stringify( endpt2.request ) )return true;
        }
        return false;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    private checkCache() : void
    {
        //console.log("checkCache", this.cache.length );
        
        const now : number = new Date().getTime();
        let i : number = 0;
        while( i < this.cache.length )
        {
            if( this.cache[i].last_access + ( this.cache[i].lifespan * Constants.MINUTES_TO_MS ) < now )
            {
                this.cache.splice( i, 1 );
            }
            else
            {
                i++;
            }
        }

        if( this.cache.length == 0 )
        {
            //console.log("checkCache stopped" );
            clearInterval( this.timer );
            this.timer = null;
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    private findCache( endpt : Endpoint.Definition ) : EndpointCache
    {
        let i : number;
        const now : number = new Date().getTime();

        for( i=0; i < this.cache.length; i++ )
        {
            if( this.compareEndpts( this.cache[i].endpoint, endpt ) )
            {
                // check if lifespan of cache has passed
                if( this.cache[i].last_access + ( this.cache[i].lifespan * 1000*60 ) < now )
                {
                    console.log("cache died");
                    this.cache.splice( i, 1 );
                    if( this.cache.length == 0 )
                    {
                        clearInterval( this.timer );
                        this.timer = null;
                    }
                    return null;
                }
                else
                {
                    return this.cache[i];
                }
            }
        }
        return null;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async fetchLocal( endpt : Endpoint.Definition, options: netClient.Options = null ) : Promise<netClient.Reply>
    {
        return await this.fetch( endpt, {   timeout     : ObjectUtils.notNull( options ) && ObjectUtils.notNull( options.timeout  ) ? options.timeout : null,
                                            cache       : ObjectUtils.notNull( options ) && ObjectUtils.notNull( options.cache    ) ? options.cache : null,
                                            lifespan    : ObjectUtils.notNull( options ) && ObjectUtils.notNull( options.lifespan ) ? options.lifespan : null,
                                            ignoreUriService : true
                                        }
                                );
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async fetch( endpt : Endpoint.Definition, options: netClient.Options = null ) : Promise<netClient.Reply>
    {
        //
        // see if any wants to find cached results
        //
        if( ObjectUtils.notNull( options ) && options.cache && endpt.method === Network.Method.GET )
        {
            let cached : EndpointCache = this.findCache( endpt );
            if( ObjectUtils.notNull( cached ) )
            {
                cached.last_access = new Date().getTime();
                //console.log( 'returned cached results', endpt.method, endpt.url );
                return cached.reply;
            }
        }
        // if there is any update to potential data, need to flush any
        // cache of the same category
        //else if( endpt.method != Network.Method.GET )
        //{
        //    this.flushCacheByCategory( endpt.category );
        //}

        //
        // get remote request
        //
        //console.log("fetch", endpt.method, endpt.url, endpt.headers );
        let reply : netClient.Reply = await this.request( endpt.method,
                                                                endpt.getUrl( ObjectUtils.notNull( options ) && ObjectUtils.notNull( options.ignoreUriService ) ? options.ignoreUriService : false ),
                                                                null,
                                                                endpt.body,
                                                                endpt.headers,
                                                                ObjectUtils.notNull( options ) && ObjectUtils.notNull( options.timeout )
                                                                        ? options.timeout
                                                                        : ObjectUtils.notNull( endpt.timeout ) ? endpt.timeout : null );

        //
        // cache results only if success
        //
        if( ObjectUtils.notNull( options )
            && ObjectUtils.notNull( options.cache )
            && options.cache === true
            && endpt.method === Network.Method.GET
            && reply.ok )
        {
            //console.log( 'cache endpt results', endpt.url, endpt.method, reply.data );
            this.cache.push( { endpoint: endpt, last_access: new Date().getTime(), reply: reply, lifespan : options.lifespan ? options.lifespan : 15 } );

            // first one added, start timer
            if( this.cache.length == 1 )
            {
                this.timer = setInterval( this.checkCache, 1000*60*5 );   // 5 minute timer
            }
        }
        
        return reply;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async head( url : string, parameters : any = null, data : any = {}, headers : any = {}, timeout: number = null ) : Promise<netClient.Reply>
    {
        return await this.request( 'head', url, parameters, data, ObjectUtils.merge( headers, this.default_headers ), timeout );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async post( url : string, parameters : any = null, data : any = {}, headers : any = {}, timeout: number = null ) : Promise<netClient.Reply>
    {
        return await this.request( 'post', url, parameters, data, ObjectUtils.merge( headers, this.default_headers ), timeout );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async get( url : string, parameters : any = null, headers : any = {}, timeout: number = null ) : Promise<netClient.Reply>
    {
        return await this.request( 'get', url, parameters, null, ObjectUtils.merge( headers, this.default_headers ), timeout );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async put( url : string, parameters : any = null, data : any = {}, headers : any = {}, timeout: number = null ) : Promise<netClient.Reply>
    {
        return await this.request( 'put', url, parameters, data, ObjectUtils.merge( headers, this.default_headers ), timeout );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async delete( url : string, parameters : any = null, data : any = {}, headers : any = {}, timeout: number = null ) : Promise<netClient.Reply>
    {
        return await this.request( 'delete', url, parameters, data, ObjectUtils.merge( headers, this.default_headers ), timeout );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    public static queryString( parameters : any ) : string
    {
        
        if( ObjectUtils.isNull( parameters ) )return "";

        let params : Array<string> = [];
        let name : string;

        for( name in parameters )
        {
            params.push( StringUtils.format( "{0}={1}", name, parameters[name].toString() ) );
        }

        return params.join('&');
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async request(   method      : string,
                            url         : string,
                            parameters  : any = null,
                            data        : any = null,
                            headers     : any = null,
                            timeout     : number = null ) : Promise<netClient.Reply>
    {
        let reply : netClient.Reply = { ok: true, duration: 0 };
        let start : number = Date.now();

        try
        {
            let args : string = netClient.queryString( parameters );
            if( args.length > 0 )url = url + '?' + args;

            //console.log("request", method, url, headers, this.default_headers );
            const response : any = await this.client.request( { 
                                                                url     : url,
                                                                method  : method,
                                                                data    : data,
                                                                headers : ObjectUtils.merge( headers, this.default_headers ),
                                                                timeout : ObjectUtils.notNull( timeout ) ? timeout : this.default_timeout
                                                            } );
            //console.log( 'resp', response );

            reply.ok       = response.status === 200;
            reply.headers  = { ...response.headers };
            reply.data     = response.data;
            reply.duration = Date.now() - start;
            return reply;
        }
        catch ( err : any )
        {
            //console.error( url, err.code );

            const error        : AxiosError = err;
            let error_code     : string = error.code ? error.code : 'EXCEPTION';
            let error_messsage : string = 'server error at: ' + method + ":" + url;
            let error_status   : number = ( error.code && error.code == "ECONNABORTED" ) ? 504 : 500;

            //
            reply.duration = Date.now() - start;
            reply.ok = false;

            // type errors like 4xx/5xx type error
            if( error.response )
            {
                //console.log('client data',error.response.data);
                //console.log('client status',error.response.status);
                //console.log('client headers',error.response.headers);
                error_status = error.response.status;

                // ideally, a non-200 response is thrown here and the body returns:
                // {  code   : machine readable code that client and interpret on more why it failed,
                //    message: a human readable message on more details of the code }
                if( error.response.data != null )
                {
                    if( ( error.response.data as any ).code    )error_code     = ( error.response.data as any ).code;
                    if( ( error.response.data as any ).message )error_messsage = ( error.response.data as any ).message;
                }
                
            }
            // do mostly from a spotty network, backend not responding instantly, unauthorized or cors issue
            else if( error.request )
            {

            }
            else
            {
                error_code = 'UNKNOWN';
            }
            //.log('err', error );
            
            //
            reply.error = { status : error_status, code: error_code, message: error_messsage };
            return reply;
        }
    }
}

export namespace netClient
{
    export interface Reply
    {
        ok       : boolean;
        data?    : any;
        headers? : any;
        error?   : { status : number, code : string, message? : string };
        duration : number;
    }

    export interface Options
    {
        timeout?  : number;
        cache?    : boolean;
        lifespan? : number; // lifespan of cache in minutes
        ignoreUriService? : boolean;
        // autorefresh
    }
}

//
// eof
//