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
from dataclasses import dataclass
import werkzeug
# image classification
from imageai.Classification import ImageClassification

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

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(50))
    tag = db.Column(db.String(20))


@app.route('/', methods=['GET'])
def index():
    map = JustSampleData.query.all()
    return str(map)


@app.route('/classify', methods=['POST'])
def classify():
    imagefile = request.files['image']
    filename = werkzeug.utils.secure_filename(imagefile.filename)
    print("\nReceived image File name : " + imagefile.filename)
    file_extension = os.path.splitext(filename)[1]
    new_filename = random_string(64)  # + file_extension
    imagefile.save(os.path.join("uploads", new_filename))
    predictions, probabilities = prediction.classifyImage(
        os.path.join(execution_path, "uploads" + filename), result_count=1)

    image = Image(filename=new_filename, tag=predictions[0])

    db.session.add(image)
    db.session.commit()

    return str(new_filename, predictions[0])


def random_string(length):
    return ''.join(random.choice(string.ascii_letters) for x in range(length))


if __name__ == "__main__":
    """
    This is the main entry point for the program
    """
    db.create_all()
    app.run(host="0.0.0.0", port=80)
