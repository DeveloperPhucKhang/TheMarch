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

@app.route("/send_mail_contact", methods=['POST'])
#@login_required
def send_mail_contact():
    name = request.form['name']
    mail = request.form['mail']
    phone = request.form['phone']
    address = request.form['address']
    mail_content = request.form['mail_content']
    
    me = "themarchsite@gmail.com"
    you = "duypv@outlook.com"
    try:   
        #credentials = get_credentials()
        #http = credentials.authorize(httplib2.Http())
        #service = discovery.build('gmail', 'v1', http=http)
        #msg_body = "test message"
        #message = CreateMessage(me, you, "Status report of opened tickets", msg_body)
        #SendMessage(service, "me", message)



   
    #msg = MIMEMultipart('alternative')
    #msg['Subject'] = "Test mail"
    #msg['From'] = me
    #msg['To'] = you
    #text = "Hi!\nHow are you?\nHere is the link you wanted:\nhttps://www.python.org"
    #html = """\
    #<html>
    #  <head></head>
    #  <body>
    #    <p>Hi!<br>
    #       How are you?<br>
    #       Here is the <a href="https://www.python.org">link</a> you wanted.
    #    </p>
    #  </body>
    #</html>
    #"""
      
    #    part1 = MIMEText(text, 'plain')
    #    part2 = MIMEText(html, 'html')
    #    #msg.attach(part1)
    #    msg.attach(part2)
    #    s = smtplib.SMTP('localhost')
    #    s.sendmail(me, you, msg.as_string())
    #    s.quit()
        server = smtplib.SMTP('localhost')
        server.set_debuglevel(1)
        server.sendmail(me, you, 'asdasdasd')
        server.quit()
    except Exception, e:
        return simplejson.dumps({"result": 'error',"message":str(e)})    
    return simplejson.dumps({"result": 'success'})