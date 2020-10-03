import React from "react";
import Header from "./components/Header";
import { createStyles, withStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Copyright from "./components/Copyright";
import Footer from "./components/Footer";
import clsx from "clsx";
import NotesList from "./components/NotesList";
import { Typography, TextField, Button } from "@material-ui/core";
import { execute, makePromise } from "apollo-link";
import Recharts from "./Recharts";
import {
  myProjects,
  getProjectAnalytics,
  getCumulativeProjectAnalytics,
  link,
} from "./queries";
import Listprojrep from "./assets/listprojrep";

const useStyles = createStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  fixedHeight: {
    display: "flex",
    alignItems: "center",
  },
  background: {
    // backgroundImage: `url(${backgrondimage})`,
    backgroundSize: "cover",

    backgroundRepeat: "no-repeat",
  },
}));

class Analytics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      authenticated: false,
      pagename: "analytics",
      datapa: {},
      datapca: {},
      innerpagename: "projectsel",
      loaded: 0,
      loadedstate: 1,
      startdate: "2010-10-10",
      enddate: "2010-10-10",
      projectlist: [],
      //   projectlist: { ongoing: null, completed: null },
    };
    this.handleProjectSelection = this.handleProjectSelection.bind(this);
    // console.log(this.props.username);
    // console.log(this.props.location.state.username);
  }
  // call api here to get rest of user data from backend
  // this.handleClick = this.handleClick.bind(this);

  async handleProjectSelection(projectid, projectname) {
    this.setState({ loadedstate: 0 });
    const operation = {
      query: getProjectAnalytics,
      variables: {
        projectid: projectid,
        startdate: this.state.startdate,
        enddate: this.state.enddate,
        // projectFilter: "completed",
      }, //optional
    };
    await makePromise(execute(link, operation))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        // console.log(data);
        this.setState({ datapa: data.data.getProjectAnalytics });
      })
      .catch((error) => this.props.alert.error(error));
    const operation2 = {
      query: getCumulativeProjectAnalytics,
      variables: {
        projectid: projectid,
        startdate: this.state.startdate,
        enddate: this.state.enddate,
        // projectFilter: "completed",
      }, //optional
    };
    await makePromise(execute(link, operation2))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        // console.log(data);
        this.setState({ datapca: data.data.getCumulativeProjectAnalytics });
      })
      .catch((error) => this.props.alert.error(error));

    this.setState({
      innerpagename: "projectanalytics",
      projectname: projectname,
      loadedstate: 1,
    });
  }

  componentWillMount() {
    if (this.props.username !== undefined) {
      this.setState({
        username: this.props.username,
        authenticated: this.props.authenticated,
      });
    }
    if (this.props.location.state !== undefined) {
      this.setState({
        username: this.props.location.state.username,
        authenticated: this.props.location.state.authenticated,
      });
    } else {
      this.setState({
        username: "",
        authenticated: false,
      });
    }
  }
  async componentDidMount() {
    // console.log(this.state.username);
    // console.log(this.state.authenticated);
    await this.fetchProjects();
  }

  async fetchProjects() {
    let ongoing = [{}];
    const operation1 = {
      query: myProjects,
      variables: {
        username: this.state.username,
        projectFilter: "ongoing",
      }, //optional
    };

    await makePromise(execute(link, operation1))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        // console.log(data);
        if (data.data) {
          ongoing = data.data.myProjects;
        }
      })
      .catch((error) => this.props.alert.error(error));

    let completed;
    const operation = {
      query: myProjects,
      variables: {
        username: this.state.username,
        projectFilter: "completed",
      }, //optional
    };

    await makePromise(execute(link, operation))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        // console.log(data);
        completed = data.data.myProjects;
        // console.log(completed);
        // console.log(projectlist);
        this.setState({
          projectlist: ongoing.concat(completed),
          loaded: 1,
        });
        // console.log(this.state.projectlist);
      })
      .catch((error) => this.props.alert.error(error));
  }

  render() {
    let midpage;
    if (this.state.authenticated === false) {
      return <h1>Not Authenticated Go to Login Page and Login</h1>;
    }
    const { classes } = this.props;
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    if (this.state.innerpagename === "projectsel" && this.state.loaded === 1) {
      midpage = (
        <Grid item xs={12}>
          <Listprojrep
            projects={this.state.projectlist}
            handleToUpdate={this.handleProjectSelection}
          />
        </Grid>
      );
    }

    if (
      this.state.innerpagename === "projectanalytics" &&
      this.state.loadedstate === 1
    ) {
      midpage = (
        <>
          <Grid item xs={12}>
            <Typography variant="h5">
              {`Project Analytics ` + this.state.projectname}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Recharts data={this.state.datapa} />
          </Grid>
          <Grid item xs={12}>
            <Recharts data={this.state.datapca} />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={() => this.setState({ innerpagename: "projectsel" })}
            >
              Back
            </Button>
          </Grid>
        </>
      );
    }

    return (
      <div className={classes.root}>
        <CssBaseline />
        <Header
          string={"User:" + this.state.username}
          username={this.state.username}
          authenticated={this.state.authenticated}
        />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="xl" className={classes.container}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8} lg={9}>
                <Paper className={fixedHeightPaper}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h3">Project Analytics</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h5">
                        Click on Project to get analytics for selected dates
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="date"
                        id="date"
                        name="date"
                        helperText="Start Date"
                        fullWidth
                        onChange={(event) => {
                          this.setState({
                            startdate: event.target.value,
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="date"
                        id="date"
                        name="date"
                        helperText="End Date"
                        fullWidth
                        onChange={(event) => {
                          this.setState({
                            enddate: event.target.value,
                          });
                        }}
                      />
                    </Grid>
                    {midpage}
                  </Grid>
                </Paper>
              </Grid>
              <NotesList username={this.state.username} />;
              <Footer />
            </Grid>
            <Box pt={4}>
              <Copyright />
            </Box>
          </Container>
        </main>
      </div>
    );
  }
}
export default withStyles(useStyles)(Analytics);
