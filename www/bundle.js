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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInpvby1hcHAuanMiLCJEaXJlY3RpdmVzL3pvb1JhdGluZ1N0YXJzLmpzIiwiQ29udHJvbGxlcnMvSG9tZS5qcyIsIlNlcnZpY2VzL2FuaW1hbC5qcyIsIlNlcnZpY2VzL2JhcmNvZGUuanMiLCJTZXJ2aWNlcy9yYXRpbmcuanMiLCJTZXJ2aWNlcy90cmFuc2xhdGlvbi5qcyIsIkNvbnRyb2xsZXJzL0FuaW1hbC9BbmltYWwuanMiLCJDb250cm9sbGVycy9BbmltYWwvQW5pbWFsTWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIElvbmljIFN0YXJ0ZXIgQXBwXG5cbi8vIGFuZ3VsYXIubW9kdWxlIGlzIGEgZ2xvYmFsIHBsYWNlIGZvciBjcmVhdGluZywgcmVnaXN0ZXJpbmcgYW5kIHJldHJpZXZpbmcgQW5ndWxhciBtb2R1bGVzXG4vLyAnc3RhcnRlcicgaXMgdGhlIG5hbWUgb2YgdGhpcyBhbmd1bGFyIG1vZHVsZSBleGFtcGxlIChhbHNvIHNldCBpbiBhIDxib2R5PiBhdHRyaWJ1dGUgaW4gaW5kZXguaHRtbClcbi8vIHRoZSAybmQgcGFyYW1ldGVyIGlzIGFuIGFycmF5IG9mICdyZXF1aXJlcydcbihmdW5jdGlvbigpIHtcbmFuZ3VsYXIubW9kdWxlKCd6b28tYXBwJywgWydpb25pYycsICduZ0NvcmRvdmEnXSlcblxuLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdIb21lJywge1xuICAgIHVybDogJy8nLFxuICAgIC8qSWYgaW4gYSBmb2xkZXIsIHRlbXBsYXRlL3dlbGNvbWUuaHRtbCovXG4gICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9ob21lLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgfSlcblxuICAuc3RhdGUoJ05ld3MnLCB7XG4gICAgdXJsOiAnL25ld3MnLFxuICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvbmV3cy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwnLCB7XG4gICAgdXJsOiAnL2FuaW1hbC97YW5pbWFsSWR9L3tsYW5nfScsXG4gICAgYWJzdHJhY3Q6dHJ1ZSxcbiAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2FuaW1hbC5odG1sJ1xuICB9KVxuXG4gIC5zdGF0ZSgnQW5pbWFsLkhvbWUnLCB7XG4gICAgdXJsOiAnL2hvbWUnLFxuICAgIHZpZXdzOiB7XG4gICAgICBcIm1lbnVDb250ZW50XCI6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9hbmltYWwtaG9tZS5odG1sJyxcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwuZm9yQ2hpbGRyZW4nLCB7XG4gICAgdXJsOiAnL2Zvci1jaGlsZHJlbicsXG4gICAgLyp1cmw6ICcvZmNoaWxkcmVuJywqL1xuICAgIHZpZXdzOiB7XG4gICAgICBcIm1lbnVDb250ZW50XCI6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9mb3ItY2hpbGRyZW4uaHRtbCcsXG4gICAgICAgIC8qdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9mY2hpbGRyZW4uaHRtbCcsKi9cbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwuZm9yQWR1bHRzJywge1xuICAgIHVybDogJy9mb3ItYWR1bHRzJyxcbiAgICB2aWV3czoge1xuICAgICAgXCJtZW51Q29udGVudFwiOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvZm9yLWFkdWx0cy5odG1sJyxcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwubWFwJywge1xuICAgIHVybDogJy9tYXAnLFxuICAgIHZpZXdzOiB7XG4gICAgICBcIm1lbnVDb250ZW50XCI6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9hbmltYWwtbWFwLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQW5pbWFsTWFwQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvXCIpO1xufSlcblxuLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXG4gICAgICAvLyBEb24ndCByZW1vdmUgdGhpcyBsaW5lIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSBhcmUgZG9pbmcuIEl0IHN0b3BzIHRoZSB2aWV3cG9ydFxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xufSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5kaXJlY3RpdmUoXCJ6b29SYXRpbmdTdGFyc1wiLCB6b29SYXRpbmdTdGFycyk7XG5cbiAgem9vUmF0aW5nU3RhcnMuJGluamVjdCA9IFtcInJhdGluZ0ZhY3RvcnlcIiBdO1xuXG4gIGZ1bmN0aW9uIHpvb1JhdGluZ1N0YXJzKHJhdGluZ0ZhY3RvcnkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgYW5pbWFsSWQ6IFwiPVwiLFxuICAgICAgICBiaWc6IFwiQFwiLFxuICAgICAgICBzbWFsbDogXCJAXCIsXG4gICAgICAgIHJlYWRPbmx5OiBcIkBcIixcbiAgICAgICAgYWxyZWFkeVJhdGVkOiBcIj0/XCJcbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZVVybDogXCJQYXJ0aWFscy9EaXJlY3RpdmVzL3pvby1yYXRpbmctc3RhcnMuaHRtbFwiLFxuICAgICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZSk7XG5cbiAgICAgICAgJHNjb3BlLmFuaW1hbFJhdGluZyA9IC0xO1xuICAgICAgICAkc2NvcGUuc3RhcnNBcnJheSA9IFsxLDIsMyw0LDVdO1xuXG4gICAgICAgICRzY29wZS5nZXRBbmltYWxSYXRpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByYXRpbmdGYWN0b3J5LmdldEFuaW1hbFJhdGluZygkc2NvcGUuYW5pbWFsSWQpLnRoZW4oZnVuY3Rpb24ocmF0aW5nKSB7XG4gICAgICAgICAgICAkc2NvcGUuYW5pbWFsUmF0aW5nID0gcmF0aW5nLlJhdGluZ1N1bSAvIHJhdGluZy5SYXRpbmdDb3VudCAvIDE7XG4gICAgICAgICAgfSwgZnVuY3Rpb24ocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyOiBcIiwgcmVqZWN0ZWQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5yYXRlQW5pbWFsID0gZnVuY3Rpb24obnVtKSB7XG4gICAgICAgICAgaWYgKCEkc2NvcGUuYWxyZWFkeVJhdGVkKSB7XG4gICAgICAgICAgICAkc2NvcGUuYW5pbWFsUmF0aW5nID0gbnVtO1xuICAgICAgICAgICAgJHNjb3BlLmFscmVhZHlSYXRlZCA9IHRydWU7XG4gICAgICAgICAgICByYXRpbmdGYWN0b3J5LnJhdGVBbmltYWwoJHNjb3BlLmFuaW1hbElkLCBudW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoJHNjb3BlLnJlYWRPbmx5KSB7XG4gICAgICAgICAgJHNjb3BlLmdldEFuaW1hbFJhdGluZygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmNvbnRyb2xsZXIoXCJIb21lQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkc3RhdGVcIiwgXCIkbG9jYXRpb25cIiwgXCJiYXJjb2RlRmFjdG9yeVwiLFxuICBcInRyYW5zbGF0aW9uU2VydmljZVwiLFxuXG4gIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkbG9jYXRpb24sIGJhcmNvZGVGYWN0b3J5LHRyYW5zbGF0aW9uU2VydmljZSkge1xuXG4gICAgJHNjb3BlLmFuaW1hbElkID0gXCJcIjtcbiAgICAkc2NvcGUubGFuZyA9IFwiQ3plY2hcIjtcblxuICAgICRzY29wZS5sb2FkQW5pbWFsID0gbG9hZEFuaW1hbDtcbiAgICAkc2NvcGUucXVpdCA9IHF1aXQ7XG4gICAgJHNjb3BlLmxvYWROZXdzID0gbG9hZE5ld3M7XG4gICAgJHNjb3BlLmJhY2tUb0hvbWUgPSBiYWNrVG9Ib21lO1xuICAgICRzY29wZS50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XG4gICAgJHNjb3BlLmRlYnVnID0gZGVidWc7XG5cbiAgICBmdW5jdGlvbiBsb2FkQW5pbWFsKCkge1xuICAgICAgYmFyY29kZUZhY3Rvcnkuc2NhbigpLnRoZW4oZnVuY3Rpb24oYW5pbWFsSWQpIHtcbiAgICAgICAgJHNjb3BlLmFuaW1hbElkID0gYW5pbWFsSWQ7XG4gICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL2FuaW1hbC9cIiArIGFuaW1hbElkICsgXCIvXCIgKyAkc2NvcGUubGFuZyArIFwiL2hvbWVcIik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAgICRsb2NhdGlvbi5wYXRoKFwiL2FuaW1hbC9tZWR2ZWRfa2FtY2F0c2t5L1wiICsgJHNjb3BlLmxhbmcgKyBcIi9ob21lXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHF1aXQoKSB7XG4gICAgICBpb25pYy5QbGF0Zm9ybS5leGl0QXBwKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZE5ld3MoKSB7XG4gICAgICAkbG9jYXRpb24ucGF0aChcIi9uZXdzXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJhY2tUb0hvbWUoKSB7XG4gICAgICAkbG9jYXRpb24ucGF0aChcIi9cIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlKHRyYW5zbGF0aW9uS2V5KSB7XG4gICAgICByZXR1cm4gdHJhbnNsYXRpb25TZXJ2aWNlLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbktleSwgJHNjb3BlLmxhbmcpO1xuICAgIH1cblxuICB9XSk7XG5cblxuXG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmZhY3RvcnkoXCJhbmltYWxGYWN0b3J5XCIsIFtcIiRodHRwXCIsIFwiJHFcIiwgZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gICAgdmFyIGFuaW1hbEZhY3RvcnkgPSB7fTtcbiAgICB2YXIgdXJsID0gXCIvXCI7XG5cbiAgICBpZihpb25pYyAmJiBpb25pYy5QbGF0Zm9ybSAmJiBpb25pYy5QbGF0Zm9ybS5pc0FuZHJvaWQoKSl7XG4gICAgICB1cmwgPSBcIi9hbmRyb2lkX2Fzc2V0L3d3dy9cIjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmZXRjaEFuaW1hbEJ5SWQoaWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICB2YXIgYW5pbWFsVXJsID0gdXJsICsgXCJkYXRhL2FuaW1hbC10ZXh0cy9cIiArIGlkICtcIi5qc29uXCI7XG4gICAgICAkaHR0cC5nZXQoYW5pbWFsVXJsKS50aGVuKGZ1bmN0aW9uKGFuaW1hbERhdGEpe1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGFuaW1hbERhdGEuZGF0YSk7XG4gICAgICB9LCBmdW5jdGlvbihmYWlsZWQpe1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZmFpbGVkKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBhbmltYWxGYWN0b3J5LmZldGNoQW5pbWFsQnlJZCA9IGZldGNoQW5pbWFsQnlJZDtcblxuICAgIHJldHVybiBhbmltYWxGYWN0b3J5O1xuICB9XSk7XG59KCkpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5mYWN0b3J5KFwiYmFyY29kZUZhY3RvcnlcIiwgW1wiJGNvcmRvdmFCYXJjb2RlU2Nhbm5lclwiLCBcIiRxXCIsXG5cbiAgZnVuY3Rpb24oJGNvcmRvdmFCYXJjb2RlU2Nhbm5lciwgJHEpIHtcbiAgICB2YXIgYmFyY29kZUZhY3RvcnkgPSB7fTtcbiAgICB2YXIgY2FjaGVkSWQgPSBudWxsO1xuXG4gICAgZnVuY3Rpb24gc2NhbigpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmIChjYWNoZWRJZCkge1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNhY2hlZElkKTtcbiAgICAgIH1cblxuICAgICAgJGNvcmRvdmFCYXJjb2RlU2Nhbm5lci5zY2FuKCkudGhlbihmdW5jdGlvbihzY2FubmVkRGF0YSkge1xuICAgICAgICBjYWNoZWRJZCA9IHNjYW5uZWREYXRhLnRleHQ7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoc2Nhbm5lZERhdGEudGV4dCk7XG4gICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGJhcmNvZGVGYWN0b3J5LnNjYW4gPSBzY2FuO1xuXG4gICAgcmV0dXJuIGJhcmNvZGVGYWN0b3J5O1xuICB9XSk7XG59KCkpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKVxuICAuZmFjdG9yeShcInJhdGluZ0ZhY3RvcnlcIiwgW1wiJGh0dHBcIiwgXCIkcVwiLFxuICBmdW5jdGlvbigkaHR0cCwgJHEpIHtcblxuICAgIHZhciByYXRpbmdGYWN0b3J5ID0ge307XG4gICAgcmF0aW5nRmFjdG9yeS5yYXRlQW5pbWFsID0gcmF0ZUFuaW1hbDtcbiAgICByYXRpbmdGYWN0b3J5LmdldEFuaW1hbFJhdGluZyA9IGdldEFuaW1hbFJhdGluZztcblxuICAgIGZ1bmN0aW9uIHJhdGVBbmltYWwoYW5pbWFsSWQsIHJhdGluZykge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgJGh0dHAucG9zdChcImh0dHA6Ly9nb2xhbmctbWFydGluYXRvci5yaGNsb3VkLmNvbS9yYXRpbmcvXCIgKyBhbmltYWxJZCArIFwiL1wiICsgcmF0aW5nKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQuZGF0YSk7XG4gICAgICB9LCBmdW5jdGlvbihyZWplY3RSZWFzb24pe1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlamVjdFJlYXNvbik7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QW5pbWFsUmF0aW5nKGFuaW1hbElkKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICB2YXIgdXJsID0gXCJodHRwczovL2dvbGFuZy1tYXJ0aW5hdG9yLnJoY2xvdWQuY29tL3JhdGluZy9cIiArIGFuaW1hbElkO1xuICAgICAgJGh0dHAoe21ldGhvZDogXCJHRVRcIiwgdXJsOnVybH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdC5kYXRhKTtcbiAgICAgIH0sIGZ1bmN0aW9uKHJlamVjdFJlYXNvbil7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlamVjdFJlYXNvbik7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChyZWplY3RSZWFzb24pO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIHJldHVybiByYXRpbmdGYWN0b3J5O1xuICB9XG4gIF0pO1xufSgpKTtcbiIsIihmdW5jdGlvbigpe1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuZmFjdG9yeShcInRyYW5zbGF0aW9uU2VydmljZVwiLCBbZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyYW5zbGF0aW9uU2VydmljZSA9IHt9O1xuXG4gICAgdmFyIHRyYW5zbGF0aW9uTWFwID0ge1xuICAgICAgXCJDemVjaFwiOiB7XG4gICAgICAgIFwiTkVXU1wiOiBcIk5vdmlua3lcIixcbiAgICAgICAgXCJSRUFEX1FSXCI6IFwiTmFjdGkgUVIga29kXCIsXG4gICAgICAgIFwiUVVJVFwiOiBcIlVrb25jaVwiLFxuICAgICAgICBcIkNaRUNIXCI6IFwiQ2Vza3lcIixcbiAgICAgICAgXCJFTkdMSVNIXCI6IFwiQW5nbGlja3lcIixcbiAgICAgICAgXCJGT1JfQ0hJTERSRU5cIjogXCJQcm8gZGV0aVwiLFxuICAgICAgICBcIkZPUl9BRFVMVFNcIjogXCJQcm8gZG9zcMSbbMOpXCIsXG4gICAgICAgIFwiTUFQXCI6IFwiTWFwYVwiLFxuICAgICAgICBcIkFVRElPXCI6IFwiWnZ1a1wiLFxuICAgICAgICBcIkFDVElPTlNfRk9SXCI6IFwiTW96bm9zdGkgcHJvIFwiLFxuICAgICAgICBcIlJBVEVcIiA6IFwiSmFrIHNlIHRpIGxpYmltP1wiLFxuICAgICAgICBcIkhPTUVcIjogXCJEb211XCIsXG4gICAgICAgIFwiQU5JTUFMX0hPTUVfU0NSRUVOXCI6IFwiWnZpcmUgLSBJbmZvcm1hY2VcIixcbiAgICAgICAgXCJJTkZPUk1BVElPTlwiOiBcIkluZm9ybWFjZVwiXG4gICAgICB9LFxuICAgICAgXCJFbmdsaXNoXCI6IHtcbiAgICAgICAgXCJORVdTXCI6IFwiTmV3c1wiLFxuICAgICAgICBcIlJFQURfUVJcIjogXCJSZWFkIFFSIGNvZGVcIixcbiAgICAgICAgXCJRVUlUXCI6IFwiUXVpdFwiLFxuICAgICAgICBcIkNaRUNIXCI6IFwiQ3plY2hcIixcbiAgICAgICAgXCJFTkdMSVNIXCI6IFwiRW5nbGlzaFwiLFxuICAgICAgICBcIkZPUl9DSElMRFJFTlwiOiBcIkZvciBjaGlsZHJlblwiLFxuICAgICAgICBcIkZPUl9BRFVMVFNcIjogXCJGb3IgYWR1bHRzXCIsXG4gICAgICAgIFwiTUFQXCI6IFwiTWFwXCIsXG4gICAgICAgIFwiQVVESU9cIjogXCJBdWRpXCIsXG4gICAgICAgIFwiQUNUSU9OU19GT1JcIjogXCJBY3Rpb25zIGZvclwiLFxuICAgICAgICBcIlJBVEVcIjogXCJIb3cgZG8geW91IGxpa2UgbWU/XCIsXG4gICAgICAgIFwiSE9NRVwiOiBcIkhvbWVcIixcbiAgICAgICAgXCJBTklNQUxfSE9NRV9TQ1JFRU5cIjogXCJBbmltYWwgLSBBYm91dFwiLFxuICAgICAgICBcIklORk9STUFUSU9OXCI6IFwiQWJvdXRcIlxuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiB0cmFuc2xhdGUoa2V5LCBsYW5ndWFnZSkge1xuICAgICAgcmV0dXJuICh0cmFuc2xhdGlvbk1hcFtsYW5ndWFnZV0pW2tleV0gfHwgXCJcIjtcbiAgICB9XG5cbiAgICB0cmFuc2xhdGlvblNlcnZpY2UudHJhbnNsYXRlID0gdHJhbnNsYXRlO1xuXG4gICAgcmV0dXJuIHRyYW5zbGF0aW9uU2VydmljZTtcbiAgfV0pO1xufSgpKTtcbiIsIihmdW5jdGlvbigpIHtcblxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuY29udHJvbGxlcihcIkFuaW1hbENvbnRyb2xsZXJcIixcbiAgICBbXCIkc2NvcGVcIiwgXCIkc3RhdGVQYXJhbXNcIiwgXCJhbmltYWxGYWN0b3J5XCIsIFwidHJhbnNsYXRpb25TZXJ2aWNlXCIsIFwiJHN0YXRlXCIsXG5cblxuICBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgYW5pbWFsRmFjdG9yeSwgdHJhbnNsYXRpb25TZXJ2aWNlLCAkc3RhdGUpIHtcbiAgICB2YXIgYW5pbWFsSWQgPSAkc2NvcGUuYW5pbWFsSWQgPSAkc3RhdGVQYXJhbXMuYW5pbWFsSWQ7XG4gICAgJHNjb3BlLmxhbmcgPSAkc3RhdGVQYXJhbXMubGFuZztcbiAgICAkc2NvcGUuYW5pbWFsID0ge1xuICAgICAgXCJsYWJlbFwiOiBcInVubG9hZGVkXCIsXG4gICAgICBcImZvckFkdWx0c1wiOiBcInVubG9hZGVkXCIsXG4gICAgICBcIm11bHRpTGFuZ3VhZ2VcIjogXCJmYWxzZVwiLFxuICAgICAgXCJmb3JDaGlsZHJlblwiOiBcInVubG9hZGVkXCJcbiAgICB9O1xuICAgICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAkc2NvcGUuYWxyZWFkeVJhdGVkID0gZmFsc2U7XG4gICAgJHNjb3BlLmFjdGl2ZVN0YXRlID0gXCJpbmZvcm1hdGlvblwiO1xuXG4gICAgKGZ1bmN0aW9uIGluaXRpYWxpemUoKXtcbiAgICAgIGFuaW1hbEZhY3RvcnkuZmV0Y2hBbmltYWxCeUlkKGFuaW1hbElkKS50aGVuKGZ1bmN0aW9uKGFuaW1hbCkge1xuICAgICAgICAkc2NvcGUuYW5pbWFsID0gYW5pbWFsO1xuICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgfSwgZnVuY3Rpb24oZmFpbGVkKSB7XG4gICAgICAgICRzdGF0ZS5nbyhcIkhvbWVcIik7XG4gICAgICB9KTtcbiAgICB9KCkpO1xuXG4gICAgJHNjb3BlLnRyYW5zbGF0ZSA9IHRyYW5zbGF0ZTtcbiAgICAkc2NvcGUuZ2V0QW5pbWFsTGFiZWwgPSBnZXRBbmltYWxMYWJlbDtcbiAgICAkc2NvcGUuZ2V0VGV4dEZvckNoaWxkcmVuID0gZ2V0VGV4dEZvckNoaWxkcmVuO1xuICAgICRzY29wZS5nZXRUZXh0Rm9yQWR1bHRzID0gZ2V0VGV4dEZvckFkdWx0cztcblxuICAgIGZ1bmN0aW9uIGdldEFuaW1hbExhYmVsKCkge1xuICAgICAgaWYgKCRzY29wZS5hbmltYWwubXVsdGlMYW5ndWFnZSA9PSBcInRydWVcIikge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImxhYmVsXCIgKyAkc2NvcGUubGFuZ107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImxhYmVsXCIgKyAkc2NvcGUuYW5pbWFsLmxhbmddO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFRleHRGb3JBZHVsdHMoKSB7XG4gICAgICBpZiAoJHNjb3BlLmFuaW1hbC5tdWx0aUxhbmd1YWdlID09IFwidHJ1ZVwiKSB7XG4gICAgICAgIHJldHVybiAkc2NvcGUuYW5pbWFsW1wiZm9yQWR1bHRzXCIgKyAkc2NvcGUubGFuZ107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbC5mb3JBZHVsdHNbXCJmb3JBZHVsdHNcIiArICRzY29wZS5hbmltYWwubGFuZ107XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VGV4dEZvckNoaWxkcmVuKCkge1xuICAgICAgaWYgKCRzY29wZS5hbmltYWwubXVsdGlMYW5ndWFnZSA9PSBcInRydWVcIikge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImZvckNoaWxkcmVuXCIgKyAkc2NvcGUubGFuZ107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImZvckNoaWxkcmVuXCIgKyAkc2NvcGUuYW5pbWFsLmxhbmddO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZShrZXkpIHtcbiAgICAgIHJldHVybiB0cmFuc2xhdGlvblNlcnZpY2UudHJhbnNsYXRlKGtleSwgJHNjb3BlLmxhbmcpIHx8IGtleTtcbiAgICB9XG4gIH1dKTtcblxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmNvbnRyb2xsZXIoXCJBbmltYWxNYXBDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRpb25pY0xvYWRpbmdcIixcbiAgXCIkY29tcGlsZVwiLFxuXG4gIGZ1bmN0aW9uKCRzY29wZSwgJGlvbmljTG9hZGluZywgJGNvbXBpbGUpIHtcbiAgICB2YXIgbGF0TG5nID0ge307XG4gICAgdmFyIG1hcE9wdHMgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgICBsYXRMbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQ5LjIsMTYuNSk7XG5cbiAgICAgIG1hcE9wdHMgPSB7XG4gICAgICAgIGNlbnRlcjogbGF0TG5nLFxuICAgICAgICB6b29tOiAxNSxcbiAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUFxuICAgICAgfTtcbiAgICB9XG4gICAgaW5pdGlhbGl6ZSgpO1xuICAgICRzY29wZS5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ29vZ2xlTWFwXCIpLCBtYXBPcHRzKTtcbiAgICB9XG4gIF0pO1xufSgpKTtcbiJdfQ==
