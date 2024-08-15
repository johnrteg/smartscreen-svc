import * as React from "react";

//
import { Typography, Stack, Box, Tab, Tabs, AppBar} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';


//
//import AppData from "../../data/AppData.js";
//
import Page from './Page.js';


export interface MainProps
{
}


//
//
//
export default function Main( props : MainProps ) : JSX.Element
{
    const [tab, setTab] = React.useState<string>("main");
    const [tabs,setTabs]            = React.useState< Array<JSX.Element> >( [] );

    React.useEffect( () => pageLoaded(), [] );

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    function pageLoaded() : void
    {
        let new_tabs : Array<JSX.Element> = [];

        new_tabs.push( <Tab key="main"     value="main"       label={ "Main"}           /> );
        new_tabs.push( <Tab key="travel"    value="travel"      label={ "travel" }        /> );
        new_tabs.push( <Tab key="kitchen"   value="kitchen"     label={ "kitchen" }         /> );
        new_tabs.push( <Tab key="other"   value="other"     label="other"         /> );

        setTabs( new_tabs );
    }

    ///////////////////////////////////////////////////////////////////////////////
    async function onLogin() : Promise<void>
    {
        //console.log('button pressed');
        //let response : any = await appdata.server.get('/account');
        //console.log('button pressed', response );
    }

    ///////////////////////////////////////////////////////////////////////////////
    function onTabChange( event: React.SyntheticEvent, newValue: string ) : void
    {
        setTab(newValue);
    }


    // ===============================================================================================
    return (

        <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={tab}>
            
            <TabPanel value="main"  ><Page name={ "main" }/></TabPanel>
            <TabPanel value="travel" ><Page name={ "travel" }/></TabPanel>
            <TabPanel value="kitchen"><Page name={ "kitchen" }/></TabPanel>
            <TabPanel value="other"><Page name={ "other" }/></TabPanel>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
                    <TabList onChange={onTabChange} >
                        { tabs }
                    </TabList>
                </AppBar>
            </Box>
        </TabContext>

        
        </Box>
            
    );
    // ===============================================================================================
}

// eof