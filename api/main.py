from flask import Flask
from flask import render_template, request, flash, redirect, url_for, session, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
import os
from dotenv import load_dotenv
from dataclasses import dataclass


load_dotenv()

UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET')
USERNAME = os.getenv('DB_USERNAME')
PASSWORD = os.getenv('DB_PASSWORD')
HOST = os.getenv('DB_HOST')
PORT = os.getenv('DB_PORT')
DATABASE = os.getenv('DB_DATABASE')
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://" + \
    USERNAME + ":" + PASSWORD + "@" + HOST + ":" + PORT + "/" + DATABASE
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
db = SQLAlchemy(app)


@dataclass
class JustSampleData(db.Model):
    id: int
    data: str

    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(50))


@app.route('/', methods=['GET'])
def index():
    map = JustSampleData.query.all()
    return str(map)


if __name__ == "__main__":
    """
    This is the main entry point for the program
    """
    db.create_all()
    app.run(host="0.0.0.0", port=80)
