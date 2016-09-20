var R = {};
//NameSpace that we can use

R.init = function () {
    $(document).ready(function () {

        //clicking ont the + button to pop-up the form
        $("#add-new").click(function () {
            $(".popup-wrapper").css("display", "block");
            $(".popup").css("display", "block");
        });

        //clicking ont the add a stone button to pop-up the form
        $("#addStone").click(function(){
            $(".popWrapperStone").css("display", "block");
            $(".popupStone").css("display", "block");
        });


        //cross to close the Stone pop-up form
        $(".closingPopupStone").click(function () {
            $(".popWrapperStone").css("display", "none")
        });


        //cross to close the pop-up form
        $(".closingGrass").click(function () {
            $(".popup-wrapper").css("display", "none")
        });
        //Clicking on the generate calendar button, refresh the calendar
        $("#generateCalendar").click(function () {
            location.reload();
        });

        //Erase button function
        $(".repoDroppable .delete").click(function () {
            var currentActivity = $(this).closest(".slot");
            console.log(currentActivity.attr("id"));

            $.get("/delete_activity", {"currentActivity": currentActivity.attr("id")}, function () {
            });
        });

        R.initRepository();
        R.sortBlockList();
        R.calculateActivityTime();
        R.generateWeek(0);
        $(".left-panel").resizable({
            resizeHeight: false
        });
        $(".top-panel").resizable({
            resizeWidth: false
        });


        //switching between weeks in the calendar
        (function () {
            var counter = 0;
            $("#weekNum").text("Week " + counter);
            $("#prevWeek").click(function () {

                if (counter > 0) {
                    counter--;
                    R.generateWeek(counter);
                    $("#weekNum").text("Week " + counter);
                }
                else {
                    $("#prevWeek").css("disabled", "true")
                }
            });

            $("#nextWeek").click(function () {
                counter++;
                $("#weekNum").text("Week " + counter);
                R.generateWeek(counter);
            });
        })();



            //making the ChronoList sortable
        $(".block-list #slots-container2").sortable({
            connectWith: ".connectedSortable",
            update: function (event, ui) {

                $("#slots-container2 button.delete").css("display", "none");            //removing the "delete" button from "chronoList" activities
                R.scheduleActivity(ui.item);

            },
            receive: function (event, ui) {
                R.scheduleActivity(ui.item);
            }
        }).disableSelection();

            //making the repository sortable
        $(".repository #slots-container").sortable({
            connectWith: ".connectedSortable",
            receive: function (event, ui) {
                R.removeScheduleActivity(ui.item);

            }
        }).disableSelection();


        //$( "ul, li" ).disableSelection();


        //create new activity form
        $("#activityForm").bind("submit", function () {
            $.post("/activity", $(this).serialize(), function (result) {
                $(".popup-wrapper").css("display", "none");
                $(".popup").css("display", "none");
                var createdActivity = $(result);
                $(".repository #slots-container").prepend(createdActivity);

            });
            return false;
        });
    });
};

R.calculateActivityTime = function () {
    //print on every activity its date and calendar hours based on its index position

    var dayStartingHour = 9;
    var dayEndingHour = 18;
    var numOfWeeks = 20;
    var dailyLength = 9;
    var daysInWeek = 5;
    var hoursInAweek = dailyLength * daysInWeek;
    var hoursCounter = 0;
    var hoursSkipped = 0;
    var totalDailyHours = 0;


    $(".block-list .slot").each(function () {
        var currentActivity = $(this);
        var activityTitle = currentActivity.attr("data-activity-title");
        var activityType = currentActivity.attr("data-activity-type")
        var currentActivityLength = parseInt(currentActivity.attr("data-activity-length"));
        var calculatedWeekNumber = Math.floor(hoursCounter / hoursInAweek);

        var calculatedHourInCurrentWeek = hoursCounter % hoursInAweek;
        var calculatedHour = calculatedHourInCurrentWeek % dailyLength;
        var calculatedDayNumber = Math.floor(calculatedHourInCurrentWeek / dailyLength);


        var remaningDayHours = dailyLength - calculatedHour;
        var calculatedActivityStart = dayStartingHour + (hoursCounter - Math.floor(hoursCounter / dailyLength) * 9);
        var calculateActivityEnd = calculatedActivityStart + currentActivityLength;
        var relevantStone;
        var hoursUntilStoneFound = 0;
        for (var i = calculatedActivityStart ; i < Math.min(calculateActivityEnd +1,dayEndingHour)  ;i++){
            relevantStone = $(".stoneSlot[data-stone-week="+ calculatedWeekNumber +"][data-stone-day="+calculatedDayNumber+"][data-stone-start="+i+"]");
            console.debug(".stoneSlot[data-stone-week="+ calculatedWeekNumber +"][data-stone-day="+calculatedDayNumber+"][data-stone-start="+i+"]");
            console.debug(relevantStone.length)
            if (relevantStone.length > 0){
                break;
            }
            hoursUntilStoneFound++;
        }
        if (relevantStone && relevantStone.length > 0 ){
            var stoneLength = parseInt(relevantStone.attr("data-stone-length"));
            hoursCounter += stoneLength + hoursUntilStoneFound;
            hoursSkipped += hoursUntilStoneFound;
            calculatedHourInCurrentWeek = hoursCounter % hoursInAweek;
            calculatedHour = calculatedHourInCurrentWeek % dailyLength;
            calculatedDayNumber = Math.floor(calculatedHourInCurrentWeek / dailyLength);
            calculatedActivityStart = dayStartingHour + (hoursCounter - Math.floor(hoursCounter / dailyLength) * 9);
            calculateActivityEnd = calculatedActivityStart + currentActivityLength;
        }


        if (remaningDayHours < currentActivityLength) {
            hoursSkipped += remaningDayHours;
            hoursCounter += remaningDayHours;
            calculatedHourInCurrentWeek = hoursCounter % hoursInAweek;
            calculatedHour = calculatedHourInCurrentWeek % dailyLength;
            calculatedDayNumber = Math.floor(calculatedHourInCurrentWeek / dailyLength);
            calculatedActivityStart = dayStartingHour + (hoursCounter - Math.floor(hoursCounter / dailyLength) * 9);
            calculateActivityEnd = calculatedActivityStart + currentActivityLength;


            //Shit
            hoursUntilStoneFound = 0;
            for (var i = calculatedActivityStart ; i < Math.min(calculateActivityEnd +1,dayEndingHour)  ;i++){
                relevantStone = $(".stoneSlot[data-stone-week="+ calculatedWeekNumber +"][data-stone-day="+calculatedDayNumber+"][data-stone-start="+i+"]");
                console.debug(".stoneSlot[data-stone-week="+ calculatedWeekNumber +"][data-stone-day="+calculatedDayNumber+"][data-stone-start="+i+"]");
                console.debug(relevantStone.length)
                if (relevantStone.length > 0){
                    break;
                }
                hoursUntilStoneFound++;
            }
            if (relevantStone && relevantStone.length > 0 ){
                var stoneLength = parseInt(relevantStone.attr("data-stone-length"));
                hoursCounter += stoneLength + hoursUntilStoneFound;
                hoursSkipped += hoursUntilStoneFound;
                calculatedHourInCurrentWeek = hoursCounter % hoursInAweek;
                calculatedHour = calculatedHourInCurrentWeek % dailyLength;
                calculatedDayNumber = Math.floor(calculatedHourInCurrentWeek / dailyLength);
                calculatedActivityStart = dayStartingHour + (hoursCounter - Math.floor(hoursCounter / dailyLength) * 9);
                calculateActivityEnd = calculatedActivityStart + currentActivityLength;
            }
        }

        hoursCounter += currentActivityLength;

        console.log("currentActivityLength " + currentActivityLength);



        currentActivity.attr("data-week", calculatedWeekNumber);
        currentActivity.attr("data-day", calculatedDayNumber);
        currentActivity.attr("data-hour", calculatedHour);
        currentActivity.attr("data-activity-start", calculatedActivityStart);
        currentActivity.attr("data-activity-end", calculateActivityEnd);
        currentActivity.attr("data-activity-time_slots", currentActivityLength);
        currentActivity.attr("data-activity-title", activityTitle);


        currentActivity.text("");

        var text = currentActivity.html(( activityTitle + "</br>"+ "</br>" + currentActivityLength + " Hr." ));

        currentActivity.append(text);
    });
};


R.generateWeek = function (weekNum) {
    console.log("im in generate week");

    $(".week-schedule .day .content").empty();
    for(var d=0 ; d < 5; d++){
        var currentDay = $(".day[data-day="+d+"] .content")
        for(var h=0 ; h < 9; h++){
            var space = $("<div/>").addClass("space").attr("data-hour",h);
            currentDay.append(space);
        }
    }


    var weekActivities = $(".block-list .slot[data-week=" + weekNum + "]");
    var stones = $(".stoneSlot[data-stone-week=" + weekNum + "]");

    stones.each(function () {
        var currentStone = $(this);
        var currentStoneLength = parseInt(currentStone.attr("data-stone-length"));
        var currentStoneDay = currentStone.attr("data-stone-day");
        var currentStoneHourInDay = parseInt(currentStone.attr("data-stone-start")) - 9;
        var relevantDay = $(".week-schedule .day[data-day=" + currentStoneDay + "]");


        var stoneRepresentation = $("<div />");
        stoneRepresentation.addClass("stone");
        stoneRepresentation.addClass("stoneSlot");
        stoneRepresentation.attr("id", currentStone.attr("id"));
        //stoneRepresentation.html(currentStone.attr("data-activity-title") + "</br>" +
        // currentStone.attr("data-activity-start") + "-" + currentStone.attr("data-activity-end"));

        stoneRepresentation.css("height", 50 * currentStoneLength);

         $(".week-schedule .day[data-day=" + currentStoneDay + "] .space[data-hour= " + currentStoneHourInDay + "]").replaceWith(stoneRepresentation);

        var listOfSpacesToRemove = stoneRepresentation.nextAll().slice( 0, currentStoneLength -1 )
        listOfSpacesToRemove.remove();

    });




    weekActivities.each(function () {

        var currentActivity = $(this);
        console.log("container slot." + currentActivity.attr("data-type"));
        var currentActivityLength = parseInt(currentActivity.attr("data-activity-length"));
        var currentActivityDay = currentActivity.attr("data-day");
        var activityHourInDay = currentActivity.attr("data-hour");
        var relevantDay = $(".week-schedule .day[data-day=" + currentActivityDay + "]");

        var activityRepresentation = $("<div />");
        activityRepresentation.addClass(currentActivity.attr("data-type"));
        activityRepresentation.addClass("activitySlot");
        activityRepresentation.attr("id", currentActivity.attr("id"));
        activityRepresentation.html(currentActivity.attr("data-activity-title") + "</br>" + currentActivity.attr("data-activity-start") + "-" + currentActivity.attr("data-activity-end"));

        activityRepresentation.css("height", 50 * currentActivityLength);
       // relevantDay.find(".content").append(activityRepresentation);


        //relevantDay.find(".content").append(activityRepresentation);
        $(".week-schedule .day[data-day=" + currentActivityDay + "] .space[data-hour= " + activityHourInDay + "]").replaceWith(activityRepresentation);

        var listOfSpacesToRemove = activityRepresentation.nextAll().slice( 0, currentActivityLength -1 )
        console.log("GILAD " , listOfSpacesToRemove)
        listOfSpacesToRemove.remove();


        console.log("what we need------ " + $(".week-schedule .day[data-day=" + currentActivityDay + "] .space[data-hour= " + activityHourInDay + "]"));


        // for (var i = 0; i < currentActivityLength; i++) {
        //     var divToRemove = $(".week-schedule .day[data-day=" +currentActivityDay +"] .space[data-hour= " + activityHourInDay +"]");
        //     divToRemove.remove();
        //
        //
        //     var day = parseInt(currentActivityDay);
        //     var hour = parseInt(activityHourInDay);
        //     console.log("THE DAY" + typeof(day) + day);
        //     console.log("THE HOUR" + typeof(hour) + hour);
        //     // $(".week-schedule .day[data-day="+day+"] .space[data-hour="+hour+"]").remove();
        //     console.log(typeof(2));
        //     $(".week-schedule .day[data-day=" + day + "] .space[data-hour=" + hour + "]").remove();
        //
        //     // $(".week-schedule .day[data-day=1] .space[data-hour=6]").remove();
        //     // console.log("this is the div to remove: " + divToRemove);
        //
        // }
    });
};


//after clicking "add" activity form, it takes the slot that contains this "add btn" and append the slot to the "chronolist" container in the html
R.initRepository = function () {

    // This variable return the closest slot that is next to where the user is clicking
    $(".repository .slot .add").click(function (e) {
        e.stopPropagation();

        //This variable return the closest slot that is next to where the user is clicking
        var currentActivity = $(this).closest(".slot");
        $(".block-list .container").append(currentActivity);
        R.scheduleActivity(currentActivity);
    });
};

R.sortBlockList = function () {
    var counter = 0;
    if ($(".block-list .slot:not(.sorted)").length > 1) {
        while ($(".block-list .slot:not(.sorted)").length > 0) {
            var unsortedBlock = $(".block-list .slot:not(.sorted)").first();

            var nextActivityId = unsortedBlock.attr("data-next");
            var unsortedBlockAndPrevSorted = unsortedBlock.add(unsortedBlock.prevUntil(".slot:not(.sorted)"));

            // console.log(counter +".before");
            // console.log($(".block-list .slot"));
            // console.log(counter +". found " + unsortedBlock.attr("id") + " ---> " + nextActivityId);
            // console.log("grabbing");
            // console.log(unsortedBlockAndPrevSorted);
            if (nextActivityId != "None") {
                // console.log("putting before .block-list .slot#" + nextActivityId);
                var nextBlock = $(".block-list .slot#" + nextActivityId);
                // console.log(nextBlock);
                nextBlock.before(unsortedBlockAndPrevSorted);
            } else {
                // console.log("putting last");
                $(".block-list .container").append(unsortedBlockAndPrevSorted)
            }
            unsortedBlock.addClass("sorted");
            // console.log(counter +".after");
            // console.log($(".block-list .slot"));
            // console.log(counter +". end");
            counter++;

        }
    }
};

R.scheduleActivity = function (activity) {
    var originalPrev = $(".block-list .slot[data-next='" + activity.attr("id") + "']");
    var originalNext = $(".block-list .slot#" + activity.attr("data-next"));
    var prevActivity = activity.prev();
    var nextActivity = activity.next();
    var originalPrevId, originalNextId, currentPrevId, currentNextId;


    if (originalPrev.length == 0) {
        originalPrevId = "None";
        // console.log("i was first");
    }
    else {
        originalPrevId = originalPrev.attr("id"); //REMOVING case middle
        originalNextId = originalNext.attr("id");
        // console.log("i was not first");

        originalPrev.attr("data-next", originalNextId)
    }

    if (nextActivity.length == 0) {
        currentNextId = "None";
        activity.attr("data-next", "None");
        // console.log("i am now last");
    } else {
        currentNextId = nextActivity.attr("id");
        // console.log("i am not last now");
        activity.attr("data-next", currentNextId)
    }


    if (originalNext.length == 0) { //REMOVING
        originalNextId = "None";
        // console.log("i was last");
    } else {
        originalNextId = originalNext.attr("id");
        // console.log("i was not last");
    }

    if (prevActivity.length == 0) {
        currentPrevId = "None";
        // console.log("i am now first");
    } else {
        currentPrevId = prevActivity.attr("id");
        prevActivity.attr("data-next", activity.attr("id"));
        // console.log("i am not first now ");
    }


    $.get("/schedule_activity", {
        "activity_id": activity.attr("id"),
        "current_next_id": currentNextId,
        "current_prev_id": currentPrevId,
        "original_next_id": originalNextId,
        "original_prev_id": originalPrevId
    }, function () {
        // console.log("updated server calling calculate activity");
        R.calculateActivityTime();
        R.generateWeek(0);
    });

};

///////////////////////////////////////////////////////////////////////////

R.removeScheduleActivity = function (activity) {
    // console.log(activity);
    // var originalPrev = $(".block-list .slot[data-next='"+ activity.attr("id") +"']");
    // var originalNext = $(".block-list .slot#" + activity.attr("data-next"));
    // var originalPrevId, originalNextId, currentPrevId, currentNextId;
    //
    //
    // // console.log("CHECK");
    //
    // if (originalPrev.length == 0){
    //     originalPrevId ="None";
    //     // console.log("i was first");
    // }
    // else{
    //     originalPrevId = originalPrev.attr("id"); //REMOVING case middle
    //     originalNextId = originalNext.attr("id");
    //     // console.log("i was not first");
    //
    //     originalPrev.attr("data-next", originalNextId)
    // }
    //
    // if (originalNext.length == 0){ //REMOVING
    //     originalNextId = "None";
    //     // console.log("i was last");
    // }else{
    //     originalNextId = originalNext.attr("id");
    //     // console.log("i was not last");
    // }
    //
    // $.get("/remove_schedule_activity",{"original_next_id":originalNextId,"original_prev_id":originalPrevId},function(){
    //     // console.log("updated removing");
    //     R.calculateActivityTime();
    //     R.generateWeek(0);
    // });

    nextActivity = (activity[0].nextElementSibling != null ? activity[0].nextElementSibling.id : null);
    prevActivity =(activity[0].previousElementSibling != null ? activity[0].previousElementSibling.id : null);
    currentActivity = activity[0].id;


    $.get("/update_schedule_activity",{"currentActivity":currentActivity , "nextActivity":nextActivity,"prevActivity":prevActivity},function(){
        R.calculateActivityTime();
        R.generateWeek(0);
    });

};

// R.addingTheStone = function(activity){
//     var previousActivityId = $(".stone").previousElementSibling.attr("id");
//     var nextActivityId = $(".stone").nextElementSibling.attr("id");
//
//     if (previousActivityId == "None"){
//         //prepend the stone to NextActivityId of the block-list
//     }
//     else{
//         if (nextActivityId == "None"){
//             //append the stone to the previousActivityId of the block-list
//         }
//         else{
//             //prepend the stone to NExtActivityId or append the stone to previousActivityId of the block-list
//         }
//     }
//
//
// };






R.init();









