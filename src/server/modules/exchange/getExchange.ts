//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';

//
import { netClient }            from '../../../net/netClient.js';
import { getExchangeEndpoint }  from '../../../api/getExchangeEndpoint.js';
import { ExchangeModule }       from './ExchangeModule.js';



//
//
//
export default class getExchange extends getExchangeEndpoint
{
    private module : ExchangeModule;

    /////////////////////////////////////////////////////////////////////////////////
    constructor( module : ExchangeModule )
    {
        super();
        this.module = module;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        //https://app.exchangerate-api.com/dashboard/confirmed
        //console.log( "getExchange", this.module.key, this.request, new Date().toLocaleString() );

        let rates : Array<getExchangeEndpoint.Rate> = [];

        const endpt : netClient = new netClient( "" );

        //const key : string = "c3bae5e76d0640bb8c5153708242208";
        const response : netClient.Reply = await endpt.get( StringUtils.format( "https://v6.exchangerate-api.com/v6/{0}/latest/{1}", this.module.key, this.request.base ), {} );                   
        //console.log( "gotWx", JSON.stringify( response.data, null, 4 ) );

        if( response.ok )
        {
            const targets : Array<string> = this.request.targets.split(",");
            try
            {
                targets.forEach( ( rate : string ) => { if( response.data.conversion_rates[rate] )rates.push( { currency: rate, conversion: response.data.conversion_rates[rate] } ) } );
            }
            catch( err: any )
            {
                console.error( "exchange: error parsing JSON response" );
            }
                
        }
       
        // reply
        let reply : getExchangeEndpoint.ReplyData = { rates : rates };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//