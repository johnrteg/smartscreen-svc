import * as React from "react";

//
import { Typography, Stack, Box } from '@mui/material';

//
import { Icon as CadIcon } from "../../assets/flags/icons/1x1/ca.js";
import { Icon as EurIcon } from "../../assets/flags/icons/1x1/eu.js";
import { Icon as GbpIcon } from "../../assets/flags/icons/1x1/gb.js";
import { Icon as AudIcon } from "../../assets/flags/icons/1x1/au.js";
import { Icon as ChfIcon } from "../../assets/flags/icons/1x1/ch.js";
import { Icon as HkdIcon } from "../../assets/flags/icons/1x1/hk.js";
import { Icon as JpyIcon } from "../../assets/flags/icons/1x1/jp.js";
import { Icon as MxnIcon } from "../../assets/flags/icons/1x1/mx.js";
import { Icon as UahIcon } from "../../assets/flags/icons/1x1/ua.js";
import { Icon as UsdIcon } from "../../assets/flags/icons/1x1/us.js";

import Title from "../../widgets/Title.js";

//
import AppData from "../../AppData.js";

import { netClient } from "../../../net/netClient.js";
import { Constants } from "../../../utils/Constants.js";

import { getExchangeEndpoint } from "../../../api/getExchangeEndpoint.js";

enum Direction
{
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical",
}


export interface ExchangeConfig
{
    base         : string;
    targets      : Array<string>;
    update_hours : number;
    direction    : string;
    title        : boolean;
    gap : number;
}     

export interface ExchangeProps
{
    config : ExchangeConfig;
}


//
//
//
export default function Exchange( props : ExchangeProps ) : JSX.Element
{
    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );
    
    const [rates, setRates]               = React.useState< Array<getExchangeEndpoint.Rate> >( [] );

    //
    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        refresh();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageUnloaded() : void
    {
        //console.log("wx unloaded");
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // https://en.wikipedia.org/wiki/ISO_4217
    // https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
    function Icon( value : string, size : number ) : JSX.Element
    {
        //console.log("Icon", value );
        switch( value )
        {
            case "CAD"      : return <CadIcon width={size+"px"} height={size+"px"} />; break;
            case "EUR"      : return <EurIcon width={size+"px"} height={size+"px"} />; break;
            case "GBP"      : return <GbpIcon width={size+"px"} height={size+"px"} />; break;
            case "AUD"      : return <AudIcon width={size+"px"} height={size+"px"} />; break;
            case "CHF"      : return <ChfIcon width={size+"px"} height={size+"px"} />; break;
            case "HKD"      : return <HkdIcon width={size+"px"} height={size+"px"} />; break;
            case "JPY"      : return <JpyIcon width={size+"px"} height={size+"px"} />; break;
            case "MXN"      : return <MxnIcon width={size+"px"} height={size+"px"} />; break;
            case "UAH"      : return <UahIcon width={size+"px"} height={size+"px"} />; break;
            case "USD"      : return <UsdIcon width={size+"px"} height={size+"px"} />; break;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async function refresh() : Promise<void>
    {
        const endpt : getExchangeEndpoint = new getExchangeEndpoint();
        endpt.request.base      = props.config.base;
        endpt.request.targets   = props.config.targets.join(",");

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt, { cache: true, lifespan: 240 } ); // 240 minute force update
        if( reply.ok )
        {
            //console.log("exchange", reply.data );
            const data : getExchangeEndpoint.ReplyData = reply.data;

            setRates( data.rates );

            //  todo, set for 9AM
        }
        setTimeout( refresh, appdata.nextUpdate( props.config.update_hours * Constants.HOURS_TO_MS ) );
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function renderRate( rate : getExchangeEndpoint.Rate, index : number ) : JSX.Element
    {
        let elem : JSX.Element =
            <Box key={ rate.currency } sx={ { display:'flex', justifyContent:'center', alignItems:'center' } } >
                <Stack direction={"column"} spacing={0} gap={0.5} sx={ { display:'flex', justifyContent:'center',alignItems:'center'} } width={"100%"}>
                    <Typography component="div" color={"text.primary"}>{ rate.currency }</Typography>
                    { Icon( rate.currency, 50 ) }
                    <Typography component="div" color={"text.secondary"} sx={{ fontSize: 16, lineHeight:1.0, paddingTop:"4px" }}>{ rate.conversion.toFixed(2) }</Typography>
                </Stack>
            </Box>;
        return elem;
    }

    // ===============================================================================================
    return (
        <Stack direction={ "column" } spacing={0} gap={0} width={"100%"}>
            { props.config.title ? <Title label="Exchange" /> : null }
            <Stack direction={ props.config.direction == Direction.HORIZONTAL ? "row" : "column" } spacing={0} gap={props.config.gap} width={"100%"}>
                { rates.map( ( day : getExchangeEndpoint.Rate, index : number ) => { return renderRate( day, index ) } ) }
            </Stack>
        </Stack>       
    );
    // ===============================================================================================
}

// eof