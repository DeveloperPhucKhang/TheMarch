import os
import glob
import TheMarch.common as common

#Get database
common.connect_db()
common.get_band_category()

__all__ = [os.path.basename(
    f)[:-3] for f in glob.glob(os.path.dirname(__file__) + "/*.py")]
#__all__.append('HomeController')