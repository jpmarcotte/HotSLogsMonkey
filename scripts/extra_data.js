// ==UserScript==
// @name         HotSLogs Extra Data
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds extra columns to HotSLogs data tables
// @author       Jacques Marcotte
// @match        https://www.hotslogs.com/*
// @grant        none
// ==/UserScript==

(function() {
  window.addRoS = function() {
    var tables = $('table.rgMasterTable').filter(function(i, table) {
      var found_games_played = false;
      var found_win_percent = false;
      var found_ros = false;
      var header_cells = $(table).find('th');
      header_cells.each(function(i, cell) {
        var text = $(cell).text().trim();
        if (text.substr(0,12) == 'Games Played') {
          found_games_played = true;
        }
        if (text == 'Win Percent') {
          found_win_percent = true;
        }
        if (text == 'RoS Win %') {
          found_ros = true;
        }
      });
      return found_games_played && found_win_percent && !found_ros;
    });

    tables.each(function(i,table) {
      var header_row = $(table).find('thead > tr');
      header_row.append('<th scope="col" class="rgHeader">RoS Win %</th>');

      var header_cells = $(table).find('th');
      var games_played_index = null;
      var win_percent_index = null;
      header_cells.each(function(i, cell) {
        var text = $(cell).text().trim();
        if (text.substr(0,12) == 'Games Played') {
          games_played_index = i;
        }
        if (text == 'Win Percent') {
          win_percent_index = i;
        }
      });

      var rows = $(table).find('tr.rgRow,tr.rgAltRow');
      rows.each(function(i,row) {
        var cells = $(row).find('td');
        var games_played = parseInt(cells.eq(games_played_index).text().replace(',',''),10);
        var win_percent = parseFloat(cells.eq(win_percent_index).text(),10)/100;
        console.log("Win: "+win_percent);
        var RoS = (win_percent * games_played + 1 ) / (games_played + 2);
        var new_cell = document.createElement('td');
        new_cell.innerHTML = (100*RoS).toFixed(1) + ' %';
        row.append(new_cell);
      });
    });
  };

  // Add a button to the page
  console.log("Adding RoS button");
  ros_cell = document.createElement('div');
  ros_cell.id = 'ros_cell';
  ros_cell.style = "position:fixed; bottom: 20px; left: 20px; font-size: 14px; cursor: pointer; font-weight: bold";
  ros_cell.innerHTML = "Add<BR>RoS";
  document.body.appendChild(ros_cell);
  $(ros_cell).click(window.addRoS);
})();
