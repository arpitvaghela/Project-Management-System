import React from "react";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import DeleteRounded from "@material-ui/icons/DeleteRounded";
import { createStyles, withStyles } from "@material-ui/core/styles";
import Listfileproj from "../assets/listfileproj";
import { Typography, Paper, CssBaseline, Grid } from "@material-ui/core";
import { ListItem, List, Button } from "@material-ui/core/";
import PeopleIcon from "@material-ui/icons/People";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import { DropzoneDialog } from "material-ui-dropzone";
import DeleteFile from "./DeleteFile";
import EditProject from "./EditProject";
// import Typography from '@material-ui/core/Typography';

const useStyles = createStyles((theme) => ({
  divforbutton: {
    flexDirection: "row",
    padding: theme.spacing(1),
  },
  buttonclass: {
    margin: theme.spacing(3),
  },
  grid: {
    flexDirection: "row",
    flexGrow: 1,
  },
  root: {
    display: "flex",
    flexDirection: "row",
  },
  paper: {
    padding: theme.spacing(2),
    width: "90%",
  },
  listroot: {
    width: "100%",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
}));

class ProjectFileManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      projectid: 42069,
      fileid: 42069,
      viewname: "allfiles",
      filestoupload: [],
      open: false,
      username: this.props.username,
    };
    this.handleToUpdate = this.handleToUpdate.bind(this);
    this.handlePage = this.handlePage.bind(this);
  }
  componentWillMount() {
    this.setState({ files: this.props.files, projectid: this.props.projectid });
    // this.setState({ states: this.props.stateforedit });

    // console.log(this.props.files);
  }
  handleToUpdate(someArg) {
    this.setState({ fileid: someArg });
  }
  handlePage() {
    this.props.handleToUpdate();
    this.setState({ viewname: "allfiles" });
  }

  componentDidUpdate() {
    if (this.setState.viewname === "back") {
      this.props.handleToUpdate();
    }
    // console.log(this.state.states);
  }
  handleClose() {
    this.setState({
      open: false,
    });
  }

  handleSave(files) {
    //Saving files to state for further use and closing Modal.
    this.setState({
      filestoupload: files,
      open: false,
    });
    // Upload files to server here
  }

  handleOpen() {
    this.setState({
      open: true,
    });
  }

  render() {
    const { classes } = this.props;
    let top, mid;
    top = (
      <Grid container justify="center" direction="row">
        {/* <Typography variant="h4">Manage Files</Typography> */}
        <Fab
          color="primary"
          aria-label="add"
          className={classes.buttonclass}
          onClick={(event) =>
            this.setState({ viewname: "addfile", open: true })
          }
        >
          <AddIcon />
        </Fab>
        <Fab
          color="secondary"
          aria-label="delete"
          className={classes.buttonclass}
          onClick={(event) => this.setState({ viewname: "deletefile" })}
        >
          <DeleteRounded />
        </Fab>
        <Button
          variant="contained"
          color="primary"
          aria-label="edit"
          className={classes.buttonclass}
          onClick={(event) => this.setState({ viewname: "editproject" })}
        >
          Edit
        </Button>
        <DropzoneDialog
          open={this.state.open}
          onSave={this.handleSave.bind(this)}
          // acceptedFiles={["image/jpeg", "image/png", "image/bmp"]}
          showPreviews={true}
          maxFileSize={5000000}
          onClose={this.handleClose.bind(this)}
        />
      </Grid>
    );

    if (
      this.state.viewname === "allfiles" ||
      this.state.viewname === "addfile"
    ) {
      mid = (
        <>
          <CssBaseline />
          <Grid container justify="center" direction="row" spacing={2}>
            <Grid
              item
              direction="row"
              justify="center"
              className={classes.root}
              xs={12}
              sm={6}
            >
              <Paper className={classes.paper}>
                <Typography variant="h4">Your Project Details</Typography>
                <Typography variant="subtitle1">
                  {`Date created:` + this.props.date}
                </Typography>
                <Typography variant="subtitle1">
                  {" "}
                  {`Description:` + this.props.description}{" "}
                </Typography>
                <Typography variant="subtitle1">Project Members:</Typography>
                <List className={classes.listroot}>
                  {
                    <>
                      {this.props.members.map((members) => (
                        <ListItem button>
                          <ListItemAvatar>
                            <Avatar className={classes.avatar}>
                              <PeopleIcon></PeopleIcon>
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={members.user.username}
                            secondary={members.role}
                          />
                        </ListItem>
                      ))}
                    </>
                  }
                </List>
              </Paper>
            </Grid>
            <Grid
              item
              direction="row"
              justify="center"
              className={classes.root}
              xs={12}
              sm={6}
            >
              <Paper className={classes.paper}>
                <Listfileproj
                  files={this.state.files}
                  handleToUpdate={this.handleToUpdate}
                  description={this.state.description}
                />
              </Paper>
            </Grid>
          </Grid>
        </>
      );
    }

    if (this.state.viewname === "deletefile") {
      mid = <DeleteFile handleToUpdate={this.handlePage} />;
    }
    if (this.state.viewname === "editproject") {
      mid = (
        <EditProject
          projectid={this.state.projectid}
          name={this.props.name}
          date={this.props.date}
          path={this.props.path}
          username={this.props.username}
          shortdescription={this.props.shortdescription}
          description={this.props.description}
          members={this.props.members}
          handleToUpdate={this.handlePage}
        />
      );
    }

    return [top, mid];
  }
}

export default withStyles(useStyles)(ProjectFileManager);
