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
import { Typography } from "@material-ui/core";
import backgrondimage from "./img/background.jpg";
import TaskView from "./components/TaskView";
import TaskList from "./components/TasksList";
import NotesList from "./components/NotesList";
import { execute, makePromise } from "apollo-link";
import { myTasks, link } from "./queries";
import { withAlert } from "react-alert";

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
  },
  fixedHeight: {
    display: "flex",
    alignItems: "center",
    height: "100%",
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  divforbutton: {
    flexDirection: "column",
    padding: theme.spacing(3),
  },
  buttonclass: {
    margin: theme.spacing(3),
  },
  headinger: {
    padding: theme.spacing(1),
    // background: "#FFFFFF",
    // colorPrimary: "$FF",
  },
  background: {
    backgroundImage: `url(${backgrondimage})`,
    backgroundSize: "cover",

    backgroundRepeat: "no-repeat",
  },
}));

class Tasks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      authenticated: false,
      pagename: "tasks",
      tasklist: [],
      taskid: 42069,
      redirect: 0,
      loaded: 0,
      active: [],
      inactive: [],
      all: [],
      completed: [],
      working: [],
    };
    this.handleToUpdate = this.handleToUpdate.bind(this);
    this.fetchDataFilter = this.fetchDataFilter.bind(this);
    // console.log(this.props.username);
    // console.log(this.props.location.state.username);
  }
  // call api here to get rest of user data from backend
  // this.handleClick = this.handleClick.bind(this);

  async fetchDataFilter(Filter) {
    const operation1 = {
      query: myTasks,
      variables: {
        username: this.state.username,
        taskFilter: Filter,
      }, //optional
    };
    let tasklist;
    await makePromise(execute(link, operation1))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        console.log(data);
        if (data.data) {
          tasklist = data.data.myTasks;
          console.log(tasklist);
          // return tasklist;
          if (Filter === null) {
            this.setState({ all: tasklist });
          }
          if (Filter === "inactive") {
            this.setState({ inactive: tasklist });
          }
          if (Filter === "active") {
            this.setState({ active: tasklist });
          }
          if (Filter === "completed") {
            this.setState({ completed: tasklist });
          }
          if (Filter === "working") {
            this.setState({ working: tasklist });
          }
        }
      })
      .catch((error) => this.props.alert.error(error));
  }

  async fetchalldata() {
    await this.fetchDataFilter(null);
    await this.fetchDataFilter("completed");
    await this.fetchDataFilter("working");
    await this.fetchDataFilter("inactive");
    await this.fetchDataFilter("active");
    let tasklist = {
      inactive: this.state.inactive,
      working: this.state.working,
      active: this.state.active,
      completed: this.state.completed,
      all: this.state.all,
    };
    this.setState({ tasklist: tasklist, loaded: 1 });
    console.log(this.state.tasklist);
  }

  handleToUpdate(taskid) {
    this.setState({ taskid: taskid, pagename: "viewtask" });
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
    console.log(this.state.username);
    console.log(this.state.authenticated);
    await this.fetchalldata();
  }

  render() {
    let mid;
    const { classes } = this.props;
    const fixedHeightPaper1 = clsx(
      classes.paper,
      classes.fixedHeight,
      classes.background
    );
    // const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    let aftermid = <NotesList username={this.state.username} />;
    if (this.state.pagename === "viewtask") {
      mid = (
        <TaskView
          username={this.state.username}
          projectid={this.state.projectid}
          taskid={this.state.taskid}
        />
      );
    }
    if (this.state.pagename === "tasks" && this.state.loaded === 1) {
      console.log(this.state.tasklist);
      mid = (
        <TaskList
          tasklist={this.state.tasklist}
          handleToUpdate={this.handleToUpdate}
        />
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
                <Paper className={fixedHeightPaper1}>
                  <Typography variant="h3" className={classes.headinger}>
                    Your Tasks
                  </Typography>
                  {mid}
                </Paper>
              </Grid>
              {aftermid}
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
export default withAlert()(withStyles(useStyles)(Tasks));
