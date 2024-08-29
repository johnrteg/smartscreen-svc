import * as React from "react";
import { Typography, Box} from '@mui/material';


export interface TitleProps
{
    label : string;
}


//
//
//
export default function Title( props : TitleProps ) : JSX.Element
{

    // ===============================================================================================
    return (<Box component="section" width={"100%"} height={"20px"} sx={ { borderBottom: 1, borderColor: "text.secondary" } }>
            <Typography component="div" color={"text.secondary"} sx={{ fontSize: 18, lineHeight:1.0 }}>{ props.label }</Typography> 
            </Box>
        
    );
    // ===============================================================================================
}

// eof