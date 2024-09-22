import * as React from "react";

//
import { Snackbar, Alert } from '@mui/material';

export interface SnackAlertProps
{
    message : string;
    severity? : "success" | "error" | "info" | "warning";
    onClose?: () => void;
}

export interface SnackAlertMesssage
{
    message : string;
    severity : "success" | "error" | "info" | "warning";
}


//
//
//
export default function SnackAlert( props : SnackAlertProps ) : JSX.Element
{
    ////////////////////////////////////////////////////////////////////////
    function onClose() : void
    {
        if( props.onClose )props.onClose();

    }
  // ===============================================================================================
  return (
        <Snackbar   open={ true }
                        autoHideDuration={5000}
                        anchorOrigin={{vertical:"top",horizontal:"center"}}
                        onClose={ () => onClose() }  >
                <Alert  onClose={ () => onClose() }
                        severity={ props.severity ? props.severity : "success" }
                        variant="filled"
                        sx={{ width: '100%' }} >
                        { props.message }
                    </Alert>            
        </Snackbar>
    );
    // ===============================================================================================             color: { props.waitColor },
}

// eof