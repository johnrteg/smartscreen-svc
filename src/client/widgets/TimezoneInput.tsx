//
import * as React from "react";

//
import { Grid }    from '@mui/material';

import ObjectUtils from "../../utils/ObjectUtils.js";

// local
//import AppData from "../../data/AppData.js";
import ComboInput from "./ComboInput.js";


//
//
//
export interface TimezoneInputProps
{
    id          : string;
    label       : string;
    value       : string;
    onChange    : ( new_value : string ) => void;
    gridColumns? : number;
}

//
export default function TimezoneInput( props : TimezoneInputProps ) : JSX.Element
{
    //
    //
    const [selected,setSelected]    = React.useState< string>( "" );
    const [timezones,setTimezones]  = React.useState< Array<string> >( [] );

    //
    React.useEffect( () => pageLoaded(), [] );
    React.useEffect( () => propsChanged(), [props] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        let choices : Array<string> = [];

        const zones : Array<string> = Intl.supportedValuesOf('timeZone');
        zones.forEach( ( tz: string, index: number )=> { choices.push( tz ); } );

        setTimezones( choices );
        const tz : string = ObjectUtils.notNull( props.value ) && props.value != "" ? props.value : Intl.DateTimeFormat().resolvedOptions().timeZone;
        setSelected( tz );
        props.onChange( tz );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function propsChanged() : void
    {
        if( ObjectUtils.notNull( props.value ) && props.value != "" && props.value != selected )
        {
            setSelected( props.value );
        }
    }

    ///////////////////////////////////////////////////////////////////////////////
    function onChange( new_value : string ) : void
    {
        setSelected( new_value );
        props.onChange( new_value );
    }

   
    let field : JSX.Element = <ComboInput   id={ props.id }
                                            label={ props.label }
                                            fullWidth={ true }
                                            value={ selected }
                                            values={ timezones }
                                            onChange={ onChange }
                                            gridColumns={3} />

    if( props.gridColumns != null && props.gridColumns > 0 )field = <Grid item xs={props.gridColumns} >{field}</Grid>;

    // ===============================================================================================
    return ( <>{field}</> );
    // ===============================================================================================
}

// eof