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

(function(){
  angular.module("zoo-app").controller("BarcodeScannerController", ["$scope", "$location", "$cordovaBarcodeScanner",
    function($scope, $location, $cordovaBarcodeScanner) {

      $scope.scannedData = "";

      if (ionic.Platform.isAndroid()) {
        $cordovaBarcodeScanner.scan().then(function(scannedData) {
          $scope.scannedData = scannedData;
          $location.path("/animal/" + scannedData.text);
        }, function(failedData) {
          $location.path("/");
        });
      } else {
        $location.path("/");
      }

    }]);
}());

(function() {
  angular.module("zoo-app").controller("HomeController", ["$scope", "$state", "$location", "barcodeFactory",

  function($scope, $state,$location, barcodeFactory) {

    $scope.animalId = "";

    function loadAnimal() {
      barcodeFactory.scan().then(function(animalId) {
        $scope.animalId = animalId;
        $location.path("/animal/" + animalId + "/home");
      });
    }

    function quit() {
      ionic.Platform.exitApp();
    }

    $scope.loadAnimal = loadAnimal;
    $scope.quit = quit;
  }]);




})();

(function(){
  "use strict";

  angular.module("zoo-app").factory("animalFactory", ["$http", "$q", function($http, $q) {
    var animalFactory = {};
    var url = "/";

    if(ionic.Platform.isAndroid()){
      url = "/android_asset/www/";
    }

    function fetchAnimalById(id) {
      var deferred = $q.defer();

      $http.get(url + "data/animal-texts/" + id +".json").then(function(animalData){
        deferred.resolve(animalData.data);
      });

      return deferred.promise;
    }

    animalFactory.fetchAnimalById = fetchAnimalById;

    return animalFactory;
  }]);
}());

(function(){
  "use strict";

  angular.module("zoo-app").factory("barcodeFactory", ["$cordovaBarcodeScanner", "$q",

  function($cordovaBarcodeScanner, $q) {
    var barcodeFactory = {};
    var cachedId = null;

    function scan() {
      var deferred = $q.defer();

      if (cachedId) {
        deferred.resolve(cachedId);
      }

      $cordovaBarcodeScanner.scan().then(function(scannedData) {
        cachedId = scannedData.text;
        deferred.resolve(scannedData.text);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    barcodeFactory.scan = scan;

    return barcodeFactory;
  }]);
}());

(function() {

  angular.module("zoo-app").controller("AnimalController",
    ["$scope", "$stateParams", "animalFactory",


  function($scope, $stateParams, animalFactory) {

    var animalId = $scope.animalId = $stateParams.animalId;
    $scope.animal = {
      "label": "unloaded",
      "forAdults": "unloaded",
      "for-children": "unloaded"
    };
    $scope.loading = true;

    (function initialize(){
      alert("animalId is " + animalId);
      animalFactory.fetchAnimalById(animalId).then(function(animal) {
        $scope.animal = animal;
        $scope.loading = false;
      });
    }());

  }]);

})();

(function() {
  "use strict";

  angular.module("zoo-app").controller("AnimalMapController", ["$scope", "$ionicLoading",
  "$compile",

  function($scope, $ionicLoading, $compile) {
    var latLng = {};
    var mapOpts = {};

    function initialize() {
      latLng = new google.maps.LatLng(49.2,16.5);

      mapOpts = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
    }
    initialize();
    $scope.map = new google.maps.Map(document.getElementById("googleMap"), mapOpts);
    }
  ]);
}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInpvby1hcHAuanMiLCJDb250cm9sbGVycy9CYXJjb2RlU2Nhbm5lci5qcyIsIkNvbnRyb2xsZXJzL0hvbWUuanMiLCJTZXJ2aWNlcy9hbmltYWwuanMiLCJTZXJ2aWNlcy9iYXJjb2RlLmpzIiwiQ29udHJvbGxlcnMvQW5pbWFsL0FuaW1hbC5qcyIsIkNvbnRyb2xsZXJzL0FuaW1hbC9BbmltYWxNYXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIElvbmljIFN0YXJ0ZXIgQXBwXG5cbi8vIGFuZ3VsYXIubW9kdWxlIGlzIGEgZ2xvYmFsIHBsYWNlIGZvciBjcmVhdGluZywgcmVnaXN0ZXJpbmcgYW5kIHJldHJpZXZpbmcgQW5ndWxhciBtb2R1bGVzXG4vLyAnc3RhcnRlcicgaXMgdGhlIG5hbWUgb2YgdGhpcyBhbmd1bGFyIG1vZHVsZSBleGFtcGxlIChhbHNvIHNldCBpbiBhIDxib2R5PiBhdHRyaWJ1dGUgaW4gaW5kZXguaHRtbClcbi8vIHRoZSAybmQgcGFyYW1ldGVyIGlzIGFuIGFycmF5IG9mICdyZXF1aXJlcydcbihmdW5jdGlvbigpIHtcbmFuZ3VsYXIubW9kdWxlKCd6b28tYXBwJywgWydpb25pYycsICduZ0NvcmRvdmEnXSlcblxuLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdIb21lJywge1xuICAgIHVybDogJy8nLFxuICAgIC8qSWYgaW4gYSBmb2xkZXIsIHRlbXBsYXRlL3dlbGNvbWUuaHRtbCovXG4gICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9ob21lLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgfSlcblxuICAuc3RhdGUoJ0FuaW1hbCcsIHtcbiAgICB1cmw6ICcvYW5pbWFsL3thbmltYWxJZH0nLFxuICAgIGFic3RyYWN0OnRydWUsXG4gICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9hbmltYWwuaHRtbCcsXG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwuSG9tZScsIHtcbiAgICB1cmw6ICcvaG9tZScsXG4gICAgdmlld3M6IHtcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2FuaW1hbC1ob21lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQW5pbWFsQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwuZm9yQ2hpbGRyZW4nLCB7XG4gICAgdXJsOiAnL2Zvci1jaGlsZHJlbicsXG4gICAgdmlld3M6IHtcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2Zvci1jaGlsZHJlbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0FuaW1hbENvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC5zdGF0ZSgnQW5pbWFsLmZvckFkdWx0cycsIHtcbiAgICB1cmw6ICcvZm9yLWFkdWx0cycsXG4gICAgdmlld3M6IHtcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2Zvci1hZHVsdHMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBbmltYWxDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAuc3RhdGUoJ0FuaW1hbC5tYXAnLCB7XG4gICAgdXJsOiAnL21hcCcsXG4gICAgdmlld3M6IHtcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2FuaW1hbC1tYXAuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBbmltYWxNYXBDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAuc3RhdGUoJ0xvYWRBbmltYWwnLCB7XG4gICAgdXJsOiAnbG9hZEFuaW1hbCcsXG4gICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9sb2FkLWFuaW1hbC5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQmFyY29kZVNjYW5uZXJDb250cm9sbGVyJ1xuICB9KTtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL1wiKTtcbn0pXG5cbi5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblxuICAgICAgLy8gRG9uJ3QgcmVtb3ZlIHRoaXMgbGluZSB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UgYXJlIGRvaW5nLiBJdCBzdG9wcyB0aGUgdmlld3BvcnRcbiAgICAgIC8vIGZyb20gc25hcHBpbmcgd2hlbiB0ZXh0IGlucHV0cyBhcmUgZm9jdXNlZC4gSW9uaWMgaGFuZGxlcyB0aGlzIGludGVybmFsbHkgZm9yXG4gICAgICAvLyBhIG11Y2ggbmljZXIga2V5Ym9hcmQgZXhwZXJpZW5jZS5cbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuICAgIH1cbiAgICBpZih3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuICB9KTtcbn0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuY29udHJvbGxlcihcIkJhcmNvZGVTY2FubmVyQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkbG9jYXRpb25cIiwgXCIkY29yZG92YUJhcmNvZGVTY2FubmVyXCIsXG4gICAgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sICRjb3Jkb3ZhQmFyY29kZVNjYW5uZXIpIHtcblxuICAgICAgJHNjb3BlLnNjYW5uZWREYXRhID0gXCJcIjtcblxuICAgICAgaWYgKGlvbmljLlBsYXRmb3JtLmlzQW5kcm9pZCgpKSB7XG4gICAgICAgICRjb3Jkb3ZhQmFyY29kZVNjYW5uZXIuc2NhbigpLnRoZW4oZnVuY3Rpb24oc2Nhbm5lZERhdGEpIHtcbiAgICAgICAgICAkc2NvcGUuc2Nhbm5lZERhdGEgPSBzY2FubmVkRGF0YTtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aChcIi9hbmltYWwvXCIgKyBzY2FubmVkRGF0YS50ZXh0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZmFpbGVkRGF0YSkge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL1wiKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkbG9jYXRpb24ucGF0aChcIi9cIik7XG4gICAgICB9XG5cbiAgICB9XSk7XG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuY29udHJvbGxlcihcIkhvbWVDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRzdGF0ZVwiLCBcIiRsb2NhdGlvblwiLCBcImJhcmNvZGVGYWN0b3J5XCIsXG5cbiAgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsJGxvY2F0aW9uLCBiYXJjb2RlRmFjdG9yeSkge1xuXG4gICAgJHNjb3BlLmFuaW1hbElkID0gXCJcIjtcblxuICAgIGZ1bmN0aW9uIGxvYWRBbmltYWwoKSB7XG4gICAgICBiYXJjb2RlRmFjdG9yeS5zY2FuKCkudGhlbihmdW5jdGlvbihhbmltYWxJZCkge1xuICAgICAgICAkc2NvcGUuYW5pbWFsSWQgPSBhbmltYWxJZDtcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvYW5pbWFsL1wiICsgYW5pbWFsSWQgKyBcIi9ob21lXCIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcXVpdCgpIHtcbiAgICAgIGlvbmljLlBsYXRmb3JtLmV4aXRBcHAoKTtcbiAgICB9XG5cbiAgICAkc2NvcGUubG9hZEFuaW1hbCA9IGxvYWRBbmltYWw7XG4gICAgJHNjb3BlLnF1aXQgPSBxdWl0O1xuICB9XSk7XG5cblxuXG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmZhY3RvcnkoXCJhbmltYWxGYWN0b3J5XCIsIFtcIiRodHRwXCIsIFwiJHFcIiwgZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gICAgdmFyIGFuaW1hbEZhY3RvcnkgPSB7fTtcbiAgICB2YXIgdXJsID0gXCIvXCI7XG5cbiAgICBpZihpb25pYy5QbGF0Zm9ybS5pc0FuZHJvaWQoKSl7XG4gICAgICB1cmwgPSBcIi9hbmRyb2lkX2Fzc2V0L3d3dy9cIjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmZXRjaEFuaW1hbEJ5SWQoaWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICRodHRwLmdldCh1cmwgKyBcImRhdGEvYW5pbWFsLXRleHRzL1wiICsgaWQgK1wiLmpzb25cIikudGhlbihmdW5jdGlvbihhbmltYWxEYXRhKXtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhbmltYWxEYXRhLmRhdGEpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGFuaW1hbEZhY3RvcnkuZmV0Y2hBbmltYWxCeUlkID0gZmV0Y2hBbmltYWxCeUlkO1xuXG4gICAgcmV0dXJuIGFuaW1hbEZhY3Rvcnk7XG4gIH1dKTtcbn0oKSk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmZhY3RvcnkoXCJiYXJjb2RlRmFjdG9yeVwiLCBbXCIkY29yZG92YUJhcmNvZGVTY2FubmVyXCIsIFwiJHFcIixcblxuICBmdW5jdGlvbigkY29yZG92YUJhcmNvZGVTY2FubmVyLCAkcSkge1xuICAgIHZhciBiYXJjb2RlRmFjdG9yeSA9IHt9O1xuICAgIHZhciBjYWNoZWRJZCA9IG51bGw7XG5cbiAgICBmdW5jdGlvbiBzY2FuKCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgaWYgKGNhY2hlZElkKSB7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2FjaGVkSWQpO1xuICAgICAgfVxuXG4gICAgICAkY29yZG92YUJhcmNvZGVTY2FubmVyLnNjYW4oKS50aGVuKGZ1bmN0aW9uKHNjYW5uZWREYXRhKSB7XG4gICAgICAgIGNhY2hlZElkID0gc2Nhbm5lZERhdGEudGV4dDtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzY2FubmVkRGF0YS50ZXh0KTtcbiAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgYmFyY29kZUZhY3Rvcnkuc2NhbiA9IHNjYW47XG5cbiAgICByZXR1cm4gYmFyY29kZUZhY3Rvcnk7XG4gIH1dKTtcbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmNvbnRyb2xsZXIoXCJBbmltYWxDb250cm9sbGVyXCIsXG4gICAgW1wiJHNjb3BlXCIsIFwiJHN0YXRlUGFyYW1zXCIsIFwiYW5pbWFsRmFjdG9yeVwiLFxuXG5cbiAgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsIGFuaW1hbEZhY3RvcnkpIHtcblxuICAgIHZhciBhbmltYWxJZCA9ICRzY29wZS5hbmltYWxJZCA9ICRzdGF0ZVBhcmFtcy5hbmltYWxJZDtcbiAgICAkc2NvcGUuYW5pbWFsID0ge1xuICAgICAgXCJsYWJlbFwiOiBcInVubG9hZGVkXCIsXG4gICAgICBcImZvckFkdWx0c1wiOiBcInVubG9hZGVkXCIsXG4gICAgICBcImZvci1jaGlsZHJlblwiOiBcInVubG9hZGVkXCJcbiAgICB9O1xuICAgICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcblxuICAgIChmdW5jdGlvbiBpbml0aWFsaXplKCl7XG4gICAgICBhbGVydChcImFuaW1hbElkIGlzIFwiICsgYW5pbWFsSWQpO1xuICAgICAgYW5pbWFsRmFjdG9yeS5mZXRjaEFuaW1hbEJ5SWQoYW5pbWFsSWQpLnRoZW4oZnVuY3Rpb24oYW5pbWFsKSB7XG4gICAgICAgICRzY29wZS5hbmltYWwgPSBhbmltYWw7XG4gICAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9KCkpO1xuXG4gIH1dKTtcblxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmNvbnRyb2xsZXIoXCJBbmltYWxNYXBDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRpb25pY0xvYWRpbmdcIixcbiAgXCIkY29tcGlsZVwiLFxuXG4gIGZ1bmN0aW9uKCRzY29wZSwgJGlvbmljTG9hZGluZywgJGNvbXBpbGUpIHtcbiAgICB2YXIgbGF0TG5nID0ge307XG4gICAgdmFyIG1hcE9wdHMgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgICBsYXRMbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQ5LjIsMTYuNSk7XG5cbiAgICAgIG1hcE9wdHMgPSB7XG4gICAgICAgIGNlbnRlcjogbGF0TG5nLFxuICAgICAgICB6b29tOiAxNSxcbiAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUFxuICAgICAgfTtcbiAgICB9XG4gICAgaW5pdGlhbGl6ZSgpO1xuICAgICRzY29wZS5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ29vZ2xlTWFwXCIpLCBtYXBPcHRzKTtcbiAgICB9XG4gIF0pO1xufSgpKTtcbiJdfQ==
