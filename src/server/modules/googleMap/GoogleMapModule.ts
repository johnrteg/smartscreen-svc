//
import { smartScreenService } from "../../smartScreenService.js";
import { Module } from "../Module.js";

import getCommute from "./getCommute.js";

export class GoogleMapModule extends Module
{
    public key : string;

    /////////////////////////////////////////////////////////
    constructor(  svr : smartScreenService )
    {
        super( svr );

        // endpoints
        this.server.route( new getCommute( this ) );
    }

    /////////////////////////////////////////////////////////
    public setConfig( config : any ) : void
    {
        console.log("GoogleMapModule::setConfig", config );
        this.key = config.key;
    }
}

