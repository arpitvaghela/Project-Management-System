import React from "react";
import { Fab, Grid, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core";
import { createStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import backgrondimage from "../img/background.jpg";
import clsx from "clsx";
import AddIcon from "@material-ui/icons/Add";
import DeleteRounded from "@material-ui/icons/DeleteRounded";
import TaskList from "./TasksList";
import TaskView from "./TaskView";
import DeleteTask from "./DeleteTask";
import AddTask from "./AddTask";
import { execute, makePromise } from "apollo-link";
import { ProjectTasks, link } from "../queries";
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
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  divforbutton: {
    flexDirection: "row",
    padding: theme.spacing(3),
  },
  buttonclass: {
    margin: theme.spacing(3),
  },
  headinger: {
    padding: theme.spacing(1),
    // background: "#FFFFFF",
  },
  background: {
    backgroundImage: `url(${backgrondimage})`,
    backgroundSize: "cover",

    backgroundRepeat: "no-repeat",
  },
}));

class TaskManagerProj extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.username,
      projectid: this.props.projectid,
      tasks: [],
      viewname: "alltasklist", // add task delete task view task ( edit task )
      taskid: 42069,
      redirect: 0,
      all: [],
      active: [],
      inactive: [],
      working: [],
      completed: [],
    };
    this.pageUpdate = this.pageUpdate.bind(this);
    this.handleToUpdate = this.handleToUpdate.bind(this);
    this.fetchTasksFilter = this.fetchTasksFilter.bind(this);
    this.fetchalldata = this.fetchalldata.bind(this);
  }
  async pageUpdate() {
    await this.fetchalldata();
    this.setState({ viewname: "alltasklist" });
  }
  handleToUpdate(taskid) {
    this.setState({ taskid: taskid, viewname: "viewtask" });
  }
  async fetchTasksFilter(Filter) {
    const operation1 = {
      query: ProjectTasks,
      variables: {
        username: this.state.username,
        taskFilter: Filter,
        projectid: this.state.projectid,
      }, //optional
    };
    let tasklist;
    await makePromise(execute(link, operation1))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        console.log(data);
        if (data.data) {
          tasklist = data.data.ProjectTasks;
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
      .catch((error) => {
        this.props.alert.error(error.message);
        console.log(error);
      });
  }
  async fetchalldata() {
    await this.fetchTasksFilter(null);
    await this.fetchTasksFilter("completed");
    await this.fetchTasksFilter("working");
    await this.fetchTasksFilter("inactive");
    await this.fetchTasksFilter("active");
    let tasklist = {
      inactive: this.state.inactive,
      working: this.state.working,
      active: this.state.active,
      completed: this.state.completed,
      all: this.state.all,
    };
    this.setState({ tasks: tasklist, loaded: 1 });
    console.log(tasklist);
    console.log(this.state.tasks);
  }

  async componentWillMount() {
    if (
      this.props.username !== undefined &&
      this.props.projectid !== undefined
    ) {
      this.setState({
        username: this.props.username,
        projectid: this.props.projectid,
      });
    }
    await this.fetchalldata();
    // fetch all tasks here
  }
  componentDidUpdate() {
    //fetch all tasks here again
  }
  render() {
    const { classes } = this.props;
    let mid;
    if (this.state.loaded === 1) {
      console.log(this.state.tasks);
      mid = (
        <TaskList
          tasklist={this.state.tasks}
          handleToUpdate={this.handleToUpdate}
        />
      );
    }

    const fixedHeightPaper1 = clsx(
      classes.paper,
      classes.fixedHeight,
      classes.background
    );
    let top = (
      <Grid container spacing={3}>
        <Grid container justify="center" direction="row">
          {/* <Typography variant="h4">Manage Files</Typography> */}
          <Fab
            color="primary"
            aria-label="add"
            className={classes.buttonclass}
            onClick={(event) => this.setState({ viewname: "addtask" })}
          >
            <AddIcon />
          </Fab>
          <Fab
            color="secondary"
            aria-label="delete"
            className={classes.buttonclass}
            onClick={(event) => this.setState({ viewname: "deletetask" })}
          >
            <DeleteRounded />
          </Fab>
        </Grid>
      </Grid>
    );

    if (this.state.viewname === "viewtask") {
      mid = (
        <TaskView
          username={this.state.username}
          projectid={this.state.projectid}
          taskid={this.state.taskid}
          handleToUpdate={this.pageUpdate}
        />
      );
    }
    if (this.state.viewname === "deletetask") {
      mid = (
        <DeleteTask
          username={this.state.username}
          projectid={this.state.projectid}
          tasks={this.state.tasks.all}
          handleToUpdate={this.pageUpdate}
        />
      );
    }
    if (this.state.viewname === "addtask") {
      mid = (
        <AddTask
          username={this.state.username}
          projectid={this.state.projectid}
          handleToUpdate={this.pageUpdate}
        />
      );
    }
    return (
      <Grid item xs={12} justify="center">
        <Paper className={fixedHeightPaper1} justify="center">
          <Typography variant="h3" component="h3">
            Task List
          </Typography>
          {top}
          {mid}
        </Paper>
      </Grid>
    );
  }
}

export default withAlert()(withStyles(useStyles)(TaskManagerProj));
