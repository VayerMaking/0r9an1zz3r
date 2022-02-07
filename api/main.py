import os
from dotenv import load_dotenv
import random
import hashlib
import string
import sys
import jwt
import json
# flask
from flask import Flask, Response
from flask import render_template, request, flash, redirect, url_for, session, jsonify, send_from_directory, abort
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy.dialects import postgresql
from sqlalchemy import desc
from dataclasses import dataclass
from typing import List
import werkzeug
from werkzeug.exceptions import HTTPException
# image classification
from imageai.Classification import ImageClassification
# color detection
import color_detection as cd
# color names
import color_name

# load env variables
load_dotenv()

# flask config
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER')
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET')

# db and orm config
USERNAME = os.getenv('DB_USERNAME')
PASSWORD = os.getenv('DB_PASSWORD')
HOST = os.getenv('DB_HOST')
PORT = os.getenv('DB_PORT')
DATABASE = os.getenv('DB_DATABASE')
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://" + \
    USERNAME + ":" + PASSWORD + "@" + HOST + ":" + PORT + "/" + DATABASE
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
db = SQLAlchemy(app)

# image classification config

execution_path = os.getcwd()

prediction = ImageClassification()
prediction.setModelTypeAsMobileNetV2()
prediction.setModelPath(os.path.join(
    execution_path, "models/mobilenet_v2.h5"))
prediction.loadModel()


@dataclass
class Image(db.Model):
    id: int
    filename: str
    tag: str
    is_classified: bool
    user_id: str
    #colors: List[ChildType]
    user_id: str

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(64))
    tag = db.Column(db.String(20))
    is_classified = db.Column(db.Boolean, default=False)
    colors = db.Column(postgresql.ARRAY(db.String(20), dimensions=1))
    user_id = db.Column(db.Integer)


@dataclass
class Profile(db.Model):
    id: int
    username: str
    user_email: str
    user_pass: str

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(15))
    user_email = db.Column(db.String(20))
    user_pass = db.Column(db.String(64))


@dataclass
class User(db.Model):
    id: int
    email: str
    username: str
    salt: str
    hash: str
    provider: str

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(30))
    username = db.Column(db.String(30))
    salt = db.Column(db.String(64))
    hash = db.Column(db.String(64))
    provider = db.Column(db.String(64))


@app.errorhandler(HTTPException)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""
    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return response


@app.route('/upload', methods=['POST'])
def upload():
    try:
        id = get_user_id(request)
        imagefile = request.files['image']
        filename = werkzeug.utils.secure_filename(imagefile.filename)
        new_filename = random_string(64)
        imagefile.save(os.path.join("uploads", new_filename))
        predictions, probabilities = prediction.classifyImage(
            os.path.join(execution_path, "uploads/" + new_filename), result_count=1)

        image = Image(filename=new_filename,
                      tag=predictions[0], user_id=id, is_classified=True)

        db.session.add(image)
        db.session.commit()

        return "ok"
    except UnicodeDecodeError:
        abort(404, Response('Invalid Access Token Format'))


@app.route('/getImages', methods=['GET'])
def getImages():
    images = Image.query.filter_by(user_id=get_user_id(
        request)).order_by(desc(Image.id)).limit(15).all()
    return jsonify(images)


@app.route('/getCategories', methods=['GET'])
def getCategories():
    # categories = Image.query.limit(15).all()
    images = Image.query.filter_by(user_id=get_user_id(
        request)).distinct(Image.tag).limit(15).all()
    tags = []
    for image in images:
        tags.append(image.tag)
    return jsonify(tags)


@app.route('/image/<path:filename>')
def send_app_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route('/classify_color/<image_id>', methods=['GET'])
def classify_color(image_id):
    image = Image.query.filter_by(id=image_id).first()
    print("image_if: ", image_id, flush=True)

    # color recognition logic
    file_path = sys.path[0] + '/uploads/' + image.filename
    print("file_path: ", file_path, flush=True)

    colors = cd.get_colors(cd.get_image(file_path), 3, True)
    colors_array = []
    for count, value in enumerate(colors):
        print(color_name.convert_rgb_to_names(count))
        colors_array.append(
            color_name.convert_rgb_to_names(value).split(": ")[1])

    image.colors = colors_array
    db.session.add(image)
    db.session.commit()
    # image = Image(filename=new_filename, colors=colors)

    # db.session.add(image)
    # db.session.commit()

    return jsonify(image)


@app.route('/ocr/<image_id>', methods=['GET'])
def ocr(image_id):
    image = Image.query.filter_by(id=image_id).first()
    # color recognition logic
    file_path = sys.path[0] + '/uploads/' + image.filename
    ocr_result = pytesseract.image_to_string(Image.open(file_path))

    return jsonify(ocr_result)


@app.route('/getUser', methods=['GET'])
def getUser():
    user = User.query.filter_by(id=get_user_id(request)).first()
    return jsonify(user)


@app.route('/getImageDetails/<image_id>', methods=['GET'])
def getImageDetails(image_id):
    image = Image.query.filter_by(
        user_id=get_user_id(request), id=image_id).first()
    return jsonify(image)


def random_string(length):
    return ''.join(random.choice(string.ascii_letters) for x in range(length))


def get_user_id(req):
    encoded_jwt = req.headers['Authorization'].split(' ')[1]
    print("encoded_jwt: ", encoded_jwt, flush=True)
    decoded_jwt = json.dumps(jwt.decode(encoded_jwt, os.getenv(
        'JWT_SECRET'), algorithms=["HS256"]))
    print("decoded_jwt: ", decoded_jwt, flush=True)
    decoded_id = json.loads(decoded_jwt)["sub"]
    return str(decoded_id)


if __name__ == "__main__":
    """
    This is the main entry point for the program
    """
    print("we are here")
    db.create_all()
    app.run(host="0.0.0.0", port=80)
