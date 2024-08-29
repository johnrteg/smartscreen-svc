//
import StringUtils          from '../../utils/StringUtils.js';
import ObjectUtils          from '../../utils/ObjectUtils.js';
import { Network }          from '../../net/Network.js';
import { Endpoint }         from '../../net/Endpoint.js';

//
import { getLoginGoogleEndpoint }  from '../../api/getLoginGoogleEndpoint.js';
import { smartScreenService } from '../smartScreenService.js';
import { netClient } from '../../net/netClient.js';



//
//
//
export default class getLoginGoogle extends getLoginGoogleEndpoint
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
        console.log( "getLoginGoogleEndpoint", this.request );

        /*
        const params : any = { client_id : "107675219120146503094",
            redirect_uri : "https://www.example.com/authenticate/google",
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/calendar.events'
              ].join(' '), // space seperated string
              response_type: 'code',
              access_type: 'offline',
              prompt: 'consent',
        };

        const endpt : netClient = new netClient("");
        const response  : netClient.Reply = await endpt.get( "https://accounts.google.com/o/oauth2/v2/auth", params );
        if( response.ok )
        {
            console.log("login", response.data );

        }
            */
        
        // reply
        let reply : getLoginGoogleEndpoint.ReplyData = {};
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//