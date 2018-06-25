from pymongo import MongoClient,ASCENDING, DESCENDING
import os
from TheMarch import app

current_db = []
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
        #banner_saved = banner_info(item["file_name"], baner_url, item["index"])             
        file_display.append(banner_item)
    #files = [f for f in os.listdir('TheMarch/' + app.config['BANNER_IMAGE_FOLDER']) if os.path.isfile(os.path.join('TheMarch/' + app.config['BANNER_IMAGE_FOLDER'],f)) and f not in IGNORED_FILES ]            
    #for f in files:        
        #baner_url = os.path.join(app.config['BANNER_IMAGE_FOLDER'], f)
        #if f != 'default.jpg':            
        #    baner_url = "load_banner_image/%s" % f
        #    banner_saved = banner_info(f, baner_url)             
        #    file_display.append(banner_saved)
    return file_display