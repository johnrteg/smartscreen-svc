//
import * as React from "react";

//
import { Grid, TextField, Autocomplete } from '@mui/material';
import { AutocompleteChangeReason, createFilterOptions } from '@mui/material/Autocomplete';

//
import ObjectUtils      from "../../utils/ObjectUtils.js";

export interface ComboChoice
{
    value : string;
    label : string;
}

export interface ComboInputProps
{
    id            : string;
    label         : string;
    value         : string;
    values        : Array<ComboChoice | string>;
    fullWidth?    : boolean;
    width?        : number;
    disabled?     : boolean;
    allowAdd?     : boolean;
    gridColumns?  : number;
    dense?        : boolean;
    onChange?     : ( new_value : string ) => void;
}

const filter = createFilterOptions< ComboChoice | string >();


//
//
//
export default function ComboInput( props : ComboInputProps ) : JSX.Element
{
    // state
    const [value,setValue]  = React.useState< ComboChoice | string >( "" );

    //
    React.useEffect( () => propsUpdated(), [props] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function propsUpdated() : void
    {
        if( props.value != value )setValue( props.value );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onFilter( options: Array<ComboChoice | string>, params : any ) : Array<ComboChoice | string>
    {
        //console.log('onFilter', options, params);
        const filtered = filter( options, params );

        if( ObjectUtils.notNull( props.allowAdd ) && props.allowAdd )
        {
            const { inputValue } = params;
            // Suggest the creation of a new value
            //const isExisting : boolean = options.some( ( option : TagChoice ) => inputValue === option.label );
            const isExisting : boolean = options.some( ( option : ComboChoice | string ) => inputValue === option );
            if( inputValue !== '' && !isExisting )
            {
                //filtered.push({ inputValue, label: `Add "${inputValue}"` });
                //filtered.push( `Add "${inputValue}"` );
                filtered.push( inputValue );
            }
        }
        

        return filtered;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function onEquality( option: string | ComboChoice, value: string | ComboChoice ) : boolean
    {
        //console.log('onEquality', option, value, ObjectUtils.isNull( value ), value == "" );
        if( ObjectUtils.notNull( props.allowAdd ) && props.allowAdd )
        {
            // allow anything to be added
            return true;
        }
        else
        {
            // null or blank string
            if( ObjectUtils.isNull( value ) || ( ObjectUtils.isString( value ) && value == "" ) )
            {
                return false;
            }
            else if( ObjectUtils.isString( option ) && ObjectUtils.isString( value ) )
            {
                return option === value;
            }
            else
            {
                return ( option as ComboChoice ).value === ( value as ComboChoice ).value;
            } 
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    function onChange( new_value : ComboChoice | string, reason: AutocompleteChangeReason ) : void
    {
        //console.log('onChange', new_value, reason );
        setValue( new_value );
        if( props.onChange )
        {
            if( ObjectUtils.isNull( new_value ) )
            {
                props.onChange( "" );
            }
            else
            {
                if( ObjectUtils.isString( new_value ) )
                    props.onChange( new_value as string );
                else
                    props.onChange( ( new_value as ComboChoice ).value );
            }
        }
    }


    let sx : any = {};
    if( ObjectUtils.notNull( props.width ) )sx = { width: props.width };

    // 

    let field : JSX.Element = <Autocomplete
                                    disablePortal={ true }
                                    id         = { props.id }
                                    value      = { value }
                                    options    = { props.values }
                                    size       = { ObjectUtils.notNull( props.dense ) ? ( props.dense ? "small" : "medium") : "medium"}
                                    sx         = { sx }
                                    disabled   = { ObjectUtils.notNull( props.disabled ) ? props.disabled : false }
                                    fullWidth  = { ObjectUtils.notNull( props.fullWidth ) ? props.fullWidth : true }
                                    isOptionEqualToValue={ onEquality } 
                                    filterOptions={ onFilter }
                                    onChange={ (event: any, newValue: any, reason: AutocompleteChangeReason ) => { onChange( newValue, reason ); }}
                                    renderInput= { (params) => <TextField {...params} label={ props.label } />}
                                />;
    if( props.gridColumns != null && props.gridColumns > 0 )field = <Grid item xs={props.gridColumns} >{field}</Grid>;

    // ===============================================================================================
    return ( <>{field}</> );
    // ===============================================================================================
}

// eof