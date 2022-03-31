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
    tags: List[str]
    is_classified: bool
    user_id: str
    colors_rgb: List[str]
    colors_hex: List[str]
    color_percentages: List[int]
    user_id: str
    image_text: str

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(64))
    tags = db.Column(postgresql.ARRAY(db.String(15), dimensions=1))
    is_classified = db.Column(db.Boolean, default=False)
    colors_rgb = db.Column(postgresql.ARRAY(db.String(20), dimensions=1))
    colors_hex = db.Column(postgresql.ARRAY(db.String(10), dimensions=1))
    color_percentages = db.Column(
        postgresql.ARRAY(db.Integer, dimensions=1))
    user_id = db.Column(db.Integer)
    image_text = db.Column(db.String(150))


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
        # auth user
        id = get_user_id(request)

        # save file
        imagefile = request.files['image']
        filename = werkzeug.utils.secure_filename(imagefile.filename)
        new_filename = random_string(64)
        imagefile.save(os.path.join("uploads", new_filename))

        # run classification
        predictions, probabilities = prediction.classifyImage(
            os.path.join(execution_path, "uploads/" + new_filename), result_count=3)

        file_path = sys.path[0] + '/uploads/' + new_filename

        # get color names
        color_names = cd.get_color_names(cd.get_image(file_path), 3)
        color_names_array = []
        for count, value in enumerate(color_names):
            print(color_name.convert_rgb_to_names(value), flush=True)
            color_names_array.append(
                color_name.convert_rgb_to_names(value).split(": ")[1])
            if count >= 3:
                break
        # get hex color values
        colors_hex_array = cd.get_colors_hex(cd.get_image(file_path), 3)

        # get percentages
        color_percentages = cd.get_colors_percentages(
            cd.get_image(file_path), 3)

        # run ocr on the image
        ocr_result = pytesseract.image_to_string(PIL.Image.open(file_path))

        image = Image(filename=new_filename,
                      tags=predictions, user_id=id, is_classified=True,
                      colors_rgb=color_names_array, colors_hex=colors_hex_array,
                      color_percentages=color_percentages, image_text=ocr_result)

        db.session.add(image)
        db.session.commit()

        return "ok"
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/getImages', methods=['GET'])
def getImages():
    try:
        images = Image.query.filter_by(user_id=get_user_id(
            request)).order_by(desc(Image.id)).limit(50).all()
        return jsonify(images)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/getTags', methods=['GET'])
def getTags():
    try:
        images = Image.query.filter_by(user_id=get_user_id(
            request)).order_by(desc(Image.id)).with_entities(Image.tags).all()
        tags = []
        for image in images:
            for tag in image.tags:
                if tag not in tags:
                    tags.append(tag)
        return jsonify(tags)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/image/<path:filename>')
def send_app_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route('/getUser', methods=['GET'])
def getUser():
    try:
        user = User.query.filter_by(id=get_user_id(request)).first()
        return jsonify(user)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/getImageDetails/<image_id>', methods=['GET'])
def getImageDetails(image_id):
    try:
        image = Image.query.filter_by(
            user_id=get_user_id(request), id=image_id).first()
        return jsonify(image)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/deleteImage', methods=['POST'])
def deleteImage():
    try:
        image_id = request.json['image_id']
        Image.query.filter_by(user_id=get_user_id(
            request), id=image_id).delete()
        db.session.commit()
        return jsonify("ok")
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/editTags', methods=['PUT'])
def editTag():
    try:
        image_id = request.json['image_id']
        image = Image.query.filter_by(
            user_id=get_user_id(request), id=image_id).first()
        image.tags = request.json['new_tags']
        db.session.commit()
        return jsonify(image)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/getByHex', methods=['GET'])
def getByHex():
    try:
        wanted_hex = request.args.get('hex_val')
        images = Image.query.filter(Image.user_id == get_user_id(
            request), Image.colors_hex.any(wanted_hex)).all()
        return jsonify(images)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/getHexValues', methods=['GET'])
def getHexValues():
    try:
        images = Image.query.filter_by(user_id=get_user_id(
            request)).order_by(desc(Image.id)).with_entities(Image.colors_hex).all()
        colors = []
        for image in images:
            for color in image.colors_hex:
                if color not in colors:
                    colors.append(color)
        return jsonify(colors)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/getColorNames', methods=['GET'])
def getColorNames():
    try:
        images = Image.query.filter_by(user_id=get_user_id(
            request)).order_by(desc(Image.id)).with_entities(Image.colors_rgb).all()
        color_names = []
        for image in images:
            for color_name in image.colors_rgb:
                if color_name not in color_names:
                    color_names.append(color_name)
        return jsonify(color_names)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/getByColorName', methods=['GET'])
def getByColorName():
    try:
        wanted_color_name = request.args.get('color_name')
        images = Image.query.filter(Image.user_id == get_user_id(
            request), Image.colors_rgb.any(wanted_color_name)).all()
        return jsonify(images)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/getByTag', methods=['GET'])
def getByTag():
    try:
        wanted_tag = request.args.get('tag')
        images = Image.query.filter(Image.user_id == get_user_id(
            request), Image.tags.any(wanted_tag)).all()
        return jsonify(images)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


@app.route('/getByImageText', methods=['GET'])
def getByImageText():
    try:
        wanted_text = request.args.get('text')
        images = Image.query.filter(Image.user_id == get_user_id(
            request), Image.image_text.like(wanted_text)).all()
        return jsonify(images)
    except jwt.exceptions.DecodeError:
        abort(Response('Invalid Access Token Format', 400))
    except jwt.exceptions.ExpiredSignatureError:
        abort(Response('Signature Has Expired', 400))


def random_string(length):
    return ''.join(random.choice(string.ascii_letters) for x in range(length))


def get_user_id(req):
    encoded_jwt = req.headers['Authorization'].split(' ')[1]
    decoded_jwt = json.dumps(jwt.decode(encoded_jwt, os.getenv(
        'JWT_SECRET'), algorithms=["HS256"]))
    decoded_id = json.loads(decoded_jwt)["sub"]
    return str(decoded_id)


if __name__ == "__main__":
    db.create_all()
    app.run(host="0.0.0.0", port=80)
