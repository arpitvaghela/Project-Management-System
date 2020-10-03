from graphene import (Boolean, InputObjectType, Int, List, Mutation, NonNull,
                      ObjectType, String, types)
from graphene_file_upload.scalars import Upload
import pg


class createUser(Mutation):
    class Arguments:
        username = String(required=True)
        firstname = String(required=True)
        lastname = String(required=True)
        password = String(required=True)
        emailid = String(required=True)

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, username, firstname, lastname, password, emailid):
        s, m = pg.executequery(
            "INSERT INTO users VALUES (%s,%s,%s,%s,%s,%s);",
            [username, firstname, lastname, password, emailid, None])
        return createUser(status=s, msg=m)


class changePassword(Mutation):
    class Arguments:
        username = String(required=True)
        oldpassword = String(required=True)
        newpassword = String(required=True)

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, username, oldpassword, newpassword):
        s, m = pg.executequery("CALL change_password(%s,%s,%s);",
                               [username, oldpassword, newpassword])
        return changePassword(status=s, msg=m)


class changeName(Mutation):
    class Arguments:
        username = String(required=True)
        newfirstname = String(required=True)
        newlastname = String(required=True)

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, username, newfirstname, newlastname):
        s, m = pg.executequery(
            "UPDATE users SET firstname=%s, lastname=%s where username = %s",
            [newfirstname, newlastname, username])
        return changeName(status=s, msg=m)


class deleteUser(Mutation):
    class Arguments:
        username = String(required=True)

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, username):
        s, m = pg.executequery("DELETE FROM users where username = %s",
                               [username])
        return deleteUser(status=s, msg=m)


class InputMember(InputObjectType):
    username = String(required=True)
    role = String()


class createProject(Mutation):
    class Arguments:
        username = String(required=True)
        name = String(required=True)
        longdescription = String()
        shortdescription = String()
        path = String()
        members = List(InputMember)

    status = Boolean(required=True)
    msg = String()

    def mutate(root,
               info,
               username,
               name,
               longdescription=None,
               shortdescription=None,
               path=None,
               members=None):
        usernames = [x.username
                     for x in members] if members is not None else None
        roles = [x.role for x in members] if members is not None else None
        m = [[x, y] for x, y in zip(usernames, roles)
             ] if usernames is not None and roles is not None else None
        s, m = pg.executequery(
            "call create_project(%s,%s,%s,%s,%s,%s);",
            [username, name, longdescription, shortdescription, path, m])
        return createProject(status=s, msg=m)


class deleteProject(Mutation):
    class Arguments:
        username = String(required=True)
        projectid = Int(required=True)

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, username, projectid):
        s, m = pg.executequery("CALL delete_project(%s,%s);",
                               [username, projectid])
        return deleteProject(status=s, msg=m)


class editProject(Mutation):
    class Arguments:
        username = String(required=True)
        projectid = Int(required=True)
        name = String(required=True)
        shortdescription = String()
        longdescription = String()
        path = String()
        members = List(InputMember)

    status = Boolean(required=True)
    msg = String()

    def mutate(root,
               info,
               username,
               name,
               projectid,
               shortdescription=None,
               longdescription=None,
               path=None,
               members=None):
        usernames = [x.username for x in members
                     if x.username] if members is not None else None
        roles = [x.role for x in members
                 if x.role] if members is not None else None
        m = [[x, y] for x, y in zip(usernames, roles)
             ] if usernames is not None else None
        s, msg = pg.executequery("call edit_project (%s,%s,%s,%s,%s,%s,%s);", [
            username, projectid, name, shortdescription, longdescription, path,
            m
        ])
        return editProject(status=s, msg=msg)


class deleteMember(Mutation):
    class Arguments:
        username = String(required=True)
        member = String(required=True)
        projectid = Int(required=True)

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, username, member, projectid):
        s, m = pg.executequery("call delete_member (%s,%s,%s);",
                               [username, member, projectid])
        return deleteMember(status=s, msg=m)


class addMember(Mutation):
    class Arguments:
        username = String(required=True)
        member = String(required=True)
        projectid = Int(required=True)
        role = String()

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, username, member, projectid, role=None):
        s, m = pg.executequery("call add_member(%s,%s,%s,%s);",
                               [username, member, projectid, role])
        return addMember(status=s, msg=m)


class addTask(Mutation):
    class Arguments:
        assignedby = String(required=True)
        assignedto = NonNull(List(NonNull(String)))
        projectid = Int(required=True)
        title = String(required=True)
        description = String()
        startdate = types.DateTime()
        enddate = types.DateTime()
        priority = String()
        preqtaskid = List(NonNull(Int))

    status = Boolean(required=True)
    msg = String()

    def mutate(root,
               info,
               assignedby,
               assignedto,
               projectid,
               title,
               description=None,
               startdate=None,
               enddate=None,
               priority=None,
               preqtaskid=None):
        if not priority:
            priority = 'normal'
        s, m = pg.executequery("call add_task (%s,%s,%s,%s,%s,%s,%s,%s,%s);", [
            assignedby, assignedto, projectid, title, description, startdate,
            enddate, priority, preqtaskid
        ])
        return addTask(status=s, msg=m)


class updateTask(Mutation):
    class Arguments:
        username = String(required=True)
        taskid = Int(required=True)
        title = String(required=True)
        description = String()
        starttime = types.DateTime()
        endtime = types.DateTime()
        priority = String()
        preqtaskid = List(NonNull(Int))
        assignedto = NonNull(List(NonNull(String)))

    status = Boolean(required=True)
    msg = String()

    def mutate(
        root,
        info,
        username,
        taskid,
        title,
        assignedto,
        preqtaskid=None,
        description=None,
        startdate=None,
        enddate=None,
        priority=None,
    ):
        s, m = pg.executequery(
            'call edit_task (%s,%s,%s,%s,%s,%s,%s,%s,%s::integer[]);', [
                username, taskid, assignedto, title, description, startdate,
                enddate, priority, preqtaskid
            ])
        return updateTask(status=s, msg=m)


class deleteTask(Mutation):
    class Arguments:
        username = String(required=True)
        taskid = Int(required=True)

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, username, taskid):
        s, m = pg.executequery('call delete_task(%s,%s)', [taskid, username])
        return deleteTask(status=s, msg=m)


class completeTask(Mutation):
    class Arguments:
        username = String(required=True)
        taskid = Int(required=True)

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, username, taskid):
        s, m = pg.executequery('call complete_task (%s,%s);',
                               [taskid, username])
        return completeTask(status=s, msg=m)


class addNote(Mutation):
    class Arguments:
        username = String(required=True)
        title = String(required=True)
        description = String()
        color = String()
        projectid = Int()

    status = Boolean(required=True)
    msg = String()

    def mutate(root,
               info,
               username,
               title,
               projectid=None,
               description=None,
               color=None):
        if not projectid:
            s, m = pg.executequery(
                'insert into note (title,description,color,boardid,createdby) values (%s,%s,%s,(select boardid from board where username = %s),%s);',
                [title, description, color, username, username])

        else:
            s, m = pg.executequery('call add_note (%s, %s,%s,%s,%s)', [
                username,
                projectid,
                title,
                description,
                color,
            ])

        return addNote(status=s, msg=m)


class deleteNote(Mutation):
    class Arguments:
        username = String(required=True)
        noteid = Int(required=True)

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, username, noteid):
        s, m = pg.executequery('delete from note where noteid = %s;', [noteid])
        return deleteNote(status=s, msg=m)


class editNote(Mutation):
    class Arguments:
        username = String(required=True)
        noteid = Int(required=True)
        title = String(required=True)
        description = String()
        color = String()

    status = Boolean(required=True)
    msg = String()

    def mutate(root,
               info,
               username,
               noteid,
               title,
               description=None,
               color=None):
        s, m = pg.executequery(
            'update note set title = %s description = %s color = %s createdby = %s where noteid = %s);',
            [title, description, color, username, noteid])
        return editNote(status=s, msg=m)


class UploadProjectFile(Mutation):
    class Arguments:
        file = Upload()
        filename = String(required=True)
        projectid = Int(required=True)

    status = Boolean(required=True)
    msg = String()

    def mutate(root, info, filename, projectid, file=None):
        if file is not None:
            f = file.read()
        else:
            f = None
        s, m = pg.executequery(
            'insert into projectfiles (filename,file,projectid) values(%s,%s,%s)',
            [filename, f, projectid])
        return editNote(status=s, msg=m)
