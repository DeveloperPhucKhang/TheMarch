"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, send_from_directory
from TheMarch import app
from pymongo import MongoClient
import TheMarch.common as common
import os
import simplejson
import json
from datetime import timedelta
from operator import itemgetter, attrgetter

#db = common.connect_db()
#result = db.User.find()
#for item in result:
#    print("Name: " + item["name"] + "email: " + str(item["email"]))


@app.route('/')
@app.route('/home')
def home():
    #Load banner
    list_banner = common.load_banner_image()
    #Load event
    list_event = common.load_event_data('home')
    """Renders the home page."""
    return render_template(
        'Home/home.html',
        title='Home Page',
        banner = list_banner,
        event = list_event,
        year=datetime.now().year,
    )

@app.route('/contact')
def contact():
    """Renders the contact page."""
    return render_template(
        'contact.html',
        title='Contact',
        year=datetime.now().year,
        message='Your contact page.'
    )

@app.route('/about')
def about():
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Your application description page.'
    )

@app.route('/load_banner_image/<string:filename>', methods=['GET'])
@app.route('/admin/load_banner_image/<string:filename>', methods=['GET'])
def load_banner_image(filename):
    return send_from_directory(app.config['BANNER_IMAGE_FOLDER'], filename=filename)    

@app.route('/load_event_thumbnail/<string:filename>', methods=['GET'])
@app.route('/admin/load_event_thumbnail/<string:filename>', methods=['GET'])
def load_event_thumbnail(filename):
    return send_from_directory(app.config['EVENT_THUMBNAIL_FOLDER'], filename=filename)    