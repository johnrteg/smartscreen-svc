// universal
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

// external
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import proxy from '@fastify/http-proxy';
import formbody from '@fastify/formbody';
import { FastifyInstance, FastifyReply, FastifyRequest, FastifyError, FastifyListenOptions, HTTPMethods } from 'fastify';

//
//import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// internal
import StringUtils              from '../utils/StringUtils.js';
import ObjectUtils              from '../utils/ObjectUtils.js';

import { Network }              from './Network.js';
import { Endpoint }             from './Endpoint.js';
import { netClient }      from './netClient.js';




//
//
//
export class netService
{
    protected id                    : string;
    protected server                : FastifyInstance;
    protected nbr_cpus              : number;
    private app_version             : string;

    protected   log_server : boolean;
    protected   log_level  : netService.LogLevel;

    private registered_events       : Array<string>;
    protected config                : netService.IConfig;

    public  end_pts                 : Array<Endpoint.Definition>;

    // secrets
    //private google_secrets_manager : SecretManagerServiceClient;
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor()
    {
        this.server = null;
        this.log_server = false;

        this.id          = randomUUID();
        this.nbr_cpus    = os.cpus().length;
        this.log_level   = netService.LogLevel.INFO;

        this.end_pts = [];

        // get application version
        let packagejson : any = this.readJsonFile("package.json", { version: "0.0.0" } );
        this.app_version = packagejson.version;
        this.logInfo( "service started", { version: this.app_version } );

        //this.google_secrets_manager = new SecretManagerServiceClient();

        this.bindCallbacks();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    protected initConfig( config : netService.IConfig, events: Array<string> = [] ) : void
    {
        this.config = config;
        this.validateConfig();
        this.registered_events = events;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected async validateConfig() : Promise<void>
    {
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected bindCallbacks() : void
    {
        this.onShutdown         = this.onShutdown.bind( this );
        this.onSignalShutdown   = this.onSignalShutdown.bind( this );
        this.getHealth          = this.getHealth.bind( this );
        this.processError       = this.processError.bind( this );
        this.onShutdownDelay    = this.onShutdownDelay.bind( this );
        this.onWarmUp           = this.onWarmUp.bind( this );
        this.onStart            = this.onStart.bind( this );
        this.onStop             = this.onStop.bind( this );
    }

    ///////////////////////////////////////////////////////////////////////////////////
    public readJsonFile( path : string, default_value: any ) : any
    {
        if( fs.existsSync( path ) )
            return JSON.parse( fs.readFileSync( path, "utf8"));
        else
        {
            this.logError( "readJsonFile path not found", { path: path, cwd: process.cwd() } );
            return default_value;
        }   
    }

    ///////////////////////////////////////////////////////////////////////////////////
    public writeJsonFile( path : string, value: any ) : void
    {
        //if( fs.existsSync( path ) )
        fs.writeFileSync( path, JSON.stringify( value, null, 2 ) );
            //return JSON.parse( );
        //else
        //{
        //    this.logError( "readJsonFile path not found", { path: path, cwd: process.cwd() } );
        //    return default_value;
        //}   
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    protected directoryPath( import_meta_url : string ) : string
    {
        const filename : string = fileURLToPath( import_meta_url );
        return path.dirname( filename );
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    private async getSecret( id: string ) : Promise<string>
    {
        try
        {
            if( this.config.platform == netService.Platform.GOOGLE )
            {
                //let name : string = [ this.config.secrets.root, id ].join('/')
                // 'projects/your-project-id/secrets/your-secret-name/versions/latest'
                //const [version] : any = await this.google_secrets_manager.accessSecretVersion( { name } );
                //return version.payload.data.toString('utf8');
                return id;
            }
            else if( this.config.platform == netService.Platform.AWS )
            {
                // todo
                return id;
            }
            else if( this.config.platform == netService.Platform.LOCAL )
            {
                // do nothing
                return id;
            }
            else    // condition that shu=ould never occur
            {
                // do nothing
                return id;
            }
            
        }
        catch( err: any )
        {
            this.logError( "getSecret ERROR", err );
            return id;
        }
        
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    protected async processSecret( id: string ) : Promise<string>
    {
        if( id.indexOf( 'secret:' ) == 0 )
        {
            let field: string = id.substring( id.indexOf( 'secret:' ) + "secret:".length );
            return await this.getSecret( field );
        }
        else if( id.indexOf( 'env:' ) == 0 )
        {
            let field: string = id.substring( id.indexOf( 'env:' ) + "env:".length );
            if( process.env[field] === null )this.logWarning( "secret configured to be an environment variable is not set for", { field : field } );
            return process.env[field] ? process.env[field] : field;
        }
        else
        {
            return id;
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected logInfo( message: string, data? : any ) : void
    {
        if( netService.LogLevel.INFO >= this.log_level )
        {
            console.log( JSON.stringify( { level: "info", when: new Date().toISOString(), id: this.id, message: message, data : data } ) );
        }   
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected logWarning( message: string, data? : any ) : void
    {
        if( netService.LogLevel.WARNING >= this.log_level )
        {
            console.warn( { level: "warning", when: new Date().toISOString(), id: this.id, message: message, data : data } );
        }   
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected logError( message: string, data? : any ) : void
    {
        if( netService.LogLevel.ERROR >= this.log_level )
        {
            console.error( { level: "error", when: new Date().toISOString(), id: this.id, message: message, data : data } );
        }
            
    }

    /*
    // ........................................................................
    // actions
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected registerAction( actions: Array<string> ) : void
    {
        this.registered_actions = this.registered_actions.concat( actions );
        this.registered_actions.push.apply( actions );
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // if any actions have been registered, when redis is up, tell the world what actions it wants to receive.
    private registerActions() : void
    {
        if( this.registered_actions.length > 0 )
        {
            let reg : microvoltAction.IRegister = { service_id        : this.id,
                                                    service_type      : this.type,
                                                    action_types      : this.registered_actions };
            //this.publish( PubSub.Channels.REGISTER_ACTIONS, reg );
        }  
    }
    */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // structure of this.actions is:
    // this.actions[action] = [ { type, last_idx, [ids] } ]
    //
    //private onRegisterActions( message : any ) : void
    //{
        /*
        let data : microvoltAction.Register = message as microvoltAction.Register;
        if( this.id != data.service_id )
        {
            console.log( "microService::onRegisterActions", { id: this.id, data: data } );
            let i           : number;
            let j           : number;
            let len         : number = data.action_types.length;
            let pool_len    : number;
            let pool        : Action.Pool;
            let found       : boolean;

            for( i=0; i < len; i++ )
            {
                // this action (e.g. users.created) is new
                if( !this.actions[ data.action_types[i] ] )this.actions[ data.action_types[i] ] = new Array<Action.Pool>();

                // keep track of each service type and their ids
                found = false;
                pool_len = this.actions[ data.action_types[i] ].length;
                for( j=0; j < pool_len; j++ )
                {
                    // same service type already registered.  just add it's id.
                    if( this.actions[ data.action_types[i] ][j].type == data.service_type )
                    {
                        // only add unique ids in case where a service re-registers itself of the same id
                        if( this.actions[ data.action_types[i] ][j].instance_ids.indexOf( data.service_id ) < 0 )
                        {
                            this.actions[ data.action_types[i] ][j].instance_ids.push( data.service_id );
                        }
                        found = true;
                        break;
                    }
                }
                if( !found )
                {
                    pool = { type : data.service_type, last_index: -1, instance_ids: [data.service_id] }
                    this.actions[ data.action_types[i] ].push( pool );
                }
            }
        } 
        */ 
    //}
   
    // .........................................................................................................
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private onSignalShutdown() : void
    {
        this.stop( 0 );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected registerEndpoints() : void
    {
        this.getAsync( "/health", this.getHealth );
        if( this.config.platform === netService.Platform.GOOGLE )
        {
            this.get( "/_ah/warmup", this.onWarmUp );
            this.get( "/_ah/start", this.onStart );
            this.get( "/_ah/stop", this.onStop );
        }
        //this.post( "/hub/event", this.onEvent );
        //this.route( new postHubEvent( this ) );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private registerSignals() : void
    {
        process.on( 'SIGINT', this.onSignalShutdown );
        process.on( 'SIGTERM', this.onSignalShutdown );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private async getHealth( request: FastifyRequest ) : Promise<Endpoint.Reply>
    {
        /*
        let health : HealthApi.HealthReply = { services: [{ service: this.type, id: this.id, status: true }] };

        // possible to call itself via rest?
        // check other services
        let more_checks : HealthApi.HealthServices = await this.checkHealth();
        if( more_checks )health.services.push( more_checks );
        */
       console.log("getHealth");

        return { status: Network.Status.OK, data : {} }; //health };
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // override
    // probably needs to be an array of health serrvices
    //protected async checkHealth() : Promise<HealthApi.HealthServices|null>
    //{
   //     return null;
    //}

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private onWarmUp( request: FastifyRequest ) : Endpoint.Reply
    {
        //this.status = ServiceStatus.WARMED;
        this.warmUp();
        this.logInfo("onWarmUp");
        let reply : Endpoint.Reply = { status: Network.Status.OK };
        return reply;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private onStart( request: FastifyRequest ) : Endpoint.Reply
    {
        //this.status = ServiceStatus.WARMED;
        //this.warmUp();
        this.logInfo("onStart");
        let reply : Endpoint.Reply = { status: Network.Status.OK };
        return reply;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private onStop( request: FastifyRequest ) : Endpoint.Reply
    {
        //this.status = ServiceStatus.WARMED;
        //this.warmUp();
        this.logInfo("onStop");

        setTimeout( () => this.onShutdownDelay(), 250 );

        return { status: Network.Status.OK };
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected warmUp() : void
    {
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected warmDown() : void
    {
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 
    protected onShutdown( message : any ) : void
    {
        if( ObjectUtils.notNull( message ) )
        {
            this.logInfo( "onShutdown", message );
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private onShutdownDelay() : void
    {
        this.stop(0);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected serviceStopped() : void
    {
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public stop( code : number ) : void
    {
        this.logInfo( "Service shutting down", { id: this.id, code: code } );
        //this.unRegisterService();
        this.serviceStopped();
        this.server.close();
        process.exit( code );
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private processError( error: FastifyError, request: FastifyRequest, reply: FastifyReply ) : void
    {
        this.logError( "mv::processError", { error: error, url: request.url, method: request.method } );
        reply.status( Network.Status.INTERNAL_SERVER_ERROR ).send( error );
        //this.stop( 1 );
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected proxy( uri : string, host : string ) : void
    {
        this.server.register( proxy, {
            upstream: host,
            prefix: uri, // optional
            http2: false, // optional
            //replyOptions: { rewriteRequestHeaders: ( original_req : any, headers : any  ) => ( { ...headers, 'x-hello' : '1213'} ) },
            preValidation: async ( request: FastifyRequest, reply: FastifyReply ) => this.proxyValidate( request, reply )
          });
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected async proxyValidate( request: FastifyRequest, reply: FastifyReply ) : Promise<void>
    {
        //
        // add transaction id to all outbound requests
        // transaction id is to trace the path of requests from start to end
        //
        let transaction_id  : string = randomUUID();
        request.headers[ Endpoint.Headers.TRANSACTION_ID ] = transaction_id;

        //
        // authenticate
        // authenticator may add some additional information to the request for downstream services
        //
        const auth : netService.AuthenticatedRequest = await this.authenticateProxyRequest( request );
        
        if( auth.valid )
        {
            // devkey gets passed to any downstream service to be used to know
            // who is makeing the request
            request.headers[Endpoint.Headers.DEVKEY]   = auth.devkey;
        }
        else
        {
            reply.code( Network.Status.UNAUTHORIZED )
                        .send( { code: Endpoint.Error.NOT_AUTHORIZED, message: auth.message, reason: auth.reason } );
            return;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // overwrite as needed
    protected async authenticateProxyRequest( request: FastifyRequest ) : Promise<netService.AuthenticatedRequest>
    {
        return { valid: true, devkey: "", message: "", reason: {} };
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected all( uri : string, callback : netService.RequestCallback ) : void
    {
        this.server.all( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequest( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected allAsync( uri : string, callback : netService.RequestCallbackAsync ) : void
    {
        this.server.all( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequestAsync( request, reply, callback ) );
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public route( endpt : Endpoint.Definition ) : void
    {
        this.end_pts.push( endpt );
        endpt.net_service = this;

        //console.log("route", endpt.method, endpt.getEndpoint() );

        this.server.route( { method     : endpt.method,
                             url        : endpt.getEndpoint(),
                             handler    : async ( request: FastifyRequest, reply: FastifyReply ) => this.processEndpoint( request, reply, endpt ) } );
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected post( uri : string, callback : netService.RequestCallback ) : void
    {
        this.server.post( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequest( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected postAsync( uri : string, callback : netService.RequestCallbackAsync ) : void
    {
        this.server.post( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequestAsync( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected get( uri : string, callback : netService.RequestCallback ) : void
    {
        this.server.get( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequest( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected getAsync( uri : string, callback : netService.RequestCallbackAsync ) : void
    {
        this.server.get( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequestAsync( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected put( uri : string, callback : netService.RequestCallback ) : void
    {
        this.server.put( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequest( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected putAsync( uri : string, callback : netService.RequestCallbackAsync ) : void
    {
        this.server.put( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequestAsync( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected delete( uri : string, callback : netService.RequestCallback ) : void
    {
        this.server.delete( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequest( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected deleteAsync( uri : string, callback : netService.RequestCallbackAsync ) : void
    {
        this.server.delete( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequestAsync( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected head( uri : string, callback : netService.RequestCallback ) : void
    {
        this.server.head( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequest( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected patch( uri : string, callback : netService.RequestCallback ) : void
    {
        this.server.patch( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequest( request, reply, callback ) );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected options( uri : string, callback : netService.RequestCallback ) : void
    {
        this.server.options( uri, async ( request: FastifyRequest, reply: FastifyReply ) => this.processRequest( request, reply, callback ) );
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //private hasRequiredHeaders( request: FastifyRequest ) : boolean
    //{
    //    return request.headers[ Endpoint.Headers.APP_ID ] !== null;
    //}

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected beforeProxy( request: FastifyRequest ) : void
    {

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // extract a series of ip addresses sent from the requester
    protected static requestIps( request: FastifyRequest ) : Array<string>
    {
        let ips : Array<string> = [request.ip];
        if( request.ips && request.ips.length > 0 )
        {
            let i : number;
            let len : number = request.ips.length;
            for( i=0; i < len; i++ )
            {
                if( ips.indexOf( request.ips[i] ) < 0 )ips.push( request.ips[i] );
            }
        }
        return ips;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /** Removes the fields from the give header object
     * @param headers Header object given by reply
     * @param field Field name in the header to remove.
     * @returns The header
    */
    protected static removeHeaderField( headers: any, field: string ) : any
    {
        if( headers && headers[field] )delete headers[field];
        return headers;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //private static removeReplyHeaders( headers: any ) : any
    //{
        //headers = microvoltService.removeHeaderField( headers, "servicestats" );
        //headers = microvoltService.removeHeaderField( headers, "Keep-Alive" );
        //headers = microvoltService.removeHeaderField( headers, "Connection" );
    //    return headers;
    //}

    /*
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected async authenticate( request: FastifyRequest, endpt : Endpoint.Definition ) : Promise<Endpoint.Authenticated>
    {
        let auth : Endpoint.Authenticated = {   valid : true, error : null,
                                                transaction_id : request.headers[Endpoint.Headers.TRANSACTION_ID] as string,
                                                auth: { access  : { id: null },
                                                        login   : { id: null },
                                                        domain  : Endpoint.Domain.NONE  } };
        return auth;
    }
    */

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private async processEndpoint( request: FastifyRequest, reply: FastifyReply, endpt : Endpoint.Definition ) : Promise<void>
    {
        try
        {
            endpt.reset();

            //console.log("process", endpt.method, endpt.url, endpt.auth, ObjectUtils.notNull( request.headers[Endpoint.Headers.DEVKEY] ) );

            //console.log("processEndpoint",  endpt.url, endpt.method, endpt.auth,
            //                                request.headers[Endpoint.Headers.DEVKEY],
            //                                request.headers[Endpoint.Headers.DOMAIN],
            //                                request.headers[Endpoint.Headers.IDENTITY] );

            //
            // allow the endpoint to parse the request to attributes unique to the endpoint
            //
            const check : Endpoint.Reply = endpt.validate( request );
            if(  check.status != Network.Status.OK )
            {
                reply.code( check.status ).send( check.data );
            }
            //
            // request has devkey OR the endpoint does not need authentication
            //
            else if( ObjectUtils.notNull( request.headers[Endpoint.Headers.DEVKEY] ) || !endpt.auth )
            {
                //let login_id  : string = null;
                //let role_id   : string = null;
                //let domain_id : string = null;
                /*
                if( ObjectUtils.notNull( request.headers[Endpoint.Headers.IDENTITY] ) )
                {
                    //console.log( "id", request.headers[Endpoint.Headers.IDENTITY] );
                    const identity : any = JSON.parse( request.headers[Endpoint.Headers.IDENTITY] as string );
                    login_id  = identity.login;
                    role_id   = identity.role;
                    domain_id = identity.domain;
                }
                */
                let authenticate : Endpoint.Authenticated = {   transaction_id  :   request.headers[Endpoint.Headers.TRANSACTION_ID] as string,
                                                                auth: { id : request.headers[Endpoint.Headers.DEVKEY] as string,
                                                                        }
                                                            };

                // authenticate endpoints that require authentication
                //if( endpt.auth )authenticate = await this.authenticate( request, endpt );

                // continue if authentication is not needed OR the domain is allowed for this endpoint
                if( !endpt.auth )//|| endpt.isDomainAllowed( authenticate.auth.domain.type ) )
                {
                    let transaction_id : string = randomUUID();
                    // non-proxied may not pre-set transaction ids
                    if( ObjectUtils.notNull( request.headers[ Endpoint.Headers.TRANSACTION_ID ] ) )
                    {
                        transaction_id = request.headers[ Endpoint.Headers.TRANSACTION_ID ] as string;
                    }

                    //console.log("auth", authenticate );
                    authenticate.transaction_id = transaction_id;

                    //const now      : Date = new Date();
                    const response : Endpoint.Reply = await endpt.execute( authenticate );
                    //const duration : number = new Date().getTime() - now.getTime();

                    // add back in
                    //this.logInfo( "Request", { method: endpt.method, url: endpt.url, status: response.status, transaction_id: transaction_id, duration: duration } );

                    reply.header('Content-Type', Network.MimeType.JSON )
                         .header( Endpoint.Headers.TRANSACTION_ID, transaction_id )      // always give it back
                         .code( response.status )
                         .send( response.data );
                }
                else
                {
                    let err : Endpoint.ErrorReply = {   code   : Endpoint.Error.NOT_AUTHORIZED,
                                                        message: "access unauthorized" };
                    reply.code( Network.Status.UNAUTHORIZED ).send( err );
                }
            }
            else
            {
                const err : Endpoint.ErrorReply = {   code   : Endpoint.Error.NOT_AUTHORIZED, message: StringUtils.format( "devkey missing in header for {0}{1}", endpt.method, endpt.url ) };
                reply.code( Network.Status.BAD_REQUEST ).send( err );
            }

        }
        catch( err: any )
        {
            this.logError( "processEndpoint:exception", err );
            reply.code( Network.Status.INTERNAL_SERVER_ERROR ).send('mv::processEndpoint exception');
        }

    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private async processRequestAsync( request: FastifyRequest, reply: FastifyReply, callback : netService.RequestCallbackAsync ) : Promise<void>
    {
        try
        {
            // all requests will have a transactionid
            let transaction_id : string = request.headers[ Endpoint.Headers.TRANSACTION_ID ] as string;

            let got   : Endpoint.Reply = await callback( request );

            //let stats : microvoltServices.IStats = { duration: Date.now() - start_ms };

            // todo: make const enum reference for content types
            reply.header('Content-Type', Network.MimeType.JSON )
                 //.header( 'servicestats', stats )
                 .header( Endpoint.Headers.TRANSACTION_ID, transaction_id )      // always give it back
                 .code( got.status )
                 .send( got.data );
        }
        catch( err: any )
        {
            this.logError( "processRequestAsync:exception", err );
            reply.code( Network.Status.INTERNAL_SERVER_ERROR ).send('mv::processRequestAsync exception');
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private processRequest( request: FastifyRequest, reply: FastifyReply, callback : netService.RequestCallback ) : void
    {
        try
        {
            //let start_ms : number = Date.now();

            // check limits
            //let ips : Array<string> = microvoltService.requestIps( request );
            //this.logInfo( 1000, "mv::processRequest", { ips:ips, host: request.hostname, origin: request.headers.origin } );

            // all requests will have a transactionid
            let transaction_id : string = request.headers[ Endpoint.Headers.TRANSACTION_ID ] as string;

            let got   : Endpoint.Reply = callback( request );

            // do checks if not OK
  
            //let stats : microvoltServices.IStats = { duration: Date.now() - start_ms };

            //
            reply.header('Content-Type', Network.MimeType.JSON )
                 //.header( 'servicestats', stats )
                 .header( Endpoint.Headers.TRANSACTION_ID, transaction_id )      // always give it back
                 .code( got.status )
                 .send( got.data );
        }
        catch( err: any )
        {
            this.logError( "processRequest:exception", err );
            reply.code( Network.Status.INTERNAL_SERVER_ERROR ).send('mv::processRequest exception');
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // to override by actual service to do something
    protected serviceReady() : void
    {
        this.logInfo( "ServiceReady" );
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // call in case inherited classes want to register with Fastify other capacilities
    protected addServerRegister() : void
    {
        this.server.register( formbody );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public startServer() : void
    {
        this.registerSignals();

        //this.serviceAboutToStart();

        // https://fastify.dev/docs/latest/Reference/Server/#logger
        this.server = fastify({ logger              : this.log_server,
                                disableRequestLogging: true,
                                ignoreTrailingSlash : true,
                                ignoreDuplicateSlashes: true,
                                caseSensitive       : false,
                                maxParamLength      : 100 });
        
        this.server.setErrorHandler( ( error: FastifyError, request: FastifyRequest, reply : FastifyReply ) => this.processError( error, request, reply ) );
        //this.server.ready( () => this.serverReady() ); // async

        this.addServerRegister();
        this.registerEndpoints();

        try
        {
            let opts : FastifyListenOptions = { port: this.config.server.port,
                                                host: this.config.server.host };
            this.server.listen( opts, ( err: Error, address: string ) => this.serviceStarted( err, address) );
        }
        catch( err : any )
        {
            this.logError( "startServer exception", err );
            process.exit( 1 );
        }
        
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private serviceStarted( err: Error, address : string ) : void
    {
        if( err )
        {
            this.logError( "serviceStarted", err );
            process.exit(1);
        }

        this.logInfo("serviceStarted", {    status  : "Service started",
                                            id      : this.id,
                                            address : address,
                                            version : this.app_version,
                                            cpus    : this.nbr_cpus } );
        //this.registerService();
        //this.publishEndpoints();
        this.serviceReady();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Adds the ability to server up static files
    protected addStaticFileHosting( homedir: string, rootdir : string, prefix: string, setheaders : Function ) : void
    {
        this.server.register( fastifyStatic, {
                                root        : path.join( this.directoryPath( homedir ), rootdir ),
                                wildcard    : true,
                                serveDotFiles: false,
                                list        : false,
                                schemaHide  : true,
                                // allowPath: (path : string, root : string, request: any )-> callback,
                                setHeaders: ( res:any, path:any, stats:any ) => setheaders(res,path,stats),
                                prefixAvoidTrailingSlash: false,
                                prefix    : prefix, // optional: default '/'
                                //constraints: { host: 'example.com' } // optional: default {}
          });
          //this.server.setNotFoundHandler( ( req : any, res: any ) => this.defaultRoute( req, res ) );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    protected addNotFoundHandler( callback : Function ) : void
    {
        this.server.setNotFoundHandler( ( req : any, res: any ) => callback(req,res) );
    }

    /*
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    private async registerService() : Promise<void>
    {
        // call hub with configuration and actions
        if( this.registered_events.length > 0 )
        {
            let endpt : postHubRegisterEndpoint = new postHubRegisterEndpoint();
            endpt.request.service = this.type;
            endpt.request.events  = this.registered_events;

            let hub_service : microvoltClient = new microvoltClient( this.config.hub.host );
            const reply     : microvoltClient.Reply = await hub_service.fetchLocal( endpt );
            this.logInfo("registered:", { number: this.registered_events.length, ok: reply.ok } );
            if( reply.ok )
            {
                // if the registered returned any cached events, process those
                if( ObjectUtils.notNull( reply.data.events ) && reply.data.events.length > 0 )
                {
                    let i : number;
                    for( i=0; i < reply.data.events.length; i++ )
                    {
                        this.eventReceived( reply.data.events[i] );
                    }
                }
            }
            else
            {
                this.logError("Unable to register events with hub", reply.error );
            }
        } 
    
    }
        */

    /*
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    protected async publishEndpoints() : Promise<void>
    {
        let endpt : postRegisterEndpoint = new postRegisterEndpoint();
        endpt.request.service = this.type;
        endpt.request.endpoints = [];
    
        this.end_pts.forEach( ( ept : Endpoint.Definition )=> { endpt.request.endpoints.push( { category: ept.category, method: ept.method, url: ept.url, allowed_domains: ept.allowed_domains } ); } );
        let perm_service : microvoltClient = new microvoltClient( this.config.permission.host );
        const reply : microvoltClient.Reply = await perm_service.fetchLocal( endpt );
    }
        */

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    /*
    private categorizeEndpoints() : Array<microvoltService.IEndpoint>
    {
        let count       : number = this.end_pts.length;
        let i           : number;
        let j           : number;
        let categories  : Array<microvoltService.IEndpoint> = [];
        let found       : boolean;

        for( i=0; i < count; i++ )
        {
            found = false;
            for( j=0; j < categories.length; j++ )
            {
                if(  this.end_pts[i].category == categories[j].url )
                {
                    // add unique methods
                    if( categories[j].methods.indexOf( this.end_pts[i].method ) < 0 )
                    {
                        categories[j].methods.push( this.end_pts[i].method );
                    }
                    found = true;
                    break;
                }
            }

            if( !found )
            {
                categories.push( { url : this.end_pts[i].category, methods: [ this.end_pts[i].method ] } );
            }
        }
        return categories;
    }
    */

    /*
    /////////////////////////////////////////////////////////////////////////////////////////////
    public async addEvent( eventid : string ) : Promise<void>
    {
        // not already there
        if( this.registered_events.indexOf( eventid ) < 0 )
        {
            this.registered_events.push( eventid );
            await this.registerService();
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////
    public async removeEvent( eventid : string ) : Promise<void>
    {
        // not already there
        let idx : number =  this.registered_events.indexOf( eventid );
        if( idx >= 0 )
        {
            this.registered_events.splice( idx, 1 );
            await this.registerService();
        }
    }
        */

    /*
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // overrride as needed
    public async eventReceived( event : postHubTriggerEndpoint.RequestData ) : Promise<void>
    {
        // do something with the events
        this.logInfo("eventReceived: need to do something with received events", { service: this.type, events: event } );
    }
    */

    /*
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async sendEvent(     type            : string,
                                payload         : any,
                                authenticated   : Endpoint.Authenticated
                            ) : Promise<void>
    {
        let endpt : postHubTriggerEndpoint = new postHubTriggerEndpoint();
        endpt.request.type = type;
        endpt.request.transaction_id = authenticated.transaction_id,
        endpt.request.devkey         = authenticated.auth.access.id;
        endpt.request.login_id       = authenticated.auth.login.id;
        endpt.request.role_id        = authenticated.auth.role.id;
        endpt.request.created_at     = new Date().toISOString(),
        endpt.request.payload        = payload;

        const hub   : microvoltClient = new microvoltClient( this.config.hub.host );
        const reply : microvoltClient.Reply = await hub.fetchLocal( endpt );
        //console.log("sent trigger", type, reply );
    }
        */

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // initialize database connection or other states before everything else starts
    protected async init() : Promise<void>
    {
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async start() : Promise<void>
    {
        // bootstrap
        await this.init();
        this.startServer();
    }
}

export namespace netService
{

    export interface RequestCallback{ ( request: FastifyRequest ) : Endpoint.Reply }  
    export interface RequestCallbackAsync{ ( request: FastifyRequest ) : Promise<Endpoint.Reply> }  

    export enum Platform
    {
        LOCAL     = "local",
        GOOGLE    = "google",
        AWS       = "aws",
        AZURE     = "azure"
    }

    export enum LogLevel
    {
        INFO     = 1,
        WARNING  = 2,
        ERROR    = 3,
    }

    export interface AuthenticatedRequest
    {
        valid    : boolean;
        devkey   : string;
        message? : string;
        reason?  : any;
    }

    //
    // base configuration for all services
    // a service can extend this for other things it might need
    //
    export interface IConfig
    {
        platform    : Platform;
        server      : { host : string; port : number; }
        //secrets     : { root : string };
    }

    export interface IEndpoint
    {
        url      : string;
        methods  : Array<Network.Method>;
    }

}

//
// eof
//