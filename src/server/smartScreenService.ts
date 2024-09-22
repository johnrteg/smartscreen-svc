//
import * as fs from 'fs';
import * as path from 'path';

//
import { google } from 'googleapis';

// external
import { netService }       from '../net/netService.js';
import ObjectUtils          from '../utils/ObjectUtils.js';

import getLayout            from './endpoints/getLayout.js';
import getLoginGoogle       from './endpoints/getLoginGoogle.js';
import getAuthGoogle        from './endpoints/getAuthGoogle.js';
import getSettings          from './endpoints/getSettings.js';
import putSettings          from './endpoints/putSettings.js';
import getConfig            from './endpoints/getConfig.js';

// modules
import { WxModule }         from './modules/wx/WxModule.js';
import { CalendarModule }   from './modules/calendar/CalendarModule.js';
import { ExchangeModule }   from './modules/exchange/ExchangeModule.js';
import { GoogleMapModule }  from './modules/googleMap/GoogleMapModule.js';
import { WordModule }       from './modules/word/WordModule.js';

export interface OauthToken
{
    access_token    : string;
    refresh_token   : string;
    scope           : string;
    token_type      : string;
    id_token        : string;
    expiry_date     : number;
}

//
export class smartScreenService extends netService
{
    private modules : any;
    public google_oauth_key : string;

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
        const config : any = this.readJsonFile( "config/modules.json", {} );
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
        this.route( new getSettings( this ) );
        this.route( new putSettings( this ) );
        this.route( new getConfig( this ) );

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
            if( fs.existsSync( this.credentialsPath() ) )
            {
                const content     : string = fs.readFileSync( this.credentialsPath() ).toString();
                const credentials : any = JSON.parse( content );
                return credentials;
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
    public saveTokens( client_tokens : OauthToken ) : void
    {
        fs.writeFileSync( this.tokenPath(), JSON.stringify( client_tokens, null, 2 ) );
        //console.log( "token saved" );
    }

    ///////////////////////////////////////////////////////////////////////////////
    public async getTokens() : Promise<OauthToken>
    {
        if( fs.existsSync( this.tokenPath() ) )
        {
            const contents : string = fs.readFileSync( this.tokenPath() ).toString();
            const tokens   : OauthToken = JSON.parse( contents );

            const now : Date = new Date();
            if( tokens.expiry_date <= now.getTime() )
            {
                if( ObjectUtils.notNull( tokens.refresh_token ) )
                {
                    console.log("refresh token needed", new Date( tokens.expiry_date ).toLocaleString() );
                    return this.refreshToken( tokens.refresh_token );
                }
                else
                {
                    console.warn("refresh token not provided");
                    return null;
                }
            }
            else
            {
                return tokens;
            }
        }
        else
        {
            return null;
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    // https://medium.com/starthinker/google-oauth-2-0-access-token-and-refresh-token-explained-cccf2fc0a6d9
    public async refreshToken( refresh_token : string ) : Promise<OauthToken>
    {
        const credentials : any = this.loadSavedCredentialsIfExist();

        //console.log( "creds", credentials, refresh_token );
        if( ObjectUtils.notNull( credentials ) )
        {
            try
            {
                const oauth2Client : any = new google.auth.OAuth2(  credentials.web.client_id,
                                                                    credentials.web.client_secret,
                                                                    credentials.web.redirect_uris[0]
                                                                );
                const new_tokens : any = await oauth2Client.refreshToken( refresh_token );

                // no refresh token returned, so keep current one
                if( ObjectUtils.isNull( new_tokens.tokens.refresh_token ) )
                {
                    new_tokens.tokens.refresh_token = refresh_token;
                }
                console.log( "refreshToken:: new" ); //, new_tokens.tokens );
                this.saveTokens( new_tokens.tokens );
                return new_tokens.tokens;
            }
            catch( err : any )
            {
                console.error( "Unable to get token:" );
                return null;
            }
            
        }
        else
        {
            console.error("refreshToken:: credentials not saved");
            return null;
        }
        
    }

    ////////////////////////////////////////////////////////////////////////////////
    public async authorizeFromCode( code : string ) : Promise<OauthToken>
    {
        const credentials : any = this.loadSavedCredentialsIfExist();
        //console.log( "credentials", credentials );

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
            //console.log( "tokens", tokens.tokens, new Date( tokens.tokens.expiry_date ).toString() );
            this.saveTokens( tokens.tokens );
            return tokens.tokens;
        }
        else
        {
            console.error("credentials not saved");
            return null;
        }
    }

}
// eof