import React from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import Listdeltask from "../assets/listdeltask";
import { Grid, Paper } from "@material-ui/core";
import { withAlert } from "react-alert";
import { deleteTask, link } from "../queries";
import { execute, makePromise } from "apollo-link";
const useStyles = createStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  button: {
    padding: theme.spacing(2),
  },
}));

class DeleteTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskid: [],
      selected: 0,
      deleteflag: 0,
      tasks: this.props.tasks,
      username: "",
      projectid: "",
    };
    this.handleUpdate = this.handleUpdate.bind(this);
    // this.handleClick = this.handleClick.bind(this);
  }
  handleUpdate(projid, number) {
    let success;
    this.setState({ taskid: projid, selected: number, deleteflag: 1 });
    let x;
    for (x of projid) {
      const operation = {
        query: deleteTask,
        variables: {
          username: this.state.username,
          taskid: x,
        }, //optional
      };

      makePromise(execute(link, operation)) // eslint-disable-next-line
        .then((data) => {
          console.log(data);
          // console.log(`received data ${JSON.stringify(data, null, 2)}`)
          if (data.data.deleteTask.status === false) {
            this.props.alert.error(data.data.deleteTask.msg);
          }
          if (data.data.deleteTask.status === true) {
            // eslint-disable-next-line
            this.props.alert.success("Success on delete");
          }
        })
        .catch((error) => this.props.alert.error(error));
    }

    success = true;
    if (success) this.props.handleToUpdate();
  }
  componentDidUpdate() {
    if (this.state.deleteflag === 1) {
      this.setState({ deleteflag: 0 });
      this.props.alert.success("sucessfully deleted");
      this.props.handleToUpdate();

      //call delete here
    }
  }
  componentWillMount() {
    this.setState({
      username: this.props.username,
      projectid: this.props.projectid,
    });
  }
  render() {
    const { classes } = this.props;
    return (
      <Grid
        container
        item
        xs={12}
        justify="center"
        alignItems="center"
        direction="column"
      >
        <Grid
          container
          xs={6}
          justify="center"
          className={classes.button}
        ></Grid>
        <Paper className={classes.root}>
          <Listdeltask
            task={this.state.tasks}
            handleToUpdate={this.handleUpdate}
          />
        </Paper>
      </Grid>
    );
  }
}

export default withAlert()(withStyles(useStyles)(DeleteTask));
