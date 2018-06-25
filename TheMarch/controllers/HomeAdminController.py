# -*- coding: utf-8 -*-
"""
Routes and views for the flask application.
"""
from datetime import datetime
from flask import Flask, request, render_template, redirect, url_for, send_from_directory
from TheMarch import app
from pymongo import MongoClient, ASCENDING, DESCENDING
from flask import session, flash, abort
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import InputRequired, Email, Length, ValidationError
from bson.objectid import ObjectId
from flask_wtf import FlaskForm
from flask_bootstrap import Bootstrap
from werkzeug import secure_filename
import os
import simplejson
import json
from datetime import timedelta
from operator import itemgetter, attrgetter
from PIL import Image
import TheMarch.common as common

bootstrap = Bootstrap(app)
app.config['SECRET_KEY'] = 'hard to guess string'
app.config['SECRET_KEY'] = 'hard to guess string'
app.config['ROOT_FOLDER'] = 'TheMarch/'
app.config['BANNER_IMAGE_FOLDER'] = 'dataset/banner/'
app.config['COFFEE_IMAGE_FOLDER'] = 'dataset/coffee/'
app.config['EVENT_IMAGE_FOLDER'] = 'dataset/event/'
app.config['BAND_IMAGE_FOLDER'] = 'dataset/band/'
app.config['GYM_IMAGE_FOLDER'] = 'dataset/gym/'
IGNORED_FILES = set(['.gitignore'])

# flask-login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

result = common.current_db.User.find()
for item in result:
    print("Name: " + item["name"] + "email: " + str(item["email"]))

#############
# Object user
#############
class User(UserMixin):
    def __init__(self,id, user_name, password):
        self.id = id
        self.user_name = user_name
        self.password = password
        self.set_password(password)

    def set_password(self, password):
        self.pw_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password, password)

#############
# Delare login form
#############
class LoginForm(FlaskForm):
    username = StringField('User Name'.decode('utf-8'),
                           validators=[InputRequired(), Length(min=4, max=80)], 
                           render_kw={"placeholder": "Tên đăng nhập".decode('utf-8')})
    password = PasswordField('Password'.decode('utf-8'),
                           validators=[InputRequired()], 
                           render_kw={"placeholder": "Mật khẩu".decode('utf-8')})
    remember = BooleanField('Ghi nhớ'.decode('utf-8'))

@app.route('/admin')
#@login_required
def admin():
    return redirect(url_for('banner'))

#############
# Get detail of user
#############
@login_manager.user_loader
def load_user(user_id):
    current_user = common.current_db.User.find_one({"_id": ObjectId(user_id)})
    currentUser = User(user_id, current_user.get('username'), current_user.get('password'))
    return currentUser

#############
# Unauthorized user
#############
@login_manager.unauthorized_handler
def unauthorized():        
    return render_template('Admin/login.html', form = LoginForm())    
    #message = None
    #if common.reset_msg:
    #    message = common.reset_msg
    #    common.reset_msg = None
    #    return render_template('Admin/login.html', form = LoginForm(), reset_msg = message)
    #else:
    #    return render_template('Admin/login.html', form = LoginForm())

#############
#Login 
#############
@app.route('/login', methods=['GET'])
def login_page():
    return render_template('Admin/login.html', form = LoginForm())

#############
#Login 
#############
@app.route('/login', methods=['POST'])
def do_admin_login():
    form = LoginForm(request.form)
    username = request.form["username"]
    password = request.form["password"]
    # CHeck username
    current_user = common.current_db.User.find_one({"email": username})
    if current_user:
        # Check pass
        #if check_password_hash(password, current_user.get('password')):
        #    return 'Login success'
        if password == current_user.get('password'):
            remember = request.form.get("remember", "no") == "yes"
            currentUser = User(current_user.get('_id'), username, password)
            # Excute Login
            if login_user(currentUser, remember=form.remember.data):
                session.permanent = True
                app.permanent_session_lifetime = timedelta(minutes=3000)
                session.update(dict(user=username))
                return redirect(url_for('home_admin'))   
            # Cannot Login
            else:                    
                return render_template('login.html', form=form, errorLogin = constants.ERR_LOGIN_FAILED.decode('utf-8'))
            # Check password failed
        else:                
            return render_template('login.html', form=form , passError= constants.ERR_PASSWORD.decode('utf-8'))
    # Check user name failed
    else:               
        return render_template('login.html', form=form, userError= constants.ERR_USER_NAME.decode('utf-8'))
    return render_template('login.html', form=form)
    
#############
# Upload banner
#############
@app.route("/upload_banner", methods=['POST'])
#@login_required
def upload_banner():    
    files = request.files['file']
    if files:     
        try:     
            file_name = secure_filename(files.filename)
            file_name = common.gen_file_name(file_name,'TheMarch/' + app.config['BANNER_IMAGE_FOLDER'])
            banner_number = request.form['banner_number']
            old_file_name = request.form['old_file_name']
            if banner_number > 0:           
                #Delete old banner image, database                               
                if old_file_name != '':            
                    old_file_path = os.path.join('TheMarch/' + app.config['BANNER_IMAGE_FOLDER'], old_file_name)
                    if os.path.exists(old_file_path):
                        os.remove(old_file_path)
                    #delete database
                    common.current_db.Banner.remove({"file_name": old_file_name, "index": banner_number})
                #Inset new image                                
                if float(banner_number) == 0:
                    #Get max index
                    max_banner = common.current_db.Banner.find().sort("index", DESCENDING).limit(1)
                    banner_number = int(max_banner[0]['index']) + 1
                    banner_number = str(banner_number)
                #file_name = file_name.replace(os.path.splitext(file_name)[0], banner_number + '_banner')    
                file_name = banner_number + '_' + file_name     
                file_path = os.path.join('TheMarch/' + app.config['BANNER_IMAGE_FOLDER'], file_name)   
                # save file to disk
                files.save(file_path)
                #Image.open(files).save(file_path)
                # Save database
                common.current_db.Banner.insert({"file_name": file_name, "index": banner_number})                
                return simplejson.dumps({'result': 'success', 'file_name' : file_name})
            else:        
                return simplejson.dumps({'result': 'success', 'file_name' : 'No file'})
        except Exception, e:
            return simplejson.dumps({'result': 'error', 'error_message': str(e) ,'file_name' : 'No file'})
    else:
        return simplejson.dumps({"result": 'success', 'file_name' : 'No file'})    


#############
# Delete banner
#############
@app.route("/delete_banner", methods=['DELETE'])
#@login_required
def delete_banner():   
    file_name = request.form['file_name'] 
    banner_number = request.form['banner_number']
    file_path = os.path.join(app.config['ROOT_FOLDER'] + app.config['BANNER_IMAGE_FOLDER'], file_name)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)            
            #Remove database
        common.current_db.Banner.remove({"file_name": file_name, "index": banner_number})
        #Get default file
        #file_default = [f for f in os.listdir('TheMarch/' + app.config['BANNER_IMAGE_FOLDER']) if os.path.isfile(os.path.join('TheMarch/' + app.config['BANNER_IMAGE_FOLDER'],f)) and f == 'default.jpg' ]                    
        #file_name = file_name.replace(os.path.splitext(file_name)[0], banner_number + '_banner')         
        #file_name = banner_number + '_banner.jpg'
        #file_path = os.path.join('TheMarch/' + app.config['BANNER_IMAGE_FOLDER'], file_name)   
        #file_path_default = os.path.join('TheMarch/' + app.config['BANNER_IMAGE_FOLDER'], 'default.jpg')
        #copyfile(file_path_default, file_path)
        return simplejson.dumps({'result': 'success'})        
    except:
        return simplejson.dumps({'result': 'error'})

#############
# Banner controller
#############
@app.route("/admin/banner", methods=['GET'])
#@login_required
def banner():    
    list_banner = common.load_banner_image()
    return render_template(
        'Admin/banner.html',
        banner_data = list_banner,
        year=datetime.now().year,
    )

@app.route("/refesh_banner", methods=['GET'])
#@login_required
def refesh_banner():    
    list_banner = common.load_banner_image()                
    return simplejson.dumps({'list_banner': list_banner})

#############
# Event controller
#############
@app.route("/admin/event", methods=['GET'])
#@login_required
def event():        
    return render_template(
        'Admin/event.html',        
        year=datetime.now().year,
    )

#############
# Event controller
#############
@app.route("/admin/add_event", methods=['GET'])
#@login_required
def add_event():        
    return render_template(
        'Admin/add-event.html',        
        year=datetime.now().year,
    )

#############
# Event controller
#############
@app.route("/load_event_data", methods=['POST'])
def load_event_admin():
    list_event = []
    #Get list event
    list_event_db = common.current_db.Event.find().sort("created_on", DESCENDING)
    for item in list_event_db:                
        item = {
                    "event_type": item["event_type"],
                    "title": item["title"],
                    "short_description": item["short_description"] ,
                    "description": item["description"] ,
                    "created_by": item["created_by"] ,
                    "created_date": item["created_date"] ,
                    "is_important": item["is_important"] 
                }                                          
        list_event.append(item)
    return simplejson.dumps({'list_event': list_event})

@app.route("/add_event_db", methods=['POST'])
#@login_required
def add_event_db():  
    try:
        event_type = request.form['event_type']
        title = request.form['title']
        description = request.form['description']
        short_description = request.form['short_description']
        created_date = datetime.now()
        created_date = '{0}/{1}/{2}'.format(created_date.year, created_date.month, created_date.day)
        created_by = 'admin'
        is_important = request.form['is_important']
        new_event = {
                        "event_type": event_type,
                        "title": title,
                        "short_description": short_description,
                        "description": description,
                        "is_important": is_important,
                        "created_date": created_date,
                        "created_by": created_by
                    }
        common.current_db.Event.insert(new_event)   
        return simplejson.dumps({"result": 'success'}) 
    except:
        return simplejson.dumps({"result": 'error'}) 

    
       