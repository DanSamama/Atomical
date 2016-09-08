from google.appengine.ext import ndb
import logging

class Activity(ndb.Model):
    id = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    creator = ndb.StringProperty()
    program = ndb.StringProperty()
    cohort = ndb.StringProperty()
    type = ndb.StringProperty()
    title = ndb.StringProperty()
    desc = ndb.TextProperty()
    tags = ndb.StringProperty(repeated=True)
    files = ndb.StringProperty(repeated=True)
    time_slots = ndb.IntegerProperty()
    status = ndb.StringProperty()
    next = ndb.StringProperty()
