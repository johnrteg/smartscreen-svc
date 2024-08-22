//
//

//
import * as React from "react";
import { createRoot } from 'react-dom/client';

//
import AppData from "./AppData.js";
import App from "./App.js";

//
// Centralized state
//
const appdata : AppData = AppData.instance();
appdata.initialize( () => main() );

//
// startup page
//
function main() : void
{
    const container : any = document.getElementById('root');
    const root = createRoot( container! );
    root.render( <App/> );
}

// eof