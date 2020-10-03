import React from "react";
import Header from "./components/Header";
import { createStyles, withStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Copyright from "./components/Copyright";
import Footer from "./components/Footer";
import clsx from "clsx";
import NotesList from "./components/NotesList";
import { Typography } from "@material-ui/core";
import browndesk from "./img/background.jpg";

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
    backgroundImage: `url(${browndesk})`,
    height: "100%",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  },
  fixedHeight: {
    display: "flex",
    alignItems: "center",
  },
}));

class Profiles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      authenticated: false,
      pagename: "settings",
      //   projectlist: { ongoing: null, completed: null },
    };

    // console.log(this.props.username);
    // console.log(this.props.location.state.username);
  }
  // call api here to get rest of user data from backend
  // this.handleClick = this.handleClick.bind(this);

  componentWillMount() {
    if (this.props.username !== undefined) {
      this.setState({
        username: this.props.username,
        authenticated: this.props.authenticated,
      });
    }
    if (this.props.location.state !== undefined) {
      this.setState({
        username: this.props.location.state.username,
        authenticated: this.props.location.state.authenticated,
      });
    } else {
      this.setState({
        username: "",
        authenticated: false,
      });
    }
  }
  componentDidMount() {
    console.log(this.state.username);
    console.log(this.state.authenticated);
  }

  render() {
    if (this.state.authenticated === false) {
      return <h1>Not Authenticated Go to Login Page and Login</h1>;
    }
    let aftermid = <NotesList username={this.state.username} />;
    const { classes } = this.props;
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    return (
      <div className={classes.root}>
        <CssBaseline />
        <Header
          string={"User:" + this.state.username}
          username={this.state.username}
          authenticated={this.state.authenticated}
        />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="xl" className={classes.container}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8} lg={9} alignItems="center">
                <Paper className={fixedHeightPaper}>
                  <Typography variant="h1">
                    This Page is Under Construction!.
                  </Typography>
                </Paper>
              </Grid>
              {aftermid}
              <Footer />
            </Grid>
            <Box pt={4}>
              <Copyright />
            </Box>
          </Container>
        </main>
      </div>
    );
  }
}
export default withStyles(useStyles)(Profiles);
