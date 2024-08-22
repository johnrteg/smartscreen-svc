import { smartScreenService } from "../smartScreenService.js";


export class Module
{
    protected server : smartScreenService;
    
    constructor( svr : smartScreenService )
    {
        console.log("Module");
        this.server = svr;
    }

    /////////////////////////////////////////////////////////
    public setConfig( config : any ) : void
    {
        console.log("Module::setConfig", config );
    }
}

// https://stackoverflow.com/questions/10914751/loading-node-js-modules-dynamically-based-on-route
//module.exports = { index: function(){ return new clock() } };
