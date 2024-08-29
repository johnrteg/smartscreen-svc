//
import * as fs from 'fs';
import * as path from 'path';

//
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';

// external
import { netService }   from '../net/netService.js';
import getLayout        from './endpoints/getLayout.js';
import getLoginGoogle   from './endpoints/getLoginGoogle.js';
import getAuthGoogle    from './endpoints/getAuthGoogle.js';

// modules
import { WxModule }         from './modules/wx/WxModule.js';
import { CalendarModule }   from './modules/calendar/CalendarModule.js';
import { ExchangeModule }   from './modules/exchange/ExchangeModule.js';
import { GoogleMapModule }  from './modules/googleMap/GoogleMapModule.js';
import { WordModule }       from './modules/word/WordModule.js';

export interface OauthToken
{
    access_token  : string;
    refresh_token : string;
    scope : string;
    token_type : string;
    id_token : string;
    expiry_date : number;
}


export class smartScreenService extends netService
{
    private modules : any;
    public google_oauth_key : string;

    private static SCOPES : Array<string> = ['https://www.googleapis.com/auth/calendar.readonly'];


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

        // instantiate configuration
        this.modules[ "wx" ]        = new WxModule( this );
        this.modules[ "calendar" ]  = new CalendarModule( this );
        this.modules[ "exchange" ]  = new ExchangeModule( this );
        this.modules[ "googleMap" ] = new GoogleMapModule( this );
        this.modules[ "word" ]      = new WordModule( this );

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

    ///////////////////////////////////////////////////////////////////////////////////
    private tokenPath() : string
    {
        return path.join( process.cwd(), 'data', 'token.json')
    }
    ///////////////////////////////////////////////////////////////////////////////////
    private credentialsPath() : string
    {
        return path.join( process.cwd(), 'data', 'credentials.json')
    }

    //////////////////////////////////////////////////////////////////////////////////
    public loadSavedCredentialsIfExist() : any
    {
        try
        {
            //.log("loadSavedCredentialsIfExist", fs.existsSync( this.credentialsPath() ), this.credentialsPath() );
            if( fs.existsSync( this.credentialsPath() ) )
            {
                const content     : string = fs.readFileSync( this.credentialsPath() ).toString();
                const credentials : any = JSON.parse( content );
                return credentials; //google.auth.fromJSON( credentials );
            }
            else
            {
                return null;
            }
        }
        catch( err )
        {
            return null;
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    public saveTokens( client_tokens : any ) : void
    {
        //const content   : string = fs.readFileSync( this.tokenPath() ).toString();
        //const keys      : any = JSON.parse( content );
        //const key       : any = keys.installed || keys.web;
        //const payload   : string = JSON.stringify({
        //                                type: 'authorized_user',
        //                                client_id: key.client_id,
        //                                client_secret: key.client_secret,
        //                                refresh_token: client_tokens.refresh_token,
        //                                });
        fs.writeFileSync( this.tokenPath(), JSON.stringify( client_tokens, null, 2 ) );
    }

    ///////////////////////////////////////////////////////////////////////////////
    public async getTokens() : Promise<OauthToken>
    {
        if( fs.existsSync( this.tokenPath() ) )
        {
            const contents : string = fs.readFileSync( this.tokenPath() ).toString();
            const tokens   : any = JSON.parse( contents );

            const now : Date = new Date();
            if( tokens.expiry_date <= now.getTime() )
            {
                console.log("refresh tokens", tokens.refresh_token );
            }
            return tokens;
        }
        else
        {
            return null;
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    public async authorizeFromCode( code : string ) : Promise<void>
    {
        const credentials : any = this.loadSavedCredentialsIfExist();
        console.log( "credentials", credentials );

        if( credentials )
        {
            // https://www.oauth.com/oauth2-servers/access-tokens/authorization-code-request/
            const oauth2Client : any = new google.auth.OAuth2(
                                                                credentials.web.client_id,
                                                                credentials.web.client_secret,
                                                                credentials.web.redirect_uris[0]
                                                            );

            // This will provide an object with the access_token and refresh_token.
            // Save these somewhere safe so they can be used at a later time.
            const tokens : any = await oauth2Client.getToken( code );
            //oauth2Client.setCredentials( tokens );
            console.log( "tokens", tokens.tokens );
            this.saveTokens( tokens.tokens );
        }
        else
        {
            console.error("credentials not saved");
        }
    }
    /*
        // get token exchange from code
        const endpt : netClient = new netClient( "" );
        const response : netClient.Reply = await endpt.post( "https://oauth2.googleapis.com/token", {},
                        {   grant_type: "authorization_code",
                            code: this.server.google_oauth_key,
                            scope: this.request.scope,
                            client_id: "1067509946324-up5h3eqksr1hkihtb1ujte4h4i93iutj.apps.googleusercontent.com",
                            client_secret: "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",
                            redirect_uri: "http://localhost:8080/auth/google" } );
        console.log( "gettoken", response );

        body:
        'client_id=1067509946324-up5h3eqksr1hkihtb1ujte4h4i93iutj.apps.googleusercontent.com&code_verifier=
        &code=4%2F0AQlEd8y3mJ5M3JA7YzhutkA3-34qs7bEPHF68FKNHgMLXS5RMvsK_F5jql9UimRdHL9jpQ
        &grant_type=authorization_code
        &redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fauth%2Fgoogle
        &client_secret=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'
  */

    /*
    ////////////////////////////////////////////////////////////////////////////////
    public async authorize() : Promise<any>
    {
        let client : any = this.loadSavedCredentialsIfExist();
        console.log("authorize::client", client );
        if( client )
        {
            return client;
        }

        client = await authenticate({ scopes: smartScreenService.SCOPES, keyfilePath: this.credentialsPath() });
        console.log("authorize::authenticate", client );
        if( client.credentials )
        {
            this.saveCredentials( client );
        }
        return client;
    }
        */


}