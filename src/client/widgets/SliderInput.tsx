import * as React from "react";

//
import { FormControlLabel, Grid, Slider } from '@mui/material';
import ObjectUtils from "../../utils/ObjectUtils.js";
import StringUtils from "../../utils/StringUtils.js";

export interface SliderInputProps
{
  id            : string;
  label         : string;
  labelPlacement : "start" | "end" | "top" | "bottom";
  value         : number | number[];
  disabled?     : boolean;
  gridColumns?  : number;
  width?            : string;
  step?             : number;
  onChange?         : ( new_value : number | number[] ) => void;
  onChangeCommitted? : ( new_value : number | number[] ) => void;
}


//
//
//
export default function SliderInput( props : SliderInputProps ) : JSX.Element
{
    // state
    const [value,setValue]            = React.useState< number | number[] >( props.value );
    const [label,setLabel]            = React.useState< string >( updateLabel( props.value ) );

    //
    React.useEffect( () => propsUpdated(), [props] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function propsUpdated() : void
    {
        setValue( props.value );
        setLabel( updateLabel( props.value ) );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    function onChange( event: Event, newValue: number | number[] ) : void
    {
        //evt.preventDefault();
        setValue( newValue );
        if( props.onChange )props.onChange( newValue );
        setLabel( updateLabel( newValue ) );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    function updateLabel( value : number | number[] ) : string
    {
        return StringUtils.format( "{0}: {1}%", props.label, ObjectUtils.isArray( value ) ? ( value as number[] ).join("-") : value.toString() );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    function onChangeCommitted( event: React.SyntheticEvent | Event, newValue: number | number[] ) : void
    {
        if( props.onChangeCommitted )props.onChangeCommitted( newValue );
    }

    const slider : JSX.Element = <Slider    name={ props.id }
                                            value={ value }      
                                            valueLabelDisplay="auto"
                                            disableSwap={true}
                                            step={ ObjectUtils.notNull( props.step ) ? props.step : 1 }
                                            onChangeCommitted= {onChangeCommitted}
                                            onChange= {onChange}/>;

    // https://mui.com/material-ui/react-slider/
    let field : JSX.Element = <FormControlLabel sx={{width:props.width, '& .MuiFormControlLabel-label': { fontSize: '14px' }, color: "white" }} control={ slider } label={ label } labelPlacement={props.labelPlacement} />;
    if( props.gridColumns != null && props.gridColumns > 0 )field = <Grid item xs={props.gridColumns} >{field}</Grid>;

    // ===============================================================================================
    return ( <>{field}</> );
    // ===============================================================================================
}

// eof