//
import StringUtils          from '../../utils/StringUtils.js';
import ObjectUtils          from '../../utils/ObjectUtils.js';
import { Network }          from '../../net/Network.js';
import { Endpoint }         from '../../net/Endpoint.js';

//
import { putSettingsEndpoint }  from '../../api/putSettingsEndpoint.js';
import { smartScreenService } from '../smartScreenService.js';



//
//
//
export default class putSettings extends putSettingsEndpoint
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
        //console.log( "putSettings", this.request  );
        this.server.writeJsonFile( "config/settings.json", this.request );
        
        // reply
        let reply : putSettingsEndpoint.ReplyData = {};
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//