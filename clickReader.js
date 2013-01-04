var clickLengths;    // time between each click
var timeOfLastClick;
var numberOfBars;
var selectedNoteID;
var noteCount;       // number of notes in the song
var firstNoteLength; // number of sixteenths in first note of the song
var startTime;       // used to determine total runtime of the song
var runTime;         // total length of song
var totalSixteenths; // used to determine beats per minute
var $selectedLightBar;

$(document).ready(function() {
   // initialize variables and set defaults
   clickLengths   = new Array();
   selectedNoteID = null;
   $selectedLightBar = null;
   firstNoteLength = 4;
   $("#saveDialog").dialog({ autoOpen: false, modal: true });
   $("#loadDialog").dialog({
      autoOpen: false,
      modal:    true,
      buttons:  [ { text: "Load", click: function() {
                     $(this).attr("data-loaded", "true");
                     $(this).dialog("close");
                     loadSong($(this).children("textarea").val());
                  } },
                  { text: "Cancel", click: function() {
                     $(this).dialog("close");
                  } }
      ],
      close:    function() {
         // if the load button was pressed:
         if ($(this).attr("data-loaded") === "true") {
            $("#loadButton").slideUp();
            return;
         }
         // else
         $("#loadButton").animate({ width: "50%" }, function() {
            $("#newButton").slideDown();
         });
      }
   });

   $(document).on("keydown", function(e) {
      if (event.keyCode == 8) { // delete key was pressed
         if ($selectedLightBar !== null) {
            $selectedLightBar.remove();
            $selectedLightBar = null;
         }
         return false;
      }
   });

   $("#recordingBox").on("click", function() {
      if ($("#newButton").hasClass("waiting")) {
         timeOfLastClick = new Date();
         startTime = timeOfLastClick;

         $("#newButton").removeClass("waiting").addClass("recording").children("p").html("Stop");
         $(".instructions").fadeOut();
         return;
      }

      // only record click information if the user has asked you to
      if (!$("#newButton").hasClass("recording")) return;

      // else:
      // Store the current time in a varable throughout computations in an
      // attempt to avoid losing milliseconds. Just in case those come in
      // handy later.
      var currentTime = new Date(); 

      clickLengths.push(currentTime - timeOfLastClick);
      timeOfLastClick = currentTime;
   });

   $("#newButton").on("click", function() {
      if ($(this).hasClass("start")) {
         $("#loadButton").slideUp(function() {
            $("#newButton").animate({ width: '100%' }, function() {
               $(this).removeClass("start").addClass("waiting").children("p").html("Waiting...");
               $(".instructions").html("When you're ready, click anywhere inside this box to the beat of your music. Click the stop button when you want the last note to end.");
            });
         });
      }
      else if ($(this).hasClass("recording")) {
         $(this).removeClass("recording").slideUp();
         clickLengths.push(new Date() - timeOfLastClick);
         runTime = (new Date() - startTime) / 1000;

         displayResults();
      }
   });

   $("#loadButton").on("click", function() {
      $(this).css({ float: "right"});
      $("#newButton").slideUp(function() {
         $("#loadButton").animate({ width: '100%'}, function() {
            $("#loadDialog").dialog("open");
         });
      });
   });

   $(document).on("click", ".note", function() {
      // you can't edit the first note via this menu
      if ($(this).attr("data-note-id") === "0") return;

      if (selectedNoteID === null) {
         $("#correctNoteMenu").parent().removeClass("disabled");
      }
      else {
         $('[data-note-id="' + selectedNoteID + '"]').removeClass("selected");
      }
         
      var noteID = $(this).attr("data-note-id");
      $('[data-note-id="' + noteID + '"]').addClass("selected");
      selectedNoteID = noteID;
   });

   $(document).on("click", "#timingLineContainer", function(e) {
      var arr = $(".timingLine");
      // -2 to prevent lightBars running off the end of the score
      findLine(e, arr, 0, arr.length-2); 
   });

   // binary search for the line closest to the position you clicked
   function findLine(e, arr, lo, hi) {
      if (hi < lo) return;

      var mid = lo + Math.floor( (hi-lo)/2 );
      var $line = $(arr[mid]);
      var difference = $line.offset().left - e.pageX;
      //console.log("hi is " + hi + ", lo is " + lo + ", mid is " + mid);

      if (difference <= 0 && difference > -10) {
         // find which row lightBar should go in
         var lightBarClass;
         if (e.pageY >= $('#light4Label').offset().top) {
            lightBarClass = 'light4';
         } else if (e.pageY >= $('#light3Label').offset().top) {
            lightBarClass = 'light3';
         } else if (e.pageY >= $('#light2Label').offset().top) {
            lightBarClass = 'light2';
         } else if (e.pageY >= $('#light1Label').offset().top) {
            lightBarClass = 'light1';
         } else {
            return; // the user didn't click near one of the labels
         }

         // only add a lightBar if one does not already exist at this position
         $existingLightBar = $('.lightBar.' + lightBarClass + '[data-offset="' + Math.round($line.position().left) + '"]');
         if ($existingLightBar.length > 0) {
            if ($selectedLightBar !== null) $selectedLightBar.removeClass('lightBarSelected');
            $existingLightBar.addClass('lightBarSelected');
            $selectedLightBar = $existingLightBar;
            return;
         }

         var lightBar = '<div class="lightBar ' + lightBarClass + '" data-light="light1" style="left: ' + $line.css('left') + '" data-offset="' + Math.round($line.position().left) + '"></div>'; 
         $('#timingLineContainer').append(lightBar);
         //makeDraggable($('.lightBar[style="left: ' + $line.css('left') + '"]'));
      }
      else if (difference > 0) {
         findLine(e, arr, lo, mid-1);
      }
      else {
         findLine(e, arr, mid+1, hi);
      }
   }

   $(".firstNoteOption").on("click", function() {
      firstNoteLength = parseInt($(this).attr("data-length"));
      repaintScore();
   });

   $(".correctionOption").on("click", function() {
      var thisNoteLength = parseInt($(this).attr("data-length"));

      var scalingRatio = thisNoteLength / firstNoteLength;
      clickLengths[selectedNoteID] = clickLengths[0] * scalingRatio;
      repaintScore();
   });

   $("#minutesInput, #secondsInput, #centisecondsInput").on("click", function() {
      updateRuntime();
      updateRuntimeDisplay();
   });

   $("#saveNotes").on("click", function() {
      var sixteenthRef   = clickLengths[0] / firstNoteLength;
      output = firstNoteLength + ',';
      for (var i = 1; i < clickLengths.length; i++) {
         var sixteenths = Math.round(clickLengths[i] / sixteenthRef);
         output += sixteenths + ',';
      }
      output += runTime;
      $("#saveDialog").children("textarea").val(output);
      $("#saveDialog").dialog("open");
   });

   $("#saveChoreo").on("click", function() {
      var lightIsOn = [false, false, false, false];
      var timeSoFar = 0;
      var output = '';
      var containerWidth = $('#timingLineContainer').width();

      for (var offset = 0; offset <= containerWidth; offset+=10) {
         var outputLine = '';
         for (var i = 0; i < 4; i++) {
            $lightBars = $('.light' + (i+1) + '[data-offset="' + offset + '"]');
            if (lightIsOn[i] && $lightBars.length == 0) {
               outputLine += i + ''  + 0;
               lightIsOn[i] = false;
            }
            else if (!lightIsOn[i] && $lightBars.length > 0) {
               outputLine += i + '' + 1;
               lightIsOn[i] = true;
            }
         }
         var currentTime = offset/containerWidth * runTime * 1000;
         if (outputLine !== "") {
            output += Math.round(currentTime - timeSoFar) + ' ' + outputLine + '\n';
            // TOOD: think about making this line more efficient when you're
            // less tired
            timeSoFar += Math.round(currentTime - timeSoFar);
         }
      }

      $("#saveDialog").children("textArea").val(output);
      $("#saveDialog").dialog("open");
   });

   function displayResults() {
      $("#recordingBox").addClass("left");
      $(".menu, #labelColumn, #timingLineContainer").removeClass("hidden");

      numberOfBars = 0;
      noteCount    = 0;
      var noteString = placeNonWholeNote(firstNoteLength);
      var sixteenthRef   = clickLengths[0] / firstNoteLength;
      // sixteenths remaining in this 4:4 bar 
      var remainingInBar = 16 - firstNoteLength;

      for (var i = 1; i < clickLengths.length; i++) {
         noteCount++;
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

      totalSixteenths = 16 * (numberOfBars+1) - remainingInBar;
      placeReferenceLines();
      updateRuntimeDisplay();
      updateRuntimeInputs();
   }

   function placeWholeNotes(sixteenths) {
      var noteString = '';
      while (Math.floor(sixteenths / 16) > 0) {
         noteString += '<img data-note-id="' + noteCount + '" class="note whole" src="images/whole.png" />';
         sixteenths -= 16;
         if (sixteenths > 0) {
            noteString += placeTie(16);
         }
         noteString += placeBarLine();
      }

      return noteString;
   }

   function fillRemainderOfBar(sixteenths) {
      var noteString = placeNonWholeNote(sixteenths);
      noteString += placeTie(sixteenths);
      return noteString + placeBarLine();
   }

   // This seems like it might have a more elegant solution. I'll try to return
   // to this when I'm no longer in a rush to finish it by Christmas.
   function placeNonWholeNote(sixteenths) {
      var noteString = '<img data-note-id="' + noteCount + '" class="note ';
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
            noteString += '<img data-note-id="' + noteCount + '" class="note sixteenth" src="images/sixteenth.png" />';
            break;
         case 6:
            noteString += 'dotted-quarter" src="images/dotted-quarter.png" />';
            break;
         case 7:
            noteString += 'dotted-quarter" src="images/dotted-quarter.png" />';
            noteString += placeTie(6);
            noteString += '<img data-note-id="' + noteCount + '" class="note sixteenth" src="images/sixteenth.png" />';
            break;
         case 8:
            noteString += 'half" src="images/half.png" />';
            break;
         case 9:
            noteString += 'half" src="images/half.png" />';
            noteString += placeTie(8);
            noteString += '<img data-note-id="' + noteCount + '" class="note sixteenth" src="images/sixteenth.png" />';
            break;
         case 10:
            noteString += 'half" src="images/half.png" />';
            noteString += placeTie(8);
            noteString += '<img data-note-id="' + noteCount + '" class="note eighth" src="images/eighth.png" />';
            break;
         case 11:
            noteString += 'half" src="images/half.png" />';
            noteString += placeTie(8);
            noteString += '<img data-note-id="' + noteCount + '" class="note dotted-eighth" src="images/dotted-eighth.png" />';
            break;
         case 12:
            noteString += 'dotted-half" src="images/dotted-half.png" />';
            break;
         case 13:
            noteString += 'dotted-half" src="images/dotted-half.png" />';
            noteString += placeTie(12);
            noteString += '<img data-note-id="' + noteCount + '" class="note sixteenth" src="images/sixteenth.png" />';
            break;
         case 14:
            noteString += 'dotted-half" src="images/dotted-half.png" />';
            noteString += placeTie(12);
            noteString += '<img data-note-id="' + noteCount + '" class="note eighth" src="images/eighth.png" />';
            break;
         case 15:
            noteString += 'dotted-half" src="images/dotted-half.png" />';
            noteString += placeTie(12);
            noteString += '<img data-note-id="' + noteCount + '" class="note dotted-eighth" src="images/dotted-eighth.png" />';
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

   function placeReferenceLines() {
      var i;
      for (i = 0; i <= 2*totalSixteenths; i++) { // lines spaced as 1/32 notes
         var lineString = '<div class="timingLine timingLine';
         if (i % 32 == 0) {
            lineString += '1';
         } else if (i % 8 == 0) {
            lineString += '2';
         } else if (i % 4 == 0) {
            lineString += '3';
         } else {
            lineString += '4';
         }
         $("#timingLineContainer").append(lineString + '" style="left: ' + (10*i) + 'px"></div>');
      }
      $("#timingLineContainer").css('width', 10*(i-1) + 'px');
   }

   function repaintScore() {
      var lightBars = $('.lightbar');
      $("#noteContainer").html('<div id="timingLineContainer"></div>');
      selectedNoteID = null;
      $("#correctNoteMenu").parent().addClass("disabled");
      displayResults();
      $('#timingLineContainer').append(lightBars);
   }

   function updateRuntime() {
      runTime = 60 * parseInt($("#minutesInput").val());
      runTime += parseInt($("#secondsInput").val());
      runTime += parseInt($("#centisecondsInput").val()) / 100;
   }

   function updateRuntimeDisplay() {
      var minutes = Math.floor(runTime / 60);
      $("#runTime").html(minutes);

      var seconds = Math.floor(runTime % 60);
      $("#runTime").append(':' + pad(seconds, 2));

      var centiseconds = Math.round(runTime*100 % 100);
      $("#runTime").append(':' + pad(centiseconds, 2));

      var beats = totalSixteenths / 4;
      $("#runTime").append(' | ' + Math.round(beats * 60 / runTime) + ' bpm');
   }

   function updateRuntimeInputs() {
      var minutes = Math.floor(runTime / 60);
      $("#minutesInput").val(minutes);

      var seconds = Math.floor(runTime % 60);
      $("#secondsInput").val(seconds);

      var centiseconds = Math.round(runTime*100 % 100);
      $("#centisecondsInput").val(centiseconds);
   }

   function loadSong(input) {
      var inputArray = input.split(",");
      runTime = inputArray.pop();
      for (var i in inputArray) {
         clickLengths.push(parseInt(inputArray[i]));
      }
      firstNoteLength = clickLengths[0];
      displayResults();
   }

   /*function makeDraggable($lightBar) {
      // prevent from overlapping?
      $lightBar.resizable({
         grid: [10, 1],
         minHeight: 17,
         maxHeight: 17,
         handles: "e, w",
         resize: function(e, ui) {
            fixLeftOverflow(ui);
            fixRightOverflow(ui);
            //console.log("resizing");
         },
         stop: function(e, ui) {
            fixOverlaps(ui);
         }
      });
   }

   function fixLeftOverflow(ui) {
      if (ui.position.left < 0) {
         ui.element.css('width', ui.size.width + ui.position.left);
         ui.element.css('left', '0px');
      }
   }

   function fixRightOverflow(ui) {
      if (ui.position.left + ui.size.width >
      $("#timingLineContainer").width()) {
         var overflow = ui.position.left + ui.size.width - $("#timingLineContainer").width();
         ui.element.css('width', ui.size.width - overflow + 'px');
         alert('here');
      }
   }

   function fixOverlaps(ui) {
      $("." + ui.element.attr('data-light')).each(function() {
         console.log($(this).css('left'));
      });
   }*/

   // taken from http://www.electrictoolbox.com/pad-number-zeroes-javascript/
   function pad(number, length) {
      var str = '' + number;
      while (str.length < length) {
         str = '0' + str;
      }
      return str;
   }
});
