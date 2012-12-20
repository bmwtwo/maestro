var clickLengths;    // time between each click
var timeOfLastClick;

$(document).ready(function() {
   clickLengths = new Array();

   $("#recordingBox").on("click", function() {
      if ($("#theButton").attr("class") == "waiting") {
         timeOfLastClick = new Date();
         $("#theButton").removeClass("waiting").addClass("recording").html("Stop");
         $(this).children("p").fadeOut();
         return;
      }

      // only record click information if the user has asked you to
      if ($("#theButton").attr("class") != "recording") return;

      // else:
      // Store the current time in a varable throughout computations in an
      // attempt to avoid losing milliseconds. Just in case those come in
      // handy later.
      var currentTime = new Date(); 

      clickLengths.push(currentTime - timeOfLastClick);
      console.log(clickLengths.length);
      timeOfLastClick = currentTime;
   });

   $("#theButton").on("click", function() {
      if ($(this).attr("class") == "start") {
         $(this).html("Waiting...").removeClass("start").addClass("waiting");
         $(".instructions").html("When you're ready, click anywhere inside this box to the beat of your music. Click the stop button when you want the last note to end.");
      }
      else if ($(this).attr("class") == "recording") {
         $(this).removeClass("recording").html("Done!").attr("disabled", "disabled");
         clickLengths.push(new Date() - timeOfLastClick);
         console.log(clickLengths.length);
         displayResults();
      }
   });

   function displayResults() {
      $("#recordingBox").addClass("left");
      $("#recordingBox").append(clickLengths[0] + ": quarter<br />");

      for (var i = 1; i < clickLengths.length; i++) {
         // assume the first note is a quarter note, and work from high to low
         // for the current note
         var noteType = "half";
         // calculate how close this note is to a quarter note
         var previousDifference = clickLengths[0]*2 - clickLengths[i];

         var quarterDifference = Math.abs(clickLengths[0] - clickLengths[i]);
         if (previousDifference > 0 &&
               Math.abs(quarterDifference) < previousDifference) {
            noteType = "quarter";
            previousDifference = quarterDifference;
         }

         var eighthDifference = Math.abs(clickLengths[0]/2 - clickLengths[i]);
         if (quarterDifference > 0 &&
               Math.abs(eighthDifference) < previousDifference) {
            noteType = "eighth";
            previousDifference = eighthDifference;
         }
         $("#recordingBox").append(clickLengths[i] + ": " + noteType + "<br />");
      }
   }
});
