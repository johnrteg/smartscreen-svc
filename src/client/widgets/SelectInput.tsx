//
import * as React from 'react';

//
import { InputLabel, MenuItem, FormHelperText, FormControl, Grid, ListItemIcon, ListItemText } from '@mui/material';
import { Select, SelectChangeEvent } from '@mui/material';

//
import ObjectUtils from '../../utils/ObjectUtils.js';

//
//
//
export interface SelectChoice
{
    value : string | number;
    label : string;
    icon? : any;
}

export interface SelectInputProps
{
    id          : string;
    label       : string;
    disabled?   : boolean;
    helperText? : string;
    readOnly?   : boolean;
    required?   : boolean;
    minWidth?   : number;
    value       : string | number;
    values      : Array<SelectChoice>;
    dense?      : boolean;
    multiple?   : boolean;
    gridColumns? : number;
    onChange?   : ( value: string | number ) => void;
}

export default function SelectInput( props: SelectInputProps ) : JSX.Element
{
    // state
    const [value, setValue] = React.useState( props.value );
  
    React.useEffect( () => propsUpdated(), [props] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function propsUpdated() : void
    {
        if( ObjectUtils.notNull( props.value ) && props.values.length > 0 && props.value != value && hasValue( props.value ) )
        {
            setValue( props.value );
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    function hasValue( value : string | number ) : boolean
    {
        let i : number;
        for( i=0; i < props.values.length; i++ )
        {
            if( props.values[i].value == value )return true;
        }
        return false;
    }

    ////////////////////////////////////////////////////////////////////////////////
    function onChange( event: SelectChangeEvent ) : void
    {
        if( props.values && props.values.length > 0 )setValue( event.target.value );
        if( props.onChange )props.onChange( event.target.value );
    }

    let field : JSX.Element = <FormControl  sx      ={ { m: 0, minWidth: props.minWidth != null ? props.minWidth : 150 } }
                                            disabled={ props.disabled != null ? props.disabled : false }
                                            size    ={ props.dense != null ? ( props.dense ? "small" : "medium" ) : "medium" }
                                            required={ props.required != null ? props.required : false } >
                                <InputLabel id={ props.id + "-select-label"}>{ props.label }</InputLabel>
                                    <Select
                                            labelId     = { props.id + "-select-label-id"}
                                            id          = { props.id }
                                            value       = { hasValue( value ) ? value.toString() : "" }
                                            multiple    = { props.multiple != null ? props.multiple : false }
                                            label       = { props.label }
                                            onChange    = { onChange }
                                            inputProps  = {{ readOnly: props.readOnly != null ? props.readOnly : false }}
                                            >
                                            { props.values.map(( item:SelectChoice, index:number ) => 
                                                    { return <MenuItem key={item.value} value={item.value} selected={ item.value === value }>
                                                                { item.icon ?<ListItemIcon sx={{minWidth: 32,verticalAlign:'center'}}> { item.icon }</ListItemIcon> : null }
                                                                { item.label }
                                                            </MenuItem>} ) }
                                    </Select>
                                { props.helperText != null ? ( <FormHelperText>{ props.helperText  }</FormHelperText> ) : null }
                                </FormControl>;

    if( props.gridColumns != null && props.gridColumns > 0 )field = <Grid item xs={props.gridColumns} >{field}</Grid>;

    // ===============================================================================================
    return ( <>{field}</> );
    // ===============================================================================================
}