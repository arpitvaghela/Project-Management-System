import React from "react";
import { withStyles, Paper, Grid } from "@material-ui/core";
import { createStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import List from "@material-ui/core/List";
import Listelemtask from "../assets/listelemtask";
const useStyles = createStyles((theme) => ({
  root: {
    // display: "flex",
    width: "90%",
  },
  list: {
    width: "100%",
    maxWidth: 360,
  },
}));

class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      tasklist: this.props.tasklist,
      taskid: 42069,
      redirect: 0,
    };
    this.handleToUpdate = this.handleToUpdate.bind(this);
  }

  handleToUpdate(someArg) {
    this.setState({ taskid: someArg, redirect: 1 });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.taskid !== this.state.taskid) {
      this.props.handleToUpdate(this.state.taskid, this.state.redirect);
    }
    // console.log(this.state.tasklist);
  }
  render() {
    const classes = useStyles();
    let ListElement;
    if (this.state.value === 0) {
      let taskall = this.state.tasklist.all;
      let listItems1 = taskall.map((taskall) => (
        <Listelemtask task={taskall} handleToUpdate={this.handleToUpdate} />
      ));

      ListElement = <List className={classes.list}>{listItems1}</List>;
    }
    if (this.state.value === 1) {
      let projectson = this.state.tasklist.active;
      let listItems1 = projectson.map((projectson) => (
        <Listelemtask task={projectson} handleToUpdate={this.handleToUpdate} />
      ));
      ListElement = <List className={classes.list}>{listItems1}</List>;
    }
    if (this.state.value === 2) {
      let projectscom = this.state.tasklist.inactive;
      let listItems2 = projectscom.map((projectscom) => (
        <Listelemtask task={projectscom} handleToUpdate={this.handleToUpdate} />
      ));
      ListElement = <List className={classes.list}>{listItems2}</List>;
    }
    if (this.state.value === 3) {
      let projectson = this.state.tasklist.working;
      let listItems1 = projectson.map((projectson) => (
        <Listelemtask task={projectson} handleToUpdate={this.handleToUpdate} />
      ));
      ListElement = <List className={classes.list}>{listItems1}</List>;
    }
    if (this.state.value === 4) {
      let projectscom = this.state.tasklist.completed;
      let listItems2 = projectscom.map((projectscom) => (
        <Listelemtask task={projectscom} handleToUpdate={this.handleToUpdate} />
      ));
      ListElement = <List className={classes.list}>{listItems2}</List>;
    }

    return (
      <Grid
        container
        item
        justify="center"
        alignItems="center"
        direction="column"
      >
        <Paper>
          <Tabs
            value={this.state.value}
            onChange={(event, value) => this.setState({ value: value })}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="on"
          >
            <Tab label="All Tasks" />
            <Tab label="Active Tasks" />
            <Tab label="Inactive Tasks" />
            <Tab label="Working Tasks" />
            <Tab label="Completed Tasks" />
          </Tabs>
          {ListElement}
        </Paper>
      </Grid>
    );
  }
}

export default withStyles(useStyles)(TaskList);
