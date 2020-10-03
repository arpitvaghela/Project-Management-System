import React from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import {
  Grid,
  TextField,
  Paper,
  Button,
  MenuItem,
  Typography,
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { execute, makePromise } from "apollo-link";
import { ProjectTasks, addTask, link } from "../queries";
import { withAlert } from "react-alert";
import Listseltask from "../assets/listseltask";

const useStyles = createStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  root: {
    width: "80%",
    padding: theme.spacing(2),
    margin: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

class AddTask extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: this.props.username,
      projectid: this.props.projectid,
      priority_type: "",
      status_type: "",
      task_title: "",
      startdate: "2000-11-15",
      enddate: "2000-11-15",
      description: "",
      assignedto: [],
      loaded: "",
      preqid: [],
      preqammout: 0,
      taskall: [],
    };
    this.handleClick = this.handleClick.bind(this);
    this.fetchTasksFilter = this.fetchTasksFilter.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  async fetchTasksFilter() {
    const operation1 = {
      query: ProjectTasks,
      variables: {
        username: this.props.username,
        taskFilter: null,
        projectid: this.props.projectid,
        tasklist: [],
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

          this.setState({ taskall: tasklist, loaded: 1 });
        }
      })
      .catch((error) => {
        this.props.alert.error(error.message);
        console.log(error);
      });
  }

  componentWillMount() {
    if (this.props.username !== undefined) {
      this.setState({ username: this.props.username });
    }
    let today = new Date();
    let dd = String(today.getDate() + 1).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;
    this.setState({ startdate: today + "T07:45:05.567947" });
    this.setState({ enddate: today + "T07:45:05.567947" });
  }
  async handleClick(event) {
    console.log(this.state.enddate);
    // event.preventDefault();
    const operation = {
      query: addTask,
      variables: {
        assignedby: this.state.username,
        assignedto: this.state.assignedto,
        description: this.state.description,
        enddate: this.state.enddate,
        preqtaskid: this.state.preqid,
        priority: this.state.priority_type,
        projectid: this.state.projectid,
        title: this.state.task_title,
      }, //optional
    };
    await makePromise(execute(link, operation))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        console.log(data);
        if (data.data.addTask.status === false) {
          this.props.alert.error(data.data.addTask.msg);
        }
        if (data.data.addTask.status === true) {
          this.props.alert.success("Success on adding Task");
          this.props.handleToUpdate();
        }
      })
      .catch((error) => {
        this.props.alert.error(error.message);
        console.log(error);
      });
    //if success redirect back
    this.props.handleToUpdate();
  }
  handleUpdate(sel, select) {
    this.setState({ preqid: sel, preqammout: select });
  }
  componentDidMount() {
    this.fetchTasksFilter();
  }
  render() {
    const { classes } = this.props;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();

    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    var dd1 = String(tomorrow.getDate()).padStart(2, "0");
    var mm1 = String(tomorrow.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy1 = tomorrow.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;
    tomorrow = yyyy1 + "-" + mm1 + "-" + dd1;
    const priority_type = [
      { value: "highest", label: "highest" },
      { value: "high", label: "high" },
      { value: "normal", label: "normal" },
      { value: "low", label: "low" },
    ];

    let listtask;
    if (this.state.loaded === 1) {
      listtask = (
        <Listseltask
          task={this.state.taskall}
          handleToUpdate={this.handleUpdate}
        />
      );
    }

    return (
      <FormControl>
        <Grid container item xs={12} justify="center">
          <Paper className={classes.root}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="title"
                  name="titile"
                  label="Task title"
                  fullWidth
                  onChange={(event) =>
                    this.setState({ task_title: event.target.value })
                  }
                  //   autoComplete="fname"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  multiline
                  id="description"
                  name="description"
                  label="Description"
                  fullWidth
                  onChange={(event) =>
                    this.setState({ description: event.target.value })
                  }

                  //   autoComplete="billing address-line2"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  select
                  id="priority_type"
                  name="priority_type"
                  label="priority_type"
                  helperText="priority type"
                  value={this.state.priority_type}
                  onChange={(event) =>
                    this.setState({ priority_type: event.target.value })
                  }
                  fullWidth
                  //   autoComplete="billing address-level2"
                >
                  {priority_type.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  id="date"
                  name="date"
                  label="StartDate"
                  defaultValue={today}
                  fullWidth
                  inputProps={{ readOnly: true }}
                  onChange={(event) =>
                    this.setState({
                      startdate: event.target.value + "T07:45:05.567947",
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  id="date"
                  name="date"
                  label="EndDate"
                  defaultValue={tomorrow}
                  fullWidth
                  onChange={(event) => {
                    console.log(event.target.value + "T07:45:05.567947");
                    this.setState({
                      enddate: event.target.value + "T07:45:05.567947",
                    });
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="assigned to"
                  name="assigned to"
                  label="Assigned To : Enter username seperated by a comma"
                  fullWidth
                  onChange={(event) => {
                    this.setState({
                      assignedto: event.target.value.split(","),
                    });
                    //   console.log(event.target.value.split(","));
                  }}
                  //   autoComplete="fname"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Select Prerequisite task</Typography>
                {listtask}
              </Grid>
            </Grid>
          </Paper>
          <Grid container xs={6} justify="center" spacing={3}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={(event) => this.handleClick(event)}
            >
              Add Task
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={this.props.handleToUpdate}
            >
              Back
            </Button>
          </Grid>
        </Grid>
      </FormControl>
    );
  }
}

export default withAlert()(withStyles(useStyles)(AddTask));
