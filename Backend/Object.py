from graphene import ObjectType, String, Field, Int, types, List
from graphene_file_upload.scalars import Upload
import query


class User(ObjectType):
    username = String()
    firstname = String()
    lastname = String()
    email = String()

    def resolve_username(parent, info):
        return parent.username

    def resolve_firstname(parent, info):
        return parent.firstname

    def resolve_lastname(parent, info):
        return parent.lastname

    def resolve_email(parent, info):
        return parent.email


class Note(ObjectType):
    noteid = Int(required=True)
    title = String()
    description = String()
    color = String()
    createdby = String()
    createdat = types.DateTime()

    def resolve_noteid(parent, info):
        return parent.noteid

    def resolve_title(parent, info):
        return parent.title

    def resolve_description(parent, info):
        return parent.description

    def resolve_color(parent, info):
        return parent.color

    def resolve_createdby(parent, info):
        return parent.createdby

    def resolve_firstname(parent, info):
        return parent.createdat


class Member(ObjectType):
    user = Field(User)
    role = String()

    def resolve_user(parent, info):
        return query.f_getuser(parent.user)

    def resolve_lastname(parent, info):
        return parent.role


class Project(ObjectType):
    projectid = Int()
    name = String()
    shortdescription = String()
    longdescription = String()
    createdon = types.Date()
    path = String()
    createdby = Field(User)
    members = Field(List(Member))

    def resolve_projectid(parent, info):
        return parent.projectid

    def resolve_name(parent, info):
        return parent.name

    def resolve_shortdescription(parent, info):
        return parent.shortdescription

    def resolve_longdescription(parent, info):
        return parent.longdescription

    def resolve_createdon(parent, info):
        return parent.createdon

    def resolve_path(parent, info):
        return parent.path

    def resolve_createdby(parent, info):
        return query.f_getuser(parent.createdby)

    def resolve_members(parent, info):
        return parent.members


class Task(ObjectType):

    taskid = Int()
    title = String()
    description = String()
    starttime = types.DateTime()
    endtime = types.DateTime()
    completiontime = types.DateTime()
    status = String()
    priority = String()
    projectid = Int()
    assignedby = String()
    assignedto = List(User)
    preqtask = List(Int)

    def resolve_taskid(parent, info):
        return parent.taskid

    def resolve_title(parent, info):
        return parent.title

    def resolve_description(parent, info):
        return parent.description

    def resolve_starttime(parent, info):
        return parent.starttime

    def resolve_endtime(parent, info):
        return parent.endtime

    def resolve_completiontime(parent, info):
        return parent.completiontime

    def resolve_status(parent, info):
        return parent.status

    def resolve_priority(parent, info):
        return parent.priority

    def resolve_projectid(parent, info):
        return parent.projectid

    def resolve_assignedby(parent, info):
        return query.f_getuser(parent.assignedby)

    def resolve_assignedto(parent, info):
        return [query.f_getuser(x) for x in parent.assignedto]

    def resolve_preqtask(parent, info):
        return parent.preqtask


class Report(ObjectType):
    inactive = Int()
    active = Int()
    total = Int()
    completed = Int()
    completed_before = Int()
    completed_after = Int()
    working = Int()

    def resolve_total(parent, info):
        return parent.total

    def resolve_active(parent, info):
        return parent.active

    def resolve_inactive(parent, info):
        return parent.inactive

    def resolve_working(parent, info):
        return parent.working

    def resolve_completed(parent, info):
        return parent.completed

    def resolve_completed_before(parent, info):
        return parent.completed_before

    def resolve_completed_after(parent, info):
        return parent.completed_after


class UserReport(ObjectType):
    username = String()
    inactive = Int()
    active = Int()
    working = Int()
    completed = Int()
    completed_before = Int()
    completed_after = Int()
    total = Int()

    def resolve_username(parent, info):
        return parent.username

    def resolve_total(parent, info):
        return parent.total

    def resolve_active(parent, info):
        return parent.active

    def resolve_inactive(parent, info):
        return parent.inactive

    def resolve_working(parent, info):
        return parent.working

    def resolve_completed(parent, info):
        return parent.completed

    def resolve_completed_before(parent, info):
        return parent.completed_before

    def resolve_completed_after(parent, info):
        return parent.completed_after


class Analytics(ObjectType):
    date = types.Date()
    newTask = Int()
    Taskcompleted = Int()

    def resolve_date(parent, info):
        return parent.date

    def resolve_newTask(parent, info):
        return parent.newTask

    def resolve_Taskcompleted(parent, info):
        return parent.Taskcompleted


class File(ObjectType):
    fileid = Int()
    filename = String()
    file = Upload()
    lastupdated = types.DateTime()
    projectid = Int()

    def resolve_fileid(parent, info):
        return parent.fileid

    def resolve_filename(parent, info):
        return parent.filename

    def resolve_fileid(parent, info):
        return parent.fileid

    def resolve_fileid(parent, info):
        return parent.fileid
