import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import WorkIcon from "@material-ui/icons/Work";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { createStyles, withStyles } from "@material-ui/core/styles";
import { ListItemSecondaryAction, Checkbox, Button } from "@material-ui/core";
import { withAlert } from "react-alert";

// import { withAlert } from "react-alert";
//  import Card from "./Card";
// import ListSubheader from "@material-ui/core/ListSubheader";
const useStyles = createStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(2),
  },
}));
class Listdelproj extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      del: [],
      selected: 0,
    };
    // this.managestate = this.managestate.bind(this);
  }

  componentDidUpdate() {
    if (this.state.selected > 1) {
      this.props.alert.info("deleting more than one project is not advised");
    }
  }

  render() {
    const { classes } = this.props;
    let list = this.props.project.map((project) => (
      <>
        <ListItem button>
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              <WorkIcon />
            </Avatar>
          </ListItemAvatar>
          <Grid container direction="column">
            <Typography variant="h6">{project.name}</Typography>

            <ListItemText
              primary={project.shortdescription}
              secondary={
                `Started: ` + project.date + ` Created By: ` + project.username
              }
            ></ListItemText>
            <ListItemSecondaryAction>
              <Checkbox
                edge="end"
                onChange={(event) => {
                  if (event.target.checked) {
                    let okay = this.state.del;
                    this.setState({ del: okay.concat([project.projectid]) });
                    this.setState({ selected: this.state.selected + 1 });
                  } else {
                    let okay = this.state.del;
                    const index = okay.indexOf(project.projectid);
                    if (index > -1) {
                      okay.splice(index, 1);
                    }
                    this.setState({ del: okay });
                    this.setState({ selected: this.state.selected - 1 });
                  }
                  console.log("selected:" + this.state.selected);
                }}
              />
            </ListItemSecondaryAction>
            {/* <Card project={this.props.project}></Card> */}
          </Grid>
        </ListItem>
      </>
    ));
    let button = (
      <Grid container justify="center">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={(event) =>
            this.props.handleToUpdate(this.state.del, this.state.selected)
          }
        >
          Delete Project
        </Button>
      </Grid>
    );
    return [button, list];
  }
}

export default withAlert()(withStyles(useStyles)(Listdelproj));
