import React from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import Listdelproj from "../assets/listdelproj";
import { Paper } from "@material-ui/core";
import { withAlert } from "react-alert";
import { deleteProject, link } from "../queries";
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

class DeleteProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectid: [],
      selected: 0,
      deleteflag: 0,
      projects: this.props.projects,
      username: "",
    };
    this.handleUpdate = this.handleUpdate.bind(this);
    // this.handleClick = this.handleClick.bind(this);
  }
  handleUpdate(projid, number) {
    let success = false;
    this.setState({ projectid: projid, selected: number, deleteflag: 1 });
    let x;
    for (x of projid) {
      const operation = {
        query: deleteProject,
        variables: {
          username: this.state.username,
          projectid: x,
        }, //optional
      };

      makePromise(execute(link, operation)) // eslint-disable-next-line
        .then((data) => {
          console.log(data);
          // console.log(`received data ${JSON.stringify(data, null, 2)}`)
          if (data.data.deleteProject.status === false) {
            this.props.alert.error(data.data.deleteProject.msg);
          }
          if (data.data.deleteProject.status === true) {
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
    this.setState({ username: this.props.username });
  }
  render() {
    const { classes } = this.props;
    let projectson = this.state.projects.ongoing.concat(
      this.state.projects.completed
    );
    return (
      <Paper className={classes.root}>
        <Listdelproj project={projectson} handleToUpdate={this.handleUpdate} />
      </Paper>
    );
  }
}

export default withAlert()(withStyles(useStyles)(DeleteProject));
