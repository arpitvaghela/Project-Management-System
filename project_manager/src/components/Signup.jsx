import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { createStyles, withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Title from "./components/Title";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import Copyright from "./components/Copyright";
// import { gql } from "apollo-boost";
import { execute, makePromise } from "apollo-link";
import { createUser, link } from "./queries";
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

// const createUser = gql`
//   mutation(
//     $firstname: String!
//     $lastname: String!
//     $username: String!
//     $emailid: String!
//     $password: String!
//   ) {
//     createUser(
//       firstname: $firstname
//       lastname: $lastname
//       username: $username
//       emailid: $emailid
//       password: $password
//     ) {
//       msg
//       status
//     }
//   }
// `;

class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      password: "",
      signup: false,
      // mutatatefunc: null,
      message: "",
      // data: [],
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    //call mutation query for graphql here
    event.preventDefault();
    const operation = {
      query: createUser,
      variables: {
        firstname: this.state.first_name,
        lastname: this.state.last_name,
        emailid: this.state.email,
        username: this.state.username,
        password: this.state.password,
      }, //optional
    };

    makePromise(execute(link, operation))
      .then((data) => {
        // console.log(`received data ${JSON.stringify(data, null, 2)}`)
        console.log(data);
        if (data.data.createUser.status === true) {
          this.props.alert.success("Created User Succesfully");
          this.setState({ signup: data.data.createUser.status });
        } else {
          this.props.alert.error(data.data.createUser.msg);
        }
        this.setState({ message: data.data.createUser.msg });

        // console.log(data.data.createUser.status);
        // console.log(data.createUser.status);
        console.log(this.state.signup);
        console.log(this.state.message);
      })
      .catch((error) => console.log(`received error ${error}`));

    // You can also easily pass variables for dynamic arguments

    // this.setState({ signup: signupsucess });
  }
  render() {
    const { classes } = this.props;
    if (this.state.signup) {
      return (
        <Redirect
          to={{
            pathname: "/login-page",
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
              Sign up
            </Typography>
            <form className={classes.form} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="fname"
                    name="firstName"
                    variant="outlined"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    onChange={(event) =>
                      this.setState({ first_name: event.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="lname"
                    onChange={(event) =>
                      this.setState({ last_name: event.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="username"
                    label="username"
                    name="username"
                    autoComplete="username"
                    onChange={(event) =>
                      this.setState({ username: event.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="email"
                    label="email"
                    name="email"
                    autoComplete="email"
                    onChange={(event) =>
                      this.setState({ email: event.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
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
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={(event) => this.handleClick(event)}
              >
                Sign Up
              </Button>
              <Grid container justify="flex-end">
                <Grid item>
                  <Link href="login-page" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
          <Box mt={5}>
            <Copyright />
          </Box>
        </Container>
      </Container>
    );
  }
}
SignUp.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withAlert()(withStyles(useStyles)(SignUp));
