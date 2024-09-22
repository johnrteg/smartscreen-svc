import * as React from "react";

//
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export enum AlertAction
{
    CANCEL  = "cancel",
    NO      = "no",
    YES     = "yes"
}

export interface AlertPromptProps
{
    open          : boolean;
    title         : string;
    message       : string;
    canelText?    : string;
    noText?       : string;
    yesText       : string;
    onAction      : ( action : AlertAction ) => void;
}


//
//
//
export default function AlertPrompt( props : AlertPromptProps ) : JSX.Element
{
    const [open,setOpen] = React.useState< boolean >(props.open);

    React.useEffect( () => propsChanged(), [props] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function propsChanged() : void
    {
        setOpen( props.open );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    function onClose() : void
    {
        props.onAction( AlertAction.CANCEL );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    function onAction( action : AlertAction ) : void
    {
        props.onAction( action );
    }

  // ===============================================================================================
  return (
    <Dialog open={open} onClose={ onClose }>
        <DialogTitle id="alert-dialog-title">
            { props.title }
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                { props.message }
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            { props.canelText ? <Button onClick={ ()=>onAction( AlertAction.CANCEL ) }>{ props.canelText }</Button> : null }
            { props.noText    ? <Button onClick={ ()=>onAction( AlertAction.NO )     }>{ props.noText }</Button> : null }
            <Button onClick={ ()=>onAction( AlertAction.YES ) } autoFocus>{ props.yesText }</Button>
        </DialogActions>
      </Dialog>
    );
    // ===============================================================================================
}

// eof