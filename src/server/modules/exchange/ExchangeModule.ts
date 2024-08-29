//
import { smartScreenService } from "../../smartScreenService.js";
import { Module } from "../Module.js";

import getExchange from "./getExchange.js";

export class ExchangeModule extends Module
{
    public key : string;

    /////////////////////////////////////////////////////////
    constructor(  svr : smartScreenService )
    {
        super( svr );

        // endpoints
        this.server.route( new getExchange( this ) );
    }

    /////////////////////////////////////////////////////////
    public setConfig( config : any ) : void
    {
        //console.log("ExchangeModule::setConfig", config );
        this.key = config.key;
    }
}

