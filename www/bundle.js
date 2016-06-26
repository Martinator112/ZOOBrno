// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
(function() {
angular.module('zoo-app', ['ionic', 'ngCordova'])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');
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
    /*url: '/fchildren',*/
    views: {
      "menuContent": {
        templateUrl: 'Partials/for-children.html',
        /*templateUrl: 'Partials/fchildren.html',*/
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
      $location.path("/animal/medved_kamcatsky/" + $scope.lang + "/home");
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

  angular.module("zoo-app").directive("zooRatingStars", zooRatingStars);

  zooRatingStars.$inject = ["ratingFactory" ];

  function zooRatingStars(ratingFactory) {
    return {
      restrict: "E",
      scope: {
        animalId: "=",
        big: "@",
        small: "@",
        readOnly: "@",
        alreadyRated: "=?"
      },
      templateUrl: "Partials/Directives/zoo-rating-stars.html",
      link: function($scope, $element, $attrs) {
        console.log($scope);

        $scope.getAnimalRating = function() {
          ratingFactory.getAnimalRating($scope.animalId).then(function(rating) {
            $scope.animalRating = rating.RatingSum / rating.RatingCount / 1;
          }, function(rejected) {
            console.log("Err: ", rejected);
          });
        };

        $scope.rateAnimal = function(num) {
          if (!$scope.alreadyRated) {
            $scope.animalRating = num;
            $scope.alreadyRated = true;
            ratingFactory.rateAnimal($scope.animalId, num);
          }
        };

        if ($scope.readOnly) {
          $scope.getAnimalRating();
        }
      }
    };
  }
}());

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

  angular.module("zoo-app")
  .factory("ratingFactory", ["$http", "$q",
  function($http, $q) {

    var ratingFactory = {};
    ratingFactory.rateAnimal = rateAnimal;
    ratingFactory.getAnimalRating = getAnimalRating;




    function rateAnimal(animalId, rating) {
      var deferred = $q.defer();

      $http.post("http://golang-martinator.rhcloud.com/rating/" + animalId + "/" + rating)
      .then(function(result){
        deferred.resolve(result.data);
      }, function(rejectReason){
        deferred.resolve(rejectReason);
      });

      return deferred.promise;
    }

    function getAnimalRating(animalId) {
      var deferred = $q.defer();

      var url = "https://golang-martinator.rhcloud.com/rating/" + animalId;
      alert("Get: " + url);
      $http({method: "GET", url:url})
      .then(function(result){
        console.log(result);
        deferred.resolve(result.data);
      }, function(rejectReason){
        console.log(rejectReason);
        deferred.reject(rejectReason);
      });

      return deferred.promise;
    }

    return ratingFactory;
  }
  ]);
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
        "FOR_ADULTS": "Pro dospělé",
        "MAP": "Mapa",
        "AUDIO": "Zvuk",
        "ACTIONS_FOR": "Moznosti pro ",
        "RATE" : "Ohodnot me",
        "HOME": "Domu",
        "ANIMAL_HOME_SCREEN": "Zvire - Informace"
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
        "RATE": "Rate me",
        "HOME": "Home",
        "ANIMAL_HOME_SCREEN": "Animal - About"
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
    $scope.alreadyRated = false;

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
    $scope.getAnimalLabel = getAnimalLabel;
    $scope.getTextForChildren = getTextForChildren;
    $scope.getTextForAdults = getTextForAdults;

    function getAnimalLabel() {
      if ($scope.animal.multiLanguage == "true") {
        return $scope.animal["label" + $scope.lang];
      } else {
        return $scope.animal["label" + $scope.animal.lang];
      }
    }

    function getTextForAdults() {
      if ($scope.animal.multiLanguage == "true") {
        return $scope.animal["forAdults" + $scope.lang];
      } else {
        return $scope.animal.forAdults["forAdults" + $scope.animal.lang];
      }
    }

    function getTextForChildren() {
      if ($scope.animal.multiLanguage == "true") {
        return $scope.animal["forChildren" + $scope.lang];
      } else {
        return $scope.animal["forChildren" + $scope.animal.lang];
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInpvby1hcHAuanMiLCJDb250cm9sbGVycy9Ib21lLmpzIiwiRGlyZWN0aXZlcy96b29SYXRpbmdTdGFycy5qcyIsIlNlcnZpY2VzL2FuaW1hbC5qcyIsIlNlcnZpY2VzL2JhcmNvZGUuanMiLCJTZXJ2aWNlcy9yYXRpbmcuanMiLCJTZXJ2aWNlcy90cmFuc2xhdGlvbi5qcyIsIkNvbnRyb2xsZXJzL0FuaW1hbC9BbmltYWwuanMiLCJDb250cm9sbGVycy9BbmltYWwvQW5pbWFsTWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIElvbmljIFN0YXJ0ZXIgQXBwXHJcblxyXG4vLyBhbmd1bGFyLm1vZHVsZSBpcyBhIGdsb2JhbCBwbGFjZSBmb3IgY3JlYXRpbmcsIHJlZ2lzdGVyaW5nIGFuZCByZXRyaWV2aW5nIEFuZ3VsYXIgbW9kdWxlc1xyXG4vLyAnc3RhcnRlcicgaXMgdGhlIG5hbWUgb2YgdGhpcyBhbmd1bGFyIG1vZHVsZSBleGFtcGxlIChhbHNvIHNldCBpbiBhIDxib2R5PiBhdHRyaWJ1dGUgaW4gaW5kZXguaHRtbClcclxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xyXG4oZnVuY3Rpb24oKSB7XHJcbmFuZ3VsYXIubW9kdWxlKCd6b28tYXBwJywgWydpb25pYycsICduZ0NvcmRvdmEnXSlcclxuXHJcbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGlvbmljQ29uZmlnUHJvdmlkZXIpIHtcclxuICAkaW9uaWNDb25maWdQcm92aWRlci50YWJzLnBvc2l0aW9uKCdib3R0b20nKTtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnSG9tZScsIHtcclxuICAgIHVybDogJy8nLFxyXG4gICAgLypJZiBpbiBhIGZvbGRlciwgdGVtcGxhdGUvd2VsY29tZS5odG1sKi9cclxuICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvaG9tZS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICB9KVxyXG5cclxuICAuc3RhdGUoJ05ld3MnLCB7XHJcbiAgICB1cmw6ICcvbmV3cycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL25ld3MuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXHJcbiAgfSlcclxuXHJcbiAgLnN0YXRlKCdBbmltYWwnLCB7XHJcbiAgICB1cmw6ICcvYW5pbWFsL3thbmltYWxJZH0ve2xhbmd9JyxcclxuICAgIGFic3RyYWN0OnRydWUsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2FuaW1hbC5odG1sJ1xyXG4gIH0pXHJcblxyXG4gIC5zdGF0ZSgnQW5pbWFsLkhvbWUnLCB7XHJcbiAgICB1cmw6ICcvaG9tZScsXHJcbiAgICB2aWV3czoge1xyXG4gICAgICBcIm1lbnVDb250ZW50XCI6IHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2FuaW1hbC1ob21lLmh0bWwnLFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgLnN0YXRlKCdBbmltYWwuZm9yQ2hpbGRyZW4nLCB7XHJcbiAgICB1cmw6ICcvZm9yLWNoaWxkcmVuJyxcclxuICAgIC8qdXJsOiAnL2ZjaGlsZHJlbicsKi9cclxuICAgIHZpZXdzOiB7XHJcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvZm9yLWNoaWxkcmVuLmh0bWwnLFxyXG4gICAgICAgIC8qdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9mY2hpbGRyZW4uaHRtbCcsKi9cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIC5zdGF0ZSgnQW5pbWFsLmZvckFkdWx0cycsIHtcclxuICAgIHVybDogJy9mb3ItYWR1bHRzJyxcclxuICAgIHZpZXdzOiB7XHJcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvZm9yLWFkdWx0cy5odG1sJyxcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIC5zdGF0ZSgnQW5pbWFsLm1hcCcsIHtcclxuICAgIHVybDogJy9tYXAnLFxyXG4gICAgdmlld3M6IHtcclxuICAgICAgXCJtZW51Q29udGVudFwiOiB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9hbmltYWwtbWFwLmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBbmltYWxNYXBDb250cm9sbGVyJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvXCIpO1xyXG59KVxyXG5cclxuLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xyXG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgaWYod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xyXG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXHJcbiAgICAgIC8vIGZvciBmb3JtIGlucHV0cylcclxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcclxuXHJcbiAgICAgIC8vIERvbid0IHJlbW92ZSB0aGlzIGxpbmUgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91IGFyZSBkb2luZy4gSXQgc3RvcHMgdGhlIHZpZXdwb3J0XHJcbiAgICAgIC8vIGZyb20gc25hcHBpbmcgd2hlbiB0ZXh0IGlucHV0cyBhcmUgZm9jdXNlZC4gSW9uaWMgaGFuZGxlcyB0aGlzIGludGVybmFsbHkgZm9yXHJcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxyXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcclxuICAgIH1cclxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcclxuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5jb250cm9sbGVyKFwiSG9tZUNvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJHN0YXRlXCIsIFwiJGxvY2F0aW9uXCIsIFwiYmFyY29kZUZhY3RvcnlcIixcclxuICBcInRyYW5zbGF0aW9uU2VydmljZVwiLFxyXG5cclxuICBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJGxvY2F0aW9uLCBiYXJjb2RlRmFjdG9yeSx0cmFuc2xhdGlvblNlcnZpY2UpIHtcclxuXHJcbiAgICAkc2NvcGUuYW5pbWFsSWQgPSBcIlwiO1xyXG4gICAgJHNjb3BlLmxhbmcgPSBcIkN6ZWNoXCI7XHJcblxyXG4gICAgJHNjb3BlLmxvYWRBbmltYWwgPSBsb2FkQW5pbWFsO1xyXG4gICAgJHNjb3BlLnF1aXQgPSBxdWl0O1xyXG4gICAgJHNjb3BlLmxvYWROZXdzID0gbG9hZE5ld3M7XHJcbiAgICAkc2NvcGUuYmFja1RvSG9tZSA9IGJhY2tUb0hvbWU7XHJcbiAgICAkc2NvcGUudHJhbnNsYXRlID0gdHJhbnNsYXRlO1xyXG4gICAgJHNjb3BlLmRlYnVnID0gZGVidWc7XHJcblxyXG4gICAgZnVuY3Rpb24gbG9hZEFuaW1hbCgpIHtcclxuICAgICAgYmFyY29kZUZhY3Rvcnkuc2NhbigpLnRoZW4oZnVuY3Rpb24oYW5pbWFsSWQpIHtcclxuICAgICAgICAkc2NvcGUuYW5pbWFsSWQgPSBhbmltYWxJZDtcclxuICAgICAgICAkbG9jYXRpb24ucGF0aChcIi9hbmltYWwvXCIgKyBhbmltYWxJZCArIFwiL1wiICsgJHNjb3BlLmxhbmcgKyBcIi9ob21lXCIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZWJ1ZygpIHtcclxuICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvYW5pbWFsL21lZHZlZF9rYW1jYXRza3kvXCIgKyAkc2NvcGUubGFuZyArIFwiL2hvbWVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcXVpdCgpIHtcclxuICAgICAgaW9uaWMuUGxhdGZvcm0uZXhpdEFwcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxvYWROZXdzKCkge1xyXG4gICAgICAkbG9jYXRpb24ucGF0aChcIi9uZXdzXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGJhY2tUb0hvbWUoKSB7XHJcbiAgICAgICRsb2NhdGlvbi5wYXRoKFwiL1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0cmFuc2xhdGUodHJhbnNsYXRpb25LZXkpIHtcclxuICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uU2VydmljZS50cmFuc2xhdGUodHJhbnNsYXRpb25LZXksICRzY29wZS5sYW5nKTtcclxuICAgIH1cclxuXHJcbiAgfV0pO1xyXG5cclxuXHJcblxyXG5cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCl7XHJcbiAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5kaXJlY3RpdmUoXCJ6b29SYXRpbmdTdGFyc1wiLCB6b29SYXRpbmdTdGFycyk7XHJcblxyXG4gIHpvb1JhdGluZ1N0YXJzLiRpbmplY3QgPSBbXCJyYXRpbmdGYWN0b3J5XCIgXTtcclxuXHJcbiAgZnVuY3Rpb24gem9vUmF0aW5nU3RhcnMocmF0aW5nRmFjdG9yeSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3Q6IFwiRVwiLFxyXG4gICAgICBzY29wZToge1xyXG4gICAgICAgIGFuaW1hbElkOiBcIj1cIixcclxuICAgICAgICBiaWc6IFwiQFwiLFxyXG4gICAgICAgIHNtYWxsOiBcIkBcIixcclxuICAgICAgICByZWFkT25seTogXCJAXCIsXHJcbiAgICAgICAgYWxyZWFkeVJhdGVkOiBcIj0/XCJcclxuICAgICAgfSxcclxuICAgICAgdGVtcGxhdGVVcmw6IFwiUGFydGlhbHMvRGlyZWN0aXZlcy96b28tcmF0aW5nLXN0YXJzLmh0bWxcIixcclxuICAgICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmdldEFuaW1hbFJhdGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmF0aW5nRmFjdG9yeS5nZXRBbmltYWxSYXRpbmcoJHNjb3BlLmFuaW1hbElkKS50aGVuKGZ1bmN0aW9uKHJhdGluZykge1xyXG4gICAgICAgICAgICAkc2NvcGUuYW5pbWFsUmF0aW5nID0gcmF0aW5nLlJhdGluZ1N1bSAvIHJhdGluZy5SYXRpbmdDb3VudCAvIDE7XHJcbiAgICAgICAgICB9LCBmdW5jdGlvbihyZWplY3RlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycjogXCIsIHJlamVjdGVkKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5yYXRlQW5pbWFsID0gZnVuY3Rpb24obnVtKSB7XHJcbiAgICAgICAgICBpZiAoISRzY29wZS5hbHJlYWR5UmF0ZWQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmFuaW1hbFJhdGluZyA9IG51bTtcclxuICAgICAgICAgICAgJHNjb3BlLmFscmVhZHlSYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJhdGluZ0ZhY3RvcnkucmF0ZUFuaW1hbCgkc2NvcGUuYW5pbWFsSWQsIG51bSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKCRzY29wZS5yZWFkT25seSkge1xyXG4gICAgICAgICAgJHNjb3BlLmdldEFuaW1hbFJhdGluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpe1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuZmFjdG9yeShcImFuaW1hbEZhY3RvcnlcIiwgW1wiJGh0dHBcIiwgXCIkcVwiLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcclxuICAgIHZhciBhbmltYWxGYWN0b3J5ID0ge307XHJcbiAgICB2YXIgdXJsID0gXCIvXCI7XHJcblxyXG4gICAgaWYoaW9uaWMgJiYgaW9uaWMuUGxhdGZvcm0gJiYgaW9uaWMuUGxhdGZvcm0uaXNBbmRyb2lkKCkpe1xyXG4gICAgICB1cmwgPSBcIi9hbmRyb2lkX2Fzc2V0L3d3dy9cIjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmZXRjaEFuaW1hbEJ5SWQoaWQpIHtcclxuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgdmFyIGFuaW1hbFVybCA9IHVybCArIFwiZGF0YS9hbmltYWwtdGV4dHMvXCIgKyBpZCArXCIuanNvblwiO1xyXG4gICAgICBhbGVydChcIkdldHRpbmcgYW5pbWFsVXJsOiAnXCIgKyBhbmltYWxVcmwgKyBcIidcIik7XHJcbiAgICAgICRodHRwLmdldChhbmltYWxVcmwpLnRoZW4oZnVuY3Rpb24oYW5pbWFsRGF0YSl7XHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhbmltYWxEYXRhLmRhdGEpO1xyXG4gICAgICB9LCBmdW5jdGlvbihmYWlsZWQpe1xyXG4gICAgICAgIGRlZmVycmVkLnJlamVjdChmYWlsZWQpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGFuaW1hbEZhY3RvcnkuZmV0Y2hBbmltYWxCeUlkID0gZmV0Y2hBbmltYWxCeUlkO1xyXG5cclxuICAgIHJldHVybiBhbmltYWxGYWN0b3J5O1xyXG4gIH1dKTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCl7XHJcbiAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5mYWN0b3J5KFwiYmFyY29kZUZhY3RvcnlcIiwgW1wiJGNvcmRvdmFCYXJjb2RlU2Nhbm5lclwiLCBcIiRxXCIsXHJcblxyXG4gIGZ1bmN0aW9uKCRjb3Jkb3ZhQmFyY29kZVNjYW5uZXIsICRxKSB7XHJcbiAgICB2YXIgYmFyY29kZUZhY3RvcnkgPSB7fTtcclxuICAgIHZhciBjYWNoZWRJZCA9IG51bGw7XHJcblxyXG4gICAgZnVuY3Rpb24gc2NhbigpIHtcclxuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgIGlmIChjYWNoZWRJZCkge1xyXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2FjaGVkSWQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkY29yZG92YUJhcmNvZGVTY2FubmVyLnNjYW4oKS50aGVuKGZ1bmN0aW9uKHNjYW5uZWREYXRhKSB7XHJcbiAgICAgICAgY2FjaGVkSWQgPSBzY2FubmVkRGF0YS50ZXh0O1xyXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoc2Nhbm5lZERhdGEudGV4dCk7XHJcbiAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBiYXJjb2RlRmFjdG9yeS5zY2FuID0gc2NhbjtcclxuXHJcbiAgICByZXR1cm4gYmFyY29kZUZhY3Rvcnk7XHJcbiAgfV0pO1xyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKXtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpXHJcbiAgLmZhY3RvcnkoXCJyYXRpbmdGYWN0b3J5XCIsIFtcIiRodHRwXCIsIFwiJHFcIixcclxuICBmdW5jdGlvbigkaHR0cCwgJHEpIHtcclxuXHJcbiAgICB2YXIgcmF0aW5nRmFjdG9yeSA9IHt9O1xyXG4gICAgcmF0aW5nRmFjdG9yeS5yYXRlQW5pbWFsID0gcmF0ZUFuaW1hbDtcclxuICAgIHJhdGluZ0ZhY3RvcnkuZ2V0QW5pbWFsUmF0aW5nID0gZ2V0QW5pbWFsUmF0aW5nO1xyXG5cclxuXHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHJhdGVBbmltYWwoYW5pbWFsSWQsIHJhdGluZykge1xyXG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgJGh0dHAucG9zdChcImh0dHA6Ly9nb2xhbmctbWFydGluYXRvci5yaGNsb3VkLmNvbS9yYXRpbmcvXCIgKyBhbmltYWxJZCArIFwiL1wiICsgcmF0aW5nKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpe1xyXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0LmRhdGEpO1xyXG4gICAgICB9LCBmdW5jdGlvbihyZWplY3RSZWFzb24pe1xyXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVqZWN0UmVhc29uKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRBbmltYWxSYXRpbmcoYW5pbWFsSWQpIHtcclxuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgIHZhciB1cmwgPSBcImh0dHBzOi8vZ29sYW5nLW1hcnRpbmF0b3IucmhjbG91ZC5jb20vcmF0aW5nL1wiICsgYW5pbWFsSWQ7XHJcbiAgICAgIGFsZXJ0KFwiR2V0OiBcIiArIHVybCk7XHJcbiAgICAgICRodHRwKHttZXRob2Q6IFwiR0VUXCIsIHVybDp1cmx9KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpe1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQuZGF0YSk7XHJcbiAgICAgIH0sIGZ1bmN0aW9uKHJlamVjdFJlYXNvbil7XHJcbiAgICAgICAgY29uc29sZS5sb2cocmVqZWN0UmVhc29uKTtcclxuICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVqZWN0UmVhc29uKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmF0aW5nRmFjdG9yeTtcclxuICB9XHJcbiAgXSk7XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpe1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuZmFjdG9yeShcInRyYW5zbGF0aW9uU2VydmljZVwiLCBbZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdHJhbnNsYXRpb25TZXJ2aWNlID0ge307XHJcblxyXG4gICAgdmFyIHRyYW5zbGF0aW9uTWFwID0ge1xyXG4gICAgICBcIkN6ZWNoXCI6IHtcclxuICAgICAgICBcIk5FV1NcIjogXCJOb3Zpbmt5XCIsXHJcbiAgICAgICAgXCJSRUFEX1FSXCI6IFwiTmFjdGkgUVIga29kXCIsXHJcbiAgICAgICAgXCJRVUlUXCI6IFwiVWtvbmNpXCIsXHJcbiAgICAgICAgXCJDWkVDSFwiOiBcIkNlc2t5XCIsXHJcbiAgICAgICAgXCJFTkdMSVNIXCI6IFwiQW5nbGlja3lcIixcclxuICAgICAgICBcIkZPUl9DSElMRFJFTlwiOiBcIlBybyBkZXRpXCIsXHJcbiAgICAgICAgXCJGT1JfQURVTFRTXCI6IFwiUHJvIGRvc3DEm2zDqVwiLFxyXG4gICAgICAgIFwiTUFQXCI6IFwiTWFwYVwiLFxyXG4gICAgICAgIFwiQVVESU9cIjogXCJadnVrXCIsXHJcbiAgICAgICAgXCJBQ1RJT05TX0ZPUlwiOiBcIk1vem5vc3RpIHBybyBcIixcclxuICAgICAgICBcIlJBVEVcIiA6IFwiT2hvZG5vdCBtZVwiLFxyXG4gICAgICAgIFwiSE9NRVwiOiBcIkRvbXVcIixcclxuICAgICAgICBcIkFOSU1BTF9IT01FX1NDUkVFTlwiOiBcIlp2aXJlIC0gSW5mb3JtYWNlXCJcclxuICAgICAgfSxcclxuICAgICAgXCJFbmdsaXNoXCI6IHtcclxuICAgICAgICBcIk5FV1NcIjogXCJOZXdzXCIsXHJcbiAgICAgICAgXCJSRUFEX1FSXCI6IFwiUmVhZCBRUiBjb2RlXCIsXHJcbiAgICAgICAgXCJRVUlUXCI6IFwiUXVpdFwiLFxyXG4gICAgICAgIFwiQ1pFQ0hcIjogXCJDemVjaFwiLFxyXG4gICAgICAgIFwiRU5HTElTSFwiOiBcIkVuZ2xpc2hcIixcclxuICAgICAgICBcIkZPUl9DSElMRFJFTlwiOiBcIkZvciBjaGlsZHJlblwiLFxyXG4gICAgICAgIFwiRk9SX0FEVUxUU1wiOiBcIkZvciBhZHVsdHNcIixcclxuICAgICAgICBcIk1BUFwiOiBcIk1hcFwiLFxyXG4gICAgICAgIFwiQVVESU9cIjogXCJBdWRpXCIsXHJcbiAgICAgICAgXCJBQ1RJT05TX0ZPUlwiOiBcIkFjdGlvbnMgZm9yXCIsXHJcbiAgICAgICAgXCJSQVRFXCI6IFwiUmF0ZSBtZVwiLFxyXG4gICAgICAgIFwiSE9NRVwiOiBcIkhvbWVcIixcclxuICAgICAgICBcIkFOSU1BTF9IT01FX1NDUkVFTlwiOiBcIkFuaW1hbCAtIEFib3V0XCJcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiB0cmFuc2xhdGUoa2V5LCBsYW5ndWFnZSkge1xyXG4gICAgICByZXR1cm4gKHRyYW5zbGF0aW9uTWFwW2xhbmd1YWdlXSlba2V5XSB8fCBcIlwiO1xyXG4gICAgfVxyXG5cclxuICAgIHRyYW5zbGF0aW9uU2VydmljZS50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XHJcblxyXG4gICAgcmV0dXJuIHRyYW5zbGF0aW9uU2VydmljZTtcclxuICB9XSk7XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmNvbnRyb2xsZXIoXCJBbmltYWxDb250cm9sbGVyXCIsXHJcbiAgICBbXCIkc2NvcGVcIiwgXCIkc3RhdGVQYXJhbXNcIiwgXCJhbmltYWxGYWN0b3J5XCIsIFwidHJhbnNsYXRpb25TZXJ2aWNlXCIsXHJcblxyXG5cclxuICBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgYW5pbWFsRmFjdG9yeSwgdHJhbnNsYXRpb25TZXJ2aWNlKSB7XHJcblxyXG4gICAgdmFyIGFuaW1hbElkID0gJHNjb3BlLmFuaW1hbElkID0gJHN0YXRlUGFyYW1zLmFuaW1hbElkO1xyXG4gICAgJHNjb3BlLmxhbmcgPSAkc3RhdGVQYXJhbXMubGFuZztcclxuICAgICRzY29wZS5hbmltYWwgPSB7XHJcbiAgICAgIFwibGFiZWxcIjogXCJ1bmxvYWRlZFwiLFxyXG4gICAgICBcImZvckFkdWx0c1wiOiBcInVubG9hZGVkXCIsXHJcbiAgICAgIFwibXVsdGlMYW5ndWFnZVwiOiBcImZhbHNlXCIsXHJcbiAgICAgIFwiZm9yQ2hpbGRyZW5cIjogXCJ1bmxvYWRlZFwiXHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xyXG4gICAgJHNjb3BlLmFscmVhZHlSYXRlZCA9IGZhbHNlO1xyXG5cclxuICAgIChmdW5jdGlvbiBpbml0aWFsaXplKCl7XHJcbiAgICAgIGFsZXJ0KFwiYW5pbWFsSWQgaXMgXCIgKyBhbmltYWxJZCk7XHJcbiAgICAgIGFuaW1hbEZhY3RvcnkuZmV0Y2hBbmltYWxCeUlkKGFuaW1hbElkKS50aGVuKGZ1bmN0aW9uKGFuaW1hbCkge1xyXG4gICAgICAgICRzY29wZS5hbmltYWwgPSBhbmltYWw7XHJcbiAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgfSwgZnVuY3Rpb24oZmFpbGVkKSB7XHJcbiAgICAgICAgYWxlcnQoZmFpbGVkKTtcclxuICAgICAgfSk7XHJcbiAgICB9KCkpO1xyXG5cclxuICAgICRzY29wZS50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XHJcbiAgICAkc2NvcGUuZ2V0QW5pbWFsTGFiZWwgPSBnZXRBbmltYWxMYWJlbDtcclxuICAgICRzY29wZS5nZXRUZXh0Rm9yQ2hpbGRyZW4gPSBnZXRUZXh0Rm9yQ2hpbGRyZW47XHJcbiAgICAkc2NvcGUuZ2V0VGV4dEZvckFkdWx0cyA9IGdldFRleHRGb3JBZHVsdHM7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0QW5pbWFsTGFiZWwoKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuYW5pbWFsLm11bHRpTGFuZ3VhZ2UgPT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImxhYmVsXCIgKyAkc2NvcGUubGFuZ107XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJsYWJlbFwiICsgJHNjb3BlLmFuaW1hbC5sYW5nXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFRleHRGb3JBZHVsdHMoKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuYW5pbWFsLm11bHRpTGFuZ3VhZ2UgPT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImZvckFkdWx0c1wiICsgJHNjb3BlLmxhbmddO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAkc2NvcGUuYW5pbWFsLmZvckFkdWx0c1tcImZvckFkdWx0c1wiICsgJHNjb3BlLmFuaW1hbC5sYW5nXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFRleHRGb3JDaGlsZHJlbigpIHtcclxuICAgICAgaWYgKCRzY29wZS5hbmltYWwubXVsdGlMYW5ndWFnZSA9PSBcInRydWVcIikge1xyXG4gICAgICAgIHJldHVybiAkc2NvcGUuYW5pbWFsW1wiZm9yQ2hpbGRyZW5cIiArICRzY29wZS5sYW5nXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImZvckNoaWxkcmVuXCIgKyAkc2NvcGUuYW5pbWFsLmxhbmddO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlKGtleSkge1xyXG4gICAgICByZXR1cm4gdHJhbnNsYXRpb25TZXJ2aWNlLnRyYW5zbGF0ZShrZXksICRzY29wZS5sYW5nKSB8fCBrZXk7XHJcbiAgICB9XHJcbiAgfV0pO1xyXG5cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuY29udHJvbGxlcihcIkFuaW1hbE1hcENvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJGlvbmljTG9hZGluZ1wiLFxyXG4gIFwiJGNvbXBpbGVcIixcclxuXHJcbiAgZnVuY3Rpb24oJHNjb3BlLCAkaW9uaWNMb2FkaW5nLCAkY29tcGlsZSkge1xyXG4gICAgdmFyIGxhdExuZyA9IHt9O1xyXG4gICAgdmFyIG1hcE9wdHMgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xyXG4gICAgICBsYXRMbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQ5LjIsMTYuNSk7XHJcblxyXG4gICAgICBtYXBPcHRzID0ge1xyXG4gICAgICAgIGNlbnRlcjogbGF0TG5nLFxyXG4gICAgICAgIHpvb206IDE1LFxyXG4gICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVBcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGluaXRpYWxpemUoKTtcclxuICAgICRzY29wZS5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ29vZ2xlTWFwXCIpLCBtYXBPcHRzKTtcclxuICAgIH1cclxuICBdKTtcclxufSgpKTtcclxuIl19
