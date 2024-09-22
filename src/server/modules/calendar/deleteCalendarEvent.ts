//
//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';

//
import { deleteCalendarEventEndpoint }  from '../../../api/deleteCalendarEventEndpoint.js';
import { CalendarModule }       from './CalendarModule.js';
import { netClient }            from '../../../net/netClient.js';
import { OauthToken }           from '../../smartScreenService.js';



//
//
//
export default class deleteCalendarEvent extends deleteCalendarEventEndpoint
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
        const token : OauthToken = await this.module.server.getTokens();
        if( token )
        {
            const endpt : netClient = new netClient( "" );
            console.log( "deleteCalendarEvent", this.request );
            // https://developers.google.com/calendar/api/v3/reference/events/insert
            const response : netClient.Reply = await endpt.delete( StringUtils.format( "https://www.googleapis.com/calendar/v3/calendars/{0}/events/{1}",
                                                                        this.request.calendarId,
                                                                        this.request.id ),
                                                            {}, {}, { Authorization : StringUtils.format( "{0} {1}", token.token_type, token.access_token ) } );
            //console.log( "deleteCalendarEvent", response.ok, response );
            if( response.ok )
            {
            }
            else
            {
                return this.failure( Network.Status.BAD_REQUEST, deleteCalendarEventEndpoint.Error.MISSING_OR_BAD_DATA, "bad request" );
            }
        }
        else
        {
            return this.failure( Network.Status.UNAUTHORIZED, deleteCalendarEventEndpoint.Error.NOT_AUTHORIZED, "unauthorized token" );
        }
        //
        
        // reply
        let reply : deleteCalendarEventEndpoint.ReplyData = {};
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//