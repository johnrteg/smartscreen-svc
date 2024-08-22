//
//
import * as React from "react";


//
import { ThemeProvider } from '@mui/material/styles';

//
import theme            from './theme/theme.js';
import Main from './Main.js';

//import AppData          from "./app/data/AppData.js";


const ROOT_DEPTH : number = 0;

//
//
//
export default function App(): JSX.Element
{
    //const [appdata,setAppData]       = React.useState< AppData >( AppData.instance() );

    //
    //const [display, setDisplay]      = React.useState<string>( window.location.hash );
    //const [language, setLanguage]    = React.useState<string>( appdata.localizer.language );
    //const [mode, setMode]            = React.useState<string>( appdata.system.session.mode() );

    // callback when rendering is complete
    //React.useEffect( () => { appdata.pingUserActivity(); } );
    React.useEffect( () => pageLoaded(), [] );

    ///////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        //console.log('App:page loaded', appdata.uri );
        //window.addEventListener( "hashchange", () => urlHashChange() );
        //appdata.timeout_cb = aboutToLogout;
        //appdata.localizer.addListener( Localizer.LANGUAGE, languageChanged );
        //appdata.cache.addListener( Cache.ACCESS, accessChanged );
    }

    ///////////////////////////////////////////////////////////////////////
    async function aboutToLogout() : Promise<void>
    {
        //console.log('LOGOUT');
        //await appdata.logout();
        //appdata.setPage( "login" );
    }


  // ==============================================================================
  return <ThemeProvider theme={theme}><Main/></ThemeProvider>;
  // ==============================================================================

}

// eof