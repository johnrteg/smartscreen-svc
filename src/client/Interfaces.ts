export namespace Interfaces
{
    
    

    export interface Widget
    {
        module : string;
        config : any;
        width : string;
    }

    export interface Row
    {
        widgets: Array<Widget>;
    }

    export interface Page
    {
        name : string;
        rows : Array<Row>;
    }

    export interface Layout
    {
        pages : Array<Page>;
    }
}

