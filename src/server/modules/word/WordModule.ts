//
import { smartScreenService } from "../../smartScreenService.js";
import { Module } from "../Module.js";

import getWordOfDay from "./getWordOfDay.js";

export class WordModule extends Module
{
    public key : string;

    /////////////////////////////////////////////////////////
    constructor(  svr : smartScreenService )
    {
        super( svr );

        // endpoints
        this.server.route( new getWordOfDay( this ) );
    }

    /////////////////////////////////////////////////////////
    public setConfig( config : any ) : void
    {
        //console.log("ExchangeModule::setConfig", config );
        this.key = config.key;
    }
}

