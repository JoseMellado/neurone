import ServerUtils from './lib/utils';

import UserAgent from 'useragent';

import { Documents } from '../imports/api/documents/index';
import { Snippets } from '../imports/api/snippets/index';
import { VisitedLinks } from '../imports/api/visitedLinks/index';
import { Keystrokes } from '../imports/api/keystrokes/index';
import { MouseClicks } from '../imports/api/mouseClicks/index';
import { MouseCoordinates } from '../imports/api/mouseCoordinates/index';
import { ScrollMoves } from '../imports/api/scrollMoves/index';
import { SessionLogs } from '../imports/api/sessionLogs/index';
import { Queries } from '../imports/api/queries/index';
import { Bookmarks } from '../imports/api/bookmarks/index';
import { FormAnswers } from '../imports/api/formAnswers/index';

export default Meteor.methods({
  storeKeystroke: function(jsonObject) {
    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;
    Keystrokes.insert(jsonObject);
    //console.log('Keystroke Stored!', time);
  },
  storeMouseClick: function(jsonObject) {
    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;
    MouseClicks.insert(jsonObject);
    //console.log('Mouse Click Stored!', time);
  },
  storeMouseCoordinate: function(jsonObject) {
    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;
    MouseCoordinates.insert(jsonObject);
    //console.log('Mouse Coordinate Stored!', time);
  },
  storeScrollMove: function(jsonObject) {
    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;
    ScrollMoves.insert(jsonObject);
    //console.log('Scroll Move Stored!', time);
  },
  storeVisitedLink: function(jsonObject) {
    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;
    VisitedLinks.insert(jsonObject);
    //console.log('Visited Link Stored!', time);
  },
  storeSnippet: function(jsonObject) {
    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;
    Snippets.insert(jsonObject);
    //console.log('Snippet Stored!', time);
  },
  storeSessionLog: function(jsonObject) {
    var time = ServerUtils.getTimestamp(),
      ipAddr = this.connection.clientAddress,
         rua = this.connection.httpHeaders['user-agent'],     // raw user agent
         oua = rua ? UserAgent.parse(rua) : '',               // object user agent
     browser = oua ? oua.family + ' ' + oua.major : 'undefined';    
       state = jsonObject.state;

    jsonObject.server_time = time;
    jsonObject.clientAddress = ipAddr;
    jsonObject.clientBrowser = browser;
    jsonObject.userAgent = rua;
    SessionLogs.insert(jsonObject);
    //console.log('Session Log Stored!', state, ipAddr, browser, time);
  },
  storeQuery: function(jsonObject) {
    var time = ServerUtils.getTimestamp(),
       query = jsonObject.query;

    jsonObject.server_time = time;
    Queries.insert(jsonObject);
    //console.log('Query Stored!', query, time);
  },
  storeBookmark: function(jsonObject) {
    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;
    Bookmarks.insert(jsonObject);
    //console.log('Bookmark Stored!', time);
  },
  removeBookmark: function(userId, currentUrl) {
    Bookmarks.remove({ owner: userId, url: currentUrl });
  },
  getBookmarks: function(currentUrl) {
    return Bookmarks.find({ url: currentUrl }).fetch();
  },
  isBookmark: function(currentUrl) {
    var bkms = Bookmarks.find({ url: currentUrl }).fetch();
    var result = bkms.length > 0
    //console.log('Is bookmark?', currentUrl, result);
    return result;
  },
  storeFormAnswer: function(jsonObject) {
    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;
    FormAnswers.insert(jsonObject);
    //console.log('Form Answer Stored!', page, time);
  }
});