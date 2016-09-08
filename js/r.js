var R = {};
//NameSpace that we can use

R.init = function(){
    $(document).ready(function(){

        $(".clickable.slot.wide-btn").click(function(){
            $(".popup-wrapper").css("display","block");
        });

        R.sortBlockList();
        R.initRepository();
        R.calculateActivityTime();
        R.generateWeek(0);
        $(".left-panel").resizable({
            resizeHeight: false
        });
        $(".top-panel").resizable({
            resizeWidth: false
        });

        //Make the activities sortable between them. Being able to drag them
        // $(".repository #slots-container").sortable({
        //     revert: true,
        //     stop:function(event, ui){
        //         //todo add logic udpate linked list
        //         R.scheduleActivity(ui.item);
        //     },
        //     "axis":"y",
        //     containment: "parent"
        // });

        //make the chronoList activities sortable
        // $(".block-list .container").sortable({
        //     revert: true,
        //     stop:function(event, ui){
        //         //todo add logic udpate linked list
        //         R.scheduleActivity(ui.item);
        //     },
        //     "axis":"y",
        //     containment: "parent"
        // });
        //


            $(".block-list .container").sortable({
                connectWith: ".connectedSortable",
                stop:function(event, ui){
                 //todo add logic udpate linked list
                 R.scheduleActivity(ui.item);
             }
            }).disableSelection();


            $(".repository #slots-container").sortable({
                connectWith: ".connectedSortable"
            }).disableSelection();



        //$( "ul, li" ).disableSelection();



        $("#activityForm").bind("submit",function () {
            $.post("/activity",$(this).serialize(),function(result){
                $(".popup-wrapper").css("display","none");
                $(".popup").css("display","none");
                var createdActivity = $(result);
                $( ".repository #slots-container" ).prepend(createdActivity)
            });

            return false;
        });
    });
};

R.calculateActivityTime = function () {
    //print on every activity its date and calendar hours based on its index position

    //var currentWeek = 1;
    //var dayStartingHour = 9;
    //var dayEndingHour = 17;
    var numOfWeeks = 20;
    var dailyLength = 8;
    var daysInWeek = 5;
    var hoursInAweek = dailyLength * daysInWeek;
    var hoursCounter = 0;
    var hoursSkipped = 0;

    $(".block-list .slot").each(function(){
        var currentActivity = $(this);
        var currentActivityLength = parseInt(currentActivity.attr("data-activity-length"));
        var calculatedWeekNumber = Math.floor(hoursCounter / hoursInAweek);
        var calculatedHourInCurrentWeek = hoursCounter % hoursInAweek;
        var calculatedHour = calculatedHourInCurrentWeek % dailyLength;
        var remaningDayHours = dailyLength - calculatedHour;
        if (remaningDayHours  < currentActivityLength){
            hoursSkipped += remaningDayHours;
            hoursCounter += hoursSkipped;
            calculatedHourInCurrentWeek = hoursCounter % hoursInAweek;
            calculatedHour = calculatedHourInCurrentWeek % dailyLength;
        }
        var calculatedDayNumber = Math.floor(calculatedHourInCurrentWeek / dailyLength);
        hoursCounter += currentActivityLength;
        currentActivity.attr("data-week",calculatedWeekNumber);
        currentActivity.attr("data-day",calculatedDayNumber);
        currentActivity.attr("data-hour",calculatedHour);
        currentActivity.append("week: " + calculatedWeekNumber + " day: " + calculatedDayNumber + " hour: " + calculatedHour)
    });

};



R.generateWeek = function(weekNum){
    var weekActivities = $(".block-list .slot[data-week="+weekNum+"]");
    $(".week-schedule .day .content").empty();
    weekActivities.each(function(){
        var currentActivity = $(this);
        var currentActivityLength = parseInt(currentActivity.attr("data-activity-length"));
        var currentActivityDay = currentActivity.attr("data-day");
        var relevantDay = $(".week-schedule .day[data-day="+ currentActivityDay +"]");
        var activityRepresentation = $("<div />").addClass("scheduled-activity").text(currentActivity.attr("data-activity-title"));
        activityRepresentation.css("height",50 * currentActivityLength);
        relevantDay.find(".content").append(activityRepresentation);
    });
};




//after clicking "add" activity form, it takes the slot that contains this "add btn" and append the slot to the "chronolist" container in the html
R.initRepository = function(){
    $(".repository .slot .add").click(function(e){
        e.stopPropagation();
        //This variable return the closest slot that is next to where the user is clicking
        var currentActivity = $(this).closest(".slot");
        $(".block-list .container").append(currentActivity);
        R.scheduleActivity(currentActivity);
    });
};

R.sortBlockList = function(){
    var counter = 0;
    if ($(".block-list .slot:not(.sorted)").length > 1){
        while ($(".block-list .slot:not(.sorted)").length > 0){
            var unsortedBlock = $(".block-list .slot:not(.sorted)").first();

            var nextActivityId = unsortedBlock.attr("data-next");
            var unsortedBlockAndPrevSorted = unsortedBlock.add(unsortedBlock.prevUntil(".slot:not(.sorted)"));

            console.log(counter +".before");
            console.log($(".block-list .slot"));
            console.log(counter +". found " + unsortedBlock.attr("id") + " ---> " + nextActivityId);
            console.log("grabbing");
            console.log(unsortedBlockAndPrevSorted);
            if (nextActivityId != "None") {
                console.log("putting before .block-list .slot#" + nextActivityId);
                var nextBlock = $(".block-list .slot#" + nextActivityId);
                console.log(nextBlock);
                nextBlock.before(unsortedBlockAndPrevSorted);
            }else{
                console.log("putting last");
                $(".block-list .container").append(unsortedBlockAndPrevSorted)
            }
            unsortedBlock.addClass("sorted");
            console.log(counter +".after");
            console.log($(".block-list .slot"));
            console.log(counter +". end");
            counter++;

        }
    }
};

R.scheduleActivity = function(activity){
    var originalPrev = $(".block-list .slot[data-next='"+ activity.attr("id") +"']");
    var originalNext = $(".block-list .slot#" + activity.attr("data-next"));
    var prevActivity = activity.prev();
    var nextActivity = activity.next();
    var originalPrevId, originalNextId, currentPrevId, currentNextId;

    if (originalPrev.length == 0){
        originalPrevId ="None";
        console.log("i was first");
    }
    else{
        originalPrevId = originalPrev.attr("id");
        originalNextId = originalNext.attr("id");
        console.log("i was not first");

        originalPrev.attr("data-next", originalNextId)
    }

    if (nextActivity.length == 0){
        currentNextId = "None";
        activity.attr("data-next", "None");
        console.log("i am now last");
    }else{
        currentNextId = nextActivity.attr("id");
        console.log("i am not last now");
        activity.attr("data-next", currentNextId)
    }


    if (originalNext.length == 0){
        originalNextId = "None";
        console.log("i was last");
    }else{
        originalNextId = originalNext.attr("id");
        console.log("i was not last");
    }

    if (prevActivity.length == 0){
        currentPrevId = "None";
        console.log("i am now first");
    }else{
        currentPrevId = prevActivity.attr("id");
        prevActivity.attr("data-next", activity.attr("id"));
        console.log("i am not first now ");
    }


    $.get("/schedule_activity",{"activity_id":activity.attr("id"),"current_next_id":currentNextId,"current_prev_id":currentPrevId,"original_next_id":originalNextId,"original_prev_id":originalPrevId},function(){
        R.calculateActivityTime();
        R.generateWeek(0);
    });


};



R.init();