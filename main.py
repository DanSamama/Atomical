#!/usr/bin/env python
import os
import logging
import webapp2
import models
import db
from webapp2_extras import routes
from uuid import uuid4
import jinja2

jinja_environment = jinja2.Environment(loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))



def getAppVersion():
    return "v0.0.1"


# Generate an hash Id for every activity created
def generateId():
    return "slot-" + str(uuid4().hex)


# Hard coded user
def getCurrentLoggedInUser(self):
    return "Patrick"


class MainHandler(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('/pages/index.html')
        context = {}
        context["version"] = getAppVersion()
        context["repository"] = db.getRepositoryActivities("bootcamp", "winter 2015")
        context["calendar"] = db.getCalendarSetup("bootcamp", "winter 2015")
        context["chrono_list"] = db.getchronoListActivities("bootcamp", "winter 2015")
        self.response.write(template.render(context))


class ActivityForm(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('/forms/activity.html')
        context = {}
        context["version"] = getAppVersion()
        self.response.write(template.render(context))

    def post(self):
        newActivity = models.Activity()
        newActivity.id = generateId()
        newActivity.title = self.request.get("title")
        newActivity.creator = getCurrentLoggedInUser(self)
        newActivity.program = self.request.get("program")
        newActivity.cohort = self.request.get("cohort")
        newActivity.type = self.request.get("type")
        newActivity.desc = self.request.get("desc")
        newActivity.time_slots = int(self.request.get("time_slots"))
        newActivity.status = "IN_REPOSITORY"
        newActivity.put()
        self.response.write("activity saved")


class CalendarForm(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('/forms/calendarForm.html')
        context = {}
        context["version"] = getAppVersion()
        self.response.write(template.render(context))

    def post(self):
        newCalendar = models.Calendar()
        newCalendar.project_starting_day = self.request.get("project_starting_day")
        newCalendar.day_starting_hour = self.request.get("day_starting_hour")
        newCalendar.day_ending_hour = self.request.get("day_ending_hour")
        newCalendar.status = self.request.get("status")
        newCalendar.cohort = self.request.get("cohort")
        newCalendar.program = self.request.get("program")
        newCalendar.put()
        self.response.write("calendar saved")


class CreateDb(webapp2.RequestHandler):
    def get(self):
        activities = [{"title":"dan","type":"LECTURE","desc":"something...","time_slots":3},
                      {"title": "tzvi", "type": "LECTURE", "desc": "something...", "time_slots": 3},
                      {"title": "hilly", "type": "ASSIGNMENT", "desc": "something...", "time_slots": 2},
                      {"title": "gilad", "type": "EXERCISE", "desc": "something...", "time_slots": 3},
                      {"title": "shai", "type": "EXERCISE", "desc": "something...", "time_slots": 1},
                      {"title": "dana", "type": "LECTURE", "desc": "something...", "time_slots": 1}
                      ]

        for a in activities:
            newActivity = models.Activity()
            newActivity.id = generateId()
            newActivity.title = a['title']
            newActivity.creator = getCurrentLoggedInUser(self)
            newActivity.program = "bootcamp"
            newActivity.cohort = "winter 2015"
            newActivity.type = a['type']
            newActivity.desc = a['desc']
            newActivity.time_slots = a['time_slots']
            newActivity.status = "IN_REPOSITORY"
            newActivity.put()

class ScheduleActivity(webapp2.RequestHandler):
    def get(self):
        activityId = self.request.get("activity_id")
        currentNextId = self.request.get("current_next_id")
        currentPrevId = self.request.get("current_prev_id")
        originalNextId = self.request.get("original_next_id")
        originalPrevId = self.request.get("original_prev_id")

        if originalPrevId == "None":
            pass
            #console.log("i was first");
        else:
            #i was not first, my original prev should point at my original next
            logging.info("updating " + originalPrevId  + " to point at " + originalNextId)
            originalPrev = db.getActivityById(originalPrevId)
            if originalPrev:
                originalPrev.next = originalNextId
                originalPrev.put()

        if currentNextId == "None":
            #i am now last
            activity = db.getActivityById(activityId)
            if activity:
                activity.next = None
                activity.status = "IN_CHRONOLIST"
                activity.put()
        else:
            #i am not last now
            logging.info("updating " + activityId + " to point at " + currentNextId)
            activity = db.getActivityById(activityId)
            if activity:
                activity.next = currentNextId
                activity.status = "IN_CHRONOLIST"
                activity.put()

        if originalNextId == "None":
            pass
            # i was last, my original prev is now last
            # originalPrev = db.getActivityById(originalPrevId)
            # if originalPrev:
            #     originalPrev.next = None
            #     originalPrev.put()

        else:
            pass
            #console.log("i was not last");

        if currentPrevId == "None":
            pass
            #console.log("i am now first");
        else:
            #i am not first now
            logging.info("updating " + currentPrevId + " to point at " + activityId)
            currentPrev = db.getActivityById(currentPrevId)
            if currentPrev:
                currentPrev.next = activityId
                currentPrev.put()


        # #todo add extra prop
        # activity = db.getActivityById(activityId)
        # if activity:
        #     currentNext = activity.next
        #     activity.status = "IN_CHRONOLIST"
        #     prevActivity = db.getActivityById(prevActivityId)
        #     if prevActivity:
        #         prevActivity.next = activity.next
        #
        #
        #     if nextActivityId:
        #         activity.next = nextActivityId
        #         nexActivity = db.getActivityById(nextActivityId)
        #         if prevActivity:
        #             prevActivity.next = activityId
        #         #nexActivity.next = currentNext
        #         #nexActivity.put()
        #     else:
        #         activity.next = None
        #     activity.put()

        # if prevActivity:
        #     prevActivity.next = activityId
        #     prevActivity.put()

class MarkAsLast(webapp2.RequestHandler):
    def get(self):
        activityId = self.request.get("activity_id")
        activity = db.getActivityById(activityId)
        if activity:
            activity.next = None
            activity.put()




app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/activity', ActivityForm),
    ('/calendarForm',CalendarForm),
    ('/schedule_activity', ScheduleActivity),
    ('/mark_as_last', MarkAsLast),

    ('/create_db', CreateDb)

], debug=True)
