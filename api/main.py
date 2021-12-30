import os
from dotenv import load_dotenv
import random
import hashlib
import string
# flask
from flask import Flask
from flask import render_template, request, flash, redirect, url_for, session, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy.dialects import postgresql
from dataclasses import dataclass
from typing import List
import werkzeug
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
class JustSampleData(db.Model):
    id: int
    data: str

    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(50))


@dataclass
class Image(db.Model):
    id: int
    filename: str
    tag: str
    is_classified: bool
    #colors: List[ChildType]

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(64))
    tag = db.Column(db.String(20))
    is_classified = db.Column(db.Boolean, default=False)
    colors = db.Column(postgresql.ARRAY(db.String(20), dimensions=1))


@app.route('/', methods=['GET'])
def index():
    map = JustSampleData.query.all()
    return str(map)


@app.route('/upload', methods=['POST'])
def upload():
    imagefile = request.files['image']
    filename = werkzeug.utils.secure_filename(imagefile.filename)
    print("\nReceived image File name : " + imagefile.filename)
    file_extension = os.path.splitext(filename)[1]
    new_filename = random_string(64)  # + file_extension
    imagefile.save(os.path.join("uploads", new_filename))
    predictions, probabilities = prediction.classifyImage(
        os.path.join(execution_path, "uploads/" + new_filename), result_count=1)

    image = Image(filename=new_filename, tag=predictions[0])

    db.session.add(image)
    db.session.commit()

    return "ok"


@app.route('/getImages', methods=['GET'])
def getImages():
    images = Image.query.limit(15).all()
    return jsonify(images)


@app.route('/getCategories', methods=['GET'])
def getCategories():
    # categories = Image.query.limit(15).all()
    categories = Image.select(Image.tag).all()
    return jsonify(categories)


@app.route('/image/<path:filename>')
def send_app_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route('/classify_color/<path:filename>', methods=['POST'])
def classify_color(filename):
    image = Image.query.filter_by(filename=filename).first()
    # color recognition logic
    file_path = 'uploads/' + filename
    colors = cd.get_colors(cd.get_image(file_path), 8, True)
    for i in colors:
        print(color_name.convert_rgb_to_names(i))

    image.colors = colors
    db.session.add(image)
    db.session.commit()
    # image = Image(filename=new_filename, colors=colors)

    # db.session.add(image)
    # db.session.commit()

    return jsonify(image)


def random_string(length):
    return ''.join(random.choice(string.ascii_letters) for x in range(length))


if __name__ == "__main__":
    """
    This is the main entry point for the program
    """
    print("we are here")
    db.create_all()
    app.run(host="0.0.0.0", port=80)
