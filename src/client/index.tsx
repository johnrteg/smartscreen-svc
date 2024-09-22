//
//
//
import * as React from "react";
import { createRoot } from 'react-dom/client';

//
import App from "./App.js";
import AppData from "./AppData.js";

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