import csv
import re
#import nltk.collocations
#import nltk.corpus
#import collections
#from nltk.corpus import brown
import json
import os
import time
import requests
from PIL import Image
from StringIO import StringIO
from requests.exceptions import ConnectionError
import urllib, cStringIO
import sys


berlin_kay_color_bin = ["white", "black", "red", "green", "yellow", "blue", "brown", "purple", "pink", "orange", "gray"]


out_file =  open('webcolors.csv', 'a')
writer = csv.writer(out_file, delimiter=',')
                            
def query_images(dirpath, query):
  BASE_URL = 'https://ajax.googleapis.com/ajax/services/search/images?'\
             'v=1.0&q=' + query + '&start=%d'
 
  BASE_PATH = dirpath #os.path.join(path, dir)
 
  if not os.path.exists(BASE_PATH):
    os.makedirs(BASE_PATH)
 
  r = requests.get(BASE_URL % 0)
  for i in range(0,6):
   for image_info in json.loads(r.text)['responseData']['results']:
     url = image_info['tbUrl']
     try:
       image_r = requests.get(url)
     except ConnectionError, e:
       print 'could not download %s' % url
       continue

     urlfile = cStringIO.StringIO(urllib.urlopen(url).read())
     try:
       im = Image.open(urlfile)
       rgbcolor = im.resize( (1,1), Image.ANTIALIAS).getpixel((0,0))      
      
       print rgbcolor
       return rgbcolor      
     except IOError, e:
       print e
       print 'could not save %s' % url


# Parse each line of responses.csv
reader = csv.reader(open("responses1.csv", 'rb'))
reader.next()
for row in reader:
	color_term = row[3].strip()
	print color_term
	rgbcolor = query_images('colorimages', color_term)
	
	# Write color-term, rgb values to csv
	writer.writerow([color_term, rgbcolor])
	

	#found = False
	#for l in list:
	#	if re.findall(l, color_term):
	#		found = True
	#		break
	#if (not found):
	#	print color_term




            


		

# For each term, go to Google Images and get dominant color and store rgb


# For each term, get the bigram co-occurence color word and get the rgb for that