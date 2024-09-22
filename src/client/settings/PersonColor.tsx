import * as React from "react";

//
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Stack } from '@mui/material';
import { Icon as CircleIcon } from "../modules/calendar/icons/CircleIcon.js";

//
import TextInput from "../widgets/TextInput.js";




export interface PersonColorProps
{
    color         : string;
    name          : string;
    //onColorChange : ( color : string ) => void;
    onChange  : ( name : string ) => void;
    onBlur  : () => void;
}


//
//
//
export default function PersonColor( props : PersonColorProps ) : JSX.Element
{
    const [name, setName]         = React.useState<string>(props.name);

    React.useEffect( nameChange, [props.name] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function nameChange() : void
    {
        setName( props.name );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onNameChange( value : string ) : void
    {
        //setName( value );
        props.onChange( value );
    }

  // ===============================================================================================
  return (
    <Stack direction={"row"} gap={1}>
        <div style={{paddingTop:"15px"}}><CircleIcon color={ props.color } /></div>
        <TextInput label={""} value={ props.name }  onChange={onNameChange} onBlur={props.onBlur} />
    </Stack>
    );
    // ===============================================================================================
}

// eof