import React from "react";
import { createStyles, withStyles } from "@material-ui/core/styles";
import { Grid, Paper, TextField, MenuItem, Button } from "@material-ui/core";
import { execute, makePromise } from "apollo-link";
import { addNote, link } from "../queries";
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
    // width: "36%",
  },
}));

class AddNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.username,
      title: "",
      description: "",
      color: "",
      fetchmethod: "",
      projectid: this.props.projectid,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    if (this.props.fetchmethod) {
      this.setState({ fetchmethod: this.props.fetchmethod });
    }
  }
  handleClick() {
    //call mutation here
    console.log("do this");
    if (this.state.fetchmethod === "user") {
      console.log("didthis");
      const operation = {
        query: addNote,
        variables: {
          title: this.state.title,
          color: this.state.color,
          description: this.state.description,
          username: this.state.username,
        }, //optional
      };

      makePromise(execute(link, operation))
        .then((data) => {
          // console.log(`received data ${JSON.stringify(data, null, 2)}`)
          console.log(data);
          if (data.data.addNote.status === false) {
            this.props.alert.error(data.data.addNote.msg);
          }
          if (data.data.addNote.status === true) {
            this.props.alert.success("Success on adding note");
            this.props.handleToUpdate();
          }
        })
        .catch((error) => this.props.alert.error(error));
    }
    if (this.state.fetchmethod === "project") {
      // eslint-disable-next-line
      {
        console.log(this.state.projectid);
        console.log("didthis2");
        const operation = {
          query: addNote,
          variables: {
            title: this.state.title,
            color: this.state.color,
            description: this.state.description,
            username: this.state.username,
            projectid: this.state.projectid,
          }, //optional
        };

        makePromise(execute(link, operation))
          .then((data) => {
            // console.log(`received data ${JSON.stringify(data, null, 2)}`)
            if (data.data.addNote.status === false) {
              this.props.alert.error(data.data.addNote.msg);
            }
            if (data.data.addNote.status === true) {
              this.props.alert.success("Success on adding note");
              this.props.handleToUpdate();
              console.log(this.state.projectid);
            }
          })
          .catch((error) => this.props.alert.error(error));
      }
    }
    //on sucess redirect

    // Different Mutation Called Based on fetch method
  }
  render() {
    const { classes } = this.props;
    const color = [
      { value: "red", label: "red" },
      { value: "green", label: "green" },
      { value: "blue", label: "blue" },
    ];
    let body = (
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
            <Grid item xs={12} sm={6}>
              <TextField
                required
                select
                id="color"
                name="color"
                label="color"
                value={this.state.color}
                fullWidth
                onChange={(event) =>
                  this.setState({ color: event.target.value })
                }
                //   autoComplete="billing address-level2"
              >
                {color.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={this.handleClick}
        >
          Add
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
    );
    return body;
  }
}

export default withAlert()(withStyles(useStyles)(AddNote));
