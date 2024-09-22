//
import StringUtils          from '../../utils/StringUtils.js';
import ObjectUtils          from '../../utils/ObjectUtils.js';
import { Network }          from '../../net/Network.js';
import { Endpoint }         from '../../net/Endpoint.js';

//
import { getSettingsEndpoint }  from '../../api/getSettingsEndpoint.js';
import { smartScreenService } from '../smartScreenService.js';



//
//
//
export default class getSettings extends getSettingsEndpoint
{
    private server : smartScreenService;

    /////////////////////////////////////////////////////////////////////////////////
    constructor( svr : smartScreenService )
    {
        super();
        this.server = svr;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public async execute( authenticated : Endpoint.Authenticated ) : Promise<Endpoint.Reply>
    {
        /*
        export interface ReplyData
    {
        device      : { id: string; name: string; };
        location    : { address : string, timezone: string; };
        background  : { color: string; image_url: string; opacity: number; };
        calendar    : { ids: Array<string> };
        persons     : Array<Person>;
    }
        */

        // get timezone


        const default_setting: getSettingsEndpoint.ReplyData = {    device     : { id: "", name: "Home" },
                                                                    location    : { address: "", timezone: "America/New_York" },
                                                                    background  : { color: "#121212",
                                                                                    image_url: "https://coronadotimes.com/wp-content/uploads/import/photos/3001-4000/3589-ADarkSkyline.jpg",
                                                                                    opacity: 100 },
                                                                    calendar    : { ids: ["primary"], start_dow: 0 },
                                                                    events      : { default_duration: 30, dim_past: true },
                                                                    persons     : [],
                                                                    units       : getSettingsEndpoint.UnitsOfMeasure.STANDARD
                                                                };
        const settings : getSettingsEndpoint.ReplyData = this.server.readJsonFile( "config/settings.json", default_setting );
        //console.log( "getSettings", settings );

        // check for missing
        
        // reply
        let reply : getSettingsEndpoint.ReplyData = settings;
        return { status: Network.Status.OK, data: reply };
    }
}

//
// eof
//