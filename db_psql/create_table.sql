
DROP DATABASE IF EXISTS project;

CREATE DATABASE project;

\c project

DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS project CASCADE;

DROP TABLE IF EXISTS member CASCADE;

DROP TABLE IF EXISTS ProjectFiles CASCADE;

DROP TABLE IF EXISTS Task CASCADE;

DROP TABLE IF EXISTS AssignedTo CASCADE;

DROP TABLE IF EXISTS Preqtask CASCADE;

DROP TABLE IF EXISTS board CASCADE;

DROP TABLE IF EXISTS col CASCADE;

DROP TABLE IF EXISTS note CASCADE;

CREATE TABLE IF NOT EXISTS users (
    username text PRIMARY KEY,
    firstname text NOT NULL,
    lastname text NOT NULL,
    password TEXT NOT NULL,
    emailID text NOT NULL
);

CREATE TABLE IF NOT EXISTS project (
    projectid serial PRIMARY KEY,
    "name" text NOT NULL,
    DOC date NOT NULL,
    "path" text,
    createdby text REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS member (
    member text REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    ProjectID int REFERENCES project (ProjectID) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    "Role" text,
    PRIMARY KEY (member)
);

CREATE TABLE IF NOT EXISTS ProjectFiles (
    FileID serial PRIMARY KEY,
    "filename" text NOT NULL,
    "file" bytea NOT NULL,
    lastupdated date NOT NULL,
    ProjectID int REFERENCES project (ProjectID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Task (
    TaskID serial PRIMARY KEY,
    Title text NOT NULL,
    "Description" text,
    StartDate date,
    EndDate date,
    "Status" text,
    AssignedBy text REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
    ProjectID int REFERENCES project (ProjectID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS AssignedTo (
    TaskID int REFERENCES Task (TaskID) ON DELETE CASCADE ON UPDATE CASCADE,
    member text REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (TaskID, member)
);

CREATE TABLE IF NOT EXISTS preqtask (
    Task int REFERENCES Task (TaskID) ON DELETE CASCADE ON UPDATE CASCADE,
    Preqtask int REFERENCES Task (TaskID) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (Task, Preqtask)
);

CREATE TABLE IF NOT EXISTS board (
    boardID serial PRIMARY KEY,
    title text NOT NULL,
    "Description" text,
    "user" text REFERENCES users (username) ON DELETE CASCADE ON UPDATE CASCADE,
    ProjectID int REFERENCES project (ProjectID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS col (
    colID serial PRIMARY KEY,
    title text NOT NULL,
    boardID int REFERENCES board (boardID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Note (
    noteID serial PRIMARY KEY,
    title text NOT NULL,
    "Description" text,
    columnID int REFERENCES col (colID) ON DELETE CASCADE ON UPDATE CASCADE
);