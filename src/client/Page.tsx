import * as React from "react";

//
import { Typography, Stack, Box, Card, CardContent, CardActions, Button, Grid } from '@mui/material';

//
//import AppData from "../../data/AppData.js";
//
import Clock from "./modules/Clock/Clock.js";
import TimeZones from "./modules/TimeZones/TimeZones.js";



export interface PageProps
{
    name : string;
}


//
//
//
export default function Page( props : PageProps ) : JSX.Element
{

    ///////////////////////////////////////////////////////////////////////////////
    async function onLogin() : Promise<void>
    {
        //console.log('button pressed');
        //let response : any = await appdata.server.get('/account');
        //console.log('button pressed', response );
    }

    const card = (
        <React.Fragment>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              Word of the Day
            </Typography>
            <Typography variant="h5" component="div">
              benevolent
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              adjective
            </Typography>
            <Typography variant="body2">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Learn More</Button>
          </CardActions>
        </React.Fragment>
      );

      /*
                  <Grid container={true} spacing={2}>
                <Grid item xs={5}>
                    
                </Grid>
                <Grid item xs={3}>
                    
                </Grid>
            </Grid>
      */
    // ===============================================================================================
    return (
        <div style={{width: '100%', backgroundColor: "palette.background.card" }}>
            <Stack direction={"column"}>
                <Stack direction={"row"}>
                    <Card sx={{width:"40%"}} variant="outlined"><Clock/></Card>
                    <Card sx={{width:"35%"}} variant="outlined"><TimeZones/></Card>
                </Stack>
                <Stack direction={"row"}>
                    <Card variant="outlined">{card}</Card>
                </Stack>
            </Stack>
            

            
        </div>
    );
    // ===============================================================================================
}

// eof