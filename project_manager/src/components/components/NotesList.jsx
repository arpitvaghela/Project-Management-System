import React from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import { Grid, Paper, Typography, Button } from "@material-ui/core";
import clsx from "clsx";
import Listnotes from "../assets/listnotes";
import AddNote from "./AddNote";
import DeleteNote from "./DeleteNote";
import { execute, makePromise } from "apollo-link";
import { myNotes, projectNotes, link } from "../queries";
import { withAlert } from "react-alert";
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
  },
  fixedHeight: {
    display: "flex",
    alignItems: "center",
  },
  innerpaper: {
    display: "flex",
    width: "100%",
    // maxWidth: "100%",
  },
}));

class NotesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      action: "view",
      notes: [],
      username: this.props.username,
      projectid: this.props.projectid,
      fetchmethod: "user", // or project
    };
    this.pageUpdate = this.pageUpdate.bind(this);
  }
  pageUpdate() {
    this.setState({ action: "view" });
    // this.setState()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.action !== "view" && this.state.action === "view") {
      if (this.state.projectid === undefined) {
        this.setState({ fetchmethod: "user" });
        const operation = {
          query: myNotes,
          variables: {
            username: this.state.username,
          }, //optional
        };

        makePromise(execute(link, operation))
          .then((data) => {
            // console.log(`received data ${JSON.stringify(data, null, 2)}`)
            this.setState({ notes: data.data.myNotes });
          })
          .catch((error) => this.props.alert.error(error));
      } else {
        this.setState({ fetchmethod: "project" });
        console.log(this.state.projectid);
        const operation2 = {
          query: projectNotes,
          variables: {
            projectid: this.state.projectid,
          }, //optional
        };

        makePromise(execute(link, operation2))
          .then((data) => {
            // console.log(`received data ${JSON.stringify(data, null, 2)}`)
            this.setState({ notes: data.data.projectNotes });
          })
          .catch((error) => this.props.alert.error(error));
      }
    }
  }

  componentWillMount() {
    if (this.props.projectid === undefined) {
      this.setState({ fetchmethod: "user" });
      const operation = {
        query: myNotes,
        variables: {
          username: this.state.username,
        }, //optional
      };

      makePromise(execute(link, operation))
        .then((data) => {
          // console.log(`received data ${JSON.stringify(data, null, 2)}`)
          this.setState({ notes: data.data.myNotes });
        })
        .catch((error) => this.props.alert.error(error));
    } else {
      this.setState({ fetchmethod: "project" });
      console.log(this.state.projectid);
      console.log(this.props.projectid);
      const operation2 = {
        query: projectNotes,
        variables: {
          projectid: this.props.projectid,
        }, //optional
      };

      makePromise(execute(link, operation2))
        .then((data) => {
          console.log(data);
          this.setState({ notes: data.data.projectNotes });
        })
        .catch((error) => this.props.alert.error(error));
    }

    ///fetch notes here
  }

  render() {
    let body;
    const { classes } = this.props;
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    if (this.state.action === "view") {
      body = (
        <Listnotes notes={this.state.notes} handleToUpdate={this.pageUpdate} />
      );
    }
    if (this.state.action === "add") {
      body = (
        <AddNote
          username={this.state.username}
          projectid={this.state.projectid}
          fetchmethod={this.state.fetchmethod}
          handleToUpdate={this.pageUpdate}
        />
      );
    }
    if (this.state.action === "delete") {
      body = (
        <DeleteNote
          username={this.state.username}
          projectid={this.state.projectid}
          fetchmethod={this.state.fetchmethod}
          handleToUpdate={this.pageUpdate}
          notes={this.state.notes}
        />
      );
    }

    return (
      <Grid item xs={12} md={4} lg={3}>
        <Paper className={fixedHeightPaper}>
          <Typography variant="h5">Your Notes</Typography>
          <Grid container item justify="center" direction="row">
            <Button
              color="primary"
              aria-label="edit"
              className={classes.buttonclass}
              onClick={(event) => this.setState({ action: "add" })}
            >
              Add Note
            </Button>
            <Button
              color="primary"
              aria-label="edit"
              className={classes.buttonclass}
              onClick={(event) => this.setState({ action: "delete" })}
            >
              Delete
            </Button>
          </Grid>
          {body}
        </Paper>
      </Grid>
    );
  }
}

export default withAlert()(withStyles(useStyles)(NotesList));
