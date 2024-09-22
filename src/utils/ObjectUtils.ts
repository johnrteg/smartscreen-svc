export default class ObjectUtils
{

    ////////////////////////////////////////////////////////////////////////////
    public static merge( obj1 : any, obj2 : any ): any
    {
        let obj3 : any = {};
        let attr : string;
        for( attr in obj1 ) { obj3[ attr ] = obj1[ attr ]; }
        for( attr in obj2 ) { obj3[ attr ] = obj2[attr]; }
        return obj3;
    }

    ////////////////////////////////////////////////////////////////////////////
    public static copy( obj : any ): any
    {
        // could be improved upon to be less heavy
        return JSON.parse( JSON.stringify( obj ) );
    }

    ////////////////////////////////////////////////////////////////////////////
    public static copyTemplate( obj : any, template : any ): any
    {
        for( let prop in template )
        {
            if( typeof obj[prop] == "object" )
            {
                template[prop] = ObjectUtils.copyTemplate( obj[prop], template[prop] );
            }
            else if( obj[prop] != undefined )
            {
                template[prop] = obj[prop];
            }
        }
        return template;
    }

    public static isNull( value : any ) : boolean
    {
        return value == null || value == undefined;
    }
    public static notNull( value : any ) : boolean
    {
        return !ObjectUtils.isNull( value );
    }
    public static isString( value : any ) : boolean
    {
        return typeof value == "string";
    }
    public static isNumber( value : any ) : boolean
    {
        return typeof value == "number";
    }
    public static getNumber( value : any ) : number
    {
        if( ObjectUtils.isString( value ) )
        {
            return parseInt( value );
        }
        else if( ObjectUtils.isNumber( value ) )
        {
            return value as number;
        }
        else
        {
            return 0;
        }
    }

    public static isBoolean( value : any ) : boolean
    {
        return ( typeof value == "boolean" )
            || ( ObjectUtils.isString( value ) && ( value == "true" || value == "false" ) );
    }
    public static getBoolean( value : any ) : boolean
    {
        return typeof value == "boolean" ? value as boolean : value === "true";
    }
    public static isObject( value : any ) : boolean
    {
        return typeof value == "object";
    }
    public static isArray( value : any ) : boolean
    {
        return value instanceof Array;
    }
    public static isPrimitiveArray( value : any ) : boolean
    {
        // is an array and has elements to test
        if( ObjectUtils.isArray( value ) && value.length > 0 )
        {
            // check check first element
            // assumes all elements are of the same type
            return( ObjectUtils.isObject( value[0] ) ? false : true );
        }
        else
        {
            return false;
        }
    }
    public static isDate( value : any ) : boolean
    {
        return value instanceof Date;
    }

}
//
// eof
//