FROM python:3.8

WORKDIR /api

ADD . /api

# COPY .env .env

RUN pip install -r requirements.txt
RUN pip install tensorflow
RUN pip install imageai
RUN mkdir uploads

EXPOSE 80

# ENTRYPOINT ["tail", "-f", "/dev/null"]


