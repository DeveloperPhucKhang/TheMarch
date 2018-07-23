# -*- coding: utf-8 -*-
from pymongo import MongoClient,ASCENDING, DESCENDING
from bson.objectid import ObjectId
import os
from decimal import Decimal
import locale

from TheMarch import app

current_db = []

app.config['SECRET_KEY'] = 'hard to guess string'
app.config['SECRET_KEY'] = 'hard to guess string'
app.config['ROOT_FOLDER'] = 'TheMarch/'
app.config['BANNER_IMAGE_FOLDER'] = 'dataset/banner/'
app.config['COFFEE_IMAGE_FOLDER'] = 'dataset/coffee/'
app.config['EVENT_IMAGE_FOLDER'] = 'dataset/event/'
app.config['BAND_IMAGE_FOLDER'] = 'dataset/band/'
app.config['ROOM_IMAGE_FOLDER'] = 'dataset/room/'
app.config['EVENT_THUMBNAIL_FOLDER'] = 'dataset/event/'

IGNORED_FILES = set(['.gitignore'])

locale.setlocale( locale.LC_ALL, '' )

class banner_info:
  def __init__(self,name , url, index):
    self.name = name
    self.url = url
    self.index = index

def connect_db():
    global current_db
    connection = MongoClient('ds016718.mlab.com', 16718)
    current_db = connection['themarch']
    current_db.authenticate('duypv', 'Pa$$w0rd1')    
    return current_db

#############
# Generate valid name of image file
#############
def gen_file_name(filename, path):
    """
    If file was exist already, rename it and return a new name
    """

    i = 1
    while os.path.exists(os.path.join(path, filename)):
        name, extension = os.path.splitext(filename)
        filename = '%s_%s%s' % (name, str(i), extension)
        i += 1

    return filename

def load_banner_image():
    file_display = []
    #Get list banner
    list_banner = current_db.Banner.find().sort("index", ASCENDING)
    for item in list_banner:        
        baner_url = "load_banner_image/%s" % item["file_name"]
        banner_item = {"name": item["file_name"],"url": baner_url,"index": item["index"] }                            
        file_display.append(banner_item)
    return file_display

def load_band_thumbnail():
    file_display = []
    #Get list banner
    list_band = current_db.Band_thumbnail.find().sort("index", ASCENDING)
    for item in list_band:        
        thumbnail_url = "load_band_image/%s" % item["thumbnail"]
        video_url = item["url"] 
        if "www.youtube.com" in video_url:
            split_str = video_url.split('=')
            video_id = split_str[len(split_str)-1]
            video_url = 'https://www.youtube.com/embed/' + video_id + '?rel=0&amp;;controls=0&amp;;showinfo=0&amp;start=8'
        band_item = {
                        "_id": str(item["_id"]),
                        "index": item["index"],
                        "thumbnail": thumbnail_url,
                        "thumbnail_name": item["thumbnail"],
                        "name": item["name"],
                        "url": video_url
                    }                            
        file_display.append(band_item)
    return file_display

def load_event_data(location):
    list_event = []
    #Get list event
    if location == 'home':
        list_event_db = current_db.Event.find({'is_important': 'true'}, 
                    {'_id': 1,'event_type': 1,'title': 1,'thumbnail': 1,'short_description': 1,'created_by': 1,
                    'created_date': 1,'is_important': 1, "is_approve":1, "thumbnail_detail":1}).sort("created_date", DESCENDING).limit(2) 
        if list_event_db.count() == 0:
            list_event_db = current_db.Event.find().sort("created_date", DESCENDING).limit(2)
    else:
        list_event_db = current_db.Event.find({}, 
                    {'_id': 1,'event_type': 1,'title': 1,'thumbnail': 1,'short_description': 1,'created_by': 1,
                    'created_date': 1,'is_important': 1, "is_approve":1, "thumbnail_detail":1}).sort("created_date", DESCENDING)
    for item in list_event_db:                
        sub_item = {
                    "_id": str(item["_id"]),
                    "event_type": item["event_type"],
                    "title": item["title"],
                    "thumbnail": "load_event_thumbnail/%s" % item["thumbnail"],
                    "short_description": item["short_description"] ,
                    #"description": item["description"] ,
                    "created_by": item["created_by"] ,
                    "created_date": item["created_date"] ,
                    "is_important": item["is_important"] ,
                    "is_approve": item["is_approve"],
                    "thumbnail_detail": item["thumbnail_detail"]
                }                                          
        list_event.append(sub_item)
    return list_event

def load_event_detail_data(eventid):
    # Load detail data
    event = current_db.Event.find_one({"_id": ObjectId(eventid)}, 
                {'_id': 1,'event_type': 1,'title': 1,
                'thumbnail': 1,'short_description': 1,'created_by': 1,
                'created_date': 1,'is_important': 1, 'is_approve': 1,'thumbnail_detail': 1 })
    item = None;
    if event != None:
        item = {
                "_id": str(event["_id"]),
                "event_type": event["event_type"],
                "title": event["title"],
                "thumbnail": "load_event_thumbnail/%s" % event["thumbnail"],
                "thumbnail_name": event["thumbnail"],
                "thumbnail_detail_name": event["thumbnail_detail"],
                "thumbnail_detail": "load_event_thumbnail/%s" % event["thumbnail_detail"],
                "short_description": event["short_description"] ,
                #"description": event["description"] ,
                "created_by": event["created_by"] ,
                "created_date": event["created_date"] ,
                "is_important": event["is_important"] ,
                "is_approve": event["is_approve"],
            }
    return item    

def load_band_user():
    list_band = []
    #Get list banner
    list_band_data = current_db.User.find({'role': 'band'}).sort("user", DESCENDING)
    for item in list_band_data:        
        band_item = {
                        "_id": str(item["_id"]),
                        "name": item["name"],
                        "user": item["user"],
                        "role": item["role"],
                        "password": item["password"]
                    }                            
        list_band.append(band_item)
    return list_band

def load_band_data(current_user):
    list_band = []
    #Get list band
    if current_user.role == 'admin':
        list_band_db = current_db.Band_detail.find({}, 
                {'_id': 1,'band_name': 1,'title': 1,'thumbnail': 1,'short_description': 1,'created_by': 1,"band_type":1,
                'created_date': 1,'is_important': 1, "is_approve":1, "thumbnail_detail":1, "score":1, "userId":1}).sort("created_date", DESCENDING)
    else:
        list_band_db = current_db.Band_detail.find({"userId": ObjectId(current_user.id)}, 
                {'_id': 1,'band_name': 1,'title': 1,'thumbnail': 1,'short_description': 1,'created_by': 1,"band_type":1,
                'created_date': 1,'is_important': 1, "is_approve":1, "thumbnail_detail":1, "score":1, "userId":1}).sort("created_date", DESCENDING)
    for item in list_band_db:
        #Get user name of band
        user = current_db.User.find_one({"_id": item["userId"]}, 
                {'user': 1})           
        if user != None:             
            sub_item = {
                        "_id": str(item["_id"]),
                        "band_name": item["band_name"],
                        "title": item["title"],
                        "thumbnail": "load_band_image/%s" % item["thumbnail"],
                        "short_description": item["short_description"] ,                    
                        "created_by": item["created_by"] ,
                        "created_date": item["created_date"] ,
                        "is_important": item["is_important"] ,
                        "is_approve": item["is_approve"],
                        "thumbnail_detail": item["thumbnail_detail"],
                        "band_type": item["band_type"],
                        "score": item["score"],
                        "user_name": user["user"]
                    }                                          
            list_band.append(sub_item)
    return list_band

def load_band_detail_data(bandid):
    # Load detail data
    band = current_db.Band_detail.find_one({"_id": ObjectId(bandid)}, 
                {'_id': 1,'band_name': 1,'title': 1,'thumbnail': 1,'short_description': 1,'created_by': 1,"band_type":1,
                'created_date': 1,'is_important': 1, "is_approve":1, "thumbnail_detail":1, "score":1})
    item = None;
    if band != None:
        item = {
                "_id": str(band["_id"]),
                    "band_name": band["band_name"],
                    "title": band["title"],
                    "thumbnail": "/load_band_image/%s" % band["thumbnail"],
                    "thumbnail_name": band["thumbnail"],
                    "short_description": band["short_description"] ,
                    #"description": item["description"] ,
                    "created_by": band["created_by"] ,
                    "created_date": band["created_date"] ,
                    "is_important": band["is_important"] ,
                    "is_approve": band["is_approve"],
                    "thumbnail_detail": "/load_band_image/%s" % band["thumbnail_detail"],
                    "thumbnail_detail_name": band["thumbnail_detail"],
                    "band_type": band["band_type"],
                    "band_type_name": get_band_type_name(band["band_type"]),
                    "score": band["score"]
            }
    return item  

def load_band_by_menu(menu):
    list_band = []
    # Load detail data
    if menu == 'all':
        list_band_db = current_db.Band_detail.find({'is_approve': 'true'}, 
                    {'_id': 1,'band_name': 1,'title': 1,'thumbnail': 1,'short_description': 1,'created_by': 1,"band_type":1,
                    'created_date': 1,'is_important': 1, "is_approve":1, "thumbnail_detail":1, "score":1}).sort([("score",DESCENDING) , ("band_type",DESCENDING)])
    else:
        list_band_db = current_db.Band_detail.find({'is_approve': 'true', 'band_type' : menu},
                    {'_id': 1,'band_name': 1,'title': 1,'thumbnail': 1,'short_description': 1,'created_by': 1,"band_type":1,
                    'created_date': 1,'is_important': 1, "is_approve":1, "thumbnail_detail":1, "score":1}).sort([("score",DESCENDING) , ("band_type",DESCENDING)])
    for item in list_band_db:                
        sub_item = {
                        "_id": str(item["_id"]),
                        "band_name": item["band_name"],
                        "title": item["title"],
                        "thumbnail": "/load_band_image/%s" % item["thumbnail"],
                        "short_description": item["short_description"] ,
                        #"description": item["description"] ,
                        "created_by": item["created_by"] ,
                        "created_date": item["created_date"] ,
                        "is_important": item["is_important"] ,
                        "is_approve": item["is_approve"],
                        "thumbnail_detail": "/load_band_image/%s" % item["thumbnail_detail"],
                        "band_type": item["band_type"],
                        "band_type_name": get_band_type_name(item["band_type"]),
                        "score": item["score"]
                    }                                          
        list_band.append(sub_item)
    return list_band  

def get_band_type_name(id):
    band_type_list = {
        1: "DJ & EDM",
        2: "FULL BAND",
        3: "ROCK",
        4: "ACOUSTIC",
        5: "KHÁC",
    }
    return band_type_list.get(int(id), "KHÁC")

def get_room_type_name(id):
    band_type_list = {
        1: "XL Room",
        2: "SM Room",
        3: "Streaming Room",       
    }
    return band_type_list.get(int(id), "KHÁC")

def load_music_room_thumbnail(room_type):
    file_display = []
    #Get list banner
    if room_type == '0':
        list_thumbnail = current_db.Room_thumbnail.find().sort([("room_type",ASCENDING) , ("index",ASCENDING)])
    else:
        list_thumbnail = current_db.Room_thumbnail.find({'room_type': room_type}).sort("index", ASCENDING)
    for item in list_thumbnail:        
        thumbnail_url = "/load_room_thumbnail/%s" % item["thumbnail"]       
        music_item = {
                        "_id": str(item["_id"]),
                        "room_type": item["room_type"],
                        "index": item["index"],
                        "thumbnail": thumbnail_url,
                        "thumbnail_name": item["thumbnail"],
                        "name": item["name"],
                        "room_type_name": get_room_type_name(item["room_type"])
                    }                            
        file_display.append(music_item)
    return file_display

def load_room_description(room_type):
     # Load room description data
    room = current_db.Room_description.find_one({'room_type': room_type})
    item = None;
    if room != None:
        item = {
                    "_id": str(room["_id"]),
                    "room_type": room["room_type"],
                    "description": room["description"],
                    "price": room["price"],
                    "option_1": room["option_1"],
                    "option_2": room["option_2"],
                    "option_3": room["option_3"] ,
                    "option_4": room["option_4"] ,
                    "option_5": room["option_5"] ,
                    "option_6": room["option_6"] ,
                    "option_7": room["option_7"],
                    "option_8": room["option_8"],
                    "option_9": room["option_9"],
                    "option_10": room["option_10"],                    
            }
    return item  

def load_music_room_description():
    room_description = []
    #Get list banner
    list_description = current_db.Room_description.find().sort("room_type",ASCENDING)
    for item in list_description:                      
        description = {
                        "_id": str(item["_id"]),
                        "room_type": item["room_type"],
                        "description": item["description"],
                        "price": '{:,.0f}'.format( int(item["price"])),
                        "option_1": item["option_1"],
                        "option_2": item["option_2"],
                        "option_3": item["option_3"] ,
                        "option_4": item["option_4"] ,
                        "option_5": item["option_5"] ,
                        "option_6": item["option_6"] ,
                        "option_7": item["option_7"],
                        "option_8": item["option_8"],
                        "option_9": item["option_9"],
                        "option_10": item["option_10"],       
                    }                            
        room_description.append(description)
    return room_description


def load_room_general():
     # Load room general data
    room = current_db.Room_general_description.find_one()
    item = None;
    if room != None:
        item = {
                    "_id": str(room["_id"]),
                    "description_1": room["description_1"],
                    "description_2": room["description_2"],               
            }
    return item  


def load_band_general():
     # Load room general data
    band = current_db.Band_general_description.find_one()
    item = None;
    if band != None:
        item = {
                    "_id": str(band["_id"]),
                    "description": band["description"],                             
            }
    return item  
