-- Trigger #1(on users)-> Save Password after encryption

CREATE OR REPLACE FUNCTION create_hash () RETURNS TRIGGER AS $create_hash$
BEGIN
    --
    -- Store passwords securely
    -- password should have 1 lowercase letter, 1 uppercase letter, 1 number
    -- and be 8 to 72 characters long
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

CREATE TRIGGER create_hash BEFORE INSERT OR UPDATE ON users FOR EACH ROW
    EXECUTE FUNCTION create_hash ();

-- Trigger #2(on project on users) -> Automatically add board for new user or new project
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

-- Trigger #3 (on project) -> Add creator of project to member as leader
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

 -- Trigger #4 (on projectfiles) -> automatically update the lastupdated value in projectfiels

CREATE OR REPLACE FUNCTION update_lastupdated_files() RETURNS TRIGGER AS $$
BEGIN
    NEW.lastupdated = now();
    RETURN NEW;
END;
$$LANGUAGE plpgsql;

CREATE TRIGGER update_lastupdated_files BEFORE INSERT OR UPDATE ON projectfiles
    FOR EACH ROW EXECUTE FUNCTION update_lastupdated_files();

-- Trigger #5 (on board) -> must have one of username or projectid
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

-- Trigger #6 (on preqtask) -> on add or update preqtask set status of task to inactive if preqtask is not complete

CREATE FUNCTION change_statuson_preqtask () returns trigger
    AS $$
BEGIN
    if (select status from task where taskid = NEW.preqtask) != 'completed' then
        update task set status = 'inactive' where taskid = NEW.task;
    end if;
    return new;
END;
$$
LANGUAGE plpgsql;

create trigger task_status_to_inactive after insert or update on preqtask
    for each row execute function change_statuson_preqtask();

-- Trigger #7 (on Task) -> only leader can assign task
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

-- Trigger #8 (on task)-> update status of depended task on change in a preqtask
CREATE OR REPLACE FUNCTION update_task_status ()
    RETURNS TRIGGER
    AS $$
DECLARE
    b boolean;
    r int;
    cur1 CURSOR (tid int) FOR SELECT task AS t FROM preqtask WHERE preqtask = tid;
    BEGIN
	IF TG_OP = 'DELETE' THEN
        raise notice 'here in delete old taskid %',OLD.taskid;
		FOR r IN cur1 (OLD.taskid) LOOP
        select NOT EXISTS into b ( SELECT 1 FROM task WHERE taskid IN ( SELECT preqtask FROM preqtask WHERE task = r.t AND status != 'completed'));
                    raise notice '% %',b,r.t;
                	IF NOT EXISTS ( SELECT 1 FROM task WHERE taskid IN ( SELECT preqtask FROM preqtask WHERE task = r.t AND status != 'completed')) THEN
                    	UPDATE task SET status = 'active' WHERE taskid = r.t;
            		END IF;
        	END LOOP;
        RETURN OLD;
	ELSIF NEW.status = 'completed' THEN
        	FOR r IN cur1 (NEW.taskid) LOOP
                	IF NOT EXISTS ( SELECT 1 FROM task WHERE taskid IN ( SELECT preqtask FROM preqtask WHERE task = r.t AND status != 'completed')) THEN
                    	UPDATE task SET status = 'active' WHERE taskid = r.t;
            		END IF;
        	END LOOP;
    END IF;
 RETURN NEW;
    END
$$
LANGUAGE plpgsql;

CREATE TRIGGER update_task_status_afterupdate AFTER UPDATE ON task FOR EACH ROW
    EXECUTE FUNCTION update_task_status ();

CREATE TRIGGER update_task_status_beforedelete BEFORE DELETE ON task FOR EACH ROW
    EXECUTE FUNCTION update_task_status ();

-- Trigger #9 (on task) update project status to ongoing if there is a pending task

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
