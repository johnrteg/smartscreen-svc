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

        // OAuth:
        // host: http://localhost:8080
        // redirect: http://localhost:8080/auth/google
        // client id: 251787141802-8lm7p0g9r8ph27lt54v0tjl0if521bjp.apps.googleusercontent.com
        // client secret : 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

        //const calendar = google.calendar( {version: 'v3', auth});

        //let reports : Array<getWxEndpoint.Report> = [];

        // https://calendar.google.com/calendar/embed?src=jlajrt%40gmail.com&ctz=America%2FNew_York
        const endpt : netClient = new netClient( "" );
        const response : netClient.Reply = await endpt.get( StringUtils.format( "https://www.googleapis.com/calendar/v3/calendars/{0}/events", "primary" ),
                        {   key: "251787141802-2kkgk02405mb3p0jslkogb7c6nec16ku.apps.googleusercontent.com",
                            maxResults: 10,
                            orderBy: "updated",
                            timeMin: this.request.start_date,
                            singleEvents: "TRUE" } );
        console.log( "getCalendar", response.data );
        if( response.ok )
        {
            try
            {
                
            }
            catch( err: any )
            {
                console.error( "calendar: error parsing JSON response" );
            }
            
        }
          

        // reply
        let reply : getCalendarEndpoint.ReplyData = {};
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//