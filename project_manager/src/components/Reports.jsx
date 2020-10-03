import React from "react";
import Header from "./components/Header";
import { createStyles, withStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Copyright from "./components/Copyright";
import Footer from "./components/Footer";
import clsx from "clsx";
import NotesList from "./components/NotesList";
import { Typography } from "@material-ui/core";
import backgrondimage from "./img/background.jpg";
import { execute, makePromise } from "apollo-link";
import { myProjects, getProjectReport, getUserReport, link } from "./queries";
import Listprojrep from "./assets/listprojrep";
import PC from "./PieChart";

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
    backgroundImage: `url(${backgrondimage})`,
    backgroundSize: "cover",

    backgroundRepeat: "no-repeat",
  },
}));

class Reports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      authenticated: false,
      pagename: "reports",
      active: "",
      inactive: "",
      completed: "",
      completedbefore: "",
      completedafter: "",
      total: "",
      pactive: "",
      pinactive: "",
      pcompleted: "",
      pcompletedbefore: "",
      pcompletedafter: "",
      ptotal: "",
      innerpagename: "projectsel",
      projectid: 0,
      loaded: 0,
      projectlist: [],
      projectname: "",
      loadedproject: 0,
      //   projectlist: { ongoing: null, completed: null },
    };
    this.fetchProjects = this.fetchProjects.bind(this);
    this.fetchUserReport = this.fetchUserReport.bind(this);
    this.handleProjectSelection = this.handleProjectSelection.bind(this);
    // console.log(this.props.username);
    // console.log(this.props.location.state.username);
  }
  // call api here to get rest of user data from backend
  // this.handleClick = this.handleClick.bind(this);

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

  async handleProjectSelection(projectid, projectname) {
    this.setState({ projectid: projectid, projectname: projectname });
    const operation = {
      query: getProjectReport,
      variables: {
        projectid: projectid,
        // projectFilter: "completed",
      }, //optional
    };
    await makePromise(execute(link, operation))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        // console.log(data);
        let a = data.data.getProjectReport;
        this.setState({
          pactive: a.active,
          pinactive: a.inative,
          pcompleted: a.completed,
          pcompletedbefore: a.completedBefore,
          pcompletedafter: a.completedAfter,
          pworking: a.working,
          ptotal: a.total,
        });
      })
      .catch((error) => this.props.alert.error(error));
    this.setState({ innerpagename: "projectreport", loadedproject: 1 });
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
        console.log(this.state.projectlist);
      })
      .catch((error) => this.props.alert.error(error));
  }

  async fetchUserReport() {
    const operation = {
      query: getUserReport,
      variables: {
        username: this.state.username,
        // projectFilter: "completed",
      }, //optional
    };
    await makePromise(execute(link, operation))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        // console.log(data);
        let a = data.data.getUserReport;
        this.setState({
          active: a.active,
          inactive: a.inative,
          completed: a.completed,
          completedbefore: a.completedBefore,
          completedafter: a.completedAfter,
          working: a.working,
          total: a.total,
        });
      })
      .catch((error) => this.props.alert.error(error));
  }
  async componentDidMount() {
    await this.fetchProjects();
    await this.fetchUserReport();
  }

  render() {
    if (this.state.authenticated === false) {
      return <h1>Not Authenticated Go to Login Page and Login</h1>;
    }
    const { classes } = this.props;
    const fixedHeightPaper = clsx(
      classes.paper,
      classes.fixedHeight,
      classes.background
    );
    let projectinner;
    if (this.state.loaded === 1 && this.state.innerpagename === "projectsel") {
      projectinner = (
        <Listprojrep
          projects={this.state.projectlist}
          handleToUpdate={this.handleProjectSelection}
        />
      );
    }
    if (this.state.innerpagename === "projectreport") {
      projectinner = (
        <>
          <Typography vairant="h5" padding="20">
            {this.state.projectname}
          </Typography>
          <Typography variant="h6">
            {" "}
            Active Tasks:{this.state.pactive}{" "}
          </Typography>
          <Typography variant="h6">
            Inactive Tasks:{this.state.pinactive}{" "}
          </Typography>
          <Typography variant="h6">
            Completed Tasks:{this.state.pcompleted}{" "}
          </Typography>
          <Typography variant="h6">
            Completed Before:{this.state.pcompletedbefore}{" "}
          </Typography>
          <Typography variant="h6">
            Completed After:{this.state.pcompletedafter}{" "}
          </Typography>
          <Typography variant="h6">Total:{this.state.ptotal} </Typography>
          <br></br>
          <Typography variant="h6">Visual PieChart</Typography>
          {/* <PieChart /> */}
          <PC
            data={[
              {
                name: "Active",
                value: this.state.pactive,
              },
              {
                name: "Inactive",
                value: this.state.pinactive,
              },
              {
                name: "Completed",
                value: this.state.pcompleted,
              },
              {
                name: "CompletedBefore",
                value: this.state.pcompletedbefore,
              },
              {
                name: "CompletedAfter",
                value: this.state.pcompletedafter,
              },
              {
                name: "Total",
                value: this.state.ptotal,
              },
            ]}
          />
          <Button
            color="primary"
            aria-label="edit"
            onClick={() =>
              this.setState({
                innerpagename: "projectsel",
                loadedproject: 0,
              })
            }
          >
            Back
          </Button>
        </>
      );
    }
    if (this.state.loaded === 1) {
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
                    <Grid
                      container
                      justify="center"
                      direction="row"
                      spacing={2}
                    >
                      <Grid
                        item
                        direction="row"
                        justify="center"
                        className={classes.root}
                        xs={12}
                        sm={6}
                      >
                        <Paper className={classes.paper}>
                          <Typography variant="h4">
                            User Based Report
                          </Typography>
                          <Typography variant="h6">
                            Active Tasks:{this.state.active}{" "}
                          </Typography>
                          <Typography variant="h6">
                            Inactive Tasks:{this.state.inactive}{" "}
                          </Typography>
                          <Typography variant="h6">
                            Completed Tasks:{this.state.completed}{" "}
                          </Typography>
                          <Typography variant="h6">
                            Completed Before:{this.state.completedbefore}{" "}
                          </Typography>
                          <Typography variant="h6">
                            Completed After:{this.state.completedafter}{" "}
                          </Typography>
                          <Typography variant="h6">
                            Total:{this.state.total}{" "}
                          </Typography>
                          <br></br>
                          <Typography variant="h6">Visual PieChart</Typography>
                          <PC
                            data={[
                              {
                                name: "Active",
                                value: this.state.active,
                              },
                              {
                                name: "Inactive",
                                value: this.state.inactive,
                              },
                              {
                                name: "Completed",
                                value: this.state.completed,
                              },
                              {
                                name: "CompletedBefore",
                                value: this.state.completedbefore,
                              },
                              {
                                name: "CompletedAfter",
                                value: this.state.completedafter,
                              },
                              {
                                name: "Total",
                                value: this.state.total,
                              },
                            ]}
                          />
                        </Paper>
                      </Grid>
                      <Grid
                        item
                        direction="row"
                        justify="center"
                        className={classes.root}
                        xs={12}
                        sm={6}
                      >
                        <Paper className={classes.paper}>
                          <Typography variant="h4">
                            Project Based Report
                          </Typography>
                          {projectinner}
                        </Paper>
                      </Grid>
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
    return null;
  }
}
export default withStyles(useStyles)(Reports);
