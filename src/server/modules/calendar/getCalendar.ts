//
//
import StringUtils          from '../../../utils/StringUtils.js';
import ObjectUtils          from '../../../utils/ObjectUtils.js';
import { Network }          from '../../../net/Network.js';
import { Endpoint }         from '../../../net/Endpoint.js';

//
import { getCalendarEndpoint }  from '../../../api/getCalendarEndpoint.js';
import { CalendarModule }       from './CalendarModule.js';
import { netClient }            from '../../../net/netClient.js';
import { OauthToken }           from '../../smartScreenService.js';



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
        console.log( "getCalendar", this.request.ids, ObjectUtils.getNumber( this.request.start_date ), ObjectUtils.getNumber( this.request.end_date ) );

        // https://google-calendar-simple-api.readthedocs.io/en/latest/colors.html
        const calendar_colors = {   classic:['#AC725E','#D06B64','#F83A22','#FA573C','#FF7537','#FFAD46','#42D692','#16A765','#7BD148','#B3DC6C','#FBE983','#FAD165','#92E1C0','#9FE1E7','#9FC6E7','#4986E7','#9A9CFF','#B99AFF','#C2C2C2','#CABDBF','#CCA6AC','#F691B2','#CD74E6','#A47AE2'],
                                    modern :['#795548','#E67C73','#D50000','#F4511E','#EF6C00','#F09300','#009688','#0B8043','#7CB342','#C0CA33','#E4C441','#F6BF26','#33B679','#039BE5','#4285F4','#3F51B5','#7986CB','#B39DDB','#616161','#A79B8E','#AD1457','#D81B60','#8E24AA','#9E69AF'] };

        const web_colors = { classic: ['#A4BDFC','#7AE7BF','#DBADFF','#FF887C','#FBD75B','#FFB878','#46D6DB','#E1E1E1','#5484ED','#51B749','#DC2127'],
                             modern : ['#7986CB','#33B679','#8E24AA','#E67C73','#F6BF26','#F4511E','#039BE5','#616161','#3F51B5','#0B8043','#D50000'] };

        let events : Array<getCalendarEndpoint.Event> = [];

        const token : OauthToken = await this.module.server.getTokens();
        if( token )
        {
            const endpt : netClient = new netClient( "" );

            let ids : Array<string> = this.request.ids.split(','); //['en.usa#holiday@group.v.calendar.google.com','primary'];
            //if( ObjectUtils.notNull( this.request.ids ) )ids = this.request.ids;

            //console.log("cals", ids );
            //console.log("dates",    new Date( ObjectUtils.getNumber( this.request.start_date ) * 1000 ).toISOString(),
            //                        new Date( ObjectUtils.getNumber( this.request.end_date ) * 1000 ).toISOString() );

            let idx : number;
            let i : number;
            for( idx=0; idx < ids.length; idx++ )
            {
                // get data
                const response : netClient.Reply = await endpt.get( StringUtils.format( "https://www.googleapis.com/calendar/v3/calendars/{0}/events", encodeURIComponent( ids[idx] ) ),
                                                                {   //maxResults: 10,
                                                                    orderBy     : "startTime",
                                                                    timeMin     : new Date( ObjectUtils.getNumber( this.request.start_date ) * 1000 ).toISOString(),
                                                                    timeMax     : new Date( ObjectUtils.getNumber( this.request.end_date ) * 1000 ).toISOString(),
                                                                    singleEvents: "true" },
                                                                    { Authorization : StringUtils.format( "{0} {1}", token.token_type, token.access_token ) } );
                //console.log( "getCalendar", ids[idx], response.ok, response.error );
                if( response.ok )
                {
                    const data : any = response.data;
                    //console.log( "getCalendar", data );
                    
                    for( i=0; i < data.items.length; i++ )
                    {
                        console.log( "event", i, data.items[i] );
                        
                        events.push( {  id          : data.items[i].id,
                                        calendarId  : ids[idx],
                                        summary     : data.items[i].summary,
                                        color       : data.items[i].colorId ? web_colors['modern'][ parseInt( data.items[i].colorId )-1] : null,
                                        start : {   dt      : data.items[i].start.dateTime ? data.items[i].start.dateTime : data.items[i].start.date,
                                                    tz      : data.items[i].start.timeZone ? data.items[i].start.timeZone: null,
                                                    allday  : data.items[i].start.date != null },
                                        end   : {   dt      : data.items[i].end.dateTime   ? data.items[i].end.dateTime   : data.items[i].end.date  ,
                                                    tz      : data.items[i].end.timeZone   ? data.items[i].end.timeZone  : null,
                                                    allday  : data.items[i].end.date != null }
                                    } );
                    }
                }
            } // endfor

            
        }
        else
        {
            console.error( "getCalendar: no tokens saved/expired" );
            // NOT_AUTHORIZED
            return this.failure( Network.Status.UNAUTHORIZED, getCalendarEndpoint.Error.NOT_AUTHORIZED, "unauthorized token" );
        }
        // redirect: http://localhost:8080/auth/google
        // client id: 251787141802-8lm7p0g9r8ph27lt54v0tjl0if521bjp.apps.googleusercontent.com
        // client secret : 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
        
        // reply
        let reply : getCalendarEndpoint.ReplyData = { events : events };
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//