//
//
//

export module Network
{

    // https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
    export enum Status { OK=200, CREATED=201, ACCEPTED=202, NON_AUTHORITATIVE_INFO=203, NO_CONTENT=204,
    PARTIAL_CONTENT=206,
    MULTI_STATUS = 207,
    ALREADY_REPORTED = 208,
    IM_USED = 226,

    MULTIPLE_CHOICES=300, MOVED_PERMANENTLY=301, FOUND=302, SEE_OTHER=303,
    NOT_MODIFIED=304, USE_PROXY=305, TEMP_REDIRECT=307,
    PERMANENT_REDIRECT = 308,

    BAD_REQUEST=400,
    UNAUTHORIZED=401,
    PAYMENT_REQD=402,
    FORBIDDEN=403,
    NOT_FOUND=404,
    NOT_ALLOWED=405,
    NOT_ACCEPTED=406,
    PROXY_AUTH_REQD=407,
    REQUEST_TIMEOUT=408,
    CONFLICT=409,
    GONE=410,
    LENGTH_REQD=411,
    PRE_CONDITION_FAILED=412,
    REQUEST_ENTITY_TOO_LONG=413, REQUEST_URI_TOO_LONG=414, UNSUPPORTED_MEDIA_TYPE=415,
    REQUESTED_RANGE_NOT_SATISFIABLE=416,
    EXPECTATION_FAILED=417,
    //IM_A_TEAPOT = 418,
    MISDIRECTED_REQUEST = 421,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    TOO_EARLY = 425,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_TOO_LARGE = 431,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,

    INTERNAL_SERVER_ERROR=500, NOT_IMPLEMENTED=501, BAD_GATEWAY=502, SERVICE_UNAVAIL=503, GATEWAY_TIMEOUT=504,
    HTTP_VERSION_NOT_SUPPORTED=505, VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENT_STORAGE = 507,
    LOOP_DETECED = 508,
    NOT_EXTENDED = 510,
    NETWORK_AUTH_REQUIRED = 511 }

    //
    export enum Protocol { FILE="file", HTTP="http", HTTPS="https", SFTP="sftp" }

    // https://en.wikipedia.org/wiki/HTTP
    export enum Method
    {
        GET     = "GET",
        PUT     = "PUT",
        POST    = "POST",
        DELETE  = "DELETE",
        HEAD    = "HEAD",
        //COPY    = "COPY",     not suppported by fastify
        //MOVE    = "MOVE",     not suppported by fastify
        PATCH   = "PATCH",
        //TRACE   = "TRACE",    not suppported by fastify
        OPTIONS = "OPTIONS"
    }

    export enum MimeType
    {
        // data
        JSON        = "application/json",
        XML         = "application/xml",
        BIN         = "application/octet-stream",
        GZIP        = "application/gzip",
        TAR         = "application/x-tar",
        ZIP         = "application/zip",
        PDF         = "application/pdf",

        // text
        TEXT        = "text/plain",
        HTML        = "text/html",
        CSS         = "text/css",
        CSV         = "text/csv",
        ICS         = "text/ics",
        JS          = "text/javascript",

        // audio
        MP3         = "audio/mpeg",
        WAVE        = "audio/wav",

        // video
        MP4         = "video/mp4",
        MPEG        = "video/mpeg",

        // image
        JPEG        = "image/jpeg",
        PNG         = "image/png",
        GIF         = "image/gif",
        BMP         = "image/bmp"
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    export function url( protocol: Protocol, host: string, port: number, uri: string ) : string
    {
        let url : string = protocol;
        url += "://";
        url += host;

        if( port && port > 0 )
        {
            url += ":";
            url += port;
        }
        
        if( uri )
        {
            if( uri.charAt(0) != '/' )url += "/";
            url += uri;
        }
        return url;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    export function uriParts( request_uri : string ) : Array<string>
    {
        let str : string = request_uri.toLowerCase();

        // remove any parameters
        //if( str.indexOf('?') > 0 )str = str.substring( 0, str.indexOf('?') );
        let reqs   : Array<string> = str.split('/');

        // remove any blank parts like from:
        // /v2//api// -> v2/api
        reqs = reqs.filter(n => n);
        return reqs;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    export function sameUri( request_uri : string, endpt_uri: string ) : boolean
    {
        return sameUriArray( uriParts( request_uri ), uriParts( endpt_uri ) );
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    //  request                     endpt                               match
    //  /v2/users/user              /v2/users/user                      true
    //  /v2/users/user/             /v2/users/user                      false
    //  /v2/users/user/378          /v2/users/user/:id                  true
    //  /v2/users/user/38/cart/34   /v2/users/user/:id/cart/:cid        true
    //  /v2/users/user/38/cart/34   /v2/users/user/:id/*                true
    //  /v2/users/user/38?q=bob     /v2/users/user/:id/*                true
    //
    export function sameUriArray( request_uri : Array<string>, endpt_uri: Array<string> ) : boolean
    {
        //console.log( request_uri, endpt_uri );

        //
        // remove any parameters at the end of the request uri
        // /v2/food?param=color&type=apple
        if( request_uri[request_uri.length-1].indexOf('?') > 0 )
        {
            // trim off from the back those parameters
            request_uri[request_uri.length-1] = request_uri[request_uri.length-1].substring( 0, request_uri[request_uri.length-1].lastIndexOf('?') );
            // so this last item should just be "food"
        }

        //
        // deal with the wildcard case
        // endpt: /v2/users/user/*
        if( endpt_uri[ endpt_uri.length-1 ] == '*' )
        {
            // trim off request items to be ignored
            endpt_uri.pop();    // remove last, * items
            while( request_uri.length > endpt_uri.length )
            {
                request_uri.pop();
            }
            // at this point, both arrays should be the same length
        }

        let i   : number;
        let len : number = endpt_uri.length;

        // sub in request any parameters defined in the endpt (e.g. /v2/fruit/:color/shippping/:zipcode )
        for( i=0; i < len; i++ )
        {
            // is the endpt segment a parameter (e.g. :id )?
            if( endpt_uri[ i ].charAt(0) == ':' )
            {
                if( request_uri[i] != undefined )
                {
                    request_uri[i] = endpt_uri[ i ];    // set request to the id
                }
                // is the endpt optional, the it does not matter if the request does not have it
                // /v2/food/:id?
                // optional parameters can only be at the end
                else if( i == len-1 && endpt_uri[ i ].charAt( endpt_uri[ i ].length - 1 ) == '?' )
                {
                    // the request does not have a spot for it,
                    // but that is ok, so remove it from the endpt
                    endpt_uri.splice(i,1);
                    break;                  // force drop out from loop
                }
                // if request does not exist, failed
                else    
                {
                    return false;                       
                }
            }
        }
        // so now request was
        // /v2/food/green/shipping/20878 to /v2/fruit/:color/shippping/:zipcode

        // at this point, both arrays should be the same length, less any special commands 
        // that were in the endpt uri
        if( request_uri.length != endpt_uri.length )return false;

        // both uris should be the same now
        return request_uri.join('/') === endpt_uri.join('/');

    }

}

//
// eof
//