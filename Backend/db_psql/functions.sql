
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

-- function project tasks
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
