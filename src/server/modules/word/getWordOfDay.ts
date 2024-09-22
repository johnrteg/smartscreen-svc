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
        const endpt : netClient = new netClient( "" );

        const response : netClient.Reply = await endpt.get( "https://api.wordnik.com/v4/words.json/wordOfTheDay",
            {   date    : this.request.date,
                api_key : this.module.key
            } );                   
        //

        //console.log( "getWordOfDay", this.request, this.module.key, response );

        let word        : string = "";
        let definition  : string = "";
        let type        : string = "";

        if( response.ok )
        {
            //console.log( "getWordOfDay", JSON.stringify( response.data, null, 4 ) );
            word       = response.data.word;
            definition = response.data.definitions[0].text;
            type       = response.data.definitions[0].partOfSpeech;
        }
        else
        {
            console.error("word", response.error );
        }
       
        // reply
        let reply : getWordOfDayEndpoint.ReplyData = { word : word, definition: definition, type: type };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//