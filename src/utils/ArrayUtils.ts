
export default class ArrayUtils
{
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public static isSame( ar1 : Array<any>, ar2: Array<any> ): boolean
    {
        if( ar1.length !== ar2.length )return false;

        let i : number;
        let n : number = ar1.length;
        for( i=0; i < n; i++ )
        {
            // element in ar1 is not in any locaton of ar2, so they are not the same
            if( ar2.indexOf( ar1[i] ) < 0 )
            {
                return false;
            }
        }

        return true;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    public static remove( ar : Array<any>, value : any ) : Array<any>
    {
        let n : number = ar.length;
        let i : number;
        for( i=0; i < n; i++ )
        {
            if( ar[i] == value )
            {
                ar.splice( i, 1 );
            }
        }
        return ar;
    }

    

}

//
// eof
//