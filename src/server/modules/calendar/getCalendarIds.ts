//
//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';

//
import { getCalendarIdsEndpoint }  from '../../../api/getCalendarIdsEndpoint.js';
import { CalendarModule }       from './CalendarModule.js';
import { netClient }            from '../../../net/netClient.js';
import { OauthToken }           from '../../smartScreenService.js';



//
//
//
export default class getCalendar extends getCalendarIdsEndpoint
{
    private module : CalendarModule;

    /////////////////////////////////////////////////////////////////////////////////
    constructor( module : CalendarModule )
    {
        super();
        this.module = module;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        let ids : Array<getCalendarIdsEndpoint.Calendar> = [];// {id:"primary", name: "Primary", colorId: 0 } ];

        const token : OauthToken = await this.module.server.getTokens();
        if( token )
        {
            const endpt : netClient = new netClient( "" );

            // get calendars
            const response : netClient.Reply = await endpt.get(   "https://www.googleapis.com/calendar/v3/users/me/calendarList", {},
                                                                        { Authorization : StringUtils.format( "{0} {1}", token.token_type, token.access_token ) } );
            if( response.ok )
            {
                //console.log( "getCalendar::calendars", JSON.stringify( response.data, null, 2 ) );
                let i : number;
                let primary : boolean;
                for( i=0; i < response.data.items.length; i++ )
                {
                    primary = ObjectUtils.notNull( response.data.items[i].primary ) ? ObjectUtils.getBoolean( response.data.items[i].primary ): false;
                    ids.push( { id: response.data.items[i].id,
                                name : response.data.items[i].summary,
                                colorId: parseInt( response.data.items[i].colorId ),
                                primary: primary } );
                }
            }

        }
        else
        {
            console.error( "getCalendar: no tokens saved/expired" );
            // NOT_AUTHORIZED
            return this.failure( Network.Status.UNAUTHORIZED, getCalendarIdsEndpoint.Error.NOT_AUTHORIZED, "unauthorized token" );
        }
        
        // reply
        let reply : getCalendarIdsEndpoint.ReplyData = { calendars : ids };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//