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

# flask-login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

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
@login_required
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
    return render_template('Admin/login-page.html', form = LoginForm())    
    #message = None
    #if common.reset_msg:
    #    message = common.reset_msg
    #    common.reset_msg = None
    #    return render_template('Admin/login.html', form = LoginForm(),
    #    reset_msg = message)
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
                    if max_banner.count() == 0:
                        banner_number = 1
                    else:
                        banner_number = int(max_banner[0]['index']) + 1
                    banner_number = str(banner_number)
                #file_name = file_name.replace(os.path.splitext(file_name)[0],
                #banner_number + '_banner')
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
    return render_template('Admin/banner.html',
        banner_data = list_banner,
        year=datetime.now().year,)

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
    return render_template('Admin/event.html',        
        year=datetime.now().year,)

#############
# Add Event controller
#############
@app.route("/admin/add_event", methods=['GET'])
#@login_required
def add_event():        
    return render_template('Admin/add-event.html',        
        year=datetime.now().year,)

#############
# Detail Event controller
#############
@app.route("/admin/detail_event/<string:eventid>", methods=['GET'])
#@login_required
def detail_event(eventid):        
    # Load detail data
    try:     
        item = common.load_event_detail_data(eventid)  
        return render_template('Admin/detail-event.html', 
            event_detail = item,       
            year=datetime.now().year,)
    except Exception, e:
        return render_template('Admin/detail-event.html',
            event_detail = [],
            year=datetime.now().year)

#############
# Event controller
#############
@app.route("/load_event_data", methods=['POST'])
def load_event_admin():
    try:
        list_event = common.load_event_data('admin')    
        return simplejson.dumps({"result": 'success', 'list_event': list_event})
    except Exception, e:
        return simplejson.dumps({"result": 'error'})

#############
# Event controller
#############
@app.route("/load_event_description", methods=['POST'])
def load_event_description():
    try:
        event_id = request.form['event_id']
        event = common.current_db.Event.find_one({"_id": ObjectId(event_id)}, {'_id': 1,'description': 1})
        description = None
        if event != None:
            description = {"description": event["description"]}
        return simplejson.dumps({"result": 'success', 'description': description})
    except:
        return simplejson.dumps({"result": 'error'})


@app.route("/add_event_db", methods=['POST'])
#@login_required
def add_event_db():  
    try:
        event_type = request.form['event_type']
        title = request.form['title']
        thumbnail = 'default.jpg'
        is_empty_thumbnail = request.form['is_empty_thumbnail']        
        thumbnail_detail = 'default.jpg'
        is_empty_thumbnail_detail = request.form['is_empty_thumbnail_detail']        
        description = request.form['description']
        short_description = request.form['short_description']
        created_date = datetime.now()
        created_date = '{0}/{1}/{2}'.format(created_date.year, created_date.month, created_date.day)
        created_by = 'admin'
        is_important = request.form['is_important']
        is_approve = 'false'
        if is_empty_thumbnail == 'false':
            #save thumbnail to server
            files = request.files['thumbnail_file']
            file_name = secure_filename(files.filename)
            file_name = common.gen_file_name(file_name,'TheMarch/' + app.config['EVENT_THUMBNAIL_FOLDER'])
            file_path = os.path.join('TheMarch/' + app.config['EVENT_THUMBNAIL_FOLDER'], file_name)   
            # save file to disk
            files.save(file_path)
            thumbnail = file_name
        if is_empty_thumbnail_detail == 'false':
            #save thumbnail detail to server
            files = request.files['thumbnail_file_detail']
            file_name = secure_filename(files.filename)
            file_name = common.gen_file_name(file_name,'TheMarch/' + app.config['EVENT_THUMBNAIL_FOLDER'])
            file_path = os.path.join('TheMarch/' + app.config['EVENT_THUMBNAIL_FOLDER'], file_name)   
            # save file to disk
            files.save(file_path)
            thumbnail_detail = file_name
        new_event = {
                        "event_type": event_type,
                        "title": title,
                        "thumbnail": thumbnail,
                        "thumbnail_detail": thumbnail_detail,
                        "short_description": short_description,
                        "description": description,
                        "is_important": is_important,
                        "is_approve": is_approve,
                        "created_date": created_date,
                        "created_by": created_by
                    }
        common.current_db.Event.insert(new_event)   
        return simplejson.dumps({"result": 'success'}) 
    except Exception, e:
        print 'error' + str(e)
        return simplejson.dumps({"result": 'error'}) 


@app.route("/update_event_db", methods=['POST'])
#@login_required
def update_event_db():  
    try:
        event_id = request.form['event_id']
        event_type = request.form['event_type']
        title = request.form['title']
        #thumbnail image
        old_thumbnail = request.form['old_thumbnail']
        thumbnail = old_thumbnail
        is_empty_thumbnail = request.form['is_empty_thumbnail']       
        #thumbnail detail image
        old_thumbnail_detail = request.form['old_thumbnail_detail']
        thumbnail_detail = old_thumbnail_detail
        is_empty_thumbnail_detail = request.form['is_empty_thumbnail_detail']        
        description = request.form['description']
        short_description = request.form['short_description']
        is_important = request.form['is_important']        
        if is_empty_thumbnail == 'false':
            #delete old thumnail
            #Delete old thumnail image, database
            if old_thumbnail != '' and old_thumbnail != 'default.jpg':            
                old_file_path = os.path.join('TheMarch/' + app.config['EVENT_THUMBNAIL_FOLDER'], old_thumbnail)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            #save thumbnail to server
            files = request.files['thumbnail_file']
            file_name = secure_filename(files.filename)
            file_name = common.gen_file_name(file_name,'TheMarch/' + app.config['EVENT_THUMBNAIL_FOLDER'])
            file_path = os.path.join('TheMarch/' + app.config['EVENT_THUMBNAIL_FOLDER'], file_name)   
            # save file to disk
            files.save(file_path)
            thumbnail = file_name
        if is_empty_thumbnail_detail == 'false':
            #delete old thumnail detail
            #Delete old thumnail detail image, database
            if old_thumbnail_detail != '' and old_thumbnail_detail != 'default.jpg':            
                old_file_path = os.path.join('TheMarch/' + app.config['EVENT_THUMBNAIL_FOLDER'], old_thumbnail_detail)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            #save thumbnail to server
            files = request.files['thumbnail_file_detail']
            file_name = secure_filename(files.filename)
            file_name = common.gen_file_name(file_name,'TheMarch/' + app.config['EVENT_THUMBNAIL_FOLDER'])
            file_path = os.path.join('TheMarch/' + app.config['EVENT_THUMBNAIL_FOLDER'], file_name)   
            # save file to disk
            files.save(file_path)
            thumbnail_detail = file_name
        update_event = {
                        "event_type": event_type,
                        "title": title,
                        "thumbnail": thumbnail,
                        "thumbnail_detail": thumbnail_detail,
                        "short_description": short_description,
                        "description": description,
                        "is_important": is_important,
                    }
        common.current_db.Event.update({"_id": ObjectId(event_id)}, {"$set": update_event})     
        return simplejson.dumps({"result": 'success'}) 
    except Exception, e:
        print 'error' + str(e)
        return simplejson.dumps({"result": 'error'}) 

#############
# Delete event
#############
@app.route("/delete_event", methods=['DELETE'])
#@login_required
def delete_event():   
    try:
        event_id = request.form['event_id'] 
        event = common.current_db.Event.find_one({"_id": ObjectId(event_id)})
        if event != None:
            #delete database
            common.current_db.Event.remove({"_id": ObjectId(event_id)})
            thumbnail = event.get('thumbnail')
            if thumbnail != 'default.jpg':
                #delete file thumbnail
                file_path = os.path.join(app.config['ROOT_FOLDER'] + app.config['EVENT_THUMBNAIL_FOLDER'], thumbnail)    
                if os.path.exists(file_path):
                    os.remove(file_path)                           
        return simplejson.dumps({'result': 'success'})        
    except:
        return simplejson.dumps({'result': 'error'})

#############
# Approve event
#############
@app.route("/approve_event", methods=['POST'])
#@login_required
def approve_event():   
    try:
        event_id = request.form['event_id'] 
        is_approve = request.form['is_approve']        
        common.current_db.Event.update({"_id": ObjectId(event_id)}, {"$set": {"is_approve": is_approve}})                    
        return simplejson.dumps({'result': 'success'})        
    except Exception, e:
        return simplejson.dumps({'result': 'error'})

#############
# Band thumbnail controller
#############
@app.route("/admin/band_thumbnail", methods=['GET'])
#@login_required
def band_thumbnail():    
    list_band = common.load_band_thumbnail()
    return render_template('Admin/band-thumbnail.html',
        band_data = list_band,
        year=datetime.now().year,)

#############
# Save band thumbnail info
#############
@app.route("/admin/save_band_thumbnail_info", methods=['POST'])
#@login_required
def save_band_thumbnail_info():   
    try:
        band_id = request.form['band_id']           
        name = request.form['name']
        url = request.form['url']
        common.current_db.Band_thumbnail.update({"_id": ObjectId(band_id)}, {"$set": {"name": name,"url": url}})                    
        return simplejson.dumps({'result': 'success'})        
    except Exception, e:
        return simplejson.dumps({'result': 'error'})

#############
# Upload band thumbnail
#############
@app.route("/admin/upload_band_thumbnail", methods=['POST'])
#@login_required
def upload_band_thumbnail():    
    files = request.files['file']
    if files:     
        try:     
            file_name = secure_filename(files.filename)
            file_name = common.gen_file_name(file_name,'TheMarch/' + app.config['BAND_IMAGE_FOLDER'])
            band_id = request.form['band_id']
            band_index = request.form['band_index']
            old_file_name = request.form['old_file_name']     
            #Delete old band image, database
            if old_file_name != '' and old_file_name != 'default.jpg':            
                old_file_path = os.path.join('TheMarch/' + app.config['BAND_IMAGE_FOLDER'], old_file_name)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)        
            file_name = band_index + '_' + file_name     
            file_path = os.path.join('TheMarch/' + app.config['BAND_IMAGE_FOLDER'], file_name)   
            # save file to disk
            files.save(file_path)
            #Image.open(files).save(file_path)
            # Save database
            common.current_db.Band_thumbnail.update({"_id": ObjectId(band_id)}, {"$set": {"thumbnail": file_name}})                
            return simplejson.dumps({'result': 'success', 'file_name' : file_name})
        except Exception, e:
            return simplejson.dumps({'result': 'error', 'error_message': str(e) ,'file_name' : 'No file'})
    else:
        return simplejson.dumps({"result": 'success', 'file_name' : 'No file'})    
       
@app.route("/refesh_band_thumbnail", methods=['GET'])
#@login_required
def refesh_band_thumbnail():    
    list_band = common.load_band_thumbnail()                
    return simplejson.dumps({'list_band': list_band})

#############
# Delete banner
#############
@app.route("/delete_band_thumbnail", methods=['DELETE'])
#@login_required
def delete_band_thumbnail():   
    file_name = request.form['file_name'] 
    band_index = request.form['band_index']
    band_id = request.form['band_id']
    file_path = os.path.join(app.config['ROOT_FOLDER'] + app.config['BAND_IMAGE_FOLDER'], file_name)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)            
        #update database
        common.current_db.Band_thumbnail.update({"_id": ObjectId(band_id)}, {"$set": {"thumbnail": 'default.jpg'}})
        return simplejson.dumps({'result': 'success'})        
    except:
        return simplejson.dumps({'result': 'error'})

#############
# Band user controller
#############
@app.route("/admin/band_user", methods=['GET'])
#@login_required
def band_user():    
    return render_template('Admin/band-user.html',
        year=datetime.now().year)

#############
# Event controller
#############
@app.route("/load_band_user_data", methods=['POST'])
def load_band_user_data():
    try:
        list_band = common.load_band_user()
        return simplejson.dumps({"result": 'success', 'list_band': list_band})
    except Exception, e:
        return simplejson.dumps({"result": 'error'})

#############
# Add band user
#############
@app.route("/admin/add_band_user", methods=['POST'])
#@login_required
def add_band_user():   
    try:
        name = request.form['name']           
        user = request.form['user']
        password = request.form['password']
        #Check exist user
        exist_user = common.current_db.User.find({"user": user})
        if exist_user.count() > 0:
            return simplejson.dumps({'result': 'error', 'message':'exist'})
        common.current_db.User.insert({
                                        "name": name, 
                                        "user": user, 
                                        "password": password,
                                        "role": "band"
                                        })                  
        return simplejson.dumps({'result': 'success'})        
    except Exception, e:
        return simplejson.dumps({'result': 'error'})


#############
# Add band user
#############
@app.route("/admin/update_band_user", methods=['POST'])
#@login_required
def update_band_user():   
    try:
        user_id = request.form['user_id']           
        name = request.form['name']           
        #user = request.form['user']
        password = request.form['password']
        if password != '':
            item = {"name": name,"password": password}
        else:
            item = {"name": name}
        common.current_db.User.update({"_id": ObjectId(user_id)}, {"$set": item})       
        return simplejson.dumps({'result': 'success'})        
    except Exception, e:
        return simplejson.dumps({'result': 'error'})

#############
# Delete band user
#############
@app.route("/delete_band_user", methods=['DELETE'])
#@login_required
def delete_band_user():   
    user_id = request.form['user_id']
    try:         
        #update database
        common.current_db.User.remove({"_id": ObjectId(user_id)})
        return simplejson.dumps({'result': 'success'})        
    except:
        return simplejson.dumps({'result': 'error'})

#############
# Event controller
#############
@app.route("/admin/band_detail", methods=['GET'])
#@login_required
def band_detail():        
    return render_template('Admin/band_detail.html',        
        year=datetime.now().year)

#############
# band detail controller
#############
@app.route("/load_band_detail_data", methods=['POST'])
def load_band_detail_data():
    try:
        list_band = common.load_band_data()    
        return simplejson.dumps({"result": 'success', 'list_band': list_band})
    except Exception, e:
        return simplejson.dumps({"result": 'error'})

#############
# Add band detail controller
#############
@app.route("/admin/add_band_detail", methods=['GET'])
#@login_required
def add_band_detail():        
    return render_template('Admin/add-band-detail.html',        
        year=datetime.now().year,)

@app.route("/add_band_detail_db", methods=['POST'])
#@login_required
def add_band_detail_db():  
    try:
        band_name = request.form['band_name']
        band_type = request.form['band_type']
        title = request.form['title']
        thumbnail = 'default.jpg'
        is_empty_thumbnail = request.form['is_empty_thumbnail']        
        thumbnail_detail = 'default.jpg'
        is_empty_thumbnail_detail = request.form['is_empty_thumbnail_detail']        
        description = request.form['description']
        short_description = request.form['short_description']
        created_date = datetime.now()
        created_date = '{0}/{1}/{2}'.format(created_date.year, created_date.month, created_date.day)
        created_by = 'admin'
        is_important = request.form['is_important']
        is_approve = 'false'
        if is_empty_thumbnail == 'false':
            #save thumbnail to server
            files = request.files['thumbnail_file']
            file_name = secure_filename(files.filename)
            file_name = common.gen_file_name(file_name,'TheMarch/' + app.config['BAND_IMAGE_FOLDER'])
            file_path = os.path.join('TheMarch/' + app.config['BAND_IMAGE_FOLDER'], file_name)   
            # save file to disk
            files.save(file_path)
            thumbnail = file_name
        if is_empty_thumbnail_detail == 'false':
            #save thumbnail detail to server
            files = request.files['thumbnail_file_detail']
            file_name = secure_filename(files.filename)
            file_name = common.gen_file_name(file_name,'TheMarch/' + app.config['BAND_IMAGE_FOLDER'])
            file_path = os.path.join('TheMarch/' + app.config['BAND_IMAGE_FOLDER'], file_name)   
            # save file to disk
            files.save(file_path)
            thumbnail_detail = file_name
        new_event = {
                        "band_name": band_name,
                        "band_type": band_type,
                        "title": title,
                        "thumbnail": thumbnail,
                        "thumbnail_detail": thumbnail_detail,
                        "short_description": short_description,
                        "description": description,
                        "is_important": is_important,
                        "is_approve": is_approve,
                        "created_date": created_date,
                        "created_by": created_by
                    }
        common.current_db.Band_detail.insert(new_event)   
        return simplejson.dumps({"result": 'success'}) 
    except Exception, e:
        print 'error' + str(e)
        return simplejson.dumps({"result": 'error'}) 

#############
# Detail band controller
#############
@app.route("/admin/detail_band_page/<string:eventid>", methods=['GET'])
#@login_required
def detail_band_page(eventid):        
    # Load detail data
    try:     
        item = common.load_band_detail_data(eventid)  
        return render_template('Admin/edit-band-detail.html', 
            band_detail = item,       
            year=datetime.now().year)
    except Exception, e:
        return render_template('Admin/edit-band-detail.html',
            band_detail = [],
            year=datetime.now().year)

#############
# band detail description controller
#############
@app.route("/load_band_detail_description", methods=['POST'])
def load_band_detail_description():
    try:
        band_id = request.form['band_id']
        event = common.current_db.Band_detail.find_one({"_id": ObjectId(band_id)}, {'_id': 1,'description': 1, "band_type": 1})
        description = None
        band_type = None
        if event != None:
            description = {"description": event["description"]}
            band_type = {"band_type": event["band_type"]}
        return simplejson.dumps({"result": 'success', 'description': description, 'band_type': band_type})
    except:
        return simplejson.dumps({"result": 'error'})

@app.route("/update_band_detail_db", methods=['POST'])
#@login_required
def update_band_detail_db():  
    try:
        band_id = request.form['band_id']
        band_name = request.form['band_name']
        band_type = request.form['band_type']
        title = request.form['title']
        #thumbnail image
        old_thumbnail = request.form['old_thumbnail']
        thumbnail = old_thumbnail
        is_empty_thumbnail = request.form['is_empty_thumbnail']       
        #thumbnail detail image
        old_thumbnail_detail = request.form['old_thumbnail_detail']
        thumbnail_detail = old_thumbnail_detail
        is_empty_thumbnail_detail = request.form['is_empty_thumbnail_detail']        
        description = request.form['description']
        short_description = request.form['short_description']
        is_important = request.form['is_important']        
        if is_empty_thumbnail == 'false':
            #delete old thumnail
            #Delete old thumnail image, database
            if old_thumbnail != '' and old_thumbnail != 'default.jpg':            
                old_file_path = os.path.join('TheMarch/' + app.config['BAND_IMAGE_FOLDER'], old_thumbnail)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            #save thumbnail to server
            files = request.files['thumbnail_file']
            file_name = secure_filename(files.filename)
            file_name = common.gen_file_name(file_name,'TheMarch/' + app.config['BAND_IMAGE_FOLDER'])
            file_path = os.path.join('TheMarch/' + app.config['BAND_IMAGE_FOLDER'], file_name)   
            # save file to disk
            files.save(file_path)
            thumbnail = file_name
        if is_empty_thumbnail_detail == 'false':
            #delete old thumnail detail
            #Delete old thumnail detail image, database
            if old_thumbnail_detail != '' and old_thumbnail_detail != 'default.jpg':            
                old_file_path = os.path.join('TheMarch/' + app.config['BAND_IMAGE_FOLDER'], old_thumbnail_detail)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            #save thumbnail to server
            files = request.files['thumbnail_file_detail']
            file_name = secure_filename(files.filename)
            file_name = common.gen_file_name(file_name,'TheMarch/' + app.config['BAND_IMAGE_FOLDER'])
            file_path = os.path.join('TheMarch/' + app.config['BAND_IMAGE_FOLDER'], file_name)   
            # save file to disk
            files.save(file_path)
            thumbnail_detail = file_name
        update_event = {
                        "band_name": band_name,
                        "band_type": band_type,
                        "title": title,
                        "thumbnail": thumbnail,
                        "thumbnail_detail": thumbnail_detail,
                        "short_description": short_description,
                        "description": description,
                        "is_important": is_important,
                        "is_approve": 'false',
                    }
        common.current_db.Band_detail.update({"_id": ObjectId(band_id)}, {"$set": update_event})     
        return simplejson.dumps({"result": 'success'}) 
    except Exception, e:
        print 'error' + str(e)
        return simplejson.dumps({"result": 'error'}) 

#############
# Approve event
#############
@app.route("/approve_band_detail", methods=['POST'])
#@login_required
def approve_band_detail():   
    try:
        band_id = request.form['band_id'] 
        is_approve = request.form['is_approve']        
        common.current_db.Band_detail.update({"_id": ObjectId(band_id)}, {"$set": {"is_approve": is_approve}})                    
        return simplejson.dumps({'result': 'success'})        
    except Exception, e:
        return simplejson.dumps({'result': 'error'})

#############
# Delete event
#############
@app.route("/delete_band_detail", methods=['DELETE'])
#@login_required
def delete_band_detail():   
    try:
        band_id = request.form['band_id'] 
        band = common.current_db.Band_detail.find_one({"_id": ObjectId(band_id)})
        if band != None:
            #delete database
            common.current_db.Band_detail.remove({"_id": ObjectId(band_id)})
            thumbnail = band.get('thumbnail')
            if thumbnail != 'default.jpg':
                #delete file thumbnail
                file_path = os.path.join(app.config['ROOT_FOLDER'] + app.config['BAND_IMAGE_FOLDER'], thumbnail)    
                if os.path.exists(file_path):
                    os.remove(file_path)                           
        return simplejson.dumps({'result': 'success'})        
    except:
        return simplejson.dumps({'result': 'error'})