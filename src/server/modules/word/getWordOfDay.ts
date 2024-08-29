//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';

//
import { netClient }            from '../../../net/netClient.js';
import { getWordOfDayEndpoint }  from '../../../api/getWordOfDayEndpoint.js';
import { WordModule }       from './WordModule.js';



//
//
//
export default class getWordOfDay extends getWordOfDayEndpoint
{
    private module : WordModule;

    /////////////////////////////////////////////////////////////////////////////////
    constructor( module : WordModule )
    {
        super();
        this.module = module;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        //console.log( "getExchange", this.module.key, this.request, new Date().toLocaleString() );

        const endpt : netClient = new netClient( "" );

        //const key : string = "c3bae5e76d0640bb8c5153708242208";
        const response : netClient.Reply = await endpt.get( "https://api.wordnik.com/v4/words.json/wordOfTheDay",
            { date  : this.request.date,
                key : this.module.key
            } );                   
        //

        if( response.ok )
        {
            console.log( "getWordOfDay", JSON.stringify( response.data, null, 4 ) );
        }
       
        // reply
        let reply : getWordOfDayEndpoint.ReplyData = { word : "", definition: "", type: "" };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//