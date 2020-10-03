DROP DATABASE IF EXISTS pms;

CREATE DATABASE pms;

\c pms
DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS project CASCADE;

DROP TABLE IF EXISTS member CASCADE;

DROP TABLE IF EXISTS projectfiles CASCADE;

DROP TABLE IF EXISTS task CASCADE;

DROP TABLE IF EXISTS assignedto CASCADE;

DROP TABLE IF EXISTS preqtask CASCADE;

DROP TABLE IF EXISTS board CASCADE;

-- DROP TABLE IF EXISTS col CASCADE;
DROP TABLE IF EXISTS note CASCADE;

DROP TYPE IF EXISTS role_type;

DROP TYPE IF EXISTS status_type;

DROP TYPE IF EXISTS priority_type;

-- username check -> Alphanumeric string that may include _ and – having a length of 3 to 16 characters
-- check if path provided for profilepic is an image in the frontend or backend
-- firstname, lastname check -> case insensitive alphabetic string

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


/*
insert into users values('username','fn','ln','pswd','email',null);
 */
CREATE TABLE IF NOT EXISTS project (
    projectid serial PRIMARY KEY,
    "name" text NOT NULL,
    "shortdescription" text,
    "longdescription" text,
    createdon date NOT NULL, -- Date Of Creation
    "path" text, -- path refers to the path of git repository
    createdby text NOT NULL REFERENCES users (username)ON DELETE CASCADE ,
    status project_status DEFAULT 'completed' NOT NULL,
    UNIQUE (name, createdby)
);


/*
insert into project (name,createdon,createdby) values ('Project1',CURRENT_DATE,'arpit');
 */
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


/*
insert into member where values ('un',pid,role)
 */
CREATE TABLE IF NOT EXISTS projectfiles (
    fileid serial PRIMARY KEY,
    "filename" text CHECK ("filename" ~ '^[\w,\s-]+\.[A-Za-z]+$') NOT NULL,
    "file" bytea,
    lastupdated timestamp NOT NULL DEFAULT now(),
    projectid int REFERENCES project  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL
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
    FOREIGN KEY (assignedby, projectid) REFERENCES member (username, projectid) ON DELETE CASCADE ON UPDATE CASCADE ,
    UNIQUE (title, assignedby, projectid)
);


/*
insert into task (title,description,starttime,endtime,assignedby,projectid)
values('task1','just a task',null,null,'arpit',1);
 */
CREATE TABLE IF NOT EXISTS assignedto (
    taskid int REFERENCES task  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    username text REFERENCES users  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    PRIMARY KEY (taskid, username)
);

CREATE TABLE IF NOT EXISTS preqtask (
    task int REFERENCES task (taskid)  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    preqtask int REFERENCES task (taskid)  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
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
    createdby text REFERENCES users (username)  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    createdat timestamp DEFAULT NOW() NOT NULL,
    boardid int REFERENCES board (boardid)  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    UNIQUE (title, description)
);

-- PL-Blocks
--#1 trigger to encrypt password before saving into db

CREATE EXTENSION pgcrypto;

CREATE OR REPLACE FUNCTION create_hash ()
    RETURNS TRIGGER
    AS $create_hash$
BEGIN
    --
    -- Store passwords securely
    -- password should have 1 lowercase letter, 1 uppercase letter, 1 number, and be 8 to 72 characters long
    --
    IF NEW.password !~ '(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,72}$' THEN
        RAISE EXCEPTION 'Please enter a strong password';
    ELSE
        NEW.password = crypt(NEW.password, gen_salt('bf'));
    END IF;
    RETURN NEW;
END;
$create_hash$
LANGUAGE plpgsql;

CREATE TRIGGER create_hash
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_hash ();

--#2 trigger=> to add the user who created the project as a member
CREATE OR REPLACE FUNCTION add_leader ()
    RETURNS TRIGGER
    AS $add_leader$
BEGIN
    INSERT INTO member
        VALUES (NEW.createdby, NEW.projectid, 'leader');
    RETURN NEW;
END
$add_leader$
LANGUAGE plpgsql;

CREATE TRIGGER add_leader
    AFTER INSERT ON project
    FOR EACH ROW
    EXECUTE FUNCTION add_leader ();

-- #3 trigger only leader can assign task
CREATE OR REPLACE FUNCTION chk_task_assignedbyleader ()
    RETURNS TRIGGER
    AS $$
DECLARE
    myrole role_type;
BEGIN
    SELECT
        "role" INTO myrole
    FROM
        member
    WHERE
        username = NEW.assignedby
        AND projectid = NEW.projectid;
    IF myrole = 'leader' THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'member is not a leader';
        RETURN NULL;
    END IF;
END
$$
LANGUAGE plpgsql;

CREATE TRIGGER chk_task_assignedbyleader
    BEFORE INSERT OR UPDATE ON task
    FOR EACH ROW
    EXECUTE PROCEDURE chk_task_assignedbyleader ();

-- #4 procedure assigned to is a member
CREATE PROCEDURE assigntask (tid int, un text
)
    AS $$
DECLARE
BEGIN
    IF EXISTS (
        SELECT
            username
        FROM
            member
        WHERE
            projectid = (
                SELECT
                    projectid
                FROM
                    task
                WHERE
                    taskid = tid)
                AND username = un) THEN
        INSERT INTO assignedto
            VALUES (tid, un);
ELSE
    RAISE EXCEPTION 'user is not a member of the project';
END IF;
END
$$
LANGUAGE plpgsql;

-- #5 trigger update status of task(to active) when prereq task is completed
CREATE OR REPLACE FUNCTION update_status ()
    RETURNS TRIGGER
    AS $$
DECLARE
    r int;
    cur1 CURSOR (tid int)
    FOR
        SELECT
            task AS t
        FROM
            preqtask
        WHERE
            preqtask = tid;
    BEGIN
        IF NEW.status = 'completed' THEN
            FOR r IN cur1 (NEW.taskid)
            LOOP
                IF NOT EXISTS (
                    SELECT
                        status
                    FROM
                        task
                    WHERE
                        taskid IN (
                            SELECT
                                preqtask
                            FROM
                                preqtask
                            WHERE
                                task = r.t)
                            AND (status != 'completed')) THEN
                    UPDATE
                        task
                    SET
                        status = 'active'
                    WHERE
                        taskid = r.t;
            END IF;
        END LOOP;
    END IF;
            RETURN NEW;
END
$$
LANGUAGE plpgsql;

CREATE TRIGGER update_status
    AFTER UPDATE ON task
    FOR EACH ROW
    EXECUTE FUNCTION update_status ();

-- #6 trigger => add preqtask and set task status to inactive

CREATE Function change_statuson_preqtask (
) returns trigger
    AS $$
BEGIN
if (select status from task where taskid = NEW.preqtask) != 'completed' then
update task set status = 'inactive' where taskid = NEW.task;
end if;
return new;
END
$$
LANGUAGE plpgsql;

create trigger task_status_to_inactive after insert or update on preqtask for each row execute function change_statuson_preqtask();

-- #7 procedure => delete project only if the user doing it is a leader
CREATE PROCEDURE delete_project (usr text, pid int
)
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT
            1
        FROM
            project
        WHERE
            projectid = pid
            AND createdby = usr) THEN
    RAISE exception 'Project can only be deleted by the user who created it';
ELSE
    DELETE FROM project
    WHERE projectid = pid;
END IF;
END
$$
LANGUAGE plpgsql;

-- #8 procedure => edit project (leader can remove other leaders but not the creator)
CREATE OR REPLACE PROCEDURE edit_project (usr text, pid int, n text, sd text, ld text, p text, members text[][]
)
    AS $$
DECLARE
    userrole text;
    mem text[];
    own text;
BEGIN
    SELECT
        ROLE INTO userrole
    FROM
        member
    WHERE
        username = usr
        AND projectid = pid;
    IF userrole = 'leader' THEN
        UPDATE
            project
        SET
            name = n,
            shortdescription = sd,
            longdescription = ld,
            path = p
        WHERE
            projectid = pid
        RETURNING
            createdby INTO own;
    ELSE
        RAISE EXCEPTION 'user is not a leader';
    END IF;

    if array_length(members, 1) > 0 then
    FOREACH mem slice 1 IN ARRAY members LOOP
        INSERT INTO member
            VALUES (mem[1]::text, pid, mem[2]::role_type);
    END LOOP;
    end if;
END
$$
LANGUAGE plpgsql;

-- #9 procedure -> create project and add members

CREATE OR REPLACE PROCEDURE create_project (usr text, name text, sd text, ld text, path text, members text[][]
)
    AS $$
DECLARE
    mem text[];
    pid int;
BEGIN
    INSERT INTO project (name, shortdescription, longdescription, createdon, path, createdby)
        VALUES (name, sd, ld, CURRENT_DATE, path, usr)
    RETURNING
        projectid INTO pid;
    IF array_length(members, 1) > 0 THEN
        FOREACH mem slice 1 IN ARRAY members LOOP
            INSERT INTO member
                VALUES (mem[1]::text, pid, mem[2]::role_type);
        END LOOP;
    END IF;
END
$$
LANGUAGE plpgsql;

-- #10procedure change password (authenticate the old password before adding the new one)
CREATE PROCEDURE change_password (usr text, oldpswd text, newpswd text
)
    AS $$
DECLARE
    pswmatch boolean;
BEGIN
    SELECT
        (PASSWORD = crypt(oldpswd, PASSWORD)) INTO pswmatch
    FROM
        users
    WHERE
        username = usr;
    IF pswmatch AND newpswd !~ '(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,72}$' THEN
        UPDATE
            users
        SET
            PASSWORD = crypt(newpswd, gen_salt('bf'));
    END IF;
END
$$
LANGUAGE plpgsql;

-- #11 Procedure delete member (delete memeber if user doing it is a leader and send error if member doesnot exist)

CREATE OR REPLACE PROCEDURE delete_member (usrname text, mem text, pid int
)
    AS $$
BEGIN
    if not exists(select 1 from member where username = mem and projectid = pid) then
    raise exception '% is not a member',mem;
    end if;
    if (select createdby from project where projectid = pid) = mem then
    raise exception '% is the owner cannot be deleted',mem;
    end if;
    IF EXISTS (
        SELECT
            1
        FROM
            member
        WHERE
            username = usrname
            AND projectid = pid
            AND ROLE = 'leader') THEN

    DELETE FROM member
    WHERE username = mem
        AND projectid = pid;
        ELSE
            RAISE EXCEPTION '% is not a leader of the project', usrname;
END IF;
END
$$
LANGUAGE plpgsql;
-- # procedure => add member

create or replace procedure add_member(text,text,int,text = 'member')as $$
BEGIN
if $4 is null then $4 = 'member'; end if;
IF EXISTS (
        SELECT
            1
        FROM
            member
        WHERE
            username = $1
            AND projectid = $3
            AND ROLE = 'leader') THEN

    INSERT INTO member
    VALUES  ($2,$3,$4::role_type);
        ELSE
            RAISE EXCEPTION '% is not a leader of the project', $1;
END IF;
END
$$ LANGUAGE plpgsql;


-- #12 Procedure => (add task with assigned to and prereq task values if user is a leader and members assigned to exists)
CREATE OR REPLACE PROCEDURE add_task (assignedby text, assignedto text[], pid int, title text, description text, st timestamp, et timestamp, pr text, preqtaskid int[]
)
    AS $$
DECLARE
    tid int;
    m text;
    p int;
BEGIN
 st = now();
INSERT INTO task (title, description, starttime, endtime, assignedby, projectid,priority)
    VALUES (title, description, st, et, assignedby, pid,pr::priority_type)
RETURNING
    taskid INTO tid;
    foreach m IN ARRAY assignedto LOOP
        IF NOT EXISTS (
            SELECT
                1
            FROM
                member
            WHERE
                username = m
                AND projectid = pid) THEN
        RAISE exception '% is not a member', m;
    END IF;
INSERT INTO assignedto
    VALUES (tid, m);
END LOOP;
    IF preqtaskid IS NOT NULL THEN
        foreach p IN ARRAY preqtaskid LOOP
            INSERT INTO preqtask
                VALUES (tid, p);
        END LOOP;
    END IF;
END
$$
LANGUAGE plpgsql;

-- # procedure => update task if user is a leader and make changes in the assignedto and preqtask tables
CREATE OR REPLACE PROCEDURE edit_task (usr text, tid int, assignedto text[], t text, des text, st timestamp, et timestamp, prior text, preqtaskid int[]
)
    AS $$
DECLARE
    m text;
    pid int;
    p int;
BEGIN
    SELECT
        projectid INTO pid
    FROM
        task
    WHERE
        taskid = tid;
    IF NOT EXISTS (
        SELECT
            1
        FROM
            member
        WHERE
            username = usr
            AND projectid = pid
            AND ROLE = 'leader') THEN
    RAISE EXCEPTION '% user is not a leader', usr;
END IF;
    UPDATE
        task
    SET
        title = t,
        description = des,
        starttime = st,
        endtime = et,
        priority = prior::priority_type,
        assignedby = usr
    WHERE
        taskid = tid;
    DELETE FROM assignedto
    WHERE taskid = tid;
    foreach m IN ARRAY assignedto LOOP
        IF NOT EXISTS (
            SELECT
                1
            FROM
                member
            WHERE
                username = m
                AND projectid = pid) THEN
        RAISE exception '% is not a member', m;
    END IF;
INSERT INTO assignedto
    VALUES (tid, m);
END LOOP;
if array_length(preqtaskid, 1) > 0 then
    foreach p IN ARRAY preqtaskid LOOP
        INSERT INTO preqtask
            VALUES (p, tid);
    END LOOP;
end if;
END
$$
LANGUAGE plpgsql;

-- #13 procedure => (check if user is a leader and delete assignedto and preqtask where task is refered)
CREATE OR REPLACE PROCEDURE delete_task (tid int, usrname text
)
    AS $$
DECLARE
    pid int;
BEGIN
    SELECT
        projectid INTO pid
    FROM
        task
    WHERE
        taskid = tid;
    IF EXISTS (
        SELECT
            1
        FROM
            member
        WHERE
            username = usrname
            AND projectid = pid
            AND ROLE = 'leader') THEN
    DELETE FROM assignedto
    WHERE taskid = tid;
    DELETE FROM preqtask
    WHERE task = tid;
    DELETE FROM task
    WHERE taskid = tid;
ELSE
    RAISE exception '% is not a leader', usrname;
END IF;
END
$$
LANGUAGE plpgsql;

-- #14 procedure =>(set staus to completed if task is assigned to user and also enter current timestamp)
CREATE OR REPLACE PROCEDURE complete_task (tid int, usr text
)
    AS $$
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            task
        WHERE
            taskid = tid
            AND status = 'completed') THEN
    RAISE exception 'task already completed';
END IF;
            IF EXISTS (
                SELECT
                    1
                FROM
                    assignedto
                WHERE
                    taskid = tid
                    AND username = usr) THEN
            UPDATE
                task
            SET
                status = 'completed',
                completiontime = NOW()
            WHERE
                taskid = tid;
        ELSE
            RAISE exception 'task is not assigned to the user';
END IF;
END
$$
LANGUAGE plpgsql;

-- #15 trigger => add a board for a user and each project
CREATE OR REPLACE FUNCTION add_board ()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF TG_TABLE_NAME = 'project' THEN
        INSERT INTO board (title, projectid)
            VALUES ('Project Board_' || NEW.projectid, NEW.projectid);
    END IF;
    IF TG_TABLE_NAME = 'users' THEN
        INSERT INTO board (title, username)
            VALUES ('User Board_' || NEW.username, NEW.username);
    END IF;
    RETURN NEW;
END
$$
LANGUAGE plpgsql;

CREATE TRIGGER add_board
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION add_board ();

CREATE TRIGGER add_board
    AFTER INSERT ON project
    FOR EACH ROW
    EXECUTE FUNCTION add_board ();

-- # 16 trigger => while insert in board rasie exception if both username and projectid is empty
CREATE OR REPLACE FUNCTION check_board ()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF NEW.projectid IS NULL AND NEW.username IS NULL THEN
        RAISE exception 'one of username or project id is required';
        RETURN NULL;
    ELSE
        RETURN new;
    END IF;
END
$$
LANGUAGE plpgsql;

CREATE TRIGGER check_board
    BEFORE INSERT ON board
    FOR EACH ROW
    EXECUTE FUNCTION check_board ();

-- #17 Procedure => add note to project only if user is a member
CREATE PROCEDURE add_note (usr text, pid int, title text, description text, color text
)
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT
            1
        FROM
            member
        WHERE
            username = usr
            AND projectid = pid) THEN
    RAISE exception '% is not a member of the project', usr;
ELSE
    INSERT INTO note (title, description, color, boardid, createdby)
        VALUES (title, description, color, (
                SELECT
                    boardid
                FROM
                    board
                WHERE
                    projectid = pid), usr);
END IF;
END
$$
LANGUAGE plpgsql;

-- projectReport
CREATE OR REPLACE FUNCTION gen_project_report (pid integer)
    RETURNS TABLE (
    inactive int,
    active int,
    working int,
    completed int,
    completed_before int,
    completed_after int,
    total int
    )
    AS $$
DECLARE
    i int;
    a int;
    w int;
    c int;
    cb int;
    ca int;
    t int;
BEGIN

    if not exists (select 1 from project where projectid = pid) then raise exception 'Project doesnot exists';
    end if;

    SELECT
        COUNT(*) INTO t
    FROM
        task t
    WHERE
        t.projectid = pid;
    SELECT
        COUNT(*) INTO i
    FROM
        task t
    WHERE
        t.projectid = pid
        AND status = 'inactive';
    SELECT
        COUNT(*) INTO a
    FROM
        task t
    WHERE
        t.projectid = pid
        AND status = 'active';
    SELECT
        COUNT(*) INTO w
    FROM
        task t
    WHERE
        t.projectid = pid
        AND status = 'working';
    SELECT
        COUNT(*) INTO c
    FROM
        task t
    WHERE
        t.projectid = pid
        AND status = 'completed';
    SELECT
        COUNT(*) INTO cb
    FROM
        task t
    WHERE
        t.projectid = pid
        AND status = 'completed'
        AND completiontime <= endtime;
    SELECT
        COUNT(*) INTO ca
    FROM
        task t
    WHERE
        t.projectid = pid
        AND status = 'completed'
        AND completiontime > endtime;

    RETURN QUERY
    SELECT
        i,a,w,c,cb,ca,t;
END;
$$
LANGUAGE plpgsql;

-- Project report with user
CREATE OR REPLACE FUNCTION gen_userwise_report (pid int)
    RETURNS TABLE (
        username text,
        inactive int,
        active int,
        working int,
        completed int,
        completed_before int,
        completed_after int,
        total int
    )
    AS $$
DECLARE
    cursor1 CURSOR (pidc int)
    FOR SELECT DISTINCT
            member.username
        FROM
            member
        WHERE
            projectid = pidc;
    i int;
    a int;
    w int;
    c int;
    cb int;
    ca int;
    t int;
BEGIN
    if not exists (select 1 from project where projectid = pid) then raise exception 'Project doesnot exists';
    end if;
    CREATE TEMP TABLE report (
        member text,
        inactive int,
        active int,
        working int,
        completed int,
        completed_before int,
        completed_after int,
        total int
    );
    FOR r IN cursor1 (pid)
    LOOP
        SELECT COUNT(*) INTO t FROM task t WHERE t.taskid in
        (SELECT taskid FROM assignedto as a WHERE a.username = r.username) AND t.projectid = pid;

        SELECT COUNT(*) INTO i FROM task t WHERE t.taskid in
        (SELECT taskid FROM assignedto as a WHERE a.username = r.username) AND status = 'inactive' AND t.projectid = pid;

        SELECT COUNT(*) INTO a FROM task t WHERE t.taskid in
        (SELECT taskid FROM assignedto as a WHERE a.username = r.username) AND status = 'active' AND t.projectid = pid;

        SELECT COUNT(*) INTO w FROM task t WHERE t.taskid in
        (SELECT taskid FROM assignedto as a WHERE a.username = r.username) AND status = 'working' AND t.projectid = pid;

        SELECT COUNT(*) INTO c FROM task t WHERE t.taskid in
        (SELECT taskid FROM assignedto as a WHERE a.username = r.username) AND status = 'completed' AND t.projectid = pid;

        SELECT COUNT(*) INTO cb FROM task t WHERE t.taskid in
        (SELECT taskid FROM assignedto as a WHERE a.username = r.username) AND status = 'completed' AND completiontime <= endtime AND t.projectid = pid;

        SELECT COUNT(*) INTO ca FROM task t WHERE t.taskid in
        (SELECT taskid FROM assignedto as a WHERE a.username = r.username) AND status = 'completed' AND completiontime > endtime AND t.projectid = pid;

        INSERT INTO report
        VALUES (r.username,i,a,w,c,cb,ca,t);

    END LOOP;

    RETURN QUERY
    SELECT
        *
    FROM
        report;
    DROP TABLE IF EXISTS report;
END;
$$
LANGUAGE plpgsql;

--Function gen User report
CREATE OR REPLACE FUNCTION gen_user_report (uname text)
    RETURNS TABLE (
    inactive int,
    active int,
    working int,
    completed int,
    completed_before int,
    completed_after int,
    total int
    )
    AS $$
DECLARE
    i int;
    a int;
    w int;
    c int;
    cb int;
    ca int;
    t int;
BEGIN

    if not exists (select 1 from users where username = uname) then raise exception '% user doesnot exists',uname;
    end if;
    SELECT
        COUNT(*) INTO t
    FROM
        task t
    WHERE
        t.taskid in (
            SELECT
                taskid
            FROM
                assignedto
            WHERE
                username = uname);
    SELECT
        COUNT(*) INTO i
    FROM
        task t
    WHERE
        t.taskid in (
            SELECT
                taskid
            FROM
                assignedto
            WHERE
                username = uname)
        AND status = 'inactive';
    SELECT
        COUNT(*) INTO a
    FROM
        task t
    WHERE
        t.taskid in (
            SELECT
                taskid
            FROM
                assignedto
            WHERE
                username = uname)
        AND status = 'active';
    SELECT
        COUNT(*) INTO w
    FROM
        task t
    WHERE
        t.taskid in (
            SELECT
                taskid
            FROM
                assignedto
            WHERE
                username = uname)
        AND status = 'working';
        SELECT
        COUNT(*) INTO c
    FROM
        task t
    WHERE
        t.taskid in (
            SELECT
                taskid
            FROM
                assignedto
            WHERE
                username = uname)
        AND status = 'completed';
    SELECT
        COUNT(*) INTO cb
    FROM
        task t
    WHERE
        t.taskid in (
            SELECT
                taskid
            FROM
                assignedto
            WHERE
                username = uname)
        AND status = 'completed'
        AND completiontime <= endtime;
    SELECT
        COUNT(*) INTO ca
    FROM
        task t
    WHERE
        t.taskid in (
            SELECT
                taskid
            FROM
                assignedto
            WHERE
                username = uname)
        AND status = 'completed'
        AND completiontime > endtime;
    RETURN QUERY
    SELECT
       i,a,w,c,cb,ca,t;
END;
$$
LANGUAGE plpgsql;

-- intervalReport
SELECT
    COUNT(*)
FROM
    task
WHERE
    projectid = 1
    AND starttime >= '2020-04-13'
    AND endtime <= '2020-04-18';

SELECT
    status,
    COUNT(1)
FROM
    task
WHERE
    projectid = 1
    AND starttime >= '2020-04-13'
    AND endtime <= '2020-04-18'
GROUP BY
    status;

SELECT
    COUNT(*)
FROM
    task
WHERE
    completiontime IS NOT NULL
    AND starttime >= '2020-04-13'
    AND endtime <= '2020-04-18';

SELECT
    COUNT(*) AS completedbeforedealine
FROM
    task
WHERE
    endtime <= completiontime
    AND starttime >= '2020-04-13'
    AND endtime <= '2020-04-18';

SELECT
    COUNT(*) AS completedafterdealine
FROM
    task
WHERE
    endtime > completiontime
    AND starttime >= '2020-04-13'
    AND endtime <= '2020-04-18';

-- myProjects
-- SELECT
--     *
-- FROM
--     project
-- WHERE
--     username = 'arpit';
-- -- allNotes
-- SELECT
--     *
-- FROM
--     note
-- WHERE
--     columnid = 1;
-- function my projects

CREATE OR REPLACE FUNCTION myprojects (usr text, f text)
    RETURNS TABLE (
        pid int,
        projectname text,
        sd text,
        ld text,
        DOC date,
        projectpath text,
        OWNER text,
        members text[],
        roles text[]
    )
    AS $$
DECLARE
    r Record;
    cur1 CURSOR (usern text)
    FOR
        SELECT
            projectid AS pid
        FROM
            member
        WHERE
            username = usern;
BEGIN
    IF f IS NOT NULL THEN
        FOR r IN cur1 (usr)
        LOOP
            RETURN query
            SELECT
                projectid AS pid,
                name AS projectname,
                shortdescription AS sd,
                longdescription AS ld,
                createdon AS DOC,
                path AS projectpath,
                createdby AS OWNER,
                array_agg(username) AS members,
                array_agg(ROLE)::text[] AS roles
            FROM
                project
            NATURAL JOIN member
        WHERE
            projectid = r.pid
                AND status = f::project_status
            GROUP BY
                projectid;
        END LOOP;
    ELSE
        FOR r IN cur1 (usr)
        LOOP
            RETURN query
            SELECT
                projectid AS pid,
                name AS projectname,
                shortdescription AS sd,
                longdescription AS ld,
                createdon AS DOC,
                path AS projectpath,
                createdby AS OWNER,
                array_agg(username) AS members,
                array_agg(ROLE)::text[] AS roles
            FROM
                project
            NATURAL JOIN member
        WHERE
            projectid = r.pid
        GROUP BY
            projectid;
        END LOOP;
    END IF;
    RETURN;
END
$$
LANGUAGE plpgsql;

-- # trigger => update project status to completed if all task are completed
CREATE OR REPLACE FUNCTION check_projectstatus ()
    RETURNS TRIGGER
    AS $check_projectstatus$
DECLARE
    num_completed int;
    num_total int;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        SELECT COUNT(*) INTO num_total
        FROM task t
        WHERE projectid = OLD.projectid;

        SELECT COUNT(*) INTO num_completed
        FROM task t
        WHERE projectid = OLD.projectid AND status = 'completed';

        IF num_total = num_completed THEN
            UPDATE project
            SET status = 'completed'
            WHERE projectid = OLD.projectid;
        ELSE
            UPDATE project
            SET status = 'ongoing'
            WHERE projectid = OLD.projectid;
        END IF;
    ELSIF TG_OP = 'INSERT' THEN
        SELECT COUNT(*) INTO num_total
        FROM task t
        WHERE projectid = NEW.projectid;

        SELECT COUNT(*) INTO num_completed
        FROM task t
        WHERE projectid = NEW.projectid AND status = 'completed';

        IF num_total = num_completed THEN
            UPDATE project
            SET status = 'completed'
            WHERE projectid = NEW.projectid;
        ELSE
            UPDATE project
            SET status = 'ongoing'
            WHERE projectid = NEW.projectid;
        END IF;
    END IF;
    RETURN new;
END;
$check_projectstatus$
LANGUAGE plpgsql;

CREATE TRIGGER check_projectstatus
    AFTER INSERT OR UPDATE ON task
    FOR EACH ROW
    EXECUTE FUNCTION check_projectstatus ();

-- function => get project given pid and username
CREATE OR REPLACE FUNCTION getproject (text, int)
    RETURNS TABLE (
        pid int,
        projectname text,
        sd text,
        ld text,
        DOC date,
        projectpath text,
        OWNER text,
        members text[],
        roles text[]
    )
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT
            1
        FROM
            member
        WHERE
            username = $1
            AND projectid = $2) THEN
    RAISE exception 'user is not a member';
ELSE
    RETURN QUERY
    SELECT
        projectid AS pid,
        name AS projectname,
        shortdescription AS sd,
        longdescription AS ld,
        createdon AS DOC,
        path AS projectpath,
        createdby AS OWNER,
        array_agg(username) AS members,
        array_agg(ROLE)::text[] AS roles
    FROM
        project
    NATURAL JOIN member
WHERE
    projectid = $2
GROUP BY
    projectid;
END IF;
    RETURN;
END
$$
LANGUAGE plpgsql;

-- copy from here and #12 line 488 add_task
-- # check if user is a member

CREATE FUNCTION check_member (text, int)
    RETURNS boolean
    AS $$
BEGIN
    RETURN
        EXISTS (
            SELECT
                1
            FROM
                member
            WHERE
                projectid = $2
                AND username = $1);
END
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION project_task (text, int, text = NULL)
    RETURNS TABLE (
        tid int,
        t text,
        des text,
        st timestamp,
        et timestamp,
        ct timestamp,
        s text,
        p text,
        pid int,
        BY text,
        assignedto text[],
        preqid int[]
    )
    AS $$
BEGIN
    IF (
        SELECT
            check_member ($1, $2)) THEN
        IF $3 IS NOT NULL THEN
            RETURN query
            SELECT
                taskid,
                title,
                description,
                starttime,
                endtime,
                completiontime,
                status::text,
                priority::text,
                projectid,
                assignedby,
                array_agg(assignedto.username) AS assignedto,
                array_agg(preqtask.preqtask) AS preqtask
            FROM (task
            NATURAL JOIN assignedto)
        LEFT OUTER JOIN preqtask ON (assignedto.taskid = preqtask.task)
    WHERE
        projectid = $2
        AND status = $3::status_type
    GROUP BY
        taskid;
        ELSE
            RETURN query
            SELECT
                taskid,
                title,
                description,
                starttime,
                endtime,
                completiontime,
                status::text,
                priority::text,
                projectid,
                assignedby,
                array_agg(assignedto.username) AS assignedto,
                array_agg(preqtask.preqtask) AS preqtask
            FROM (task
            NATURAL JOIN assignedto)
        LEFT OUTER JOIN preqtask ON (assignedto.taskid = preqtask.task)
    WHERE
        projectid = $2
    GROUP BY
        taskid;
        END IF;
    ELSE
        RAISE exception 'user is not a member';
    END IF;
    RETURN;
END
$$
LANGUAGE plpgsql;

-- function my_task
CREATE OR REPLACE FUNCTION my_task (text, text = NULL)
    RETURNS TABLE (
        tid int,
        t text,
        des text,
        st timestamp,
        et timestamp,
        ct timestamp,
        s text,
        p text,
        pid int,
        BY text,
        assignedto text[],
        preqid int[]
    )
    AS $$
BEGIN
    IF $2 IS NOT NULL THEN
        RETURN query
        SELECT
            taskid,
            title,
            description,
            starttime,
            endtime,
            completiontime,
            status::text,
            priority::text,
            projectid,
            assignedby,
            array_agg(assignedto.username) AS assignedto,
            array_agg(preqtask.preqtask) AS preqtask
        FROM (task
        NATURAL JOIN assignedto)
    LEFT OUTER JOIN preqtask ON (assignedto.taskid = preqtask.task)
WHERE
    assignedto.username = $1
    AND status = $2::status_type
GROUP BY
    taskid;
    ELSE
        RETURN query
        SELECT
            taskid,
            title,
            description,
            starttime,
            endtime,
            completiontime,
            status::text,
            priority::text,
            projectid,
            assignedby,
            array_agg(assignedto.username) AS assignedto,
            array_agg(preqtask.preqtask) AS preqtask
        FROM (task
        NATURAL JOIN assignedto)
    LEFT OUTER JOIN preqtask ON (assignedto.taskid = preqtask.task)
WHERE
    assignedto.username = $1
GROUP BY
    taskid;
    END IF;
    RETURN;
END
$$
LANGUAGE plpgsql;

-- function daily analytics values
CREATE OR REPLACE FUNCTION daily_analytics(pid int, d0 date, d1 date)
RETURNS TABLE("date" date, num_start int, num_comp int)
AS $$
DECLARE
    num_start int;
    num_comp int;
BEGIN
    DROP TABLE IF EXISTS temp;
    CREATE TABLE IF NOT EXISTS temp("date" date, num int, num_c int);
    IF d1 > d0 THEN
        FOR i in 0..(d1 - d0) - 1 LOOP
            SELECT COUNT(*) INTO num_start
            FROM task
            WHERE starttime >= d0 + i AND starttime < d0 + i + 1;

            SELECT COUNT(*) INTO num_comp
            FROM task
            WHERE completiontime >= d0 + i AND completiontime < d0 + i + 1;

            INSERT INTO temp
            VALUES
                (d0 + i, num_start, num_comp);
        END LOOP;
    END IF;

    RETURN QUERY
    SELECT *
    FROM temp;
END;
$$ LANGUAGE plpgsql;

-- function cumulative analytics value
CREATE OR REPLACE FUNCTION cumulative_daily_analytics(pid int, d0 date, d1 date)
RETURNS TABLE("date" date, num_start int, num_comp int)
AS $$
DECLARE
    num_start int;
    num_comp int;
BEGIN
    DROP TABLE IF EXISTS temp;
    CREATE TABLE IF NOT EXISTS temp("date" date, num int, num_c int);
    IF d1 > d0 THEN
        FOR i in 0..(d1 - d0) - 1 LOOP
            SELECT COUNT(*) INTO num_start
            FROM task
            WHERE starttime >= d0 AND starttime < d0 + i + 1;

            SELECT COUNT(*) INTO num_comp
            FROM task
            WHERE completiontime >= d0 AND completiontime < d0 + i + 1;

            INSERT INTO temp
            VALUES
                (d0 + i, num_start, num_comp);
        END LOOP;
    END IF;

    RETURN QUERY
    SELECT *
    FROM temp;
END;
$$ LANGUAGE plpgsql;
-- procedure delete file
create or replace procedure delete_file(text,int) as $$
declare pid int;
BEGIN
    select projectid into pid from projectfiles where fileid = $2;

if not exists (select 1 from projectfiles where fileid = $2) then
    raise exception 'file doesnot exist';
end if;
IF (SELECT check_member ($1,pid)) THEN
    delete from projectfiles where fileid = $2;
    else raise exception '% is not a member',$1;
    end if;
END
$$ LANGUAGE plpgsql;

-- get files given username and projectid

create or replace function getfiles(text,int) returns setof projectfiles as $$
begin
IF (SELECT check_member ($1,$2)) then
    return query select * from projectfiles where projectid = $2;
else raise exception '% is not a member',$1;
end if;
end
$$ LANGUAGE plpgsql;

-- trigger to auto add last-updated value in the projectfiles table
create function update_lastupdated_files() returns trigger as $$
begin
NEW.lastupdated = NOW();
return NEW;
end
$$LANGUAGE plpgsql;

create trigger update_lastupdated_files before insert or update on projectfiles
for each row execute function update_lastupdated_files();

-- procedure upload file add new file or replace existing if filename and projectid are same
create or replace procedure upload_file(text,int,bytea = Null) as $$
DECLARE
    fid int;
BEGIN
if exists(select 1 from projectfiles where filename = $1 and projectid = $2) then
        select fileid into fid from projectfiles where filename = $1 and projectid = $2;
        update projectfiles set filename = $1 , file =$3 where fileid = fid;
else
    insert into projectfiles (filename,file,projectid) values($1,$3,$2);
end if;
END
$$ LANGUAGE plpgsql;
