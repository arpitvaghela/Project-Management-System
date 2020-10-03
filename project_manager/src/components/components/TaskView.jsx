import React from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import {
  Button,
  Typography,
  ListItem,
  ListItemAvatar,
  Avatar,
  List,
  ListItemText,
  Grid,
  Paper,
} from "@material-ui/core";
import PeopleIcon from "@material-ui/icons/People";
import EditTask from "./EditTask";
import { execute, makePromise } from "apollo-link";
import { getTask, preqTask, completeTask, link } from "../queries";
import { withAlert } from "react-alert";
import WorkIcon from "@material-ui/icons/Work";

const useStyles = createStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    width: "90%",
  },
}));

class TaskView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.username,
      projectid: this.props.projectid,
      taskid: this.props.taskid,
      title: "",
      description: "",
      starttime: "",
      endtime: "",
      status_type: "",
      completiontime: "",
      priority_type: "",
      assignedby: "",
      assignedto: [],
      viewname: "taskdetails",
      preqtask: [],
      preqtasklist: [],
      loaded: 1, // edit task
    };
    this.pageUpdate = this.pageUpdate.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.completetask = this.completetask.bind(this);
  }

  completetask() {
    const operation4 = {
      query: completeTask,
      variables: {
        taskid: this.props.taskid,
        username: this.props.username,
      },
    };
    makePromise(execute(link, operation4))
      .then((data) => {
        if (data.data.completeTask.status === true) {
          this.props.alert.success("Task Completed");

          // this.setState({ authenticated: true });
        } else {
          this.props.alert.error(data.data.completeTask.msg);
        }
      })
      .catch((error) => console.log(error));
    // await this.fetchData();
  }

  async fetchData() {
    const operation1 = {
      query: getTask,
      variables: {
        taskid: this.props.taskid,
      }, //optional
    };
    await makePromise(execute(link, operation1))
      .then(async (data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        console.log(data);
        let task = data.data.getTask;
        let preqtask = task.preqtask;
        let preqtasklist = [];
        let x;
        let operation2;
        if (preqtask[0] !== null) {
          for (x of preqtask) {
            console.log(x);
            operation2 = {
              query: preqTask,
              variables: {
                taskid: x,
              }, //optional
            };
            await makePromise(execute(link, operation2)).then((data) => {
              preqtasklist.push(data.data.getTask);
            });
          }
        }
        console.log(preqtasklist);
        this.setState({
          title: task.title,
          description: task.description,
          starttime: task.starttime,
          endtime: task.endtime,
          completiontime: task.completiontime,
          status_type: task.status,
          priority_type: task.priority,
          assignedby: task.assignedby,
          assignedto: task.assignedto,
          preqtask: task.preqtask,
          preqtasklist: preqtasklist,
          loaded: 1,
        });
      })
      .catch((error) => console.log(error));
  }
  async pageUpdate() {
    await this.fetchData();
    this.setState({ viewname: "taskdetails" });
  }

  componentDidMount() {
    this.fetchData();
  }
  render() {
    const { classes } = this.props;
    let low, mid;
    low = (
      <Grid container justify="center" direction="row">
        {/* <Typography variant="h4">Manage Files</Typography> */}
        <Button
          color="primary"
          aria-label="edit"
          className={classes.buttonclass}
          onClick={(event) => this.setState({ viewname: "edittask" })}
        >
          Edit Task
        </Button>
        <Button
          color="primary"
          aria-label="edit"
          className={classes.buttonclass}
          onClick={this.completetask}
        >
          Complete Task
        </Button>
      </Grid>
    );
    let preqtasklist = this.state.preqtasklist;
    mid = (
      <Paper className={classes.paper}>
        <Typography variant="h4">{this.state.title}</Typography>
        <Typography variant="h6">
          {`Status type :` +
            this.state.status_type +
            ` Priorty type :` +
            this.state.priority_type}
        </Typography>
        <Typography variant="subtitle1">
          {`start date:` + this.state.starttime}
        </Typography>
        <Typography variant="subtitle1">
          {`end date:` + this.state.endtime}
        </Typography>
        <Typography variant="subtitle1">
          {`completion date:` + this.state.completiontime}
        </Typography>
        <Typography variant="subtitle1">
          {" "}
          {`Description:` + this.state.description}{" "}
        </Typography>
        <Typography variant="subtitle1">Assigned By:</Typography>
        <ListItem button>
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              <PeopleIcon></PeopleIcon>
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={this.state.assignedby} />
        </ListItem>
        <Typography variant="subtitle1">Members Assigned To:</Typography>
        <List className={classes.listroot}>
          {
            <>
              {this.state.assignedto.map((assignedto) => (
                <ListItem button>
                  <ListItemAvatar>
                    <Avatar className={classes.avatar}>
                      <PeopleIcon></PeopleIcon>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={assignedto.username} />
                </ListItem>
              ))}
            </>
          }
        </List>
        <Typography variant="subtitle1">Prerequisite Tasks:</Typography>
        <List className={classes.listroot}>
          {
            <>
              {preqtasklist.map((preqtasklist) => (
                <ListItem button>
                  <ListItemAvatar>
                    <Avatar className={classes.avatar}>
                      <WorkIcon></WorkIcon>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText>
                    <Typography variant="h5">{preqtasklist.title}</Typography>
                    <Typography variant="h6">
                      {preqtasklist.description}
                    </Typography>
                    <Typography variant="subtitle1">
                      {`Status :` +
                        preqtasklist.status +
                        ` Priority :` +
                        preqtasklist.priority}
                    </Typography>
                  </ListItemText>
                </ListItem>
              ))}
            </>
          }
        </List>
      </Paper>
    );
    if (this.state.viewname === "edittask") {
      mid = (
        <EditTask
          username={this.state.username}
          projectid={this.state.projectid}
          taskid={this.state.taskid}
          title={this.state.title}
          description={this.state.description}
          starttime={this.state.starttime}
          endtime={this.state.endtime}
          status_type={this.state.status_type}
          priority_type={this.state.priority_type}
          assignedby={this.state.assignedby}
          assignedto={this.state.assignedto}
          preqtaskid={this.state.preqtask}
          handleToUpdate={this.pageUpdate}
        />
      );
      low = null;
    }
    return [mid, low];
  }
}

export default withAlert()(withStyles(useStyles)(TaskView));
