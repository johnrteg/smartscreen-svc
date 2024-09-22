import * as React from "react";

//
import { Typography, Stack, Box } from '@mui/material';


import Title from "../../widgets/Title.js";

//
import AppData from "../../AppData.js";

import { netClient } from "../../../net/netClient.js";
import { Constants } from "../../../utils/Constants.js";

import { getWordOfDayEndpoint } from "../../../api/getWordOfDayEndpoint.js";
import StringUtils from "../../../utils/StringUtils.js";



export interface WordOfDayConfig
{
    update_hours : number;
}     

export interface WordOfDayProps
{
    config : WordOfDayConfig;
}


//
//
//
export default function WordOfDay( props : WordOfDayProps ) : JSX.Element
{
    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );
    
    const [word, setWord]               = React.useState< string >( "" );
    const [definition, setDefinitiion]  = React.useState< string >( "" );
    const [type, setType]               = React.useState< string >( "" );

    //
    React.useEffect( () => pageLoaded(), [] );
    //React.useEffect( () => () => pageUnloaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        refresh();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async function refresh() : Promise<void>
    {
        const today : Date = new Date();

        const endpt : getWordOfDayEndpoint = new getWordOfDayEndpoint();
        endpt.request.date      = StringUtils.format( "{0}-{1}-{2}", today.getFullYear(),
                                                    StringUtils.leadingZero( today.getMonth()+1, 2 ),
                                                    StringUtils.leadingZero( today.getDate(), 2 ) );

        const reply  : netClient.Reply = await appdata.webserver.fetch( endpt, { cache: true, lifespan: 240 } ); // 240 minute force update
        if( reply.ok )
        {
            //console.log("word", reply.data );
            const data : getWordOfDayEndpoint.ReplyData = reply.data;

            setWord( data.word );
            setDefinitiion( data.definition );
            setType( data.type );

            //  todo, set for 9AM
        }
        setTimeout( refresh, appdata.nextUpdate( props.config.update_hours * Constants.HOURS_TO_MS ) );
    }


    // ===============================================================================================
    return (
        <Stack direction={ "column" } spacing={0} gap={1} width={"100%"}>
            <Title label="Word of the Day" />
            <Stack direction="row"  spacing={0} gap={2} width={"100%"}>
                <Typography component="div" color={"text.primary"} sx={{ fontSize: 24, lineHeight:1.0 }}>{word}</Typography>
                <Typography component="div" color={"text.secondary"} sx={{ fontSize: 16, lineHeight:1.0, paddingTop:0.5, fontStyle:"italic" }}>{type}</Typography>
            </Stack>
            <Stack direction="row"  spacing={0} gap={2} width={"100%"}>
                <Typography component="div" color={"text.secondary"} sx={{ fontSize: 16, lineHeight:1.0 }}>{definition}</Typography>
            </Stack>
        </Stack>       
    );
    // ===============================================================================================
}

// eof