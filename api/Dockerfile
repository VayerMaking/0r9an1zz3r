FROM python:3.8

WORKDIR /api

ADD . /api

# COPY .env .env

RUN pip install -r requirements.txt
RUN pip install tensorflow-cpu --no-cache-dir
RUN pip install imageai
RUN apt-get update
RUN apt-get install ffmpeg libsm6 libxext6  -y
RUN mkdir uploads

EXPOSE 80

# ENTRYPOINT ["tail", "-f", "/dev/null"]


