from os import walk, getcwd
import requests
url = 'http://192.168.88.244:80/upload'


files_array = next(walk(getcwd() + "/images"), (None, None, []))[2]

for image in files_array:
    files = {'image': open("images/" + image, 'rb')}
    requests.post(url, files=files)
