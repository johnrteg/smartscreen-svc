import * as React from "react";

//
import { Stack, Box, Tab, AppBar, IconButton, Menu, MenuItem} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import { Settings as SettingsIcon }         from '@mui/icons-material';

//
import AppData from "./AppData.js";
import { Interfaces } from "./Interfaces.js";
import Page from './Page.js';



export interface MainProps
{
}


//
//
//
export default function Main( props : MainProps ) : JSX.Element
{
    const [appdata,setAppData]      = React.useState< AppData >( AppData.instance() );

    const warm_timer             = React.useRef<NodeJS.Timeout>(null);
    
    const [tab, setTab]             = React.useState<string>("");
    const [tabs,setTabs]            = React.useState< Array<JSX.Element> >( [] );
    const [warm,setWarm]            = React.useState< boolean >( false );

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    React.useEffect( () => pageLoaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        let new_tabs : Array<JSX.Element> = [];

        //if( appdata.layout.pages )
        //{
            appdata.layout.pages.forEach( ( page : Interfaces.Page, index : number ) => { new_tabs.push( <Tab key={page.name} value={page.name} label={page.name} /> ) } );
            setTab( appdata.layout.pages[0].name );
        //}
        
        setTabs( new_tabs );

        window.onclick = onBackPressed;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
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

    // ===============================================================================================
    return ( <div>
        <Box sx={{ width: '100%', typography: 'body1' }}>
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
            </TabContext>
        </Box>

        <Menu
            id="action-menu"
            anchorEl={anchorEl}
            open={ anchorEl != null }
            onClose={onCloseMenu}
            MenuListProps={{
            'aria-labelledby': 'basic-button',
            }}
            >
            <MenuItem onClick={onCloseMenu}>TBD</MenuItem>
            <MenuItem onClick={onCloseMenu}>TBD</MenuItem>
            <MenuItem onClick={onRefresh}>Refresh</MenuItem>
        </Menu>
            </div>
    );
    // ===============================================================================================
}

// eof