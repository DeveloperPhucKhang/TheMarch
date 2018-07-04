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
    from_addr = "themarchsite@gmail.com"
    to_addr = "duypv@outlook.com"
    try:       
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Comment t? The March website"
        msg['From'] = from_addr
        msg['To'] = to_addr
        text = "Hi!\nHow are you?\nHere is the link you wanted:\nhttps://www.python.org"
        html = """\
        <html>
          <head>Thông tin ng??i comment</head>
          <body>
            <p>Tên: {name}<br>
            Email: {mail}<br>
            Phone: {phone}<br>
            ??a ch?: {address}<br>
            ??a ch?: {address}<br>
            N?i dung: </p><br>
            <textarea rows="5">{mail_content}</textarea></br>
          </body>
        </html>
        """
        new_message = html.format(name=name,mail=mail,phone=phone,address=address,mail_content=mail_content)        
        #part1 = MIMEText(text, 'plain')
        part2 = MIMEText(new_message, 'html')
        #msg.attach(part1)
        msg.attach(part2)
        server = smtplib.SMTP(host='smtp.gmail.com', port=587)
        server.starttls()
        server.login(from_addr,'Admin@123')
        #server = smtplib.SMTP('localhost')
        server.set_debuglevel(1)
        server.sendmail(from_addr, to_addr, msg.as_string())
        server.quit()
    except Exception, e:
        return simplejson.dumps({"result": 'error',"message":str(e)})    
    return simplejson.dumps({"result": 'success'})