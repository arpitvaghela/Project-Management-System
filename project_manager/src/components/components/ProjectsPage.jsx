import React from "react";
import { Container, Grid, Typography, Box } from "@material-ui/core";
import { withStyles } from "@material-ui/core";
import { createStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import backgrondimage from "../img/background.jpg";
import clsx from "clsx";
import Copyright from "./Copyright";
import ProjectFileManager from "./ProjectFileManager";
import TaskManagerProj from "./TaskManagerProj";
import NotesList from "./NotesList";
import { execute, makePromise } from "apollo-link";
import { getProject, link } from "../queries";
import { withAlert } from "react-alert";
const useStyles = createStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
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
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  divforbutton: {
    flexDirection: "row",
    padding: theme.spacing(3),
  },
  buttonclass: {
    margin: theme.spacing(3),
  },
  headinger: {
    padding: theme.spacing(1),
    // background: "#FFFFFF",
  },
  background: {
    backgroundImage: `url(${backgrondimage})`,
    backgroundSize: "cover",

    backgroundRepeat: "no-repeat",
  },
  maxheightpaper: {
    height: "100%",
  },
}));

class ProjectsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectid: this.props.projectid,
      name: "ProjectPage",
      date: "",
      path: "",
      username: this.props.username,
      shortdescription: "",
      longdescription:
        "Chal Hai ayyarrr idhhar kuchsdnisavue rbvaeuyvgiekru vbveryguviuaegivg evhaegivygeyg vkeviuaegvcvvbwaryvgauyv vabuiusvyd auy waygci",
      files: [],
      members: [],
      createdby: {
        username: "",
      },
      loaded: 0,
      tasks: {
        ongoing: [],
        all: [],
        current: [],
        inactive: [],
        working: [],
      },
    };
    this.fetchData = this.fetchData.bind(this);
    this.handleToUpdate = this.handleToUpdate.bind(this);
  }

  async handleToUpdate() {
    await this.fetchData();
  }
  async fetchData() {
    const operation1 = {
      query: getProject,
      variables: {
        username: this.props.username,
        projectid: this.props.projectid,
      }, //optional
    };
    await makePromise(execute(link, operation1))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        console.log(data);
        this.setState({
          name: data.data.getProject.name,
          createdon: data.data.getProject.createdon,
          createdby: data.data.getProject.createdby.username,
          path: data.data.getProject.path,
          shortdescription: data.data.getProject.shortdescription,
          longdescription: data.data.getProject.longdescription,
          members: data.data.getProject.members,
          loaded: 1,
        });
      })
      .catch((error) => console.log(error));
  }

  componentWillMount() {
    if (this.props.projectid !== undefined) {
      this.setState({
        projectid: this.props.projectid,
      });
      this.setState({ username: this.props.username });
    }

    this.setState({
      files: [
        { fileid: 1, filename: "Okay 1", lastupdated: "2020-04-04" },
        {
          fileid: 2,
          filename: "Okay 2",
          lastupdated: "2020-04-04",
        },
        {
          fileid: 3,
          filename: "Okay 3",
          lastupdated: "2020-04-04",
        },
      ],
      tasks: {
        ongoing: [],
        all: [],
        current: [],
        inactive: [],
        working: [],
      },
    });
    this.fetchData();

    // console.log(this.state.tasks);
  }

  render() {
    let projectmid, notes, tasks;

    const { classes } = this.props;
    // const fixedHeightPaper1 = clsx(
    //   classes.paper,
    //   classes.fixedHeight,
    //   classes.background
    // );
    const fixedHeightPaper2 = clsx(
      classes.paper,
      classes.fixedHeight,
      classes.background
    );

    if (this.state.loaded === 1) {
      projectmid = (
        <ProjectFileManager
          files={this.state.files}
          projectid={this.state.projectid}
          members={this.state.members}
          description={this.state.longdescription}
          shortdescription={this.state.shortdescription}
          date={this.state.createdon}
          path={this.state.path}
          name={this.state.name}
          username={this.state.username}
          handleToUpdate={this.handleToUpdate}
        />
      );
    }

    notes = (
      <NotesList
        username={this.state.username}
        projectid={this.state.projectid}
      />
    );
    tasks = (
      <TaskManagerProj
        username={this.state.username}
        projectid={this.state.projectid}
        tasks={this.state.tasks}
      />
    );

    // const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    return (
      <Container maxWidth="xl" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={9}>
            <Paper className={fixedHeightPaper2}>
              <Typography variant="h3" className={classes.headinger}>
                {this.state.name}
              </Typography>
              {projectmid}
            </Paper>
          </Grid>
          {notes}
          {tasks}
        </Grid>
        <Box pt={4}>
          <Copyright />
        </Box>
      </Container>
    );
  }
}

export default withAlert()(withStyles(useStyles)(ProjectsPage));
