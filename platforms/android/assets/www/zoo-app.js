// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
(function() {
angular.module('zoo-app', ['ionic', 'ngCordova'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('Home', {
    url: '/',
    /*If in a folder, template/welcome.html*/
    templateUrl: 'Partials/home.html',
    controller: 'HomeController'
  })

  .state('Animal', {
    url: '/animal/{animalId}',
    abstract:true,
    templateUrl: 'Partials/animal.html',
  })

  .state('Animal.Home', {
    url: '/home',
    views: {
      "menuContent": {
        templateUrl: 'Partials/animal-home.html',
        controller: 'AnimalController'
      }
    }
  })

  .state('Animal.forChildren', {
    url: '/for-children',
    views: {
      "menuContent": {
        templateUrl: 'Partials/for-children.html',
        controller: 'AnimalController'
      }
    }
  })

  .state('Animal.forAdults', {
    url: '/for-adults',
    views: {
      "menuContent": {
        templateUrl: 'Partials/for-adults.html',
        controller: 'AnimalController'
      }
    }
  })

  .state('Animal.map', {
    url: '/map',
    views: {
      "menuContent": {
        templateUrl: 'Partials/animal-map.html',
        controller: 'AnimalMapController'
      }
    }
  })

  .state('LoadAnimal', {
    url: 'loadAnimal',
    templateUrl: 'Partials/load-animal.html',
    controller: 'BarcodeScannerController'
  });

  $urlRouterProvider.otherwise("/");
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
})();
