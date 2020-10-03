import React from "react";
import { withStyles, Grid } from "@material-ui/core";
import { createStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import List from "@material-ui/core/List";
import Listelemproj from "../assets/listelemproj";
// import Card from "./Card";
const useStyles = createStyles((theme) => ({
  root: {
    display: "flex",
    width: "90%",
  },
  list: {
    width: "100%",
    maxWidth: 360,
  },
}));

class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      projectlist: this.props.projectlist,
      projectid: 42069,
      redirect: 0,
    };
    this.handleToUpdate = this.handleToUpdate.bind(this);
  }

  handleToUpdate(someArg) {
    this.setState({ projectid: someArg, redirect: 1 });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.projectid !== this.state.projectid) {
      this.props.handleToUpdate(this.state.projectid, this.state.redirect);
    }
  }

  componentDidMount() {
    this.setState({ projectlist: this.props.projectlist });
    console.log(this.state.projectlist);
  }
  render() {
    const classes = useStyles();
    let ListElement;
    if (this.state.value === 0) {
      let projectson = this.state.projectlist.ongoing.concat(
        this.state.projectlist.completed
      );

      let listItems1 = projectson.map((projectson) => (
        <Listelemproj
          project={projectson}
          handleToUpdate={this.handleToUpdate}
        />
      ));

      ListElement = <List className={classes.list}>{listItems1}</List>;
    }
    if (this.state.value === 1) {
      let projectson = this.state.projectlist.ongoing;
      let listItems1 = projectson.map((projectson) => (
        <Listelemproj
          project={projectson}
          handleToUpdate={this.handleToUpdate}
        />
      ));
      ListElement = <List className={classes.list}>{listItems1}</List>;
    }
    if (this.state.value === 2) {
      // console.log(projectscom);
      let projectscom = this.state.projectlist.completed;
      let listItems2 = projectscom.map((projectscom) => (
        <Listelemproj
          project={projectscom}
          handleToUpdate={this.handleToUpdate}
        />
      ));
      ListElement = <List className={classes.list}>{listItems2}</List>;
    }

    return (
      <Grid container justify="center" xs={12}>
        {" "}
        <Paper className={classes.root}>
          <Tabs
            value={this.state.value}
            onChange={(event, value) => this.setState({ value: value })}
            indicatorColor="primary"
            textColor="primary"
            centered
            variant="fullWidth"
          >
            <Tab label="All Projects" />
            <Tab label="Ongoing Projects" />
            <Tab label="Completed Projects" />
          </Tabs>
          {ListElement}
        </Paper>
      </Grid>
    );
  }
}

export default withStyles(useStyles)(ProjectList);
// export default ProjectList;
