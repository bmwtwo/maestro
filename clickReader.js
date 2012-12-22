var clickLengths;    // time between each click
var timeOfLastClick;
var numberOfBars;

$(document).ready(function() {
   clickLengths = new Array();

   $("#recordingBox").on("click", function() {
      if ($("#theButton").attr("class") == "waiting") {
         timeOfLastClick = new Date();
         $("#theButton").removeClass("waiting").addClass("recording").children("p").html("Stop");
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
         $(this).removeClass("start").addClass("waiting").children("p").html("Waiting...");
         $(".instructions").html("When you're ready, click anywhere inside this box to the beat of your music. Click the stop button when you want the last note to end.");
      }
      else if ($(this).attr("class") == "recording") {
         $(this).removeClass("recording").children("p").html("Done!");
         clickLengths.push(new Date() - timeOfLastClick);
         $("#recordingBox").addClass("left");
         $(".menu").removeClass("hidden");
         displayResults();
      }
   });

   $(".menuNote").on("click", function() {
      var sixteenths = parseInt($(this).attr("data-length"));
      $("#noteContainer").html('');
      displayResults(sixteenths);
   });

   function displayResults(lengthOfFirstNote) {
      // if not specified, assume the first note is a quarter note
      if (typeof(lengthOfFirstNote) === "undefined") var lengthOfFirstNote = 4;

      numberOfBars = 0;
      var noteString = placeNonWholeNote(lengthOfFirstNote);
      var sixteenthRef   = clickLengths[0] / lengthOfFirstNote;
      // sixteenths remaining in this 4:4 bar 
      var remainingInBar = 16 - lengthOfFirstNote;

      for (var i = 1; i < clickLengths.length; i++) {
         var sixteenths = Math.round(clickLengths[i] / sixteenthRef);

         // Fill the remainder of this bar (if necessary)
         // It is not necessary if the bar is empty (just fill in whole notes)
         // or if the current note will occupy less than the remainder of the
         // bar
         if (remainingInBar < 16 && sixteenths > remainingInBar) {
            noteString += fillRemainderOfBar(remainingInBar);
            sixteenths -= remainingInBar;
            remainingInBar = 16;
         }

         // Place required whole notes (if necessary)
         // Note that remainingInBar will always stay at 16, so there's
         // no need to reset it.
         noteString += placeWholeNotes(sixteenths);
         sixteenths %= 16;

         // place remaining notes (ones that don't overflow the end of a bar)
         if (sixteenths > 0) {
            noteString += placeNonWholeNote(sixteenths);
            remainingInBar -= sixteenths;
            if (remainingInBar == 0) {
               noteString += placeBarLine();
               remainingInBar = 16;
            }
         }
      }
      $("#noteContainer").append(noteString);

      function placeWholeNotes(sixteenths) {
         var noteString = '';
         while (Math.floor(sixteenths / 16) > 0) {
            noteString += '<img class="note whole" src="images/whole.png" />';
            sixteenths -= 16;
            if (sixteenths > 0) {
               noteString += placeTie(16);
            }
            noteString += placeBarLine();
         }

         return noteString;
      }
   }

   function fillRemainderOfBar(sixteenths) {
      var noteString = placeNonWholeNote(sixteenths);
      noteString += placeTie(sixteenths);
      return noteString + placeBarLine();
   }

   // This seems like it might have a more elegant solution. I'll try to return
   // to this when I'm no longer in a rush to finish it by Christmas.
   function placeNonWholeNote(sixteenths) {
      var noteString = '<img class="note ';
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
            noteString += placeTie(4);
            noteString += '<img class="note sixteenth" src="images/sixteenth.png" />';
            break;
         case 6:
            noteString += 'dotted-quarter" src="images/dotted-quarter.png" />';
            break;
         case 7:
            noteString += 'dotted-quarter" src="images/dotted-quarter.png" />';
            noteString += placeTie(6);
            noteString += '<img class="note sixteenth" src="images/sixteenth.png" />';
            break;
         case 8:
            noteString += 'half" src="images/half.png" />';
            break;
         case 9:
            noteString += 'half" src="images/half.png" />';
            noteString += placeTie(8);
            noteString += '<img class="note sixteenth" src="images/sixteenth.png" />';
            break;
         case 10:
            noteString += 'half" src="images/half.png" />';
            noteString += placeTie(8);
            noteString += '<img class="note eighth" src="images/eighth.png" />';
            break;
         case 11:
            noteString += 'half" src="images/half.png" />';
            noteString += placeTie(8);
            noteString += '<img class="note dotted-eighth" src="images/dotted-eighth.png" />';
            break;
         case 12:
            noteString += 'dotted-half" src="images/dotted-half.png" />';
            break;
         case 13:
            noteString += 'dotted-half" src="images/dotted-half.png" />';
            noteString += placeTie(12);
            noteString += '<img class="note sixteenth" src="images/sixteenth.png" />';
            break;
         case 14:
            noteString += 'dotted-half" src="images/dotted-half.png" />';
            noteString += placeTie(12);
            noteString += '<img class="note eighth" src="images/eighth.png" />';
            break;
         case 15:
            noteString += 'dotted-half" src="images/dotted-half.png" />';
            noteString += placeTie(12);
            noteString += '<img class="note dotted-eighth" src="images/dotted-eighth.png" />';
            break;
         default:
            console.log("tried to add a " + sixteenths + "/16 note");
      }

      return noteString;
   }

   function placeTie(sixteenths) {
      var noteString = '';
      switch (sixteenths) {
         case 1: case 5: case 7: case 9: case 13:
            noteString += '<div class="tie-top sixteenth-tie"></div>';
            noteString += '<div class="tie sixteenth-tie"></div>';
            break;
         case 2: case 10: case 14:
            noteString += '<div class="tie-top eighth-tie"></div>';
            noteString += '<div class="tie eighth-tie"></div>';
            break;
         case 3: case 11: case 15:
            noteString += '<div class="tie-top dotted-eighth-tie"></div>';
            noteString += '<div class="tie dotted-eighth-tie"></div>';
            break;
         case 4:
            noteString += '<div class="tie-top quarter-tie"></div>';
            noteString += '<div class="tie quarter-tie"></div>';
            break;
         case 6:
            noteString += '<div class="tie-top dotted-quarter-tie"></div>';
            noteString += '<div class="tie dotted-quarter-tie"></div>';
            break;
         case 8:
            noteString += '<div class="tie-top half-tie"></div>';
            noteString += '<div class="tie half-tie"></div>';
            break;
         case 12:
            noteString += '<div class="tie-top dotted-half-tie"></div>';
            noteString += '<div class="tie dotted-half-tie"></div>';
            break;
         case 16:
            noteString += '<div class="tie-top whole-tie"></div>';
            noteString += '<div class="tie whole-tie"></div>';
            break;
      }
      return noteString;
   }

   function placeBarLine() {
      numberOfBars++;
      return '<div class="barline"></div><p class="barNumber">' + numberOfBars + '</p>';
   }
});
