# Imports
import mutation
from graphene import ObjectType, String, Schema
from flask import Flask
from flask_graphql import GraphQLView
from flask_cors import CORS as cors
import pg

# initializing our app
app = Flask(__name__)
cors(app)
app.debug = True


class Query(ObjectType):
    # this defines a Field `hello` in our Schema with a single Argument `name`
    hello = String(name=String(default_value="stranger"))
    goodbye = String()

    # our Resolver method takes the GraphQL context (root, info) as well as
    # Argument (name) for the Field and returns data for the query Response
    def resolve_hello(root, info):
        return 'Hello'


class Mutation(ObjectType):
    create_user = mutation.createUser.Field()
    change_password = mutation.changePassword.Field()
    change_name = mutation.changeName.Field()
    delete_user = mutation.deleteUser.Field()
    create_project = mutation.createProject.Field()
    delete_project = mutation.deleteProject.Field()
    change_projectname = mutation.changeProjectName.Field()
    change_projectpath = mutation.changeProjectPath.Field()
    add_member = mutation.addMembers.Field()
    delete_member = mutation.deleteMember.Field()
    add_task = mutation.addTask.Field()
    delete_task = mutation.deleteTask.Field()
    complete_task = mutation.completeTask.Field()
    add_note = mutation.addNote.Field()
    edit_note = mutation.editNote.Field()
    delete_note = mutation.deleteNote.Field()


schema = Schema(query=Query, mutation=Mutation)


@app.route('/')
# @cors_origin()
def index():
    return '<html><body><h1>Welcome API 2.0</h1><code>path: /graphql-api<code></body></html>'


app.add_url_rule(
    '/graphql-api',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True  # for having the GraphiQL interface
    ))

if __name__ == '__main__':
    app.run()
