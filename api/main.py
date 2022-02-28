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
# ocr
import pytesseract
import PIL.Image

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
    colors_rgb: List[str]
    colors_hex: List[str]
    color_percentages: List[int]
    user_id: str

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(64))
    tag = db.Column(db.String(20))
    is_classified = db.Column(db.Boolean, default=False)
    colors_rgb = db.Column(postgresql.ARRAY(db.String(20), dimensions=1))
    colors_hex = db.Column(postgresql.ARRAY(db.String(10), dimensions=1))
    color_percentages = db.Column(
        postgresql.ARRAY(db.Integer, dimensions=1))
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

        file_path = sys.path[0] + '/uploads/' + new_filename

        colors_rgb = cd.get_colors_rgb(cd.get_image(file_path), 3)
        colors_rgb_array = []
        for count, value in enumerate(colors_rgb):
            print(color_name.convert_rgb_to_names(value), flush=True)
            colors_rgb_array.append(
                color_name.convert_rgb_to_names(value).split(": ")[1])
            if count >= 3:
                break

        colors_hex_array = cd.get_colors_hex(cd.get_image(file_path), 3)

        color_percentages = cd.get_colors_percentages(
            cd.get_image(file_path), 3)

        image = Image(filename=new_filename,
                      tag=predictions[0], user_id=id, is_classified=True,
                      colors_rgb=colors_rgb_array, colors_hex=colors_hex_array,
                      color_percentages=color_percentages)

        db.session.add(image)
        db.session.commit()

        return "ok"
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


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
        print(color_name.convert_rgb_to_names(value), flush=True)
        colors_array.append(
            color_name.convert_rgb_to_names(value).split(": ")[1])
        if count >= 3:
            break

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
    ocr_result = pytesseract.image_to_string(PIL.Image.open(file_path))

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


@app.route('/deleteImage', methods=['POST'])
def deleteImage():
    image_id = request.json['image_id']
    Image.query.filter_by(user_id=get_user_id(request), id=image_id).delete()
    db.session.commit()
    return jsonify("ok")


@app.route('/editTag', methods=['PUT'])
def editTag():
    image_id = request.json['image_id']
    image = Image.query.filter_by(
        user_id=get_user_id(request), id=image_id).first()
    image.tag = request.json['new_tag']
    db.session.commit()
    return jsonify(image)
# ["#4b4723","#e1e7f3","#857e6a"]


@app.route('/getByHex', methods=['GET'])
def getByHex():
    wanted_hex = request.args.get('hex_val')
    images = Image.query.filter(Image.user_id == get_user_id(
        request), Image.colors_hex.any(wanted_hex)).all()
    return jsonify(images)


@app.route('/getAllColors', methods=['GET'])
def getAllColors():
    images = Image.query.filter_by(user_id=get_user_id(
        request)).order_by(desc(Image.id)).with_entities(Image.colors_hex).all()
    colors = []
    for image in images:
        for color in image.colors_hex:
            colors.append(color)
    return jsonify(colors)


@app.route('/getColorNames', methods=['GET'])
def getColorNames():
    images = Image.query.filter_by(user_id=get_user_id(
        request)).order_by(desc(Image.id)).with_entities(Image.colors_rgb).all()
    color_names = []
    for image in images:
        for color_name in image.colors_rgb:
            if color_name not in color_names:
                color_names.append(color_name)
    return jsonify(color_names)


@app.route('/getByColorName', methods=['GET'])
def getByColorName():
    wanted_color_name = request.args.get('color_name')
    images = Image.query.filter(Image.user_id == get_user_id(
        request), Image.colors_rgb.any(wanted_color_name)).all()
    return jsonify(images)


@app.route('/getByTag', methods=['GET'])
def getByTag():
    wanted_tag = request.args.get('tag')
    images = Image.query.filter(Image.user_id == get_user_id(
        request), Image.colors_hex.any(wanted_tag)).all()
    return jsonify(images)


def random_string(length):
    return ''.join(random.choice(string.ascii_letters) for x in range(length))


def get_user_id(req):
    encoded_jwt = req.headers['Authorization'].split(' ')[1]
    decoded_jwt = json.dumps(jwt.decode(encoded_jwt, os.getenv(
        'JWT_SECRET'), algorithms=["HS256"]))
    decoded_id = json.loads(decoded_jwt)["sub"]
    return str(decoded_id)


if __name__ == "__main__":
    """
    This is the main entry point for the program
    """
    db.create_all()
    app.run(host="0.0.0.0", port=80)  # , ssl_context='adhoc')
