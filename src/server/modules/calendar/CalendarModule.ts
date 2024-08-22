import { smartScreenService } from "../../smartScreenService.js";
import { Module } from "../Module.js";

import getCalendar from "./getCalendar.js";

export class CalendarModule extends Module
{
    public key : string;

    /////////////////////////////////////////////////////////
    constructor(  svr : smartScreenService )
    {
        super( svr );

        // endpoints
        this.server.route( new getCalendar( this ) );
    }

    /////////////////////////////////////////////////////////
    public setConfig( config : any ) : void
    {
        //console.log("CalendarModule::setConfig", config );
        this.key = config.key;
    }
}

