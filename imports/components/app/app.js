/*

NEURONE: oNlinE inqUiRy experimentatiON systEm
Copyright (C) 2017  Daniel Gacitua

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

import { Meteor } from 'meteor/meteor';

import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularMeteorAuth from 'angular-meteor-auth';
import angularMeteorPromiser from 'angular-meteor-promiser';
import angularSanitize from 'angular-sanitize';
import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import angularTranslate from 'angular-translate';
import angularTranslateLoader from 'angular-translate-loader-static-files';
import ngYoutube from 'ng-youtube-embed-iframe';
import leafletDirective from 'angular-leaflet-directive';
import uiCarousel from 'angular-ui-carousel'


import uiSelect from 'ui-select';
import 'ui-select/dist/select.css';

import template from './app.html';

import { name as Navigation } from './navigation/navigation';
import { name as Iframe } from './iframe/displayIframe';

import { name as Auth } from './auth/auth';
import { name as Home } from './views/home';
import { name as Start } from './views/start';
import { name as End } from './views/end';
import { name as ErrorPage } from './views/error';

import { name as AuthService } from '../services/auth';
import { name as UserDataService } from '../services/userData';
import { name as ActionBlocker } from '../services/actionBlocker';
import { name as Flow } from '../services/flow';
import { name as Logger } from '../services/logger/logger';

import { name as Stages } from '../stages/stages';
import { name as Admin } from '../modules/admin';
import { name as FormsModule } from '../modules/forms/formCtrl';

import Configs from '../globalConfigs';

class App {
  constructor($scope, $translate) {
    'ngInject';

    // dgacitua: Get client settings and base language
    Meteor.call('clientSettings', (err, res) => {
      if (!err) {
        Session.set('locale', res.locale);
        $translate.use(Session.get('locale')).then(() => {
          console.log('Using Default Locale', Session.get('locale'));
        });
      }
    });
  }
}

const name = 'app';

export default angular.module(name, [
  /* Packages and dependencies */
  angularMeteor,
  angularMeteorAuth,
  'angular-meteor-promiser',
  'ngSanitize',
  'ui.select',
  'ui.carousel',
  'ngYoutube',
  'leaflet-directive',
  uiRouter,
  uiBootstrap,
  angularTranslate,
  angularTranslateLoader,
  /* Custom-made services */
  AuthService,
  UserDataService,
  Logger,
  ActionBlocker,
  Flow,
  /* Modular Components */
  Navigation,
  Iframe,
  /* App views */
  Auth,
  Home,
  Start,
  End,
  ErrorPage,
  /* iFuCo Simulation Stages */
  Stages,
  /* Other modules */
  FormsModule,
  Admin
]).filter('trusted', ['$sce', function ($sce){
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
}])
.component(name, {
  template: template.default,
  controllerAs: name,
  controller: App
})
.config(config)
.run(run)
.run(setTrackers);

function config($stateProvider, $locationProvider, $urlRouterProvider, $translateProvider) {
  'ngInject';
 
  // uiRouter settings
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/start');

  // angularTranslate settings
  $translateProvider.useStaticFilesLoader({
      prefix: 'i18n/locale-',
      suffix: '.json'
    });
  $translateProvider.useSanitizeValueStrategy('escape');
  $translateProvider.preferredLanguage('en');
};

function run($rootScope, $state, $window, $urlRouter, FlowService, UserDataService) {
  'ngInject';

  fs = FlowService;
  uds = UserDataService;

  $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
    //console.log(event, toState, toParams, error);
    if (error === 'USERDATA_NOT_READY') $state.go('home');
    if (error === 'AUTH_REQUIRED') $state.go('home');
    if (error === 'WRONG_STAGE') $state.go('start');
    if (error === 'NO_ADMIN') $state.go('start');
  });

  $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams, error) => {
    //console.log(event, toState, toParams);
  });

  angular.element($window).on('beforeunload', () => {
    //if (Configs.flowEnabled) fs.stopFlow();
    uds.flush();
    if (!!$window.localstorage) $window.localstorage.clear();
  });
};

function setTrackers($rootScope, FlowService, KMTrackService, LinkTrackService, ActionBlockerService) {
  'ngInject';

  fs = FlowService;
  lts = LinkTrackService;
  kmts = KMTrackService;
  abs = ActionBlockerService;
  
  // http://stackoverflow.com/a/20786262
  $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    if (!!Meteor.userId()) {
      lts.saveEnterPage();
      //kmts.service();
      //abs.service();

      if (toState.name !== 'start' && toState.name !== 'admin' && toState.name !== 'enrollment' && toState.name !== 'viewDocuments') {
        kmts.service();
        abs.service();

        // TODO: Disable fs.service() on displayPage in viewDocuments
        if (Configs.flowEnabled) fs.service();
      }
    }
    else {
      kmts.antiService();
      abs.antiService();
    }
  });

  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    if (!!Meteor.userId()) {
      lts.saveExitPage();
      //kmts.service();
      //abs.service();
      
      if (toState.name !== 'start' && toState.name !== 'admin' && toState.name !== 'enrollment' && toState.name !== 'viewDocuments') {
        kmts.service();
        abs.service();
      }
    }
    else {
      kmts.antiService();
      abs.antiService();
    }
  });
};