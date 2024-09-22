//
import { smartScreenService } from "../../smartScreenService.js";
import { Module } from "../Module.js";

import getCalendar          from "./getCalendar.js";
import getCalendarIds       from "./getCalendarIds.js";
import postCalendarEvent    from "./postCalendarEvent.js";
import putCalendarEvent     from "./putCalendarEvent.js";
import deleteCalendarEvent  from "./deleteCalendarEvent.js";

export class CalendarModule extends Module
{
    public key : string;

    /////////////////////////////////////////////////////////
    constructor(  svr : smartScreenService )
    {
        super( svr );

        // endpoints
        this.server.route( new getCalendar( this ) );
        this.server.route( new getCalendarIds( this ) );
        this.server.route( new postCalendarEvent( this ) );
        this.server.route( new putCalendarEvent( this ) );
        this.server.route( new deleteCalendarEvent( this ) );
    }

    /////////////////////////////////////////////////////////
    public setConfig( config : any ) : void
    {
        this.key = config.key;
    }

    

}

