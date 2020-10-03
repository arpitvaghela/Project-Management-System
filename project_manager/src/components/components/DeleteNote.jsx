import React from "react";
import ListItem from "@material-ui/core/ListItem";
import {
  Typography,
  CssBaseline,
  Checkbox,
  Grid,
  Button,
} from "@material-ui/core";
import { createStyles, withStyles } from "@material-ui/core/styles";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import { delNote, link } from "../queries";
import { execute, makePromise } from "apollo-link";
import { withAlert } from "react-alert";
const useStyles = createStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  root: {
    width: "100%",
  },
}));
class DeleteNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      del: [],
      selected: 0,
      deleteflag: 0,
      tasks: [],
      username: this.props.username,
      projectid: this.props.projectid,
    };
    this.handleClick = this.handleClick.bind(this);
    // this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    //call delete here
    let notesid = this.state.del;
    console.log(notesid);
    //call delete here
    let success = false;
    let x;
    for (x of notesid) {
      const operation = {
        query: delNote,
        variables: {
          username: this.state.username,
          noteid: x,
        }, //optional
      };

      makePromise(execute(link, operation)) // eslint-disable-next-line
        .then((data) => {
          console.log(data);
          // console.log(`received data ${JSON.stringify(data, null, 2)}`)
          if (data.data.deleteNote.status === false) {
            this.props.alert.error(data.data.deleteNote.msg);
          }
          if (data.data.deleteNote.status === true) {
            // eslint-disable-next-line
            this.props.alert.success("Success on delete");
          }
        })
        .catch((error) => this.props.alert.error(error));
    }
    success = true;
    if (success) this.props.handleToUpdate();
  }
  render() {
    // console.log(this.props.notes);
    const { classes } = this.props;
    let notes = this.props.notes.map((notes) => (
      <ListItem button>
        <Card className={classes.root}>
          <CardContent>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              Your Note
            </Typography>
            <Typography variant="h5" component="h2">
              {notes.title}
            </Typography>
            <Typography className={classes.pos} color="textSecondary">
              Description
            </Typography>
            <Typography variant="body2" component="p">
              {notes.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Checkbox
              edge="end"
              onChange={(event) => {
                if (event.target.checked) {
                  let okay = this.state.del;
                  this.setState({ del: okay.concat([notes.noteid]) });
                  this.setState({ selected: this.state.selected + 1 });
                } else {
                  let okay = this.state.del;
                  const index = okay.indexOf(notes.noteid);
                  if (index > -1) {
                    okay.splice(index, 1);
                  }
                  this.setState({ del: okay });
                  this.setState({ selected: this.state.selected - 1 });
                }
                console.log("selected:" + this.state.selected);
              }}
            />
          </CardActions>
        </Card>
      </ListItem>
    ));
    let button = (
      <Grid container justify="center" spacing={-4}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={this.handleClick}
        >
          Delete Note
        </Button>
      </Grid>
    );
    // console.log(this.props.files);
    return (
      <>
        <CssBaseline />
        {button}
        {notes}
      </>
    );
    // return filelist;
  }
}

export default withAlert()(withStyles(useStyles)(DeleteNote));
