# -*- coding: utf-8 -*-
"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, send_from_directory, request
from TheMarch import app
from pymongo import MongoClient, ASCENDING, DESCENDING
import TheMarch.common as common
import os
import simplejson
import json
from datetime import timedelta
from operator import itemgetter, attrgetter
from bson.objectid import ObjectId
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

@app.route('/')
@app.route('/home')
def home():
    #Load banner
    list_banner = common.load_banner_image()
    #Load event
    list_event = common.load_event_data('home')
    #Load band thumbnail
    list_band = common.load_band_thumbnail()
    #Load room thumbnail
    list_room_thumbnail = common.load_music_room_thumbnail('0')
    #Load room description
    list_room_description = common.load_music_room_description()
    #Load room general description
    list_room_general_description = common.load_room_general()
    #Load band general description
    list_band_general_description = common.load_band_general()
    """Renders the home page."""
    return render_template(
        'Home/home.html',
        title='Home Page',
        banner = list_banner,
        event = list_event,
        band_thumbnail = list_band,
        list_room_thumbnail = list_room_thumbnail,
        list_room_description = list_room_description,
        list_room_general_description = list_room_general_description,
        list_band_general_description = list_band_general_description,
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
@app.route("/home/list_event_recently", methods=['POST'])
#@login_required
def list_event_recently():
    list_event = []
    try:
        event_id = request.form['event_id']
        list_event_recently = common.current_db.Event.find({"_id": { '$ne': ObjectId(event_id) } }, 
                    {'_id': 1,'event_type': 1,'title': 1,'thumbnail': 1,
                    'created_date': 1, "thumbnail_detail":1}).sort("created_date", DESCENDING).limit(5)
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


#############
# Detail Event Home page
#############
@app.route("/home/list_event_slider", methods=['POST'])
#@login_required
def list_event_slider():
    list_event = []
    list_event_slider = []
    try:
        event_id_1 = request.form['event_id_1']
        event_id_2 = request.form['event_id_2']
        if event_id_1 != 'undefined' and event_id_2 != 'undefined':
            list_event_slider = common.current_db.Event.find({"_id": { '$nin': [ObjectId(event_id_1), ObjectId(event_id_2)] } }, 
                    {'_id': 1,'event_type': 1,'title': 1,'thumbnail': 1,
                    'created_date': 1, "thumbnail_detail":1}).sort("created_date", DESCENDING)
        elif  event_id_1 == 'undefined':
            list_event_slider = common.current_db.Event.find({"_id": { '$ne':  ObjectId(event_id_2) } }, 
                    {'_id': 1,'event_type': 1,'title': 1,'thumbnail': 1,
                    'created_date': 1, "thumbnail_detail":1}).sort("created_date", DESCENDING)
        else:
            list_event_slider = common.current_db.Event.find({"_id": { '$ne': ObjectId(event_id_1) } }, 
                    {'_id': 1,'event_type': 1,'title': 1,'thumbnail': 1,
                    'created_date': 1, "thumbnail_detail":1}).sort("created_date", DESCENDING)
        for item in list_event_slider:                
            item = {
                    "_id": str(item["_id"]),
                    "event_type": item["event_type"],
                    "title": item["title"],
                    "thumbnail": "load_event_thumbnail/%s" % item["thumbnail"],
                    "created_date": item["created_date"] ,
                    "thumbnail_detail": item["thumbnail_detail"]
                }                                          
            list_event.append(item)
        if len(list_event) < 2:
            list_event = []
        if len(list_event)%2 == 1:
            list_event.append(list_event[0])
        return simplejson.dumps({"result": 'success', 'list_event_slider': list_event})
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

@app.route('/load_band_image/<string:filename>', methods=['GET'])
@app.route('/admin/load_band_image/<string:filename>', methods=['GET'])
def load_band_image(filename):
    return send_from_directory(app.config['BAND_IMAGE_FOLDER'], filename=filename)    

@app.route('/load_room_thumbnail/<string:filename>', methods=['GET'])
@app.route('/admin/load_room_thumbnail/<string:filename>', methods=['GET'])
def load_room_thumbnail(filename):
    return send_from_directory(app.config['ROOM_IMAGE_FOLDER'], filename=filename)    

#############
# Events Home page
#############
@app.route("/events_page", methods=['GET'])
#@login_required
def events_page():
    #Load event
    list_event = common.load_event_data('admin')
    return render_template(
        'Home/events.html',
        list_event = list_event,
        year=datetime.now().year,
    )

#############
# Events Home page
#############
@app.route("/bands_page/<string:menu>", methods=['GET'])
#@login_required
def bands_page(menu):
    list_band_detail = common.load_band_by_menu('all')  
    list_band_menu = common.load_band_by_menu(menu)  
    return render_template(
        'Home/bands.html',
        list_band_detail = list_band_detail,
        list_band_menu = list_band_menu,    
        year=datetime.now().year,
    )   

#############
# home band detail
#############
@app.route("/home/load_home_band_detail_data", methods=['POST'])
def load_home_band_detail_data():
    try:
        list_band = common.load_band_by_menu('all')      
        return simplejson.dumps({"result": 'success', 'list_band': list_band})
    except Exception, e:
        return simplejson.dumps({"result": 'error'})

#############
# bands detail
#############
@app.route("/home/home_band_detail/<string:band_id>", methods=['GET'])
#@login_required
def home_band_detail(band_id):    
    item = common.load_band_detail_data(band_id)  
    list_item = common.load_band_by_menu('all') 
    return render_template(
        'Home/band-detail.html',
        band_detail_data = item,   
        list_band_detail = list_item, 
        year=datetime.now().year,
    ) 


#############
# Detail Event Home page
#############
@app.route("/home/list_band_by_type", methods=['POST'])
#@login_required
def list_band_by_type():
    list_event = []
    try:
        band_id = request.form['band_id']
        band_type = request.form['band_type']
        list_band = common.current_db.Band_detail.find({'is_approve': 'true', 'band_type':band_type, "_id": { '$ne': ObjectId(band_id) } }, 
                    {'_id': 1,'band_name': 1,'title': 1,'thumbnail': 1, 'band_type': 1,
                    'created_date': 1, "thumbnail_detail":1}).sort("created_date", DESCENDING).limit(3)
        for item in list_band:                
            item = {
                    "_id": str(item["_id"]),
                    "band_name": item["band_name"],
                    "band_type": item["band_type"],
                    "title": item["title"],
                    "thumbnail": "/load_band_image/%s" % item["thumbnail"],
                    "created_date": item["created_date"] ,
                    "thumbnail_detail": item["thumbnail_detail"]
                }                                          
            list_event.append(item) 
        return simplejson.dumps({"result": 'success', 'list_band': list_event})
    except Exception, e:
        return simplejson.dumps({"result": 'error', 'list_band': 'None'})
