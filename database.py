from flask import Flask, request
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps

app = Flask(__name__)

MONGODB_HOST = '0.0.0.0'
MONGODB_PORT = 27017
DBS_NAME = 'mydb'
COLLECTION_NAME = 'courses'

FIELDS = {'_id': True, 'fname': True, 'lname': True, 'gender': True, 'type': True, 'courses': True,  'age': True}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/mydb/courses")
def mydb_courses():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    my_courses = collection.find(projection=FIELDS)
    json_courses = []
    for course in my_courses:
	json_courses.append(course)
    json_courses = json.dumps(json_courses, default=json_util.default)
    connection.close()
    return json_courses

@app.route("/unique")
def unique_courses():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    #my_courses = collection.find(projection=FIELDS)
    json_courses = collection.distinct("courses")
    json_courses = json.dumps(json_courses, default=json_util.default)
    connection.close()
    return json_courses

@app.route("/gender", methods=['GET'])
def gender_distribution():
    c = request.args.get('c')
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    #my_courses = collection.find({"courses": c})
    json_courses = []
    m = collection.find({"courses": c}).count({"gender":"Male"}, with_limit_and_skip=False)
    f = collection.find({"courses": c}).count({"gender":"Female"}, with_limit_and_skip=False)
    json_courses.append(m)
    json_courses.append(f)
    json_courses = json.dumps(json_courses, default=json_util.default)
    connection.close()
    return json_courses

	
if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)
