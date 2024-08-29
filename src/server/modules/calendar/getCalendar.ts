//
import google from 'googleapis';
//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';

//
import { getCalendarEndpoint }  from '../../../api/getCalendarEndpoint.js';
import { CalendarModule } from './CalendarModule.js';
import { netClient } from '../../../net/netClient.js';
import { OauthToken } from '../../smartScreenService.js';



//
//
//
export default class getCalendar extends getCalendarEndpoint
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
        console.log( "getCalendar", this.request );

        let events : Array<getCalendarEndpoint.Event> = [];

        const token : OauthToken = await this.module.server.getTokens();
        if( token )
        {
            const endpt : netClient = new netClient( "" );
            const response : netClient.Reply = await endpt.get( StringUtils.format( "https://www.googleapis.com/calendar/v3/calendars/{0}/events", "primary" ),
                            {   //maxResults: 10,
                                orderBy: "startTime",
                                timeMin: this.request.start_date,
                                timeMax: this.request.end_date,
                                singleEvents: "TRUE" },
                                { Authorization : StringUtils.format( "{0} {1}", token.token_type, token.access_token ) } );
            //console.log( "getCalendar", response.data );
            if( response.ok )
            {
                const data : any = response.data;
                let i : number;
                for( i=0; i < data.items.length; i++ )
                {
                    //console.log( "event", i, data.items[i] );

                    events.push( {  id: data.items[i].id,
                                    summary: data.items[i].summary,
                                    start : {   dt      : data.items[i].start.dateTime ? data.items[i].start.dateTime : data.items[i].start.date,
                                                tz      : data.items[i].start.timeZone ? data.items[i].start.timeZone: null,
                                                allday  : data.items[i].start.date != null },
                                    end   : {   dt      : data.items[i].end.dateTime   ? data.items[i].end.dateTime   : data.items[i].end.date  ,
                                                tz      : data.items[i].end.timeZone   ? data.items[i].end.timeZone  : null,
                                                allday  : data.items[i].end.date != null }
                    } );
                }
            }
        }
        else
        {
            console.error( "getCalendar: no tokens saved" );
        }
        // OAuth:
        // host: http://localhost:8080
        // redirect: http://localhost:8080/auth/google
        // client id: 251787141802-8lm7p0g9r8ph27lt54v0tjl0if521bjp.apps.googleusercontent.com
        // client secret : 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

        //const calendar = google.calendar( {version: 'v3', auth});

        //let reports : Array<getWxEndpoint.Report> = [];

        // https://calendar.google.com/calendar/embed?src=jlajrt%40gmail.com&ctz=America%2FNew_York
        /*
        const endpt : netClient = new netClient( "" );
        const response : netClient.Reply = await endpt.get( StringUtils.format( "https://www.googleapis.com/calendar/v3/calendars/{0}/events", "primary" ),
                        {   key: this.module.server.google_oauth_key, 
                            maxResults: 10,
                            orderBy: "updated",
                            timeMin: this.request.start_date,
                            singleEvents: "TRUE" },
                            {Authorization : StringUtils.format( "Bearer {0}", this.module.server.google_oauth_key ) } );
        console.log( "getCalendar", response );
        

         */ 

        // reply
        let reply : getCalendarEndpoint.ReplyData = { events : events };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//