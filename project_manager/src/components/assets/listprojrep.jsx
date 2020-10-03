import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import FileCopy from "@material-ui/icons/FileCopy";
// import Paper from "@material-ui/core/Paper";
import { Typography, CssBaseline } from "@material-ui/core";

import { createStyles, withStyles } from "@material-ui/core/styles";
const useStyles = createStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
}));
class Listprojrep extends React.Component {
  render() {
    const { classes } = this.props;
    let projectlist = this.props.projects.map((projects) => (
      <ListItem
        button
        onClick={() => this.props.handleToUpdate(projects.projectid)}
      >
        <ListItemAvatar>
          <Avatar className={classes.avatar}>
            <FileCopy />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={projects.name}
          secondary={`Last updated: ` + projects.shortdescription}
        ></ListItemText>
        {/* <Card project={this.props.project}></Card> */}
      </ListItem>
    ));
    // console.log(this.props.files);
    return (
      <>
        <CssBaseline />
        <Typography variant="h5">Your Project List for Reports</Typography>
        {projectlist}
      </>
    );
    // return projectlist;
  }
}

export default withStyles(useStyles)(Listprojrep);
