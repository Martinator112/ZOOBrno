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

  .state('News', {
    url: '/news',
    templateUrl: 'Partials/news.html',
    controller: 'HomeController'
  })

  .state('Animal', {
    url: '/animal/{animalId}/{lang}',
    abstract:true,
    templateUrl: 'Partials/animal.html'
  })

  .state('Animal.Home', {
    url: '/home',
    views: {
      "menuContent": {
        templateUrl: 'Partials/animal-home.html',
      }
    }
  })

  .state('Animal.forChildren', {
    url: '/for-children',
    views: {
      "menuContent": {
        templateUrl: 'Partials/for-children.html',
      }
    }
  })

  .state('Animal.forAdults', {
    url: '/for-adults',
    views: {
      "menuContent": {
        templateUrl: 'Partials/for-adults.html',
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

(function() {
  angular.module("zoo-app").controller("HomeController", ["$scope", "$state", "$location", "barcodeFactory",
  "translationService",

  function($scope, $state, $location, barcodeFactory,translationService) {

    $scope.animalId = "";
    $scope.lang = "Czech";

    $scope.loadAnimal = loadAnimal;
    $scope.quit = quit;
    $scope.loadNews = loadNews;
    $scope.backToHome = backToHome;
    $scope.translate = translate;
    $scope.debug = debug;

    function loadAnimal() {
      barcodeFactory.scan().then(function(animalId) {
        $scope.animalId = animalId;
        $location.path("/animal/" + animalId + "/" + $scope.lang + "/home");
      });
    }

    function debug() {
      $location.path("/animal/bobr_kanadsky/" + $scope.lang + "/home");
    }

    function quit() {
      ionic.Platform.exitApp();
    }

    function loadNews() {
      $location.path("/news");
    }

    function backToHome() {
      $location.path("/");
    }

    function translate(translationKey) {
      return translationService.translate(translationKey, $scope.lang);
    }

  }]);




})();

(function(){
  "use strict";

  angular.module("zoo-app").factory("animalFactory", ["$http", "$q", function($http, $q) {
    var animalFactory = {};
    var url = "/";

    if(ionic && ionic.Platform && ionic.Platform.isAndroid()){
      url = "/android_asset/www/";
    }

    function fetchAnimalById(id) {
      var deferred = $q.defer();
      var animalUrl = url + "data/animal-texts/" + id +".json";
      alert("Getting animalUrl: '" + animalUrl + "'");
      $http.get(animalUrl).then(function(animalData){
        deferred.resolve(animalData.data);
      }, function(failed){
        deferred.reject(failed);
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

(function(){
  "use strict";

  angular.module("zoo-app").factory("translationService", [function() {
    var translationService = {};

    var translationMap = {
      "Czech": {
        "NEWS": "Novinky",
        "READ_QR": "Nacti QR kod",
        "QUIT": "Ukonci",
        "CZECH": "Cesky",
        "ENGLISH": "Anglicky",
        "FOR_CHILDREN": "Pro deti",
        "FOR_ADULTS": "Pro dospele",
        "MAP": "Mapa",
        "AUDIO": "Zvuk",
        "ACTIONS_FOR": "Moznosti pro ",
        "HOME": "Domu"
      },
      "English": {
        "NEWS": "News",
        "READ_QR": "Read QR code",
        "QUIT": "Quit",
        "CZECH": "Czech",
        "ENGLISH": "English",
        "FOR_CHILDREN": "For children",
        "FOR_ADULTS": "For adults",
        "MAP": "Map",
        "AUDIO": "Audi",
        "ACTIONS_FOR": "Actions for",
        "HOME": "Home"
      }
    };

    function translate(key, language) {
      return (translationMap[language])[key] || "";
    }

    translationService.translate = translate;

    return translationService;
  }]);
}());

(function() {

  angular.module("zoo-app").controller("AnimalController",
    ["$scope", "$stateParams", "animalFactory", "translationService",


  function($scope, $stateParams, animalFactory, translationService) {

    var animalId = $scope.animalId = $stateParams.animalId;
    $scope.lang = $stateParams.lang;
    $scope.animal = {
      "label": "unloaded",
      "forAdults": "unloaded",
      "multiLanguage": "false",
      "forChildren": "unloaded"
    };
    $scope.loading = true;

    (function initialize(){
      alert("animalId is " + animalId);
      animalFactory.fetchAnimalById(animalId).then(function(animal) {
        $scope.animal = animal;
        $scope.loading = false;
      }, function(failed) {
        alert(failed);
      });
    }());

    $scope.translate = translate;
    $scope.getTextForChildren = getTextForChildren;
    $scope.getTextForAdults = getTextForAdults;

    function getTextForAdults() {
      if ($scope.animal.multiLanguage == "true") {
        return $scope.animal["forAdults" + $scope.lang];
      } else {
        return $scope.animal.forAdults;
      }
    }

    function getTextForChildren() {
      if ($scope.animal.multiLanguage == "true") {
        return $scope.animal["forChildren" + $scope.lang];
      } else {
        return $scope.animal.forChildren;
      }
    }

    function translate(key) {
      return translationService.translate(key, $scope.lang) || key;
    }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInpvby1hcHAuanMiLCJDb250cm9sbGVycy9Ib21lLmpzIiwiU2VydmljZXMvYW5pbWFsLmpzIiwiU2VydmljZXMvYmFyY29kZS5qcyIsIlNlcnZpY2VzL3RyYW5zbGF0aW9uLmpzIiwiQ29udHJvbGxlcnMvQW5pbWFsL0FuaW1hbC5qcyIsIkNvbnRyb2xsZXJzL0FuaW1hbC9BbmltYWxNYXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIElvbmljIFN0YXJ0ZXIgQXBwXG5cbi8vIGFuZ3VsYXIubW9kdWxlIGlzIGEgZ2xvYmFsIHBsYWNlIGZvciBjcmVhdGluZywgcmVnaXN0ZXJpbmcgYW5kIHJldHJpZXZpbmcgQW5ndWxhciBtb2R1bGVzXG4vLyAnc3RhcnRlcicgaXMgdGhlIG5hbWUgb2YgdGhpcyBhbmd1bGFyIG1vZHVsZSBleGFtcGxlIChhbHNvIHNldCBpbiBhIDxib2R5PiBhdHRyaWJ1dGUgaW4gaW5kZXguaHRtbClcbi8vIHRoZSAybmQgcGFyYW1ldGVyIGlzIGFuIGFycmF5IG9mICdyZXF1aXJlcydcbihmdW5jdGlvbigpIHtcbmFuZ3VsYXIubW9kdWxlKCd6b28tYXBwJywgWydpb25pYycsICduZ0NvcmRvdmEnXSlcblxuLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdIb21lJywge1xuICAgIHVybDogJy8nLFxuICAgIC8qSWYgaW4gYSBmb2xkZXIsIHRlbXBsYXRlL3dlbGNvbWUuaHRtbCovXG4gICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9ob21lLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgfSlcblxuICAuc3RhdGUoJ05ld3MnLCB7XG4gICAgdXJsOiAnL25ld3MnLFxuICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvbmV3cy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwnLCB7XG4gICAgdXJsOiAnL2FuaW1hbC97YW5pbWFsSWR9L3tsYW5nfScsXG4gICAgYWJzdHJhY3Q6dHJ1ZSxcbiAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2FuaW1hbC5odG1sJ1xuICB9KVxuXG4gIC5zdGF0ZSgnQW5pbWFsLkhvbWUnLCB7XG4gICAgdXJsOiAnL2hvbWUnLFxuICAgIHZpZXdzOiB7XG4gICAgICBcIm1lbnVDb250ZW50XCI6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9hbmltYWwtaG9tZS5odG1sJyxcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwuZm9yQ2hpbGRyZW4nLCB7XG4gICAgdXJsOiAnL2Zvci1jaGlsZHJlbicsXG4gICAgdmlld3M6IHtcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2Zvci1jaGlsZHJlbi5odG1sJyxcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwuZm9yQWR1bHRzJywge1xuICAgIHVybDogJy9mb3ItYWR1bHRzJyxcbiAgICB2aWV3czoge1xuICAgICAgXCJtZW51Q29udGVudFwiOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvZm9yLWFkdWx0cy5odG1sJyxcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwubWFwJywge1xuICAgIHVybDogJy9tYXAnLFxuICAgIHZpZXdzOiB7XG4gICAgICBcIm1lbnVDb250ZW50XCI6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9hbmltYWwtbWFwLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQW5pbWFsTWFwQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvXCIpO1xufSlcblxuLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXG4gICAgICAvLyBEb24ndCByZW1vdmUgdGhpcyBsaW5lIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSBhcmUgZG9pbmcuIEl0IHN0b3BzIHRoZSB2aWV3cG9ydFxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xufSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuY29udHJvbGxlcihcIkhvbWVDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRzdGF0ZVwiLCBcIiRsb2NhdGlvblwiLCBcImJhcmNvZGVGYWN0b3J5XCIsXG4gIFwidHJhbnNsYXRpb25TZXJ2aWNlXCIsXG5cbiAgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRsb2NhdGlvbiwgYmFyY29kZUZhY3RvcnksdHJhbnNsYXRpb25TZXJ2aWNlKSB7XG5cbiAgICAkc2NvcGUuYW5pbWFsSWQgPSBcIlwiO1xuICAgICRzY29wZS5sYW5nID0gXCJDemVjaFwiO1xuXG4gICAgJHNjb3BlLmxvYWRBbmltYWwgPSBsb2FkQW5pbWFsO1xuICAgICRzY29wZS5xdWl0ID0gcXVpdDtcbiAgICAkc2NvcGUubG9hZE5ld3MgPSBsb2FkTmV3cztcbiAgICAkc2NvcGUuYmFja1RvSG9tZSA9IGJhY2tUb0hvbWU7XG4gICAgJHNjb3BlLnRyYW5zbGF0ZSA9IHRyYW5zbGF0ZTtcbiAgICAkc2NvcGUuZGVidWcgPSBkZWJ1ZztcblxuICAgIGZ1bmN0aW9uIGxvYWRBbmltYWwoKSB7XG4gICAgICBiYXJjb2RlRmFjdG9yeS5zY2FuKCkudGhlbihmdW5jdGlvbihhbmltYWxJZCkge1xuICAgICAgICAkc2NvcGUuYW5pbWFsSWQgPSBhbmltYWxJZDtcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvYW5pbWFsL1wiICsgYW5pbWFsSWQgKyBcIi9cIiArICRzY29wZS5sYW5nICsgXCIvaG9tZVwiKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlYnVnKCkge1xuICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvYW5pbWFsL2JvYnJfa2FuYWRza3kvXCIgKyAkc2NvcGUubGFuZyArIFwiL2hvbWVcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcXVpdCgpIHtcbiAgICAgIGlvbmljLlBsYXRmb3JtLmV4aXRBcHAoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkTmV3cygpIHtcbiAgICAgICRsb2NhdGlvbi5wYXRoKFwiL25ld3NcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmFja1RvSG9tZSgpIHtcbiAgICAgICRsb2NhdGlvbi5wYXRoKFwiL1wiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2xhdGUodHJhbnNsYXRpb25LZXkpIHtcbiAgICAgIHJldHVybiB0cmFuc2xhdGlvblNlcnZpY2UudHJhbnNsYXRlKHRyYW5zbGF0aW9uS2V5LCAkc2NvcGUubGFuZyk7XG4gICAgfVxuXG4gIH1dKTtcblxuXG5cblxufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuZmFjdG9yeShcImFuaW1hbEZhY3RvcnlcIiwgW1wiJGh0dHBcIiwgXCIkcVwiLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgICB2YXIgYW5pbWFsRmFjdG9yeSA9IHt9O1xuICAgIHZhciB1cmwgPSBcIi9cIjtcblxuICAgIGlmKGlvbmljICYmIGlvbmljLlBsYXRmb3JtICYmIGlvbmljLlBsYXRmb3JtLmlzQW5kcm9pZCgpKXtcbiAgICAgIHVybCA9IFwiL2FuZHJvaWRfYXNzZXQvd3d3L1wiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZldGNoQW5pbWFsQnlJZChpZCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHZhciBhbmltYWxVcmwgPSB1cmwgKyBcImRhdGEvYW5pbWFsLXRleHRzL1wiICsgaWQgK1wiLmpzb25cIjtcbiAgICAgIGFsZXJ0KFwiR2V0dGluZyBhbmltYWxVcmw6ICdcIiArIGFuaW1hbFVybCArIFwiJ1wiKTtcbiAgICAgICRodHRwLmdldChhbmltYWxVcmwpLnRoZW4oZnVuY3Rpb24oYW5pbWFsRGF0YSl7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoYW5pbWFsRGF0YS5kYXRhKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGZhaWxlZCl7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChmYWlsZWQpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGFuaW1hbEZhY3RvcnkuZmV0Y2hBbmltYWxCeUlkID0gZmV0Y2hBbmltYWxCeUlkO1xuXG4gICAgcmV0dXJuIGFuaW1hbEZhY3Rvcnk7XG4gIH1dKTtcbn0oKSk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmZhY3RvcnkoXCJiYXJjb2RlRmFjdG9yeVwiLCBbXCIkY29yZG92YUJhcmNvZGVTY2FubmVyXCIsIFwiJHFcIixcblxuICBmdW5jdGlvbigkY29yZG92YUJhcmNvZGVTY2FubmVyLCAkcSkge1xuICAgIHZhciBiYXJjb2RlRmFjdG9yeSA9IHt9O1xuICAgIHZhciBjYWNoZWRJZCA9IG51bGw7XG5cbiAgICBmdW5jdGlvbiBzY2FuKCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgaWYgKGNhY2hlZElkKSB7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2FjaGVkSWQpO1xuICAgICAgfVxuXG4gICAgICAkY29yZG92YUJhcmNvZGVTY2FubmVyLnNjYW4oKS50aGVuKGZ1bmN0aW9uKHNjYW5uZWREYXRhKSB7XG4gICAgICAgIGNhY2hlZElkID0gc2Nhbm5lZERhdGEudGV4dDtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzY2FubmVkRGF0YS50ZXh0KTtcbiAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgYmFyY29kZUZhY3Rvcnkuc2NhbiA9IHNjYW47XG5cbiAgICByZXR1cm4gYmFyY29kZUZhY3Rvcnk7XG4gIH1dKTtcbn0oKSk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmZhY3RvcnkoXCJ0cmFuc2xhdGlvblNlcnZpY2VcIiwgW2Z1bmN0aW9uKCkge1xuICAgIHZhciB0cmFuc2xhdGlvblNlcnZpY2UgPSB7fTtcblxuICAgIHZhciB0cmFuc2xhdGlvbk1hcCA9IHtcbiAgICAgIFwiQ3plY2hcIjoge1xuICAgICAgICBcIk5FV1NcIjogXCJOb3Zpbmt5XCIsXG4gICAgICAgIFwiUkVBRF9RUlwiOiBcIk5hY3RpIFFSIGtvZFwiLFxuICAgICAgICBcIlFVSVRcIjogXCJVa29uY2lcIixcbiAgICAgICAgXCJDWkVDSFwiOiBcIkNlc2t5XCIsXG4gICAgICAgIFwiRU5HTElTSFwiOiBcIkFuZ2xpY2t5XCIsXG4gICAgICAgIFwiRk9SX0NISUxEUkVOXCI6IFwiUHJvIGRldGlcIixcbiAgICAgICAgXCJGT1JfQURVTFRTXCI6IFwiUHJvIGRvc3BlbGVcIixcbiAgICAgICAgXCJNQVBcIjogXCJNYXBhXCIsXG4gICAgICAgIFwiQVVESU9cIjogXCJadnVrXCIsXG4gICAgICAgIFwiQUNUSU9OU19GT1JcIjogXCJNb3pub3N0aSBwcm8gXCIsXG4gICAgICAgIFwiSE9NRVwiOiBcIkRvbXVcIlxuICAgICAgfSxcbiAgICAgIFwiRW5nbGlzaFwiOiB7XG4gICAgICAgIFwiTkVXU1wiOiBcIk5ld3NcIixcbiAgICAgICAgXCJSRUFEX1FSXCI6IFwiUmVhZCBRUiBjb2RlXCIsXG4gICAgICAgIFwiUVVJVFwiOiBcIlF1aXRcIixcbiAgICAgICAgXCJDWkVDSFwiOiBcIkN6ZWNoXCIsXG4gICAgICAgIFwiRU5HTElTSFwiOiBcIkVuZ2xpc2hcIixcbiAgICAgICAgXCJGT1JfQ0hJTERSRU5cIjogXCJGb3IgY2hpbGRyZW5cIixcbiAgICAgICAgXCJGT1JfQURVTFRTXCI6IFwiRm9yIGFkdWx0c1wiLFxuICAgICAgICBcIk1BUFwiOiBcIk1hcFwiLFxuICAgICAgICBcIkFVRElPXCI6IFwiQXVkaVwiLFxuICAgICAgICBcIkFDVElPTlNfRk9SXCI6IFwiQWN0aW9ucyBmb3JcIixcbiAgICAgICAgXCJIT01FXCI6IFwiSG9tZVwiXG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZShrZXksIGxhbmd1YWdlKSB7XG4gICAgICByZXR1cm4gKHRyYW5zbGF0aW9uTWFwW2xhbmd1YWdlXSlba2V5XSB8fCBcIlwiO1xuICAgIH1cblxuICAgIHRyYW5zbGF0aW9uU2VydmljZS50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XG5cbiAgICByZXR1cm4gdHJhbnNsYXRpb25TZXJ2aWNlO1xuICB9XSk7XG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5jb250cm9sbGVyKFwiQW5pbWFsQ29udHJvbGxlclwiLFxuICAgIFtcIiRzY29wZVwiLCBcIiRzdGF0ZVBhcmFtc1wiLCBcImFuaW1hbEZhY3RvcnlcIiwgXCJ0cmFuc2xhdGlvblNlcnZpY2VcIixcblxuXG4gIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBhbmltYWxGYWN0b3J5LCB0cmFuc2xhdGlvblNlcnZpY2UpIHtcblxuICAgIHZhciBhbmltYWxJZCA9ICRzY29wZS5hbmltYWxJZCA9ICRzdGF0ZVBhcmFtcy5hbmltYWxJZDtcbiAgICAkc2NvcGUubGFuZyA9ICRzdGF0ZVBhcmFtcy5sYW5nO1xuICAgICRzY29wZS5hbmltYWwgPSB7XG4gICAgICBcImxhYmVsXCI6IFwidW5sb2FkZWRcIixcbiAgICAgIFwiZm9yQWR1bHRzXCI6IFwidW5sb2FkZWRcIixcbiAgICAgIFwibXVsdGlMYW5ndWFnZVwiOiBcImZhbHNlXCIsXG4gICAgICBcImZvckNoaWxkcmVuXCI6IFwidW5sb2FkZWRcIlxuICAgIH07XG4gICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuXG4gICAgKGZ1bmN0aW9uIGluaXRpYWxpemUoKXtcbiAgICAgIGFsZXJ0KFwiYW5pbWFsSWQgaXMgXCIgKyBhbmltYWxJZCk7XG4gICAgICBhbmltYWxGYWN0b3J5LmZldGNoQW5pbWFsQnlJZChhbmltYWxJZCkudGhlbihmdW5jdGlvbihhbmltYWwpIHtcbiAgICAgICAgJHNjb3BlLmFuaW1hbCA9IGFuaW1hbDtcbiAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0sIGZ1bmN0aW9uKGZhaWxlZCkge1xuICAgICAgICBhbGVydChmYWlsZWQpO1xuICAgICAgfSk7XG4gICAgfSgpKTtcblxuICAgICRzY29wZS50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XG4gICAgJHNjb3BlLmdldFRleHRGb3JDaGlsZHJlbiA9IGdldFRleHRGb3JDaGlsZHJlbjtcbiAgICAkc2NvcGUuZ2V0VGV4dEZvckFkdWx0cyA9IGdldFRleHRGb3JBZHVsdHM7XG5cbiAgICBmdW5jdGlvbiBnZXRUZXh0Rm9yQWR1bHRzKCkge1xuICAgICAgaWYgKCRzY29wZS5hbmltYWwubXVsdGlMYW5ndWFnZSA9PSBcInRydWVcIikge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImZvckFkdWx0c1wiICsgJHNjb3BlLmxhbmddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWwuZm9yQWR1bHRzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFRleHRGb3JDaGlsZHJlbigpIHtcbiAgICAgIGlmICgkc2NvcGUuYW5pbWFsLm11bHRpTGFuZ3VhZ2UgPT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJmb3JDaGlsZHJlblwiICsgJHNjb3BlLmxhbmddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWwuZm9yQ2hpbGRyZW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlKGtleSkge1xuICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uU2VydmljZS50cmFuc2xhdGUoa2V5LCAkc2NvcGUubGFuZykgfHwga2V5O1xuICAgIH1cbiAgfV0pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuY29udHJvbGxlcihcIkFuaW1hbE1hcENvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJGlvbmljTG9hZGluZ1wiLFxuICBcIiRjb21waWxlXCIsXG5cbiAgZnVuY3Rpb24oJHNjb3BlLCAkaW9uaWNMb2FkaW5nLCAkY29tcGlsZSkge1xuICAgIHZhciBsYXRMbmcgPSB7fTtcbiAgICB2YXIgbWFwT3B0cyA9IHt9O1xuXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAgIGxhdExuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoNDkuMiwxNi41KTtcblxuICAgICAgbWFwT3B0cyA9IHtcbiAgICAgICAgY2VudGVyOiBsYXRMbmcsXG4gICAgICAgIHpvb206IDE1LFxuICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQXG4gICAgICB9O1xuICAgIH1cbiAgICBpbml0aWFsaXplKCk7XG4gICAgJHNjb3BlLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnb29nbGVNYXBcIiksIG1hcE9wdHMpO1xuICAgIH1cbiAgXSk7XG59KCkpO1xuIl19
