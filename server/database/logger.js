import ServerUtils from '../lib/utils';

import UserAgent from 'useragent';

import { VisitedLinks } from '../../imports/api/visitedLinks/index';
import { Keystrokes } from '../../imports/api/keystrokes/index';
import { MouseClicks } from '../../imports/api/mouseClicks/index';
import { MouseCoordinates } from '../../imports/api/mouseCoordinates/index';
import { ScrollMoves } from '../../imports/api/scrollMoves/index';
import { SessionLogs } from '../../imports/api/sessionLogs/index';

Meteor.methods({
  storeKeystroke: function(jsonObject) {
    check(jsonObject, Object);

    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;

    Keystrokes.insert(jsonObject);
    //console.log('Keystroke Stored!', time);
  },
  storeMouseClick: function(jsonObject) {
    check(jsonObject, Object);

    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;

    MouseClicks.insert(jsonObject);
    //console.log('Mouse Click Stored!', time);
  },
  storeMouseCoordinate: function(jsonObject) {
    check(jsonObject, Object);

    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;

    MouseCoordinates.insert(jsonObject);
    //console.log('Mouse Coordinate Stored!', time);
  },
  storeScrollMove: function(jsonObject) {
    check(jsonObject, Object);

    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;

    ScrollMoves.insert(jsonObject);
    //console.log('Scroll Move Stored!', time);
  },
  storeVisitedLink: function(jsonObject) {
    check(jsonObject, Object);

    var time = ServerUtils.getTimestamp();
    jsonObject.server_time = time;

    VisitedLinks.insert(jsonObject);
    //console.log('Visited Link Stored!', time);
  },
  storeSessionLog: function(jsonObject) {
    check(jsonObject, Object);

    var time = ServerUtils.getTimestamp(),
      ipAddr = this.connection.clientAddress,
         rua = this.connection.httpHeaders['user-agent'],     // raw user agent
         oua = rua ? UserAgent.parse(rua) : '',               // object user agent
     browser = oua ? oua.toAgent() : 'undefined',
          os = oua ? oua.os.toString() : 'undefined',
      device = oua ? oua.device.toString() : 'undefined',
       state = jsonObject.state;

    jsonObject.server_time = time;
    jsonObject.clientAddress = ipAddr;
    jsonObject.clientBrowser = browser;
    jsonObject.clientOperatingSystem = os;
    jsonObject.clientDevice = device;
    jsonObject.userAgent = rua;

    SessionLogs.insert(jsonObject);
    //console.log('Session Log Stored!', state, ipAddr, browser, os, device, time);
  }
});