from google.appengine.ext import ndb


def getRepositoryActivities(programId, cohortId):
    return ndb.gql("SELECT * FROM Activity WHERE program = :1 and cohort = :2 and status = 'IN_REPOSITORY'", programId,
                   cohortId).fetch(1000)


def getchronoListActivities(programId, cohortId):
    return ndb.gql("SELECT * FROM Activity WHERE program = :1 and cohort = :2 and status = 'IN_CHRONOLIST'", programId,
                   cohortId).fetch(1000)


def getActivityById(activityId):
    return ndb.gql("SELECT * FROM Activity WHERE id = :1", activityId).get()


def getCalendarSetup(programId, cohortId):
    return ndb.gql("SELECT * FROM Calendar WHERE program = :1 and cohort = :2 and status = 'IN_CHRONOLIST'", programId,
                   cohortId).fetch(1000)
