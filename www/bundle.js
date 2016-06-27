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
        templateUrl: 'Partials/animal-home.html'
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

        $scope.animalRating = -1;
        $scope.starsArray = [1,2,3,4,5];

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

(function() {
  angular.module("zoo-app").controller("HomeController", ["$scope", "$state", "$location", "barcodeFactory",
  "translationService", "$ionicHistory",

  function($scope, $state, $location, barcodeFactory,translationService, $ionicHistory) {
    $scope.lang = "Czech";

    $scope.loadAnimal = loadAnimal;
    $scope.quit = quit;
    $scope.loadNews = loadNews;
    $scope.backToHome = backToHome;
    $scope.translate = translate;
    $scope.debug = debug;

    function loadAnimal() {
      $ionicHistory.clearHistory();
        $ionicHistory.clearCache().then(function() {
          barcodeFactory.scan().then(function(animalId) {
          $state.go("Animal.Home", {"animalId": animalId, "lang": $scope.lang}, {reload : true});
        });
      });
    }

    function debug() {
      $ionicHistory.clearCache().then(function() {
        $location.path("/animal/medved_kamcatsky/" + $scope.lang + "/home");
      });
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

    function scan() {
      var deferred = $q.defer();

      $cordovaBarcodeScanner.scan().then(function(scannedData) {
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
      $http({method: "GET", url:url})
      .then(function(result){
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
        "RATE" : "Jak se ti libim?",
        "HOME": "Domu",
        "ANIMAL_HOME_SCREEN": "Zvire - Informace",
        "INFORMATION": "Informace"
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
        "RATE": "How do you like me?",
        "HOME": "Home",
        "ANIMAL_HOME_SCREEN": "Animal - About",
        "INFORMATION": "About"
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
    ["$scope", "$stateParams", "animalFactory", "translationService", "$state", "$ionicHistory",


  function($scope, $stateParams, animalFactory, translationService, $state, $ionicHistory) {
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
      $ionicHistory.clearCache().then(function() {
        animalFactory.fetchAnimalById(animalId).then(function(animal) {
          $scope.animal = animal;
          $scope.loading = false;
        }, function(failed) {
          $state.go("Home");
        });
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
        return $scope.animal["forAdults" + $scope.animal.lang];
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInpvby1hcHAuanMiLCJEaXJlY3RpdmVzL3pvb1JhdGluZ1N0YXJzLmpzIiwiQ29udHJvbGxlcnMvSG9tZS5qcyIsIlNlcnZpY2VzL2FuaW1hbC5qcyIsIlNlcnZpY2VzL2JhcmNvZGUuanMiLCJTZXJ2aWNlcy9yYXRpbmcuanMiLCJTZXJ2aWNlcy90cmFuc2xhdGlvbi5qcyIsIkNvbnRyb2xsZXJzL0FuaW1hbC9BbmltYWwuanMiLCJDb250cm9sbGVycy9BbmltYWwvQW5pbWFsTWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW9uaWMgU3RhcnRlciBBcHBcblxuLy8gYW5ndWxhci5tb2R1bGUgaXMgYSBnbG9iYWwgcGxhY2UgZm9yIGNyZWF0aW5nLCByZWdpc3RlcmluZyBhbmQgcmV0cmlldmluZyBBbmd1bGFyIG1vZHVsZXNcbi8vICdzdGFydGVyJyBpcyB0aGUgbmFtZSBvZiB0aGlzIGFuZ3VsYXIgbW9kdWxlIGV4YW1wbGUgKGFsc28gc2V0IGluIGEgPGJvZHk+IGF0dHJpYnV0ZSBpbiBpbmRleC5odG1sKVxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xuKGZ1bmN0aW9uKCkge1xuYW5ndWxhci5tb2R1bGUoJ3pvby1hcHAnLCBbJ2lvbmljJywgJ25nQ29yZG92YSddKVxuXG4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ0hvbWUnLCB7XG4gICAgdXJsOiAnLycsXG4gICAgLypJZiBpbiBhIGZvbGRlciwgdGVtcGxhdGUvd2VsY29tZS5odG1sKi9cbiAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2hvbWUuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICB9KVxuXG4gIC5zdGF0ZSgnTmV3cycsIHtcbiAgICB1cmw6ICcvbmV3cycsXG4gICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9uZXdzLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgfSlcblxuICAuc3RhdGUoJ0FuaW1hbCcsIHtcbiAgICB1cmw6ICcvYW5pbWFsL3thbmltYWxJZH0ve2xhbmd9JyxcbiAgICBhYnN0cmFjdDp0cnVlLFxuICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvYW5pbWFsLmh0bWwnXG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwuSG9tZScsIHtcbiAgICB1cmw6ICcvaG9tZScsXG4gICAgdmlld3M6IHtcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2FuaW1hbC1ob21lLmh0bWwnXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC5zdGF0ZSgnQW5pbWFsLmZvckNoaWxkcmVuJywge1xuICAgIHVybDogJy9mb3ItY2hpbGRyZW4nLFxuICAgIC8qdXJsOiAnL2ZjaGlsZHJlbicsKi9cbiAgICB2aWV3czoge1xuICAgICAgXCJtZW51Q29udGVudFwiOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvZm9yLWNoaWxkcmVuLmh0bWwnLFxuICAgICAgICAvKnRlbXBsYXRlVXJsOiAnUGFydGlhbHMvZmNoaWxkcmVuLmh0bWwnLCovXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC5zdGF0ZSgnQW5pbWFsLmZvckFkdWx0cycsIHtcbiAgICB1cmw6ICcvZm9yLWFkdWx0cycsXG4gICAgdmlld3M6IHtcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2Zvci1hZHVsdHMuaHRtbCcsXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC5zdGF0ZSgnQW5pbWFsLm1hcCcsIHtcbiAgICB1cmw6ICcvbWFwJyxcbiAgICB2aWV3czoge1xuICAgICAgXCJtZW51Q29udGVudFwiOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvYW5pbWFsLW1hcC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0FuaW1hbE1hcENvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL1wiKTtcbn0pXG5cbi5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblxuICAgICAgLy8gRG9uJ3QgcmVtb3ZlIHRoaXMgbGluZSB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UgYXJlIGRvaW5nLiBJdCBzdG9wcyB0aGUgdmlld3BvcnRcbiAgICAgIC8vIGZyb20gc25hcHBpbmcgd2hlbiB0ZXh0IGlucHV0cyBhcmUgZm9jdXNlZC4gSW9uaWMgaGFuZGxlcyB0aGlzIGludGVybmFsbHkgZm9yXG4gICAgICAvLyBhIG11Y2ggbmljZXIga2V5Ym9hcmQgZXhwZXJpZW5jZS5cbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuICAgIH1cbiAgICBpZih3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuICB9KTtcbn0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuZGlyZWN0aXZlKFwiem9vUmF0aW5nU3RhcnNcIiwgem9vUmF0aW5nU3RhcnMpO1xuXG4gIHpvb1JhdGluZ1N0YXJzLiRpbmplY3QgPSBbXCJyYXRpbmdGYWN0b3J5XCIgXTtcblxuICBmdW5jdGlvbiB6b29SYXRpbmdTdGFycyhyYXRpbmdGYWN0b3J5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIGFuaW1hbElkOiBcIj1cIixcbiAgICAgICAgYmlnOiBcIkBcIixcbiAgICAgICAgc21hbGw6IFwiQFwiLFxuICAgICAgICByZWFkT25seTogXCJAXCIsXG4gICAgICAgIGFscmVhZHlSYXRlZDogXCI9P1wiXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGVVcmw6IFwiUGFydGlhbHMvRGlyZWN0aXZlcy96b28tcmF0aW5nLXN0YXJzLmh0bWxcIixcbiAgICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUpO1xuXG4gICAgICAgICRzY29wZS5hbmltYWxSYXRpbmcgPSAtMTtcbiAgICAgICAgJHNjb3BlLnN0YXJzQXJyYXkgPSBbMSwyLDMsNCw1XTtcblxuICAgICAgICAkc2NvcGUuZ2V0QW5pbWFsUmF0aW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmF0aW5nRmFjdG9yeS5nZXRBbmltYWxSYXRpbmcoJHNjb3BlLmFuaW1hbElkKS50aGVuKGZ1bmN0aW9uKHJhdGluZykge1xuICAgICAgICAgICAgJHNjb3BlLmFuaW1hbFJhdGluZyA9IHJhdGluZy5SYXRpbmdTdW0gLyByYXRpbmcuUmF0aW5nQ291bnQgLyAxO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKHJlamVjdGVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycjogXCIsIHJlamVjdGVkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUucmF0ZUFuaW1hbCA9IGZ1bmN0aW9uKG51bSkge1xuICAgICAgICAgIGlmICghJHNjb3BlLmFscmVhZHlSYXRlZCkge1xuICAgICAgICAgICAgJHNjb3BlLmFuaW1hbFJhdGluZyA9IG51bTtcbiAgICAgICAgICAgICRzY29wZS5hbHJlYWR5UmF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmF0aW5nRmFjdG9yeS5yYXRlQW5pbWFsKCRzY29wZS5hbmltYWxJZCwgbnVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCRzY29wZS5yZWFkT25seSkge1xuICAgICAgICAgICRzY29wZS5nZXRBbmltYWxSYXRpbmcoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn0oKSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5jb250cm9sbGVyKFwiSG9tZUNvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJHN0YXRlXCIsIFwiJGxvY2F0aW9uXCIsIFwiYmFyY29kZUZhY3RvcnlcIixcbiAgXCJ0cmFuc2xhdGlvblNlcnZpY2VcIiwgXCIkaW9uaWNIaXN0b3J5XCIsXG5cbiAgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRsb2NhdGlvbiwgYmFyY29kZUZhY3RvcnksdHJhbnNsYXRpb25TZXJ2aWNlLCAkaW9uaWNIaXN0b3J5KSB7XG4gICAgJHNjb3BlLmxhbmcgPSBcIkN6ZWNoXCI7XG5cbiAgICAkc2NvcGUubG9hZEFuaW1hbCA9IGxvYWRBbmltYWw7XG4gICAgJHNjb3BlLnF1aXQgPSBxdWl0O1xuICAgICRzY29wZS5sb2FkTmV3cyA9IGxvYWROZXdzO1xuICAgICRzY29wZS5iYWNrVG9Ib21lID0gYmFja1RvSG9tZTtcbiAgICAkc2NvcGUudHJhbnNsYXRlID0gdHJhbnNsYXRlO1xuICAgICRzY29wZS5kZWJ1ZyA9IGRlYnVnO1xuXG4gICAgZnVuY3Rpb24gbG9hZEFuaW1hbCgpIHtcbiAgICAgICRpb25pY0hpc3RvcnkuY2xlYXJIaXN0b3J5KCk7XG4gICAgICAgICRpb25pY0hpc3RvcnkuY2xlYXJDYWNoZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgYmFyY29kZUZhY3Rvcnkuc2NhbigpLnRoZW4oZnVuY3Rpb24oYW5pbWFsSWQpIHtcbiAgICAgICAgICAkc3RhdGUuZ28oXCJBbmltYWwuSG9tZVwiLCB7XCJhbmltYWxJZFwiOiBhbmltYWxJZCwgXCJsYW5nXCI6ICRzY29wZS5sYW5nfSwge3JlbG9hZCA6IHRydWV9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAgICRpb25pY0hpc3RvcnkuY2xlYXJDYWNoZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL2FuaW1hbC9tZWR2ZWRfa2FtY2F0c2t5L1wiICsgJHNjb3BlLmxhbmcgKyBcIi9ob21lXCIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcXVpdCgpIHtcbiAgICAgIGlvbmljLlBsYXRmb3JtLmV4aXRBcHAoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkTmV3cygpIHtcbiAgICAgICRsb2NhdGlvbi5wYXRoKFwiL25ld3NcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmFja1RvSG9tZSgpIHtcbiAgICAgICRsb2NhdGlvbi5wYXRoKFwiL1wiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2xhdGUodHJhbnNsYXRpb25LZXkpIHtcbiAgICAgIHJldHVybiB0cmFuc2xhdGlvblNlcnZpY2UudHJhbnNsYXRlKHRyYW5zbGF0aW9uS2V5LCAkc2NvcGUubGFuZyk7XG4gICAgfVxuXG4gIH1dKTtcblxuXG5cblxufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuZmFjdG9yeShcImFuaW1hbEZhY3RvcnlcIiwgW1wiJGh0dHBcIiwgXCIkcVwiLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgICB2YXIgYW5pbWFsRmFjdG9yeSA9IHt9O1xuICAgIHZhciB1cmwgPSBcIi9cIjtcblxuICAgIGlmKGlvbmljICYmIGlvbmljLlBsYXRmb3JtICYmIGlvbmljLlBsYXRmb3JtLmlzQW5kcm9pZCgpKXtcbiAgICAgIHVybCA9IFwiL2FuZHJvaWRfYXNzZXQvd3d3L1wiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZldGNoQW5pbWFsQnlJZChpZCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHZhciBhbmltYWxVcmwgPSB1cmwgKyBcImRhdGEvYW5pbWFsLXRleHRzL1wiICsgaWQgK1wiLmpzb25cIjtcbiAgICAgICRodHRwLmdldChhbmltYWxVcmwpLnRoZW4oZnVuY3Rpb24oYW5pbWFsRGF0YSl7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoYW5pbWFsRGF0YS5kYXRhKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGZhaWxlZCl7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChmYWlsZWQpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGFuaW1hbEZhY3RvcnkuZmV0Y2hBbmltYWxCeUlkID0gZmV0Y2hBbmltYWxCeUlkO1xuXG4gICAgcmV0dXJuIGFuaW1hbEZhY3Rvcnk7XG4gIH1dKTtcbn0oKSk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmZhY3RvcnkoXCJiYXJjb2RlRmFjdG9yeVwiLCBbXCIkY29yZG92YUJhcmNvZGVTY2FubmVyXCIsIFwiJHFcIixcblxuICBmdW5jdGlvbigkY29yZG92YUJhcmNvZGVTY2FubmVyLCAkcSkge1xuICAgIHZhciBiYXJjb2RlRmFjdG9yeSA9IHt9O1xuXG4gICAgZnVuY3Rpb24gc2NhbigpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICRjb3Jkb3ZhQmFyY29kZVNjYW5uZXIuc2NhbigpLnRoZW4oZnVuY3Rpb24oc2Nhbm5lZERhdGEpIHtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzY2FubmVkRGF0YS50ZXh0KTtcbiAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgYmFyY29kZUZhY3Rvcnkuc2NhbiA9IHNjYW47XG5cbiAgICByZXR1cm4gYmFyY29kZUZhY3Rvcnk7XG4gIH1dKTtcbn0oKSk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpXG4gIC5mYWN0b3J5KFwicmF0aW5nRmFjdG9yeVwiLCBbXCIkaHR0cFwiLCBcIiRxXCIsXG4gIGZ1bmN0aW9uKCRodHRwLCAkcSkge1xuXG4gICAgdmFyIHJhdGluZ0ZhY3RvcnkgPSB7fTtcbiAgICByYXRpbmdGYWN0b3J5LnJhdGVBbmltYWwgPSByYXRlQW5pbWFsO1xuICAgIHJhdGluZ0ZhY3RvcnkuZ2V0QW5pbWFsUmF0aW5nID0gZ2V0QW5pbWFsUmF0aW5nO1xuXG4gICAgZnVuY3Rpb24gcmF0ZUFuaW1hbChhbmltYWxJZCwgcmF0aW5nKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAkaHR0cC5wb3N0KFwiaHR0cDovL2dvbGFuZy1tYXJ0aW5hdG9yLnJoY2xvdWQuY29tL3JhdGluZy9cIiArIGFuaW1hbElkICsgXCIvXCIgKyByYXRpbmcpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdC5kYXRhKTtcbiAgICAgIH0sIGZ1bmN0aW9uKHJlamVjdFJlYXNvbil7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVqZWN0UmVhc29uKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRBbmltYWxSYXRpbmcoYW5pbWFsSWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHZhciB1cmwgPSBcImh0dHBzOi8vZ29sYW5nLW1hcnRpbmF0b3IucmhjbG91ZC5jb20vcmF0aW5nL1wiICsgYW5pbWFsSWQ7XG4gICAgICAkaHR0cCh7bWV0aG9kOiBcIkdFVFwiLCB1cmw6dXJsfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0LmRhdGEpO1xuICAgICAgfSwgZnVuY3Rpb24ocmVqZWN0UmVhc29uKXtcbiAgICAgICAgY29uc29sZS5sb2cocmVqZWN0UmVhc29uKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlamVjdFJlYXNvbik7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhdGluZ0ZhY3Rvcnk7XG4gIH1cbiAgXSk7XG59KCkpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5mYWN0b3J5KFwidHJhbnNsYXRpb25TZXJ2aWNlXCIsIFtmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJhbnNsYXRpb25TZXJ2aWNlID0ge307XG5cbiAgICB2YXIgdHJhbnNsYXRpb25NYXAgPSB7XG4gICAgICBcIkN6ZWNoXCI6IHtcbiAgICAgICAgXCJORVdTXCI6IFwiTm92aW5reVwiLFxuICAgICAgICBcIlJFQURfUVJcIjogXCJOYWN0aSBRUiBrb2RcIixcbiAgICAgICAgXCJRVUlUXCI6IFwiVWtvbmNpXCIsXG4gICAgICAgIFwiQ1pFQ0hcIjogXCJDZXNreVwiLFxuICAgICAgICBcIkVOR0xJU0hcIjogXCJBbmdsaWNreVwiLFxuICAgICAgICBcIkZPUl9DSElMRFJFTlwiOiBcIlBybyBkZXRpXCIsXG4gICAgICAgIFwiRk9SX0FEVUxUU1wiOiBcIlBybyBkb3NwxJtsw6lcIixcbiAgICAgICAgXCJNQVBcIjogXCJNYXBhXCIsXG4gICAgICAgIFwiQVVESU9cIjogXCJadnVrXCIsXG4gICAgICAgIFwiQUNUSU9OU19GT1JcIjogXCJNb3pub3N0aSBwcm8gXCIsXG4gICAgICAgIFwiUkFURVwiIDogXCJKYWsgc2UgdGkgbGliaW0/XCIsXG4gICAgICAgIFwiSE9NRVwiOiBcIkRvbXVcIixcbiAgICAgICAgXCJBTklNQUxfSE9NRV9TQ1JFRU5cIjogXCJadmlyZSAtIEluZm9ybWFjZVwiLFxuICAgICAgICBcIklORk9STUFUSU9OXCI6IFwiSW5mb3JtYWNlXCJcbiAgICAgIH0sXG4gICAgICBcIkVuZ2xpc2hcIjoge1xuICAgICAgICBcIk5FV1NcIjogXCJOZXdzXCIsXG4gICAgICAgIFwiUkVBRF9RUlwiOiBcIlJlYWQgUVIgY29kZVwiLFxuICAgICAgICBcIlFVSVRcIjogXCJRdWl0XCIsXG4gICAgICAgIFwiQ1pFQ0hcIjogXCJDemVjaFwiLFxuICAgICAgICBcIkVOR0xJU0hcIjogXCJFbmdsaXNoXCIsXG4gICAgICAgIFwiRk9SX0NISUxEUkVOXCI6IFwiRm9yIGNoaWxkcmVuXCIsXG4gICAgICAgIFwiRk9SX0FEVUxUU1wiOiBcIkZvciBhZHVsdHNcIixcbiAgICAgICAgXCJNQVBcIjogXCJNYXBcIixcbiAgICAgICAgXCJBVURJT1wiOiBcIkF1ZGlcIixcbiAgICAgICAgXCJBQ1RJT05TX0ZPUlwiOiBcIkFjdGlvbnMgZm9yXCIsXG4gICAgICAgIFwiUkFURVwiOiBcIkhvdyBkbyB5b3UgbGlrZSBtZT9cIixcbiAgICAgICAgXCJIT01FXCI6IFwiSG9tZVwiLFxuICAgICAgICBcIkFOSU1BTF9IT01FX1NDUkVFTlwiOiBcIkFuaW1hbCAtIEFib3V0XCIsXG4gICAgICAgIFwiSU5GT1JNQVRJT05cIjogXCJBYm91dFwiXG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZShrZXksIGxhbmd1YWdlKSB7XG4gICAgICByZXR1cm4gKHRyYW5zbGF0aW9uTWFwW2xhbmd1YWdlXSlba2V5XSB8fCBcIlwiO1xuICAgIH1cblxuICAgIHRyYW5zbGF0aW9uU2VydmljZS50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XG5cbiAgICByZXR1cm4gdHJhbnNsYXRpb25TZXJ2aWNlO1xuICB9XSk7XG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5jb250cm9sbGVyKFwiQW5pbWFsQ29udHJvbGxlclwiLFxuICAgIFtcIiRzY29wZVwiLCBcIiRzdGF0ZVBhcmFtc1wiLCBcImFuaW1hbEZhY3RvcnlcIiwgXCJ0cmFuc2xhdGlvblNlcnZpY2VcIiwgXCIkc3RhdGVcIiwgXCIkaW9uaWNIaXN0b3J5XCIsXG5cblxuICBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgYW5pbWFsRmFjdG9yeSwgdHJhbnNsYXRpb25TZXJ2aWNlLCAkc3RhdGUsICRpb25pY0hpc3RvcnkpIHtcbiAgICB2YXIgYW5pbWFsSWQgPSAkc2NvcGUuYW5pbWFsSWQgPSAkc3RhdGVQYXJhbXMuYW5pbWFsSWQ7XG4gICAgJHNjb3BlLmxhbmcgPSAkc3RhdGVQYXJhbXMubGFuZztcbiAgICAkc2NvcGUuYW5pbWFsID0ge1xuICAgICAgXCJsYWJlbFwiOiBcInVubG9hZGVkXCIsXG4gICAgICBcImZvckFkdWx0c1wiOiBcInVubG9hZGVkXCIsXG4gICAgICBcIm11bHRpTGFuZ3VhZ2VcIjogXCJmYWxzZVwiLFxuICAgICAgXCJmb3JDaGlsZHJlblwiOiBcInVubG9hZGVkXCJcbiAgICB9O1xuICAgICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAkc2NvcGUuYWxyZWFkeVJhdGVkID0gZmFsc2U7XG5cbiAgICAoZnVuY3Rpb24gaW5pdGlhbGl6ZSgpe1xuICAgICAgJGlvbmljSGlzdG9yeS5jbGVhckNhY2hlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgYW5pbWFsRmFjdG9yeS5mZXRjaEFuaW1hbEJ5SWQoYW5pbWFsSWQpLnRoZW4oZnVuY3Rpb24oYW5pbWFsKSB7XG4gICAgICAgICAgJHNjb3BlLmFuaW1hbCA9IGFuaW1hbDtcbiAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB9LCBmdW5jdGlvbihmYWlsZWQpIHtcbiAgICAgICAgICAkc3RhdGUuZ28oXCJIb21lXCIpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgfSgpKTtcblxuICAgICRzY29wZS50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XG4gICAgJHNjb3BlLmdldEFuaW1hbExhYmVsID0gZ2V0QW5pbWFsTGFiZWw7XG4gICAgJHNjb3BlLmdldFRleHRGb3JDaGlsZHJlbiA9IGdldFRleHRGb3JDaGlsZHJlbjtcbiAgICAkc2NvcGUuZ2V0VGV4dEZvckFkdWx0cyA9IGdldFRleHRGb3JBZHVsdHM7XG5cbiAgICBmdW5jdGlvbiBnZXRBbmltYWxMYWJlbCgpIHtcbiAgICAgIGlmICgkc2NvcGUuYW5pbWFsLm11bHRpTGFuZ3VhZ2UgPT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJsYWJlbFwiICsgJHNjb3BlLmxhbmddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJsYWJlbFwiICsgJHNjb3BlLmFuaW1hbC5sYW5nXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUZXh0Rm9yQWR1bHRzKCkge1xuICAgICAgaWYgKCRzY29wZS5hbmltYWwubXVsdGlMYW5ndWFnZSA9PSBcInRydWVcIikge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImZvckFkdWx0c1wiICsgJHNjb3BlLmxhbmddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJmb3JBZHVsdHNcIiArICRzY29wZS5hbmltYWwubGFuZ107XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VGV4dEZvckNoaWxkcmVuKCkge1xuICAgICAgaWYgKCRzY29wZS5hbmltYWwubXVsdGlMYW5ndWFnZSA9PSBcInRydWVcIikge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImZvckNoaWxkcmVuXCIgKyAkc2NvcGUubGFuZ107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImZvckNoaWxkcmVuXCIgKyAkc2NvcGUuYW5pbWFsLmxhbmddO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZShrZXkpIHtcbiAgICAgIHJldHVybiB0cmFuc2xhdGlvblNlcnZpY2UudHJhbnNsYXRlKGtleSwgJHNjb3BlLmxhbmcpIHx8IGtleTtcbiAgICB9XG4gIH1dKTtcblxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmNvbnRyb2xsZXIoXCJBbmltYWxNYXBDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRpb25pY0xvYWRpbmdcIixcbiAgXCIkY29tcGlsZVwiLFxuXG4gIGZ1bmN0aW9uKCRzY29wZSwgJGlvbmljTG9hZGluZywgJGNvbXBpbGUpIHtcbiAgICB2YXIgbGF0TG5nID0ge307XG4gICAgdmFyIG1hcE9wdHMgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgICBsYXRMbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQ5LjIsMTYuNSk7XG5cbiAgICAgIG1hcE9wdHMgPSB7XG4gICAgICAgIGNlbnRlcjogbGF0TG5nLFxuICAgICAgICB6b29tOiAxNSxcbiAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUFxuICAgICAgfTtcbiAgICB9XG4gICAgaW5pdGlhbGl6ZSgpO1xuICAgICRzY29wZS5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ29vZ2xlTWFwXCIpLCBtYXBPcHRzKTtcbiAgICB9XG4gIF0pO1xufSgpKTtcbiJdfQ==
