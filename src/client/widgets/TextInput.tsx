//
import * as React from "react";
import { TextField} from '@mui/material';


export interface TextInputProps
{
    value : string;
    label : string;
    onChange : ( value : string ) => void;
    onBlur? : () => void;
}


//
//
//
export default function TextInput( props : TextInputProps ) : JSX.Element
{
    const [value, setValue]         = React.useState<string>(props.value);

    //
    React.useEffect( valueUpdated, [props.value] );

    //////////////////////////////////////////////////////////////////////////////////
    function valueUpdated() : void
    {
        setValue( props.value );
    }

    //////////////////////////////////////////////////////////////////////////////////
    function onChange( value : string ) : void
    {
        setValue( value );
        props.onChange( value );
    }

    //////////////////////////////////////////////////////////////////////////////////
    function onBlur() : void
    {
        if( props.onBlur )props.onBlur();
    }


    // ===============================================================================================
    return (<TextField  label={props.label}
                        variant="outlined"
                        value={ value }
                        onBlur={ onBlur }
                        onChange={(event: React.ChangeEvent<HTMLInputElement>)=>onChange(event.target.value)} />
    );
    // ===============================================================================================
}

// eof