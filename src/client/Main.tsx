import * as React from "react";

//
import { Typography, Stack, Box, Tab, Tabs, AppBar, IconButton, MenuItem, Menu} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import { Settings as SettingsIcon }         from '@mui/icons-material';

//
import AppData from "./AppData.js";
import { Interfaces } from "./Interfaces.js";
//
import Page from './Page.js';
import SettingsPage from './settings/SettingsPage.js';
import StringUtils from "../utils/StringUtils.js";


export interface MainProps
{
}


//
//
//
export default function Main( props : MainProps ) : JSX.Element
{
    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );

    const warm_timer                = React.useRef<NodeJS.Timeout>(null);
    
    const [settings, showSettings]  = React.useState<boolean>(false);
    const [tab, setTab]             = React.useState<string>("");
    const [tabs,setTabs]            = React.useState< Array<JSX.Element> >( [] );
    const [warm,setWarm]            = React.useState< boolean >( false );

    const [anchorEl, setAnchorEl]   = React.useState<null | HTMLElement>(null);

    React.useEffect( () => pageLoaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        let new_tabs : Array<JSX.Element> = [];

        appdata.layout.pages.forEach( ( page : Interfaces.Page, index : number ) => { new_tabs.push( <Tab key={page.name} value={page.name} label={page.name} /> ) } );
        setTabs( new_tabs );
        setTab( appdata.layout.pages[0].name );

        window.onclick = onBackPressed;
    }

    ///////////////////////////////////////////////////////////////////////////////
    function onTabChange( event: React.SyntheticEvent, newValue: string ) : void
    {
        setTab(newValue);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    function onBackPressed() : void
    {
        if( warm_timer.current )clearTimeout( warm_timer.current );
        setWarm( true );
        warm_timer.current = setTimeout( cool, 10000 );
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    function cool() : void
    {
        setWarm( false );
        warm_timer.current = null;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    function onOpenMenu( event: React.MouseEvent<HTMLButtonElement> ) : void
    {
        setAnchorEl(event.currentTarget);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    function onCloseMenu() : void
    {
        setAnchorEl(null);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    function onRefresh() : void
    {
        window.location.reload();
        onCloseMenu();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    function onSettings() : void
    {
        showSettings( true );
        onCloseMenu();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    function onSettingsClose() : void
    {
        showSettings( false );
    }

    // ===============================================================================================
    // background-color: #121212; background-image:url('https://coronadotimes.com/wp-content/uploads/import/photos/3001-4000/3589-ADarkSkyline.jpg'); background-repeat: no-repeat; background-size: cover; background-attachment: fixed;
    //console.log("sets", appdata.settings.background );
    //let bg_css : any = { backgroundColor: appdata.settings.background.color,
    //                    opacity: appdata.settings.background.opacity/100,
    //                    filter: StringUtils.format("alpha(opacity={0})", appdata.settings.background.opacity )};
    
    //console.log("css", bg_css );
    //document.body.style.backgroundColor = appdata.settings.background.color;
    //document.body.style.opacity = ( appdata.settings.background.opacity/100 ).toString();
    //document.body.style.filter = StringUtils.format("alpha(opacity={0})", appdata.settings.background.opacity );
    if( appdata.settings.background.image_url && appdata.settings.background.image_url != null )
    {
        document.body.style.backgroundImage = StringUtils.format( "url('{0}')", appdata.settings.background.image_url );
        document.body.style.backgroundRepeat= "no-repeat";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
    }

    return (<div>
        <Box component={'span'} sx={{   width: '100%', height: '100vh',
                                        backgroundColor: appdata.settings.background.color, display: 'block', position: 'relative',
                                        opacity: appdata.settings.background.opacity/100 }}></Box>

        <Box component={'span'} sx={{ width: '100%', typography: 'body1', display: 'block', position: 'fixed', left: 0, top: 0 }}>

            { settings ? <SettingsPage onClose={onSettingsClose}/> : 
            <TabContext value={tab}>
                
                { appdata.layout.pages.map( ( page : Interfaces.Page, index : number ) => { return <TabPanel key={index} value={page.name}  ><Page name={ page.name } rows={ page.rows } warm={warm}/></TabPanel> } ) }

                { warm ?
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
                        <Stack direction={"row"}>
                            <TabList onChange={onTabChange} >
                                { tabs }
                            </TabList>
                            <Box sx={{ flexGrow: 1 }} ></Box>
                            <IconButton onClick={onOpenMenu}><SettingsIcon /></IconButton>
                        </Stack>
                        
                    </AppBar>
                </Box> : null }
            </TabContext> }
        </Box>

        <Menu   id="action-menu"
                anchorEl={anchorEl}
                open={ anchorEl != null }
                onClose={onCloseMenu}
                MenuListProps={{'aria-labelledby': 'basic-button'}} >
            <MenuItem onClick={onCloseMenu}>TBD</MenuItem>
            <MenuItem onClick={onSettings}>{"Settings"}</MenuItem>
            <MenuItem onClick={onRefresh}>{"Refresh"}</MenuItem>
        </Menu>
        </div>
    );
    // ===============================================================================================
}

// eof