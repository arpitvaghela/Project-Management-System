import pg
from collections import namedtuple


def f_authenticate(username, password):
    data = pg.executequery2(
        'SELECT (password = crypt(%s, password)) AS pswmatch FROM users where username = %s ;',
        [password, username])
    return data[0][0]


User = namedtuple("User", ['username', 'firstname', 'lastname', 'email'])


def f_getuser(username):
    data = pg.executequery2(
        'SELECT username,firstname,lastname,emailid FROM users WHERE username = %s',
        [username])
    if len(data) < 1:
        raise ValueError('User not found')
    else:
        return User(data[0][0], data[0][1], data[0][2], data[0][3])


Note = namedtuple(
    "Note",
    ["noteid", "title", "description", "color", "createdby", "createdat"])


def f_mynotes(username):
    data = pg.executequery2(
        'SELECT noteid,title,description,color,createdby,createdat from note WHERE boardid = (select boardid from board where username = %s)',
        [username])
    return [Note(x[0], x[1], x[2], x[3], x[4], x[5]) for x in data]


Project = namedtuple("Project", [
    'projectid', 'name', 'shortdescription', 'longdescription', 'createdon',
    'path', 'createdby', 'members'
])

Member = namedtuple("Member", ['user', 'role'])


def f_myprojects(username, f):
    data = pg.executequery2('select * from myprojects(%s,%s)', [username, f])

    return [
        Project(x[0], x[1], x[2], x[3], x[4], x[5], x[6],
                [Member(i, j) for i, j in zip(x[7], x[8])]) for x in data
    ]


def f_getproject(username, projectid):
    data = pg.executequery2("select * from getproject(%s,%s)",
                            [username, projectid])
    x = data[0]
    print(x)
    p = Project(x[0], x[1], x[2], x[3], x[4], x[5], x[6],
                [Member(i, j) for i, j in zip(x[7], x[8])])
    print(p)
    return p


def f_projectNotes(projectid):
    data = pg.executequery2(
        'select noteid,title,description,color,createdby,createdat from note where boardid = (select boardid from board where projectid = %s)',
        [projectid])
    return [Note(x[0], x[1], x[2], x[3], x[4], x[5]) for x in data]


Task = namedtuple("Task", [
    'taskid', 'title', 'description', 'starttime', 'endtime', 'completiontime',
    'status', 'priority', 'projectid', 'assignedby', 'assignedto', 'preqtask'
])


def f_gettask(taskid):
    data = pg.executequery2(
        'SELECT taskid,title,description,starttime,endtime,completiontime,status::text,priority::text,projectid,assignedby,array_agg(assignedto.username) AS assignedto,array_agg(preqtask.preqtask) AS preqtask FROM (task NATURAL JOIN assignedto) LEFT OUTER JOIN preqtask ON (assignedto.taskid = preqtask.task) WHERE taskid = %s GROUP BY taskid;',
        [taskid])
    x = data[0]
    return Task(x[0], x[1], x[2], x[3], x[4], x[5], x[6], x[7], x[8], x[9],
                x[10], x[11])


def f_getmytask(username, task_filter):
    data = pg.executequery2("select * from my_task(%s,%s)",
                            [username, task_filter])

    return [
        Task(x[0], x[1], x[2], x[3], x[4], x[5], x[6], x[7], x[8], x[9], x[10],
             x[11]) for x in data
    ]


def f_getprojecttask(username, pid, task_filter):
    data = pg.executequery2("select * from project_task(%s,%s,%s)",
                            [username, pid, task_filter])

    return [
        Task(x[0], x[1], x[2], x[3], x[4], x[5], x[6], x[7], x[8], x[9], x[10],
             x[11]) for x in data
    ]


UserReport = namedtuple("UserReport", [
    'username', 'inactive', 'active', 'working', 'completed',
    'completed_before', 'completed_after', 'total'
])

Report = namedtuple("Report", [
    'inactive', 'active', 'working', 'completed', 'completed_before',
    'completed_after', 'total'
])


def f_getUserReport(username):
    data = pg.executequery2("select * from gen_user_report(%s);", [username])
    x = data[0]
    return UserReport(username, x[0], x[1], x[2], x[3], x[4], x[5], x[6])


def f_getProjectReport(pid):
    data = pg.executequery2("select * from gen_project_report(%s)", [pid])
    x = data[0]
    return Report(x[0], x[1], x[2], x[3], x[4], x[5], x[6])


def f_getProjectReportUserwise(pid):
    data = pg.executequery2("select * from gen_userwise_report(%s)", [pid])
    return [
        UserReport(x[0], x[1], x[2], x[3], x[4], x[5], x[6], x[7])
        for x in data
    ]


Analytics = namedtuple("Analytics", ["date", "newTask", "Taskcompleted"])


def f_analytics(pid, startdate, enddate):
    data = pg.executequery2(
        "select * from daily_analytics(%s,%s::date,%s::date);",
        [pid, startdate, enddate])

    return [Analytics(x[0], x[1], x[2]) for x in data]


def f_cum_analytics(pid, startdate, enddate):
    data = pg.executequery2(
        "select * from cumulative_daily_analytics(%s,%s::date,%s::date);",
        [pid, startdate, enddate])

    return [Analytics(x[0], x[1], x[2]) for x in data]


File = namedtuple("File",
                  ["fileid", "filename", "file", "lastupdated", "projectid"])


def f_getfiles(username, pid):
    data = pg.executequery2("select * from getfiles(%s,%s);", [username, pid])
    return [File(x[0], x[1], x[2], x[3], x[4]) for x in data]


if __name__ == "__main__":
    print(f_analytics(1, "2020-04-01", "2020-04-22"))
