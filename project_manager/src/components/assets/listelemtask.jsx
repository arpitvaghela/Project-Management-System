import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import WorkIcon from "@material-ui/icons/Work";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { createStyles, withStyles } from "@material-ui/core/styles";
//  import Card from "./Card";
// import ListSubheader from "@material-ui/core/ListSubheader";
const useStyles = createStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
}));
class Listelemtask extends React.Component {
  componentDidMount() {
    console.log(this.props);
  }
  render() {
    const { classes } = this.props;
    return (
      <ListItem
        button
        onClick={() => this.props.handleToUpdate(this.props.task.taskid)}
      >
        <ListItemAvatar>
          <Avatar className={classes.avatar}>
            <WorkIcon />
          </Avatar>
        </ListItemAvatar>
        <Grid container direction="column">
          <Typography variant="h6">{this.props.task.title}</Typography>

          <ListItemText
            primary={this.props.task.description}
            secondary={
              `Started: ` +
              this.props.task.starttime +
              ` Assignmed By: ` +
              this.props.task.assignedby
            }
          ></ListItemText>
          {/* <Card project={this.props.task}></Card> */}
        </Grid>
      </ListItem>
    );
  }
}

export default withStyles(useStyles)(Listelemtask);
