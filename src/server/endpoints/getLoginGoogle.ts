//
import StringUtils          from '../../utils/StringUtils.js';
import ObjectUtils          from '../../utils/ObjectUtils.js';
import { Network }          from '../../net/Network.js';
import { Endpoint }         from '../../net/Endpoint.js';

//
import { getLoginGoogleEndpoint }  from '../../api/getLoginGoogleEndpoint.js';
import { smartScreenService } from '../smartScreenService.js';



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

        
        // reply
        let reply : getLoginGoogleEndpoint.ReplyData = {};
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//