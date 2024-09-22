//
//
//
import { getLayoutEndpoint } from '../api/getLayoutEndpoint.js';
import { getSettingsEndpoint } from '../api/getSettingsEndpoint.js';
import { getConfigEndpoint } from '../api/getConfigEndpoint.js';


import { netClient }          from '../net/netClient.js';
import { Constants } from '../utils/Constants.js';
import { Interfaces } from './Interfaces.js';





//
//
//
export default class AppData
{
    private static _instance : AppData;

    private host : string = "http://localhost:8080";
    public config : getConfigEndpoint.ReplyData;

    public webserver    : netClient;

    //public localizer : Localizer;
    public layout : Interfaces.Layout;

    public begin_window : number = 6; // hours
    public end_window   : number = 22; // hours

    public settings: getSettingsEndpoint.ReplyData;

    public static event_colors : Array<string> = ['#7986CB','#33B679','#8E24AA','#E67C73','#F6BF26','#F4511E','#039BE5','#616161','#3F51B5','#0B8043','#D50000'];

    ////////////////////////////////////////////////////////////////////////////////////////////////
    constructor()
    {
        //this.localizer  = new Localizer();
        //this.cache      = new CacheData();
        this.layout = { pages: [] };
        this.settings = null;
    
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    public async clear() : Promise<void>
    {
        //this.webserver.clear();
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////
    public static instance() : AppData
    {
        if( AppData._instance == null )
        {
            AppData._instance = new AppData();
        }
        return AppData._instance;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    public nextUpdate( tm : number ) : number
    {
        const now : Date = new Date();
        // use given if within window to update
        // else next update at the start of the window, less 1 hour
        return ( now.getHours() >= this.begin_window && now.getHours() <= this.end_window ) ? tm : ( 24 - now.getHours() + this.begin_window - 1 )*Constants.HOURS_TO_MS;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    public async initialize( main : Function ) : Promise<void>
    {

        // client service
        let headers : any = {};
        this.webserver = new netClient( this.host, headers );


        //
        //
        //
        const config_endpt : getConfigEndpoint = new getConfigEndpoint();
        const config_reply  : netClient.Reply = await this.webserver.fetch( config_endpt );
        if( config_reply.ok )
        {
            this.config = config_reply.data;
            //console.log( "config", this.config );
        }

        

        //
        const endpt : getLayoutEndpoint = new getLayoutEndpoint();
        const init_reply  : netClient.Reply = await this.webserver.fetch( endpt );
        if( init_reply.ok )
        {
            this.layout = init_reply.data.layout;
        }

        //
        //
        //
        const settings_endpt : getSettingsEndpoint = new getSettingsEndpoint();
        const settings_reply  : netClient.Reply = await this.webserver.fetch( settings_endpt );
        if( settings_reply.ok )
        {
            this.settings = settings_reply.data;
            console.log( "settings", this.settings );
        }

        //await this.localizer.init();

        // start the app
        main();
    }

}

// eof