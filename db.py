from google.appengine.ext import ndb
import logging


def getRepositoryActivities(programId, cohortId):
    return ndb.gql("SELECT * FROM Activity WHERE program = :1 and cohort = :2 and status = 'IN_REPOSITORY'", programId,
                   cohortId).fetch(1000)


def getchronoListActivities(programId, cohortId):
    return ndb.gql("SELECT * FROM Activity WHERE program = :1 and cohort = :2 and status = 'IN_CHRONOLIST'", programId,
                   cohortId).fetch(1000)


def getActivityById(activityId):
    return ndb.gql("SELECT * FROM Activity WHERE id = :1", activityId).get()


# def moveToRepositoryActivityById(activityId):
#     ndb.qql("UPDATE  ACTIVITY SET STATUS = 'IN_REPOSITORY' WHERE ID= :1" , activityId)
#
#
# def moveToChronolistActivityById(activityId):
#     ndb.qql("UPDATE  ACTIVITY SET STATUS = 'IN_CHRONOLIST' WHERE ID= :1" , activityId)

def deleteActivityFromRepository(activityId):
    logging.info("FIND ME THIS INFO : "+activityId)
    myentity = ndb.gql("SELECT * FROM Activity WHERE id = :1", activityId).get()
    myentity.key.delete()




