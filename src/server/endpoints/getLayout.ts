//
import StringUtils          from '../../utils/StringUtils.js';
import ObjectUtils          from '../../utils/ObjectUtils.js';
import { Network }          from '../../net/Network.js';
import { Endpoint }         from '../../net/Endpoint.js';

//
import { getLayoutEndpoint }  from '../../api/getLayoutEndpoint.js';
import { smartScreenService } from '../smartScreenService.js';



//
//
//
export default class getLayout extends getLayoutEndpoint
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
        const layout : any = this.server.readJsonFile( "config/layout.json", {} );
        //console.log( "getLayout", layout );
        
        // reply
        let reply : getLayoutEndpoint.ReplyData = { layout : layout };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//