import React from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import { Grid, TextField, Paper, Button, MenuItem } from "@material-ui/core";
import { execute, makePromise } from "apollo-link";
import { updateTask, link } from "../queries";
import { withAlert } from "react-alert";
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
    width: "36%",
  },
}));

class EditTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.username,
      projectid: this.props.projectid,
      taskid: this.props.taskid,
      title: this.props.title,
      description: this.props.description,
      starttime: this.props.starttime,
      endtime: this.props.endtime,
      status_type: this.props.status_type,
      completiontime: this.props.completiontime,
      priority_type: this.props.priority_type,
      assignedby: this.props.assignedby,
      assignedto: this.props.assignedto,
      preqtaskid: this.props.preqtaskid,
      viewname: "taskdetails", // edit task
    };
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    if (this.props.username !== undefined) {
      this.setState({ username: this.props.username });
    }
    this.setState(this.props.states);
    this.setState({ assignedto: [] });
    console.log(this.props.assignedto);
  }
  async handleClick(event) {
    // event.preventDefault();
    // console.log(this.state.assignedto);
    // console.log("Clicker");
    //if success redirect back
    const operation = {
      query: updateTask,
      variables: {
        assignedto: this.state.assignedto,
        description: this.state.description,
        enddate: this.state.enddate,
        priority: this.state.priority_type,
        taskid: this.state.taskid,
        title: this.state.title,
        username: this.state.username,
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
          this.props.alert.success("Success on editing Task");
          this.props.handleToUpdate();
          // this.props.handleToUpdate();
        }
      })
      .catch((error) => {
        this.props.alert.error(error.message);
        console.log(error);
      });
  }
  render() {
    const { classes } = this.props;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    const priority_type = [
      { value: "highest", label: "highest" },
      { value: "high", label: "high" },
      { value: "normal", label: "normal" },
      { value: "low", label: "low" },
    ];
    today = yyyy + "-" + mm + "-" + dd;

    return (
      <>
        <Paper className={classes.root}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                id="title"
                name="titile"
                label="Task title"
                fullWidth
                value={this.state.title}
                onChange={(event) =>
                  this.setState({ title: event.target.value })
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
                value={this.state.description}
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                id="date"
                name="date"
                helperText="EndDate:Change Only if you want to edit"
                // defaultValue={this.state.endtime}
                fullWidth
                onChange={(event) =>
                  this.setState({
                    enddate: event.target.value + "T07:45:05.567947",
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                id="title"
                name="titile"
                label="Assigned To : Enter username seperated by a comma"
                fullWidth
                defaultValue={JSON.stringify(this.state.assignedto)}
                value={this.state.assignedto}
                onChange={(event) => {
                  this.setState({
                    assignedto: event.target.value.split(","),
                  });
                }}
                //
                //   autoComplete="fname"
              />
            </Grid>
          </Grid>
        </Paper>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={(event) => this.handleClick(event)}
        >
          Edit Task
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
      </>
    );
  }
}

export default withAlert()(withStyles(useStyles)(EditTask));
