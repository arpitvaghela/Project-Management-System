import { gql } from "apollo-boost";
import { HttpLink } from "apollo-link-http";
const uri = "http://localhost:5000/graphql-api";
export const link = new HttpLink({ uri });
export const createUser = gql`
  mutation(
    $firstname: String!
    $lastname: String!
    $username: String!
    $emailid: String!
    $password: String!
  ) {
    createUser(
      firstname: $firstname
      lastname: $lastname
      username: $username
      emailid: $emailid
      password: $password
    ) {
      msg
      status
    }
  }
`;
export const authenticate = gql`
  query($username: String!, $password: String!) {
    authenticate(username: $username, password: $password)
  }
`;

export const getUser = gql`
  query($username: String!) {
    getUser(username: $username) {
      firstname
      lastname
      email
    }
  }
`;

export const myNotes = gql`
  query($username: String!) {
    myNotes(username: $username) {
      noteid
      title
      description
      color
      createdby
      createdat
    }
  }
`;

export const getTask = gql`
  query($taskid: Int!) {
    getTask(taskid: $taskid) {
      taskid
      title
      description
      starttime
      endtime
      completiontime
      status
      priority
      projectid
      assignedby
      assignedto {
        username
      }
      preqtask
    }
  }
`;

export const preqTask = gql`
  query($taskid: Int!) {
    getTask(taskid: $taskid) {
      taskid
      title
      description
      status
      priority
    }
  }
`;

export const projectNotes = gql`
  query($projectid: Int!) {
    projectNotes(projectid: $projectid) {
      noteid
      title
      description
      color
      createdby
      createdat
    }
  }
`;

export const myProjects = gql`
  query($username: String!, $projectFilter: String) {
    myProjects(username: $username, projectFilter: $projectFilter) {
      projectid
      name
      shortdescription
      longdescription
      createdon
      path
      createdby {
        username
      }
      members {
        user {
          username
        }
        role
      }
    }
  }
`;

export const getProject = gql`
  query($username: String!, $projectid: Int!) {
    getProject(username: $username, projectid: $projectid) {
      projectid
      name
      shortdescription
      longdescription
      createdon
      path
      createdby {
        username
      }
      members {
        user {
          username
        }
        role
      }
    }
  }
`;

export const myTasks = gql`
  query($username: String!, $taskFilter: String) {
    myTasks(username: $username, taskFilter: $taskFilter) {
      taskid
      title
      description
      starttime
      endtime
      completiontime
      status
      priority
      projectid
      assignedby
      assignedto {
        username
        firstname
        lastname
        email
      }
      preqtask
    }
  }
`;

export const ProjectTasks = gql`
  query($username: String!, $projectid: Int!, $taskFilter: String) {
    ProjectTasks(
      username: $username
      projectid: $projectid
      taskFilter: $taskFilter
    ) {
      taskid
      title
      description
      starttime
      endtime
      completiontime
      status
      priority
      projectid
      assignedby
      assignedto {
        username
      }
      preqtask
    }
  }
`;

export const addNote = gql`
  mutation(
    $title: String!
    $color: String!
    $description: String!
    $username: String!
    $projectid: Int
  ) {
    addNote(
      title: $title
      color: $color
      description: $description
      username: $username
      projectid: $projectid
    ) {
      status
      msg
    }
  }
`;

export const addNoteproj = gql`
  mutation(
    $title: String!
    $color: String!
    $description: String!
    $username: String!
    $projectid: Int
  ) {
    addNote(
      title: $title
      color: $color
      description: $description
      username: $username
      projectid: $projectid
    ) {
      status
      msg
    }
  }
`;

export const delNote = gql`
  mutation($username: String!, $noteid: Int!) {
    deleteNote(noteid: $noteid, username: $username) {
      status
      msg
    }
  }
`;

export const createProject = gql`
  mutation(
    $ld: String
    $name: String!
    $path: String
    $sd: String
    $username: String!
    $members: [InputMember]
  ) {
    createProject(
      longdescription: $ld
      members: $members
      name: $name
      path: $path
      shortdescription: $sd
      username: $username
    ) {
      status
      msg
    }
  }
`;

export const delUser = gql`
  mutation($username: String!) {
    deleteUser(username: $username) {
      status
      msg
    }
  }
`;

export const editProject = gql`
  mutation(
    $ld: String
    $name: String!
    $path: String
    $sd: String
    $username: String!
    $members: [InputMember]
    $projectid: Int!
  ) {
    editProject(
      longdescription: $ld
      members: $members
      name: $name
      path: $path
      shortdescription: $sd
      username: $username
      projectid: $projectid
    ) {
      status
      msg
    }
  }
`;

export const deleteProject = gql`
  mutation($projectid: Int!, $username: String!) {
    deleteProject(projectid: $projectid, username: $username) {
      status
      msg
    }
  }
`;

export const deleteMember = gql`
  mutation($member: String!, $projectid: Int!, $username: String!) {
    deleteMember(member: $member, projectid: $projectid, username: $username) {
      status
      msg
    }
  }
`;

export const addTask = gql`
  mutation(
    $assignedby: String!
    $assignedto: [String!]!
    $description: String
    $enddate: DateTime
    $preqtaskid: [Int!]
    $priority: String
    $projectid: Int!
    $title: String!
  ) {
    addTask(
      assignedby: $assignedby
      assignedto: $assignedto
      description: $description
      enddate: $enddate
      preqtaskid: $preqtaskid
      priority: $priority
      projectid: $projectid
      title: $title
    ) {
      status
      msg
    }
  }
`;

export const updateTask = gql`
  mutation(
    $assignedto: [String!]!
    $description: String
    $endtime: DateTime
    $priority: String
    $taskid: Int!
    $title: String!
    $username: String!
  ) {
    updateTask(
      assignedto: $assignedto
      description: $description
      endtime: $endtime
      priority: $priority
      taskid: $taskid
      title: $title
      username: $username
    ) {
      status
      msg
    }
  }
`;

export const deleteTask = gql`
  mutation($taskid: Int!, $username: String!) {
    deleteTask(taskid: $taskid, username: $username) {
      status
      msg
    }
  }
`;

export const completeTask = gql`
  mutation($taskid: Int!, $username: String!) {
    completeTask(taskid: $taskid, username: $username) {
      status
      msg
    }
  }
`;

export const changePassword = gql`
  mutation($newpassword: String!, $oldpassword: String!, $username: String!) {
    changePassword(
      newpassword: $newpassword
      oldpassword: $oldpassword
      username: $username
    ) {
      status
      msg
    }
  }
`;

export const changeName = gql`
  mutation($newfirstname: String!, $newlastname: String!, $username: String!) {
    changeName(
      newfirstname: $newfirstname
      newlastname: $newlastname
      username: $username
    ) {
      status
      msg
    }
  }
`;

export const getUserReport = gql`
  query($username: String!) {
    getUserReport(username: $username) {
      username
      inactive
      active
      working
      completed
      completedBefore
      completedAfter
      total
    }
  }
`;

export const getProjectReport = gql`
  query($projectid: Int!) {
    getProjectReport(projectid: $projectid) {
      inactive
      active
      total
      completed
      completedBefore
      completedAfter
      working
    }
  }
`;
export const getUserwiseProjectReport = gql`
  query($projectid: Int!) {
    getUserwiseProjectReport(projectid: $projectid) {
      UserReport {
        username
        inactive
        working
        completed
        completedBefore
        completedAfter
        total
      }
    }
  }
`;

export const getProjectAnalytics = gql`
  query($projectid: Int!, $startdate: Date!, $enddate: Date!) {
    getProjectAnalytics(
      projectid: $projectid
      startdate: $startdate
      enddate: $enddate
    ) {
      date
      newTask
      Taskcompleted
    }
  }
`;

export const getCumulativeProjectAnalytics = gql`
  query($projectid: Int!, $startdate: Date!, $enddate: Date!) {
    getCumulativeProjectAnalytics(
      projectid: $projectid
      startdate: $startdate
      enddate: $enddate
    ) {
      date
      newTask
      Taskcompleted
    }
  }
`;
