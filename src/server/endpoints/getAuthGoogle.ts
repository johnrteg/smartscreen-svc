//
import StringUtils          from '../../utils/StringUtils.js';
import ObjectUtils          from '../../utils/ObjectUtils.js';
import { Network }          from '../../net/Network.js';
import { Endpoint }         from '../../net/Endpoint.js';

//
import { getAuthGoogleEndpoint }  from '../../api/getAuthGoogleEndpoint.js';
import { smartScreenService } from '../smartScreenService.js';
import { netClient } from '../../net/netClient.js';

import {google} from 'googleapis';


//
//
//
export default class getAuthGoogle extends getAuthGoogleEndpoint
{
    private server : smartScreenService;

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor( svr : smartScreenService )
    {
        super();
        this.server = svr;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        console.log( "getAuthGoogle", this.request );

        await this.server.authorizeFromCode( this.request.code );
        
        // reply
        let reply : getAuthGoogleEndpoint.ReplyData = {};
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//