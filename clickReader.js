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
      // assume the first note is a quarter note, and work from high to low
      // for the current note
      $("#recordingBox").append('<img class="note quarter" src="images/quarter.png" />');
      var sixteenthRef = clickLengths[0] / 4;

      for (var i = 1; i < clickLengths.length; i++) {
         var sixteenths = Math.round(clickLengths[i] / sixteenthRef);
         var noteString = '';

         // place required whole notes
         while (Math.floor(sixteenths / 16) > 0) {
            noteString += '<img class="note whole" src="images/whole.png" />';
            sixteenths -= 16;
            if (sixteenths > 0) {
               noteString += '<div class="tie-top whole-tie"></div>';
               noteString += '<div class="tie whole-tie"></div>';
            }
         }

         // place remaining notes
         if (sixteenths > 0) {
            noteString += '<img class="note ';
            switch (sixteenths) {
               case 1:
                  noteString += 'sixteenth" src="images/sixteenth.png" />';
                  break;
               case 2:
                  noteString += 'eighth" src="images/eighth.png" />';
                  break;
               case 3:
                  noteString += 'dotted-eighth" src="images/dotted-eighth.png" />';
                  break;
               case 4:
                  noteString += 'quarter" src="images/quarter.png" />';
                  break;
               case 5:
                  noteString += 'quarter" src="images/quarter.png" />';
                  noteString += '<div class="tie-top quarter-tie"></div>';
                  noteString += '<div class="tie quarter-tie"></div>';
                  noteString += '<img class="note sixteenth" src="images/sixteenth.png" />';
                  break;
               case 6:
                  noteString += 'dotted-quarter" src="images/dotted-quarter.png" />';
                  break;
               case 7:
                  noteString += 'quarter" src="images/dotted-quarter.png" />';
                  noteString += '<div class="tie-top dotted-quarter-tie"></div>';
                  noteString += '<div class="tie dotted-quarter-tie"></div>';
                  noteString += '<img class="note sixteenth" src="images/sixteenth.png" />';
                  break;
               case 8:
                  noteString += 'half" src="images/half.png" />';
                  break;
               case 9:
                  noteString += 'half" src="images/half.png" />';
                  noteString += '<div class="tie-top half-tie"></div>';
                  noteString += '<div class="tie half-tie"></div>';
                  noteString += '<img class="note sixteenth" src="images/sixteenth.png" />';
                  break;
               case 10:
                  noteString += 'half" src="images/half.png" />';
                  noteString += '<div class="tie-top half-tie"></div>';
                  noteString += '<div class="tie half-tie"></div>';
                  noteString += '<img class="note eighth" src="images/eighth.png" />';
                  break;
               case 11:
                  noteString += 'half" src="images/half.png" />';
                  noteString += '<div class="tie-top half-tie"></div>';
                  noteString += '<div class="tie half-tie"></div>';
                  noteString += '<img class="note dotted-eighth" src="images/dotted-eighth.png" />';
                  break;
               case 12:
                  noteString += 'dotted-half" src="images/dotted-half.png" />';
                  break;
               case 13:
                  noteString += 'dotted-half" src="images/dotted-half.png" />';
                  noteString += '<div class="tie-top dotted-half-tie"></div>';
                  noteString += '<div class="tie dotted-half-tie"></div>';
                  noteString += '<img class="note sixteenth" src="images/sixteenth.png" />';
                  break;
               case 14:
                  noteString += 'dotted-half" src="images/dotted-half.png" />';
                  noteString += '<div class="tie-top dotted-half-tie"></div>';
                  noteString += '<div class="tie dotted-half-tie"></div>';
                  noteString += '<img class="note eighth" src="images/eighth.png" />';
                  break;
               case 15:
                  noteString += 'dotted-half" src="images/dotted-half.png" />';
                  noteString += '<div class="tie-top dotted-half-tie"></div>';
                  noteString += '<div class="tie dotted-half-tie"></div>';
                  noteString += '<img class="note dotted-eighth" src="images/dotted-eighth.png" />';
                  break;
               default:
                  console.log("tried to add a " + (sixteenths%16) + "/16");
            }
         }

         $("#recordingBox").append(noteString);
      }
   }
});
