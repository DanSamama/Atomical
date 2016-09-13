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
        context["chrono_list"] = db.getchronoListActivities("bootcamp", "winter 2015")
        self.response.write(template.render(context))


class ChronoList(webapp2.RequestHandler):
    def get(self, program, cohort):
        template = jinja_environment.get_template('/pages/index.html')
        context = {}
        context["version"] = getAppVersion()
        context["repository"] = db.getRepositoryActivities(program, cohort)
        context["chrono_list"] = db.getchronoListActivities(program, cohort)
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
        template = jinja_environment.get_template('/templates/repository_activity.html')
        context = {}
        context["activity"] = newActivity
        self.response.write(template.render(context))


class CreateDb(webapp2.RequestHandler):
    def get(self):
        activities = [{"title": "dan", "type": "LECTURE", "desc": "something...", "time_slots": 3},
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
    logging.info("ENTERING THE FUNCTION")

    def get(self):
        activityId = self.request.get("activity_id")
        currentNextId = self.request.get("current_next_id")
        currentPrevId = self.request.get("current_prev_id")
        originalNextId = self.request.get("original_next_id")
        originalPrevId = self.request.get("original_prev_id")


        if originalPrevId == "None":
            pass
            # console.log("i was first");
        else:
            # i was not first, my original prev should point at my original next
            logging.info("updating " + originalPrevId + " to point at " + originalNextId)
            originalPrev = db.getActivityById(originalPrevId)
            if originalPrev:
                originalPrev.next = originalNextId
                originalPrev.put()

        if currentNextId == "None":
            # i am now last
            activity = db.getActivityById(activityId)
            if activity:
                activity.next = None
                activity.status = "IN_CHRONOLIST"
                activity.put()
        else:
            # i am not last now
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
            # console.log("i was not last");

        if currentPrevId == "None":
            pass
            # console.log("i am now first");
        else:
            # i am not first now
            logging.info("updating " + currentPrevId + " to point at " + activityId)
            currentPrev = db.getActivityById(currentPrevId)
            if currentPrev:
                currentPrev.next = activityId
                currentPrev.put()


class updateScheduleActivity(webapp2.RequestHandler):
    logging.info("AMAZING FUNCTION!!!!!!!")

    def get(self):
        nextActivityid = self.request.get("nextActivity")
        prevActivityid = self.request.get("prevActivity")
        currentActivityid = self.request.get("currentActivity")

        logging.info("nextActivityid: " + nextActivityid + "prevActivityid : " + prevActivityid +  "currentActivityid : " + currentActivityid )

        currentActivity = db.getActivityById(currentActivityid)
        currentActivity.status = "IN_REPOSITORY"
        currentActivity.put()

        logging.info(" currentActivity.status = " +  currentActivity.status)

        if(prevActivityid is not None):
            prevActivity = db.getActivityById(prevActivityid)
            prevActivity.next = nextActivityid
            prevActivity.put()

            # if originalPrevId == "None":
            #
            #     pass
            #     #console.log("i was first");
            # else:
            #     #i was not first, my original prev should point at my original next
            #     logging.info("updating " + originalPrevId  + " to point at " + originalNextId)
            #     originalPrev = db.getActivityById(originalPrevId)
            #     if originalPrev:
            #         originalPrev.next = originalNextId
            #         originalPrev.put()
            #
            # if originalNextId == "None":
            #     pass
            #     # i was last, my original prev is now last
            #     originalPrev = db.getActivityById(originalPrevId)
            #     if originalPrev:
            #         originalPrev.next = None
            #         originalPrev.put()
            #
            # else:
            #     pass
            #     #console.log("i was not last");


class DeleteActivity(webapp2.RequestHandler):
    def get(self):
        currentActivityid = self.request.get("currentActivity")

        db.deleteActivityFromRepository(currentActivityid)




app = webapp2.WSGIApplication([
    ('/', MainHandler),

    ('/activity', ActivityForm),
    ('/schedule_activity', ScheduleActivity),
    ('/update_schedule_activity', updateScheduleActivity),
    ('/delete_activity', DeleteActivity),
    ('/create_db', CreateDb),
    routes.RedirectRoute('/repository/<program>/<cohort>', handler=ChronoList, name='chronolist', strict_slash=True),

], debug=True)
