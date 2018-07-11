# -*- coding: utf-8 -*-
"""
Routes and views for the flask application.
"""
import sys
from datetime import datetime
from flask import render_template, send_from_directory, request
from TheMarch import app
import TheMarch.common as common
import os
import simplejson
from datetime import timedelta
from operator import itemgetter, attrgetter
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header

reload(sys)
sys.setdefaultencoding('utf-8')
#Mail info
from_addr = "themarchsite@gmail.com"
from_addr_pass = 'Admin@123'
to_addr = "livemusic.marchcom@gmail.com"
#cc = ['duypv250592@gmail.com']
#bcc = ['nguyenhuuhoanggiang@gmail.com']
cc = []
bcc = []
to_addrs = [to_addr] + cc + bcc

@app.route("/send_mail_message", methods=['POST'])
#@login_required
def send_mail_message():
    name = request.form['name']
    mail = request.form['mail']
    phone = request.form['phone']
    address = request.form['address']
    mail_content = request.form['mail_content']      
    
    try:       
        msg = MIMEMultipart('alternative')
        msg['Subject'] = Header("Tin nhắn từ The March website", 'utf-8')
        msg['From'] = from_addr
        msg['To'] = to_addr
        msg['CC'] = ', '.join(cc)
        msg['BCC'] = ', '.join(bcc)        
        html = """\
        <html>
          <head>Thông tin người comment từ trang The march: </head>
          <body>
            <p>Tên:         """ +str(name)+ """<br>
                Email:      """ +str(mail)+ """<br>
                Phone:      """ +str(phone)+ """<br>
                Địa chỉ:    """ +str(address)+ """<br>
                Nội dung:   """ +str(mail_content)+ """<br>           
            </p>
          </body>
        </html>
        """                    
        part2 = MIMEText(html, 'html', 'utf-8')        
        msg.attach(part2)
        server = smtplib.SMTP(host='smtp.gmail.com', port=587)
        server.starttls()
        server.login(from_addr,from_addr_pass)        
        server.set_debuglevel(1)
        server.sendmail(from_addr, to_addrs, msg.as_string())
        server.quit()
    except Exception, e:
        return simplejson.dumps({"result": 'error',"message":str(e)})    
    return simplejson.dumps({"result": 'success'})


@app.route("/send_mail_contact", methods=['POST'])
#@login_required
def send_mail_contact():
    name = request.form['name']
    mail = request.form['mail']
    
    try:       
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Yêu cầu gửi đơn báo giá chi tiết và form book show sự kiện từ The March website".decode('utf-8')
        msg['From'] = from_addr
        msg['To'] = to_addr
        msg['CC'] = ', '.join(cc)
        msg['BCC'] = ', '.join(bcc)        
        html = """\
        <html>
          <head>Thông tin người đề nghị từ trang The march: </head>
          <body>
            <p>Tên cá nhân/công ty: """ +str(name)+ """<br>
                Email:              """ +str(mail)+ """<br>                     
            </p>
          </body>
        </html>
        """                    
        part2 = MIMEText(html, 'html')        
        msg.attach(part2)
        server = smtplib.SMTP(host='smtp.gmail.com', port=587)
        server.starttls()
        server.login(from_addr,from_addr_pass)        
        server.set_debuglevel(1)
        server.sendmail(from_addr, to_addrs, msg.as_string())
        server.quit()
    except Exception, e:
        return simplejson.dumps({"result": 'error',"message":str(e)})    
    return simplejson.dumps({"result": 'success'})
