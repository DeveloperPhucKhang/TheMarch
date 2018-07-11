import sys
from os import environ
from TheMarch import app

if __name__ == '__main__':
    reload(sys)
    sys.setdefaultencoding('utf-8')
    HOST = environ.get('SERVER_HOST', 'localhost')
    try:
        PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.run(host='0.0.0.0', port=80)
    #app.run(debug=True, use_reloader=True)
    
