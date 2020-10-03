import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import PropTypes from "prop-types";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { createStyles, withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Title from "./components/Title";
import { Redirect } from "react-router-dom";
import Copyright from "./components/Copyright";
import { execute, makePromise } from "apollo-link";
import { authenticate, link } from "./queries";

// import { useAlert } from "react-alert";
import { withAlert } from "react-alert";
const useStyles = createStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      authenticated: false,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    console.log(this.state.username);
    console.log(this.state.password);
    const operation = {
      query: authenticate,
      variables: {
        username: this.state.username,
        password: this.state.password,
      }, //optional
    };

    makePromise(execute(link, operation))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        console.log(data);
        if (data.data.authenticate === true) {
          this.props.alert.success("Login Successfull");

          this.setState({ authenticated: true });
        } else {
          this.props.alert.error("Login Failed username or password wrong");
        }
      })
      .catch((error) => console.log(`received error ${error}`));
  }

  render() {
    const { classes } = this.props;

    if (this.state.authenticated) {
      return (
        <Redirect
          to={{
            pathname: "/dashboard",
            state: {
              username: this.state.username,
              authenticated: this.state.authenticated,
            },
          }}
        />
      );
    }
    return (
      <Container component="main" maxWidth="lg">
        <Title />
        <Container component="main" maxWidth="sm">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="username"
                label="username"
                name="username"
                autoComplete="username"
                autoFocus
                onChange={(event) =>
                  this.setState({ username: event.target.value })
                }
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(event) =>
                  this.setState({ password: event.target.value })
                }
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={(event) => this.handleClick(event)}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="signup-page" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
          <Box mt={8}>
            <Copyright />
          </Box>
        </Container>
      </Container>
    );
  }
}

SignIn.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withAlert()(withStyles(useStyles)(SignIn));
