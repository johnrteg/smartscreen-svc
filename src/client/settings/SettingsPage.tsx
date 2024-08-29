import * as React from "react";

//
import { Stack, Card, Paper, Box, Typography, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
//
import AppData from "../AppData.js";



export interface SettingsPageProps
{
    onClose : () => void;
}


//
//
//
export default function SettingsPage( props : SettingsPageProps ) : JSX.Element
{

    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );

    ////////////////////////////////////////////////////////////////////////////
    function onBack() : void
    {
        props.onClose();
    }

    // ===============================================================================================
    return (
        <Stack direction={"column"}>
            <Stack direction={"row"}>
                <IconButton size="large" onClick={onBack}><ArrowBackIcon /></IconButton>
                <Typography component="div" color="text.primary" sx={{ fontSize: 32, lineHeight:1.0, paddingTop:2 }}>{"Settings"}</Typography>
            </Stack>
        </Stack>
        
    );
    // ===============================================================================================
}

// eof