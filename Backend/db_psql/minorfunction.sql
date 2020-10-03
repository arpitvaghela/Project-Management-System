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


-- Procedure => add note to project only if user is a member
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
-- get files given username and projectid

create or replace function getfiles(text,int) returns setof projectfiles as $$
begin
IF (SELECT check_member ($1,$2)) then
    return query select * from projectfiles where projectid = $2;
else raise exception '% is not a member',$1;
end if;
end
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
