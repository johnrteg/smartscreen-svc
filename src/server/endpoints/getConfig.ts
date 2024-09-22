//
import StringUtils          from '../../utils/StringUtils.js';
import ObjectUtils          from '../../utils/ObjectUtils.js';
import { Network }          from '../../net/Network.js';
import { Endpoint }         from '../../net/Endpoint.js';

//
import { getConfigEndpoint }  from '../../api/getConfigEndpoint.js';
import { smartScreenService } from '../smartScreenService.js';



//
//
//
export default class getConfig extends getConfigEndpoint
{
    private server : smartScreenService;

    /////////////////////////////////////////////////////////////////////////////////
    constructor( svr : smartScreenService )
    {
        super();
        this.server = svr;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        const google_creds : any = this.server.readJsonFile( "data/credentials.json", {} );
        //console.log( "getConfig", google_creds );

        const modules : any = this.server.readJsonFile( "config/modules.json", {} );
        let i : number;
        let map_key : string = "";
        for( i=0; i < modules.modules.length; i++ )
        {
            if( modules.modules[i].id == "googleMap" )
            {
                map_key = modules.modules[i].config.key;
                break;
            }
        }


        if( google_creds == null )
        {
            return this.failure( Network.Status.UNAUTHORIZED, getConfigEndpoint.Error.NOT_AUTHORIZED, "unauthorization credentials missing" );
        }
        
        // reply
        let reply : getConfigEndpoint.ReplyData = { google: {   client_id : google_creds.web.client_id,
                                                                redirect_url: google_creds.web.redirect_uris,
                                                                map: { key : map_key } } };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//