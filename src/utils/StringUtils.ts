
export default class StringUtils
{
    public static readonly ELLIPSE            : string = '…';
    public static readonly COLON              : string = ':';
    public static readonly SPACE              : string = ' ';

    public static readonly NUMBERS            : string = '0123456789';
    public static readonly SPECIAL            : string = ".,<>?':;{}`[]~!@#$%^&*()_-+=";

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public static removeAllSpaces( value : string ): string
    {
        return value ? value.replace(/\s+/g,'' ) : "";
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public static replaceAll( str: string, find : string, with_str : string, ignore : boolean = false ): string
    {
      return str ? str.replace( new RegExp(find.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(with_str)=="string")?with_str.replace(/\$/g,"$$$$"):with_str) : "";
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public static leadingZero( value : number, places : number = 2 ): string
    {
        return String( value ).padStart( places, '0');
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public static format( ...values: (string | number)[] ): string
    {
        let text : string = "";
        if( values.length > 0 )
        {
            text = values[0] as string;

            let i : number;
            let n : number = values.length;

            for( i=1; i < n; i++ )
            {
                text = text.replace( new RegExp("\\{" + (i-1) + "\\}", "gi"), values[i] as string );
            }
        }
        
        return text;
    }

    ///////////////////////////////////////////////////////////////////////////////////
    public static countOccurances( text : string, values : string ): number
    {
        if( text == null || values == null )return 0;

        let count : number = 0;
        let len : number = text.length;
        let i   : number;

        for( i=0; i < len; i++ )
        {
            if( values.indexOf( text.charAt(i) ) >= 0 )
            {
                count++;
            }
        }

        return count;
    }

    ///////////////////////////////////////////////////////////////////////////////////
    public static countUppercase( text : string ): number
    {
        if( text == null )return 0;

        let count : number = 0;
        let len : number = text.length;
        let i   : number;

        for( i=0; i < len; i++ )
        {
            if( /^[A-Z]*$/.test( text.charAt(i) ) )
            {
                count++;
            }
        }

        return count;
    }

    ///////////////////////////////////////////////////////////////////////////////////
    public static countLowercase( text : string ): number
    {
        if( text == null )return 0;

        let count : number = 0;
        let len : number = text.length;
        let i   : number;

        for( i=0; i < len; i++ )
        {
            if( /^[a-z]*$/.test( text.charAt(i) ) )
            {
                count++;
            }
        }

        return count;
    }

    ///////////////////////////////////////////////////////////////////////////////////
    public static isEmailAddress( email : string ): boolean
    {
        return email.toLowerCase().match( /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ) ? true : false;
    }

    /*
                                          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    */

    ///////////////////////////////////////////////////////////////////////////////////
    public static isUuid( uuid : string ): boolean
    {
        return     uuid == null
                || uuid == undefined
                || uuid == ""
                || uuid.match( /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/ ) ? true : false;
    }

    ///////////////////////////////////////////////////////////////////////////////////
    public static truncate( value : string, len : number ): string
    {
        if( value.length > len && value.length > 3 )
            return value.substring(0,len-3) + "...";
        else
            return value;
    }


    ///////////////////////////////////////////////////////////////////////////////////
    public static isIpAddress( value : string ): boolean
    {
        let parts : Array<string> = value.split('.');
        if( parts.length !== 4 )return false;
        let i : number;
        for( i=0; i < parts.length; i++ )
        {
            if( Number.isNaN( parts[i] ) || !Number.isInteger( parseInt( parts[i] ) ) )return false;
        }
        return true;
    }

    //////////////////////////////////////////////////////////////////////////////////
    public static fileSizeToString( size : number, digits : number = 1 ) : string
    {
        if( size == 0 )return "0 B";

        let i : number = Math.floor( Math.log( size ) / Math.log( 1024 ) );
        let fsize : number = ( size / Math.pow(1024, i ) );
        return fsize.toFixed( digits ) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
    }

    /////////////////////////////////////////////////////////////////////////////////
    public static toMixedCase( str : string ) : string
    {
        return str.replace(/(^|\s)\S/g,  ( t : string ): string => {
            return t.toUpperCase();
        });
    }

}

//
// eof
//