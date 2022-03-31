from os import walk, getcwd
from itsdangerous import json
import requests
import json

url = 'http://192.168.88.244:80/upload'
auth_url = 'http://192.168.88.244:5000/login'

login_headers = {"Content-Type": "application/json; charset=utf-8"}

login_data = {
    "email": "vayer@gmail.com",
    "password": "qwerty",
}

response = requests.post(auth_url, headers=login_headers, json=login_data)

json_data = json.dumps(response.json())
access_token = json.loads(json_data)["data"]["access"]

upload_headers = {
    "Authorization": "Bearer {}".format(access_token)
}

files_array = next(walk(getcwd() + "/images"), (None, None, []))[2]

for image in files_array:
    files = {'image': open("images/" + image, 'rb')}
    requests.post(url, headers=upload_headers, files=files)
