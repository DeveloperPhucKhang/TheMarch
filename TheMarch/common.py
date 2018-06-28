from pymongo import MongoClient,ASCENDING, DESCENDING
from bson.objectid import ObjectId
import os
from TheMarch import app

current_db = []

app.config['SECRET_KEY'] = 'hard to guess string'
app.config['SECRET_KEY'] = 'hard to guess string'
app.config['ROOT_FOLDER'] = 'TheMarch/'
app.config['BANNER_IMAGE_FOLDER'] = 'dataset/banner/'
app.config['COFFEE_IMAGE_FOLDER'] = 'dataset/coffee/'
app.config['EVENT_IMAGE_FOLDER'] = 'dataset/event/'
app.config['BAND_IMAGE_FOLDER'] = 'dataset/band/'
app.config['GYM_IMAGE_FOLDER'] = 'dataset/gym/'
app.config['EVENT_THUMBNAIL_FOLDER'] = 'dataset/event/'

IGNORED_FILES = set(['.gitignore'])

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

def load_event_data(location):
    list_event = []
    #Get list event
    if location == 'home':
        list_event_db = current_db.Event.find({'is_important': 'true', 'is_approve': 'true'}, 
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