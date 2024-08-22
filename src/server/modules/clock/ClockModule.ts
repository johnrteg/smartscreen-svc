//
import { smartScreenService } from "../../smartScreenService.js";
import { Module } from "../Module.js";


export class ClockModule extends Module
{
    constructor( svr : smartScreenService )
    {
        super( svr );
        console.log("new clock");
    }
}

