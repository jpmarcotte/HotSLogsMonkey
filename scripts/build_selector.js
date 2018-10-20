// ==UserScript==
// @name         HotSLogs Build Selector
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  Display per-talent build expectations alongside carousel builds
// @author       Jacques Marcotte
// @match        https://www.hotslogs.com/Sitewide/HeroDetails*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  window.geometric_mean = function(array) {
    let product = array.reduce((product, value) => product * value, 1);
    return Math.pow(product, 1 / array.length);
  }

  window.displayBuildScores = function(){
    let talent_table = $('#ctl00_MainContent_RadGridHeroTalentStatistics_ctl00');

    let header_cells = talent_table.find('thead > tr').find('th');
    let talent_tier_index = null;
    let talent_name_index = null;
    let win_percent_index = null;
    header_cells.each(function(index, header_cell) {
      let header_text = $(header_cell).text();
      if (header_text === 'TalentTier') {
        talent_tier_index = index;
      } else if (header_text === 'Talent') {
        talent_name_index = index;
      } else if (header_text === 'Win Percent') {
        win_percent_index = index;
      }
    });

    let talent_rows = talent_table.find('tr.rgRow, tr.rgAltRow');
    let level_scores = {};
    talent_rows.each(function(index, talent_row) {
      let talent_cells = $(talent_row).find('td');
      let talent_tier = parseInt(talent_cells.eq(talent_tier_index).text(),10);
      let win_percent = parseFloat(talent_cells.eq(win_percent_index).text().replace(' %',''))/100;
      let talent_name = talent_cells.eq(talent_name_index).text();
      if (!level_scores[talent_tier]) {
        level_scores[talent_tier] = {};
        level_scores[talent_tier].win_percent = win_percent;
        level_scores[talent_tier].talent_name = talent_name;
      } else if (win_percent > level_scores[talent_tier].win_percent) {
        level_scores[talent_tier].win_percent = win_percent;
        level_scores[talent_tier].talent_name = talent_name;
      } else if (win_percent === level_scores[talent_tier].win_percent) {
        level_scores[talent_tier].talent_name += ' / ' + talent_name;
      }
    });

    let build_cards = $('div.talentBuildCard');
    build_cards.each(function(index, build_card) {
      let talent_rows = $(build_card).find('table.talentBuildCardContent tr');
      let scores = [];
      talent_rows.each(function(index, talent_row) {
        let talent_cells = $(talent_row).find('td');
        let talent_tier = parseInt(talent_cells.first().text(),10)
        let talent_name_cell = talent_cells.last();
        let talent_name = talent_name_cell.text();
        if (talent_name !== "Player's Choice") {
          scores.push(level_scores[talent_tier].win_percent);
        } else {
          talent_name_cell.append('<BR>'+level_scores[talent_tier].talent_name);
        }
      });
      let alternate_build_score = window.geometric_mean(scores);

      let win_percent_cell = $(build_card).find('table.talentBuildCardHeader tr').first().find('td').last();
      win_percent_cell.append(' v. ' + (alternate_build_score * 100).toFixed(1) + ' %');
    });
  }

  window.displayBuildScores();

})();
