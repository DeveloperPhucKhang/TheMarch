"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, send_from_directory
from TheMarch import app
from pymongo import MongoClient, ASCENDING, DESCENDING
import TheMarch.common as common
import os
import simplejson
import json
from datetime import timedelta
from operator import itemgetter, attrgetter

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

#############
# Detail Event Home page
#############
@app.route("/home/detail_event/<string:eventid>", methods=['GET'])
#@login_required
def detail_event_home(eventid):
    try:
        item = common.load_event_detail_data(eventid)  
        return render_template(
            'Home/event-detail.html', 
            event_detail = item,       
            year=datetime.now().year,
        )
    except Exception, e:
        return render_template(
            'Home/event-detail.html', 
            event_detail = {},
            year=datetime.now().year,
        )

#############
# Detail Event Home page
#############
@app.route("/home/list_event_recently", methods=['GET'])
#@login_required
def list_event_recently():
    list_event = []
    try:
        list_event_recently = common.current_db.Event.find({'is_approve': 'true'}, 
                    {'_id': 1,'event_type': 1,'title': 1,'thumbnail': 1,
                    'created_date': 1, "thumbnail_detail":1}).sort("created_date", DESCENDING).limit(3)
        for item in list_event_recently:                
            item = {
                    "_id": str(item["_id"]),
                    "event_type": item["event_type"],
                    "title": item["title"],
                    "thumbnail": "load_event_thumbnail/%s" % item["thumbnail"],
                    "created_date": item["created_date"] ,
                    "thumbnail_detail": item["thumbnail_detail"]
                }                                          
            list_event.append(item) 
        return simplejson.dumps({"result": 'success', 'list_event_recently': list_event})
    except Exception, e:
        return simplejson.dumps({"result": 'error', 'list_event_recently': 'None'})

@app.route('/load_banner_image/<string:filename>', methods=['GET'])
@app.route('/admin/load_banner_image/<string:filename>', methods=['GET'])
def load_banner_image(filename):
    return send_from_directory(app.config['BANNER_IMAGE_FOLDER'], filename=filename)    

@app.route('/load_event_thumbnail/<string:filename>', methods=['GET'])
@app.route('/admin/load_event_thumbnail/<string:filename>', methods=['GET'])
def load_event_thumbnail(filename):
    return send_from_directory(app.config['EVENT_THUMBNAIL_FOLDER'], filename=filename)    