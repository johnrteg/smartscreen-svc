//
//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';

//
import { postCalendarEventEndpoint }  from '../../../api/postCalendarEventEndpoint.js';
import { CalendarModule }       from './CalendarModule.js';
import { netClient }            from '../../../net/netClient.js';
import { OauthToken }           from '../../smartScreenService.js';



//
//
//
export default class postCalendarEvent extends postCalendarEventEndpoint
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
        //console.log( "postCalendarEvent", this.request );
        let new_id : string;

        const token : OauthToken = await this.module.server.getTokens();
        if( token )
        {
            let end      : any = { timeZone: this.request.time_zone };
            let start    : any = { timeZone: this.request.time_zone };
            let start_dt : Date = new Date( this.request.start_date );
            let end_dt   : Date = new Date( this.request.end_date );

            if( this.request.allday )
            {
                start.date = StringUtils.format("{0}-{1}-{2}", start_dt.getFullYear(), StringUtils.leadingZero( start_dt.getMonth()+1, 2 ), StringUtils.leadingZero( start_dt.getDate(), 2 ) );
                end.date   = StringUtils.format("{0}-{1}-{2}", end_dt.getFullYear(), StringUtils.leadingZero( end_dt.getMonth()+1, 2 ), StringUtils.leadingZero( end_dt.getDate(), 2 ) );
            }
            else
            {
                start.dateTime = start_dt.toISOString();
                end.dateTime   = end_dt.toISOString();
            }

            const body : any = {    end         : end,
                                    start       : start,
                                    colorId     : this.request.colorId,
                                    summary     : this.request.summary,
                                    eventType   : "default",
                                    guestsCanInviteOthers: true,
                                    status      : "confirmed",
                                    visibility  : "default"
                                };

            const endpt : netClient = new netClient( "" );
            // https://developers.google.com/calendar/api/v3/reference/events/insert
            const response : netClient.Reply = await endpt.post( StringUtils.format( "https://www.googleapis.com/calendar/v3/calendars/{0}/events", this.request.calendarId ),
                                                                {},
                                                                body,
                                                            { Authorization : StringUtils.format( "{0} {1}", token.token_type, token.access_token ) } );
            //console.log( "postCalendar", body, response.ok, response.error, response.data );
            if( response.ok )
            {
                new_id = response.data.id;
            }
            else
            {
                return this.failure( Network.Status.BAD_REQUEST, postCalendarEventEndpoint.Error.MISSING_OR_BAD_DATA, "bad request" );
            }
        }
        else
        {
            return this.failure( Network.Status.UNAUTHORIZED, postCalendarEventEndpoint.Error.NOT_AUTHORIZED, "unauthorized token" );
        }
        //
        
        // reply
        let reply : postCalendarEventEndpoint.ReplyData = { id : new_id };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//