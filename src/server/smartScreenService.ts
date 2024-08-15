//
import * as fs from 'fs';
import * as path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

// external
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { FastifyInstance, FastifyReply, FastifyRequest, FastifyError, FastifyListenOptions, HTTPMethods } from 'fastify';

//import clock from "./modules/clock/module.js";

//
interface Module
{
    id : string;
    config : any;
}

export class smartScreenService
{
    protected   server     : FastifyInstance;
    protected   log_server : boolean;

    //////////////////////////////////////////////////////////////////////////////
    constructor()
    {
        this.server = null;
        this.log_server = false;
    }

    //////////////////////////////////////////////////////////////////////////////
    protected async init() : Promise<void>
    {
        let config : any = this.readJsonFile("config/modules.json", {} );
        //console.log("init::modules", config, config.modules.length );

        //config.modules.forEach( ( module : Module ) => this.addModule( module ) );
    }

    //////////////////////////////////////////////////////////////////////////////
    protected async addModule( module : Module ) : Promise<void>
    {
        //console.log( "addModule", module, import.meta.url );
        let method : string = 'index';

        try
        {
            const path : string = process.cwd() + "/build/server/modules/" + module.id + "/module.js";
            const rel_path : string = "./modules/" + module.id + "/module.js";

            if( fs.existsSync( path ) )
            {
                console.log( "add Module", module.id, rel_path );

                const data : string = fs.readFileSync( path ).toString();

                console.log( "module data", data );

                const script = new vm.Script( data, { filename: path } );
                script.runInThisContext();

                //let controller = require( rel_path );
                //if( typeof controller[method] === 'function' )controller[method]();
            }
            else
            {
                console.log( "Module entry not found", module.id, path );
            }
        }
        catch( err: any )
        {
            console.error( "module not found:", module.id );
        }
        
    }

    ///////////////////////////////////////////////////////////////////////////////////
    public readJsonFile( path : string, default_json : any ) : any
    {
        if( fs.existsSync( path ) )
            return JSON.parse( fs.readFileSync( path, "utf8"));
        else
        {
            console.error( "readJsonFile path not found", { path: path, cwd: process.cwd() } );
            return default_json;
        }   
    }

    //////////////////////////////////////////////////////////////////////////////
    public started( err: Error, address : string ) : void
    {
        if( err )
        {
            console.error( "serviceStarted", err );
            process.exit(1);
        }

        console.log( "service started", address );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    protected addNotFoundHandler( callback : Function ) : void
    {
        this.server.setNotFoundHandler( ( req : any, res: any ) => callback(req,res) );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    protected directoryPath( import_meta_url : string ) : string
    {
        const filename : string = fileURLToPath( import_meta_url );
        return path.dirname( filename );
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

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private setNotFoundHandler( request : any, response: any ) : void
    {
        console.log( "setNotFoundHandler", "websvc", request.params, request.method, request.url );
        response.sendFile('index.html');
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private setStaticHeaders( res:any, path:any, stats:any ) : void
    {
        //console.log( "setStaticHeaders", path, stats );
    }

    //////////////////////////////////////////////////////////////////////////////
    public async registerHost() : Promise<void>
    {
        this.addStaticFileHosting( import.meta.url, '../../web/public', '/', this.setStaticHeaders );
        this.addNotFoundHandler( this.setNotFoundHandler );
    }

    //////////////////////////////////////////////////////////////////////////////
    public async registerEndpoints() : Promise<void>
    {
    }

    //////////////////////////////////////////////////////////////////////////////
    public async loadModules() : Promise<void>
    {
    }

    //////////////////////////////////////////////////////////////////////////////
    public async start() : Promise<void>
    {
        await this.init();

        this.server = fastify({ logger              : this.log_server,
                                disableRequestLogging: true,
                                ignoreTrailingSlash : true,
                                ignoreDuplicateSlashes: true,
                                caseSensitive       : false,
                                maxParamLength      : 100 });

        await this.loadModules();
        await this.registerHost();
        await this.registerEndpoints();

        try
        {
            let opts : FastifyListenOptions = { port: 8080,
                                                host: "localhost" };
            this.server.listen( opts, ( err: Error, address: string ) => this.started( err, address) );
        }
        catch( err : any )
        {
            console.error( "startServer exception", err );
            process.exit( 1 );
        }
    }
}