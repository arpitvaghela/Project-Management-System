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
