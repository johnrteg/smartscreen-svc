import { smartScreenService } from "../../smartScreenService.js";
import { Module } from "../Module.js";

import getWx from "./getWx.js";
import getWxForecast from "./getWxForecast.js";

export class WxModule extends Module
{
    public key : string;

    /////////////////////////////////////////////////////////
    constructor(  svr : smartScreenService )
    {
        super( svr );

        // endpoints
        this.server.route( new getWx( this ) );
        this.server.route( new getWxForecast( this ) );
    }

    /////////////////////////////////////////////////////////
    public setConfig( config : any ) : void
    {
        //console.log("WxModule::setConfig", config );
        this.key = config.key;
    }
}

