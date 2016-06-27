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

  angular.module("zoo-app").controller("AnimalController",
    ["$scope", "$stateParams", "animalFactory", "translationService", "$state",


  function($scope, $stateParams, animalFactory, translationService, $state) {
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
    $scope.activeState = "information";

    (function initialize(){
      animalFactory.fetchAnimalById(animalId).then(function(animal) {
        $scope.animal = animal;
        $scope.loading = false;
      }, function(failed) {
        $state.go("Home");
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInpvby1hcHAuanMiLCJDb250cm9sbGVycy9Ib21lLmpzIiwiU2VydmljZXMvYW5pbWFsLmpzIiwiU2VydmljZXMvYmFyY29kZS5qcyIsIlNlcnZpY2VzL3JhdGluZy5qcyIsIlNlcnZpY2VzL3RyYW5zbGF0aW9uLmpzIiwiRGlyZWN0aXZlcy96b29SYXRpbmdTdGFycy5qcyIsIkNvbnRyb2xsZXJzL0FuaW1hbC9BbmltYWwuanMiLCJDb250cm9sbGVycy9BbmltYWwvQW5pbWFsTWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIElvbmljIFN0YXJ0ZXIgQXBwXHJcblxyXG4vLyBhbmd1bGFyLm1vZHVsZSBpcyBhIGdsb2JhbCBwbGFjZSBmb3IgY3JlYXRpbmcsIHJlZ2lzdGVyaW5nIGFuZCByZXRyaWV2aW5nIEFuZ3VsYXIgbW9kdWxlc1xyXG4vLyAnc3RhcnRlcicgaXMgdGhlIG5hbWUgb2YgdGhpcyBhbmd1bGFyIG1vZHVsZSBleGFtcGxlIChhbHNvIHNldCBpbiBhIDxib2R5PiBhdHRyaWJ1dGUgaW4gaW5kZXguaHRtbClcclxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xyXG4oZnVuY3Rpb24oKSB7XHJcbmFuZ3VsYXIubW9kdWxlKCd6b28tYXBwJywgWydpb25pYycsICduZ0NvcmRvdmEnXSlcclxuXHJcbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdIb21lJywge1xyXG4gICAgdXJsOiAnLycsXHJcbiAgICAvKklmIGluIGEgZm9sZGVyLCB0ZW1wbGF0ZS93ZWxjb21lLmh0bWwqL1xyXG4gICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9ob21lLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xyXG4gIH0pXHJcblxyXG4gIC5zdGF0ZSgnTmV3cycsIHtcclxuICAgIHVybDogJy9uZXdzJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvbmV3cy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICB9KVxyXG5cclxuICAuc3RhdGUoJ0FuaW1hbCcsIHtcclxuICAgIHVybDogJy9hbmltYWwve2FuaW1hbElkfS97bGFuZ30nLFxyXG4gICAgYWJzdHJhY3Q6dHJ1ZSxcclxuICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvYW5pbWFsLmh0bWwnXHJcbiAgfSlcclxuXHJcbiAgLnN0YXRlKCdBbmltYWwuSG9tZScsIHtcclxuICAgIHVybDogJy9ob21lJyxcclxuICAgIHZpZXdzOiB7XHJcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvYW5pbWFsLWhvbWUuaHRtbCcsXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KVxyXG5cclxuICAuc3RhdGUoJ0FuaW1hbC5mb3JDaGlsZHJlbicsIHtcclxuICAgIHVybDogJy9mb3ItY2hpbGRyZW4nLFxyXG4gICAgLyp1cmw6ICcvZmNoaWxkcmVuJywqL1xyXG4gICAgdmlld3M6IHtcclxuICAgICAgXCJtZW51Q29udGVudFwiOiB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9mb3ItY2hpbGRyZW4uaHRtbCcsXHJcbiAgICAgICAgLyp0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2ZjaGlsZHJlbi5odG1sJywqL1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgLnN0YXRlKCdBbmltYWwuZm9yQWR1bHRzJywge1xyXG4gICAgdXJsOiAnL2Zvci1hZHVsdHMnLFxyXG4gICAgdmlld3M6IHtcclxuICAgICAgXCJtZW51Q29udGVudFwiOiB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9mb3ItYWR1bHRzLmh0bWwnLFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgLnN0YXRlKCdBbmltYWwubWFwJywge1xyXG4gICAgdXJsOiAnL21hcCcsXHJcbiAgICB2aWV3czoge1xyXG4gICAgICBcIm1lbnVDb250ZW50XCI6IHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2FuaW1hbC1tYXAuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0FuaW1hbE1hcENvbnRyb2xsZXInXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9cIik7XHJcbn0pXHJcblxyXG4ucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XHJcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XHJcbiAgICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcclxuICAgICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxyXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xyXG5cclxuICAgICAgLy8gRG9uJ3QgcmVtb3ZlIHRoaXMgbGluZSB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UgYXJlIGRvaW5nLiBJdCBzdG9wcyB0aGUgdmlld3BvcnRcclxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcclxuICAgICAgLy8gYSBtdWNoIG5pY2VyIGtleWJvYXJkIGV4cGVyaWVuY2UuXHJcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xyXG4gICAgfVxyXG4gICAgaWYod2luZG93LlN0YXR1c0Jhcikge1xyXG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmNvbnRyb2xsZXIoXCJIb21lQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkc3RhdGVcIiwgXCIkbG9jYXRpb25cIiwgXCJiYXJjb2RlRmFjdG9yeVwiLFxyXG4gIFwidHJhbnNsYXRpb25TZXJ2aWNlXCIsXHJcblxyXG4gIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkbG9jYXRpb24sIGJhcmNvZGVGYWN0b3J5LHRyYW5zbGF0aW9uU2VydmljZSkge1xyXG5cclxuICAgICRzY29wZS5hbmltYWxJZCA9IFwiXCI7XHJcbiAgICAkc2NvcGUubGFuZyA9IFwiQ3plY2hcIjtcclxuXHJcbiAgICAkc2NvcGUubG9hZEFuaW1hbCA9IGxvYWRBbmltYWw7XHJcbiAgICAkc2NvcGUucXVpdCA9IHF1aXQ7XHJcbiAgICAkc2NvcGUubG9hZE5ld3MgPSBsb2FkTmV3cztcclxuICAgICRzY29wZS5iYWNrVG9Ib21lID0gYmFja1RvSG9tZTtcclxuICAgICRzY29wZS50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XHJcbiAgICAkc2NvcGUuZGVidWcgPSBkZWJ1ZztcclxuXHJcbiAgICBmdW5jdGlvbiBsb2FkQW5pbWFsKCkge1xyXG4gICAgICBiYXJjb2RlRmFjdG9yeS5zY2FuKCkudGhlbihmdW5jdGlvbihhbmltYWxJZCkge1xyXG4gICAgICAgICRzY29wZS5hbmltYWxJZCA9IGFuaW1hbElkO1xyXG4gICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL2FuaW1hbC9cIiArIGFuaW1hbElkICsgXCIvXCIgKyAkc2NvcGUubGFuZyArIFwiL2hvbWVcIik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlYnVnKCkge1xyXG4gICAgICAkbG9jYXRpb24ucGF0aChcIi9hbmltYWwvbWVkdmVkX2thbWNhdHNreS9cIiArICRzY29wZS5sYW5nICsgXCIvaG9tZVwiKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBxdWl0KCkge1xyXG4gICAgICBpb25pYy5QbGF0Zm9ybS5leGl0QXBwKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbG9hZE5ld3MoKSB7XHJcbiAgICAgICRsb2NhdGlvbi5wYXRoKFwiL25ld3NcIik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYmFja1RvSG9tZSgpIHtcclxuICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZSh0cmFuc2xhdGlvbktleSkge1xyXG4gICAgICByZXR1cm4gdHJhbnNsYXRpb25TZXJ2aWNlLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbktleSwgJHNjb3BlLmxhbmcpO1xyXG4gICAgfVxyXG5cclxuICB9XSk7XHJcblxyXG5cclxuXHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKXtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmZhY3RvcnkoXCJhbmltYWxGYWN0b3J5XCIsIFtcIiRodHRwXCIsIFwiJHFcIiwgZnVuY3Rpb24oJGh0dHAsICRxKSB7XHJcbiAgICB2YXIgYW5pbWFsRmFjdG9yeSA9IHt9O1xyXG4gICAgdmFyIHVybCA9IFwiL1wiO1xyXG5cclxuICAgIGlmKGlvbmljICYmIGlvbmljLlBsYXRmb3JtICYmIGlvbmljLlBsYXRmb3JtLmlzQW5kcm9pZCgpKXtcclxuICAgICAgdXJsID0gXCIvYW5kcm9pZF9hc3NldC93d3cvXCI7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZmV0Y2hBbmltYWxCeUlkKGlkKSB7XHJcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgIHZhciBhbmltYWxVcmwgPSB1cmwgKyBcImRhdGEvYW5pbWFsLXRleHRzL1wiICsgaWQgK1wiLmpzb25cIjtcclxuICAgICAgJGh0dHAuZ2V0KGFuaW1hbFVybCkudGhlbihmdW5jdGlvbihhbmltYWxEYXRhKXtcclxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGFuaW1hbERhdGEuZGF0YSk7XHJcbiAgICAgIH0sIGZ1bmN0aW9uKGZhaWxlZCl7XHJcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGZhaWxlZCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYW5pbWFsRmFjdG9yeS5mZXRjaEFuaW1hbEJ5SWQgPSBmZXRjaEFuaW1hbEJ5SWQ7XHJcblxyXG4gICAgcmV0dXJuIGFuaW1hbEZhY3Rvcnk7XHJcbiAgfV0pO1xyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKXtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmZhY3RvcnkoXCJiYXJjb2RlRmFjdG9yeVwiLCBbXCIkY29yZG92YUJhcmNvZGVTY2FubmVyXCIsIFwiJHFcIixcclxuXHJcbiAgZnVuY3Rpb24oJGNvcmRvdmFCYXJjb2RlU2Nhbm5lciwgJHEpIHtcclxuICAgIHZhciBiYXJjb2RlRmFjdG9yeSA9IHt9O1xyXG4gICAgdmFyIGNhY2hlZElkID0gbnVsbDtcclxuXHJcbiAgICBmdW5jdGlvbiBzY2FuKCkge1xyXG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgaWYgKGNhY2hlZElkKSB7XHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShjYWNoZWRJZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRjb3Jkb3ZhQmFyY29kZVNjYW5uZXIuc2NhbigpLnRoZW4oZnVuY3Rpb24oc2Nhbm5lZERhdGEpIHtcclxuICAgICAgICBjYWNoZWRJZCA9IHNjYW5uZWREYXRhLnRleHQ7XHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzY2FubmVkRGF0YS50ZXh0KTtcclxuICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGJhcmNvZGVGYWN0b3J5LnNjYW4gPSBzY2FuO1xyXG5cclxuICAgIHJldHVybiBiYXJjb2RlRmFjdG9yeTtcclxuICB9XSk7XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpe1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIilcclxuICAuZmFjdG9yeShcInJhdGluZ0ZhY3RvcnlcIiwgW1wiJGh0dHBcIiwgXCIkcVwiLFxyXG4gIGZ1bmN0aW9uKCRodHRwLCAkcSkge1xyXG5cclxuICAgIHZhciByYXRpbmdGYWN0b3J5ID0ge307XHJcbiAgICByYXRpbmdGYWN0b3J5LnJhdGVBbmltYWwgPSByYXRlQW5pbWFsO1xyXG4gICAgcmF0aW5nRmFjdG9yeS5nZXRBbmltYWxSYXRpbmcgPSBnZXRBbmltYWxSYXRpbmc7XHJcblxyXG4gICAgZnVuY3Rpb24gcmF0ZUFuaW1hbChhbmltYWxJZCwgcmF0aW5nKSB7XHJcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAkaHR0cC5wb3N0KFwiaHR0cDovL2dvbGFuZy1tYXJ0aW5hdG9yLnJoY2xvdWQuY29tL3JhdGluZy9cIiArIGFuaW1hbElkICsgXCIvXCIgKyByYXRpbmcpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQuZGF0YSk7XHJcbiAgICAgIH0sIGZ1bmN0aW9uKHJlamVjdFJlYXNvbil7XHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZWplY3RSZWFzb24pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEFuaW1hbFJhdGluZyhhbmltYWxJZCkge1xyXG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgdmFyIHVybCA9IFwiaHR0cHM6Ly9nb2xhbmctbWFydGluYXRvci5yaGNsb3VkLmNvbS9yYXRpbmcvXCIgKyBhbmltYWxJZDtcclxuICAgICAgJGh0dHAoe21ldGhvZDogXCJHRVRcIiwgdXJsOnVybH0pXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQuZGF0YSk7XHJcbiAgICAgIH0sIGZ1bmN0aW9uKHJlamVjdFJlYXNvbil7XHJcbiAgICAgICAgY29uc29sZS5sb2cocmVqZWN0UmVhc29uKTtcclxuICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVqZWN0UmVhc29uKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmF0aW5nRmFjdG9yeTtcclxuICB9XHJcbiAgXSk7XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpe1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuZmFjdG9yeShcInRyYW5zbGF0aW9uU2VydmljZVwiLCBbZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdHJhbnNsYXRpb25TZXJ2aWNlID0ge307XHJcblxyXG4gICAgdmFyIHRyYW5zbGF0aW9uTWFwID0ge1xyXG4gICAgICBcIkN6ZWNoXCI6IHtcclxuICAgICAgICBcIk5FV1NcIjogXCJOb3Zpbmt5XCIsXHJcbiAgICAgICAgXCJSRUFEX1FSXCI6IFwiTmFjdGkgUVIga29kXCIsXHJcbiAgICAgICAgXCJRVUlUXCI6IFwiVWtvbmNpXCIsXHJcbiAgICAgICAgXCJDWkVDSFwiOiBcIkNlc2t5XCIsXHJcbiAgICAgICAgXCJFTkdMSVNIXCI6IFwiQW5nbGlja3lcIixcclxuICAgICAgICBcIkZPUl9DSElMRFJFTlwiOiBcIlBybyBkZXRpXCIsXHJcbiAgICAgICAgXCJGT1JfQURVTFRTXCI6IFwiUHJvIGRvc3DEm2zDqVwiLFxyXG4gICAgICAgIFwiTUFQXCI6IFwiTWFwYVwiLFxyXG4gICAgICAgIFwiQVVESU9cIjogXCJadnVrXCIsXHJcbiAgICAgICAgXCJBQ1RJT05TX0ZPUlwiOiBcIk1vem5vc3RpIHBybyBcIixcclxuICAgICAgICBcIlJBVEVcIiA6IFwiSmFrIHNlIHRpIGxpYmltP1wiLFxyXG4gICAgICAgIFwiSE9NRVwiOiBcIkRvbXVcIixcclxuICAgICAgICBcIkFOSU1BTF9IT01FX1NDUkVFTlwiOiBcIlp2aXJlIC0gSW5mb3JtYWNlXCIsXHJcbiAgICAgICAgXCJJTkZPUk1BVElPTlwiOiBcIkluZm9ybWFjZVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiRW5nbGlzaFwiOiB7XHJcbiAgICAgICAgXCJORVdTXCI6IFwiTmV3c1wiLFxyXG4gICAgICAgIFwiUkVBRF9RUlwiOiBcIlJlYWQgUVIgY29kZVwiLFxyXG4gICAgICAgIFwiUVVJVFwiOiBcIlF1aXRcIixcclxuICAgICAgICBcIkNaRUNIXCI6IFwiQ3plY2hcIixcclxuICAgICAgICBcIkVOR0xJU0hcIjogXCJFbmdsaXNoXCIsXHJcbiAgICAgICAgXCJGT1JfQ0hJTERSRU5cIjogXCJGb3IgY2hpbGRyZW5cIixcclxuICAgICAgICBcIkZPUl9BRFVMVFNcIjogXCJGb3IgYWR1bHRzXCIsXHJcbiAgICAgICAgXCJNQVBcIjogXCJNYXBcIixcclxuICAgICAgICBcIkFVRElPXCI6IFwiQXVkaVwiLFxyXG4gICAgICAgIFwiQUNUSU9OU19GT1JcIjogXCJBY3Rpb25zIGZvclwiLFxyXG4gICAgICAgIFwiUkFURVwiOiBcIkhvdyBkbyB5b3UgbGlrZSBtZT9cIixcclxuICAgICAgICBcIkhPTUVcIjogXCJIb21lXCIsXHJcbiAgICAgICAgXCJBTklNQUxfSE9NRV9TQ1JFRU5cIjogXCJBbmltYWwgLSBBYm91dFwiLFxyXG4gICAgICAgIFwiSU5GT1JNQVRJT05cIjogXCJBYm91dFwiXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlKGtleSwgbGFuZ3VhZ2UpIHtcclxuICAgICAgcmV0dXJuICh0cmFuc2xhdGlvbk1hcFtsYW5ndWFnZV0pW2tleV0gfHwgXCJcIjtcclxuICAgIH1cclxuXHJcbiAgICB0cmFuc2xhdGlvblNlcnZpY2UudHJhbnNsYXRlID0gdHJhbnNsYXRlO1xyXG5cclxuICAgIHJldHVybiB0cmFuc2xhdGlvblNlcnZpY2U7XHJcbiAgfV0pO1xyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKXtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmRpcmVjdGl2ZShcInpvb1JhdGluZ1N0YXJzXCIsIHpvb1JhdGluZ1N0YXJzKTtcclxuXHJcbiAgem9vUmF0aW5nU3RhcnMuJGluamVjdCA9IFtcInJhdGluZ0ZhY3RvcnlcIiBdO1xyXG5cclxuICBmdW5jdGlvbiB6b29SYXRpbmdTdGFycyhyYXRpbmdGYWN0b3J5KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogXCJFXCIsXHJcbiAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgYW5pbWFsSWQ6IFwiPVwiLFxyXG4gICAgICAgIGJpZzogXCJAXCIsXHJcbiAgICAgICAgc21hbGw6IFwiQFwiLFxyXG4gICAgICAgIHJlYWRPbmx5OiBcIkBcIixcclxuICAgICAgICBhbHJlYWR5UmF0ZWQ6IFwiPT9cIlxyXG4gICAgICB9LFxyXG4gICAgICB0ZW1wbGF0ZVVybDogXCJQYXJ0aWFscy9EaXJlY3RpdmVzL3pvby1yYXRpbmctc3RhcnMuaHRtbFwiLFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUpO1xyXG5cclxuICAgICAgICAkc2NvcGUuYW5pbWFsUmF0aW5nID0gLTE7XHJcbiAgICAgICAgJHNjb3BlLnN0YXJzQXJyYXkgPSBbMSwyLDMsNCw1XTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmdldEFuaW1hbFJhdGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmF0aW5nRmFjdG9yeS5nZXRBbmltYWxSYXRpbmcoJHNjb3BlLmFuaW1hbElkKS50aGVuKGZ1bmN0aW9uKHJhdGluZykge1xyXG4gICAgICAgICAgICAkc2NvcGUuYW5pbWFsUmF0aW5nID0gcmF0aW5nLlJhdGluZ1N1bSAvIHJhdGluZy5SYXRpbmdDb3VudCAvIDE7XHJcbiAgICAgICAgICB9LCBmdW5jdGlvbihyZWplY3RlZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycjogXCIsIHJlamVjdGVkKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5yYXRlQW5pbWFsID0gZnVuY3Rpb24obnVtKSB7XHJcbiAgICAgICAgICBpZiAoISRzY29wZS5hbHJlYWR5UmF0ZWQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmFuaW1hbFJhdGluZyA9IG51bTtcclxuICAgICAgICAgICAgJHNjb3BlLmFscmVhZHlSYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJhdGluZ0ZhY3RvcnkucmF0ZUFuaW1hbCgkc2NvcGUuYW5pbWFsSWQsIG51bSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKCRzY29wZS5yZWFkT25seSkge1xyXG4gICAgICAgICAgJHNjb3BlLmdldEFuaW1hbFJhdGluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmNvbnRyb2xsZXIoXCJBbmltYWxDb250cm9sbGVyXCIsXHJcbiAgICBbXCIkc2NvcGVcIiwgXCIkc3RhdGVQYXJhbXNcIiwgXCJhbmltYWxGYWN0b3J5XCIsIFwidHJhbnNsYXRpb25TZXJ2aWNlXCIsIFwiJHN0YXRlXCIsXHJcblxyXG5cclxuICBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgYW5pbWFsRmFjdG9yeSwgdHJhbnNsYXRpb25TZXJ2aWNlLCAkc3RhdGUpIHtcclxuICAgIHZhciBhbmltYWxJZCA9ICRzY29wZS5hbmltYWxJZCA9ICRzdGF0ZVBhcmFtcy5hbmltYWxJZDtcclxuICAgICRzY29wZS5sYW5nID0gJHN0YXRlUGFyYW1zLmxhbmc7XHJcbiAgICAkc2NvcGUuYW5pbWFsID0ge1xyXG4gICAgICBcImxhYmVsXCI6IFwidW5sb2FkZWRcIixcclxuICAgICAgXCJmb3JBZHVsdHNcIjogXCJ1bmxvYWRlZFwiLFxyXG4gICAgICBcIm11bHRpTGFuZ3VhZ2VcIjogXCJmYWxzZVwiLFxyXG4gICAgICBcImZvckNoaWxkcmVuXCI6IFwidW5sb2FkZWRcIlxyXG4gICAgfTtcclxuICAgICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcclxuICAgICRzY29wZS5hbHJlYWR5UmF0ZWQgPSBmYWxzZTtcclxuICAgICRzY29wZS5hY3RpdmVTdGF0ZSA9IFwiaW5mb3JtYXRpb25cIjtcclxuXHJcbiAgICAoZnVuY3Rpb24gaW5pdGlhbGl6ZSgpe1xyXG4gICAgICBhbmltYWxGYWN0b3J5LmZldGNoQW5pbWFsQnlJZChhbmltYWxJZCkudGhlbihmdW5jdGlvbihhbmltYWwpIHtcclxuICAgICAgICAkc2NvcGUuYW5pbWFsID0gYW5pbWFsO1xyXG4gICAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgIH0sIGZ1bmN0aW9uKGZhaWxlZCkge1xyXG4gICAgICAgICRzdGF0ZS5nbyhcIkhvbWVcIik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICAkc2NvcGUudHJhbnNsYXRlID0gdHJhbnNsYXRlO1xyXG4gICAgJHNjb3BlLmdldEFuaW1hbExhYmVsID0gZ2V0QW5pbWFsTGFiZWw7XHJcbiAgICAkc2NvcGUuZ2V0VGV4dEZvckNoaWxkcmVuID0gZ2V0VGV4dEZvckNoaWxkcmVuO1xyXG4gICAgJHNjb3BlLmdldFRleHRGb3JBZHVsdHMgPSBnZXRUZXh0Rm9yQWR1bHRzO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEFuaW1hbExhYmVsKCkge1xyXG4gICAgICBpZiAoJHNjb3BlLmFuaW1hbC5tdWx0aUxhbmd1YWdlID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJsYWJlbFwiICsgJHNjb3BlLmxhbmddO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAkc2NvcGUuYW5pbWFsW1wibGFiZWxcIiArICRzY29wZS5hbmltYWwubGFuZ107XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRUZXh0Rm9yQWR1bHRzKCkge1xyXG4gICAgICBpZiAoJHNjb3BlLmFuaW1hbC5tdWx0aUxhbmd1YWdlID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJmb3JBZHVsdHNcIiArICRzY29wZS5sYW5nXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbC5mb3JBZHVsdHNbXCJmb3JBZHVsdHNcIiArICRzY29wZS5hbmltYWwubGFuZ107XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRUZXh0Rm9yQ2hpbGRyZW4oKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuYW5pbWFsLm11bHRpTGFuZ3VhZ2UgPT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImZvckNoaWxkcmVuXCIgKyAkc2NvcGUubGFuZ107XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJmb3JDaGlsZHJlblwiICsgJHNjb3BlLmFuaW1hbC5sYW5nXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZShrZXkpIHtcclxuICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uU2VydmljZS50cmFuc2xhdGUoa2V5LCAkc2NvcGUubGFuZykgfHwga2V5O1xyXG4gICAgfVxyXG4gIH1dKTtcclxuXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmNvbnRyb2xsZXIoXCJBbmltYWxNYXBDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRpb25pY0xvYWRpbmdcIixcclxuICBcIiRjb21waWxlXCIsXHJcblxyXG4gIGZ1bmN0aW9uKCRzY29wZSwgJGlvbmljTG9hZGluZywgJGNvbXBpbGUpIHtcclxuICAgIHZhciBsYXRMbmcgPSB7fTtcclxuICAgIHZhciBtYXBPcHRzID0ge307XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgbGF0TG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyg0OS4yLDE2LjUpO1xyXG5cclxuICAgICAgbWFwT3B0cyA9IHtcclxuICAgICAgICBjZW50ZXI6IGxhdExuZyxcclxuICAgICAgICB6b29tOiAxNSxcclxuICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpbml0aWFsaXplKCk7XHJcbiAgICAkc2NvcGUubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdvb2dsZU1hcFwiKSwgbWFwT3B0cyk7XHJcbiAgICB9XHJcbiAgXSk7XHJcbn0oKSk7XHJcbiJdfQ==
