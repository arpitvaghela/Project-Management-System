CREATE TABLE IF NOT EXISTS users (
    username text CHECK (username ~ '^[a-z0-9_-]{3,16}$') PRIMARY KEY,
    firstname text CHECK (firstname ~* '^[a-z]+$') NOT NULL,
    lastname text CHECK (lastname ~* '^[a-z]+$') NOT NULL,
    "password" text NOT NULL,
    emailid text UNIQUE CHECK (emailid ~ '^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$') NOT NULL,
    profilepic bytea
);

CREATE TYPE project_status AS enum (
    'completed',
    'ongoing'
);

CREATE TABLE IF NOT EXISTS project (
    projectid serial PRIMARY KEY,
    "name" text NOT NULL,
    "shortdescription" text,
    "longdescription" text,
    createdon date NOT NULL, -- Date Of Creation
    "path" text, -- path refers to the path of git repository
    createdby text REFERENCES users (username)NOT NULL ON DELETE CASCADE,
    status project_status DEFAULT 'completed' NOT NULL,
    UNIQUE (name, createdby)
);

CREATE TYPE role_type AS ENUM (
    'leader',
    'member'
);

CREATE TABLE IF NOT EXISTS member (
    username text REFERENCES users ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    projectid int REFERENCES project ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    "role" role_type,
    PRIMARY KEY (username, projectid)
);

CREATE TABLE IF NOT EXISTS projectfiles (
    fileid serial PRIMARY KEY,
    "filename" text CHECK ("filename" ~ '^[\w,\s-]+\.[A-Za-z]+$') NOT NULL,
    "file" bytea,
    lastupdated timestamp NOT NULL DEFAULT now(),
    projectid int REFERENCES project NOT NULL ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TYPE status_type AS ENUM (
    'inactive',
    'active',
    'working',
    'completed'
);

CREATE TYPE priority_type AS ENUM (
    'highest',
    'high',
    'normal',
    'low'
);

CREATE TABLE IF NOT EXISTS task (
    taskid serial PRIMARY KEY,
    title text NOT NULL,
    description text,
    starttime timestamp DEFAULT NOW() CHECK (starttime <= endtime),
    endtime timestamp,
    status status_type DEFAULT 'active',
    completiontime timestamp CHECK (starttime <= completiontime),
    priority priority_type DEFAULT 'normal',
    assignedby text NOT NULL,
    projectid int NOT NULL,
    FOREIGN KEY (assignedby, projectid) REFERENCES member (username, projectid) NOT NULL ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (title, assignedby, projectid)
);

CREATE TABLE IF NOT EXISTS assignedto (
    taskid int REFERENCES task NOT NULL ON DELETE CASCADE ON UPDATE CASCADE,
    username text REFERENCES users NOT NULL ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (taskid, username)
);

CREATE TABLE IF NOT EXISTS preqtask (
    task int REFERENCES task (taskid) NOT NULL ON DELETE CASCADE ON UPDATE CASCADE,
    preqtask int REFERENCES task (taskid) NOT NULL ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (task, preqtask)
);

CREATE TABLE IF NOT EXISTS board (
    boardid serial PRIMARY KEY,
    title text NOT NULL,
    "description" text,
    username text REFERENCES users ON DELETE CASCADE ON UPDATE CASCADE,
    projectid int REFERENCES project ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS note (
    noteid serial PRIMARY KEY,
    title text NOT NULL,
    "description" text,
    color text,
    createdby text REFERENCES users (username) NOT NULL ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    createdat timestamp DEFAULT NOW() NOT NULL,
    boardid int REFERENCES board (boardid) NOT NULL ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (title, description)
);
