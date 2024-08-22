//
import * as fs from 'fs';
import * as path from 'path';
import vm from 'vm';

// external
import { netService } from '../net/netService.js';
import getLayout from './endpoints/getLayout.js';
import getLoginGoogle from './endpoints/getLoginGoogle.js';
import getAuthGoogle from './endpoints/getAuthGoogle.js';

// modules
import { WxModule } from './modules/wx/WxModule.js';
import { CalendarModule } from './modules/calendar/CalendarModule.js';


export class smartScreenService extends netService
{
    private modules : any;

    //////////////////////////////////////////////////////////////////////////////
    constructor()
    {
        super();

        this.modules = {};
        

        this.initConfig( this.readJsonFile( "config/host.json", {} ) );
    }

    //////////////////////////////////////////////////////////////////////////////
    protected async init() : Promise<void>
    {
        await super.init();
    }

    //////////////////////////////////////////////////////////////////////////////
    protected async loadModules() : Promise<void>
    {

        let config : any = this.readJsonFile( "config/modules.json", {} );
        //console.log("init::modules", config, config.modules.length );

        //config.modules.forEach( ( module : Module ) => this.addModule( module ) );

        // instantiate configuration
        this.modules[ "wx" ] = new WxModule( this );
        this.modules[ "calendar" ] = new CalendarModule( this );

        // set configuration
        let i : number;
        for( i=0; i < config.modules.length; i++ )
        {
            if( this.modules[ config.modules[i].id ] )
            {
                this.modules[ config.modules[i].id ].setConfig( config.modules[i].config );
            }
        }

    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    protected bindCallbacks() : void
    {
        super.bindCallbacks();
    }

    /*
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
        */

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
        super.registerEndpoints();

        this.registerHost();

        // non-module endpoints
        this.route( new getLayout( this ) );
        this.route( new getAuthGoogle( this ) );
        this.route( new getLoginGoogle( this ) );

        await this.loadModules();
    }


}