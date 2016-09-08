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


class Calendar(ndb.Model):
    project_starting_day = ndb.DateTimeProperty()
    day_starting_hour = ndb.IntegerProperty()
    day_ending_hour = ndb.IntegerProperty()
    status = ndb.StringProperty()
    cohort = ndb.StringProperty()
    program = ndb.StringProperty()
