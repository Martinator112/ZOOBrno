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
    console.log($state);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInpvby1hcHAuanMiLCJDb250cm9sbGVycy9Ib21lLmpzIiwiRGlyZWN0aXZlcy96b29SYXRpbmdTdGFycy5qcyIsIlNlcnZpY2VzL2FuaW1hbC5qcyIsIlNlcnZpY2VzL2JhcmNvZGUuanMiLCJTZXJ2aWNlcy9yYXRpbmcuanMiLCJTZXJ2aWNlcy90cmFuc2xhdGlvbi5qcyIsIkNvbnRyb2xsZXJzL0FuaW1hbC9BbmltYWwuanMiLCJDb250cm9sbGVycy9BbmltYWwvQW5pbWFsTWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW9uaWMgU3RhcnRlciBBcHBcblxuLy8gYW5ndWxhci5tb2R1bGUgaXMgYSBnbG9iYWwgcGxhY2UgZm9yIGNyZWF0aW5nLCByZWdpc3RlcmluZyBhbmQgcmV0cmlldmluZyBBbmd1bGFyIG1vZHVsZXNcbi8vICdzdGFydGVyJyBpcyB0aGUgbmFtZSBvZiB0aGlzIGFuZ3VsYXIgbW9kdWxlIGV4YW1wbGUgKGFsc28gc2V0IGluIGEgPGJvZHk+IGF0dHJpYnV0ZSBpbiBpbmRleC5odG1sKVxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xuKGZ1bmN0aW9uKCkge1xuYW5ndWxhci5tb2R1bGUoJ3pvby1hcHAnLCBbJ2lvbmljJywgJ25nQ29yZG92YSddKVxuXG4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ0hvbWUnLCB7XG4gICAgdXJsOiAnLycsXG4gICAgLypJZiBpbiBhIGZvbGRlciwgdGVtcGxhdGUvd2VsY29tZS5odG1sKi9cbiAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2hvbWUuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICB9KVxuXG4gIC5zdGF0ZSgnTmV3cycsIHtcbiAgICB1cmw6ICcvbmV3cycsXG4gICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9uZXdzLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgfSlcblxuICAuc3RhdGUoJ0FuaW1hbCcsIHtcbiAgICB1cmw6ICcvYW5pbWFsL3thbmltYWxJZH0ve2xhbmd9JyxcbiAgICBhYnN0cmFjdDp0cnVlLFxuICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvYW5pbWFsLmh0bWwnXG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwuSG9tZScsIHtcbiAgICB1cmw6ICcvaG9tZScsXG4gICAgdmlld3M6IHtcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2FuaW1hbC1ob21lLmh0bWwnLFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAuc3RhdGUoJ0FuaW1hbC5mb3JDaGlsZHJlbicsIHtcbiAgICB1cmw6ICcvZm9yLWNoaWxkcmVuJyxcbiAgICAvKnVybDogJy9mY2hpbGRyZW4nLCovXG4gICAgdmlld3M6IHtcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2Zvci1jaGlsZHJlbi5odG1sJyxcbiAgICAgICAgLyp0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2ZjaGlsZHJlbi5odG1sJywqL1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAuc3RhdGUoJ0FuaW1hbC5mb3JBZHVsdHMnLCB7XG4gICAgdXJsOiAnL2Zvci1hZHVsdHMnLFxuICAgIHZpZXdzOiB7XG4gICAgICBcIm1lbnVDb250ZW50XCI6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9mb3ItYWR1bHRzLmh0bWwnLFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAuc3RhdGUoJ0FuaW1hbC5tYXAnLCB7XG4gICAgdXJsOiAnL21hcCcsXG4gICAgdmlld3M6IHtcbiAgICAgIFwibWVudUNvbnRlbnRcIjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2FuaW1hbC1tYXAuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBbmltYWxNYXBDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9cIik7XG59KVxuXG4ucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cbiAgICAgIC8vIERvbid0IHJlbW92ZSB0aGlzIGxpbmUgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91IGFyZSBkb2luZy4gSXQgc3RvcHMgdGhlIHZpZXdwb3J0XG4gICAgICAvLyBmcm9tIHNuYXBwaW5nIHdoZW4gdGV4dCBpbnB1dHMgYXJlIGZvY3VzZWQuIElvbmljIGhhbmRsZXMgdGhpcyBpbnRlcm5hbGx5IGZvclxuICAgICAgLy8gYSBtdWNoIG5pY2VyIGtleWJvYXJkIGV4cGVyaWVuY2UuXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcbiAgICB9XG4gICAgaWYod2luZG93LlN0YXR1c0Jhcikge1xuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuICAgIH1cbiAgfSk7XG59KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5jb250cm9sbGVyKFwiSG9tZUNvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJHN0YXRlXCIsIFwiJGxvY2F0aW9uXCIsIFwiYmFyY29kZUZhY3RvcnlcIixcbiAgXCJ0cmFuc2xhdGlvblNlcnZpY2VcIixcblxuICBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJGxvY2F0aW9uLCBiYXJjb2RlRmFjdG9yeSx0cmFuc2xhdGlvblNlcnZpY2UpIHtcblxuICAgICRzY29wZS5hbmltYWxJZCA9IFwiXCI7XG4gICAgJHNjb3BlLmxhbmcgPSBcIkN6ZWNoXCI7XG5cbiAgICAkc2NvcGUubG9hZEFuaW1hbCA9IGxvYWRBbmltYWw7XG4gICAgJHNjb3BlLnF1aXQgPSBxdWl0O1xuICAgICRzY29wZS5sb2FkTmV3cyA9IGxvYWROZXdzO1xuICAgICRzY29wZS5iYWNrVG9Ib21lID0gYmFja1RvSG9tZTtcbiAgICAkc2NvcGUudHJhbnNsYXRlID0gdHJhbnNsYXRlO1xuICAgICRzY29wZS5kZWJ1ZyA9IGRlYnVnO1xuXG4gICAgZnVuY3Rpb24gbG9hZEFuaW1hbCgpIHtcbiAgICAgIGJhcmNvZGVGYWN0b3J5LnNjYW4oKS50aGVuKGZ1bmN0aW9uKGFuaW1hbElkKSB7XG4gICAgICAgICRzY29wZS5hbmltYWxJZCA9IGFuaW1hbElkO1xuICAgICAgICAkbG9jYXRpb24ucGF0aChcIi9hbmltYWwvXCIgKyBhbmltYWxJZCArIFwiL1wiICsgJHNjb3BlLmxhbmcgKyBcIi9ob21lXCIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVidWcoKSB7XG4gICAgICAkbG9jYXRpb24ucGF0aChcIi9hbmltYWwvbWVkdmVkX2thbWNhdHNreS9cIiArICRzY29wZS5sYW5nICsgXCIvaG9tZVwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBxdWl0KCkge1xuICAgICAgaW9uaWMuUGxhdGZvcm0uZXhpdEFwcCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWROZXdzKCkge1xuICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvbmV3c1wiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiYWNrVG9Ib21lKCkge1xuICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZSh0cmFuc2xhdGlvbktleSkge1xuICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uU2VydmljZS50cmFuc2xhdGUodHJhbnNsYXRpb25LZXksICRzY29wZS5sYW5nKTtcbiAgICB9XG5cbiAgfV0pO1xuXG5cblxuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5kaXJlY3RpdmUoXCJ6b29SYXRpbmdTdGFyc1wiLCB6b29SYXRpbmdTdGFycyk7XG5cbiAgem9vUmF0aW5nU3RhcnMuJGluamVjdCA9IFtcInJhdGluZ0ZhY3RvcnlcIiBdO1xuXG4gIGZ1bmN0aW9uIHpvb1JhdGluZ1N0YXJzKHJhdGluZ0ZhY3RvcnkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgYW5pbWFsSWQ6IFwiPVwiLFxuICAgICAgICBiaWc6IFwiQFwiLFxuICAgICAgICBzbWFsbDogXCJAXCIsXG4gICAgICAgIHJlYWRPbmx5OiBcIkBcIixcbiAgICAgICAgYWxyZWFkeVJhdGVkOiBcIj0/XCJcbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZVVybDogXCJQYXJ0aWFscy9EaXJlY3RpdmVzL3pvby1yYXRpbmctc3RhcnMuaHRtbFwiLFxuICAgICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZSk7XG5cbiAgICAgICAgJHNjb3BlLmFuaW1hbFJhdGluZyA9IC0xO1xuICAgICAgICAkc2NvcGUuc3RhcnNBcnJheSA9IFsxLDIsMyw0LDVdO1xuXG4gICAgICAgICRzY29wZS5nZXRBbmltYWxSYXRpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByYXRpbmdGYWN0b3J5LmdldEFuaW1hbFJhdGluZygkc2NvcGUuYW5pbWFsSWQpLnRoZW4oZnVuY3Rpb24ocmF0aW5nKSB7XG4gICAgICAgICAgICAkc2NvcGUuYW5pbWFsUmF0aW5nID0gcmF0aW5nLlJhdGluZ1N1bSAvIHJhdGluZy5SYXRpbmdDb3VudCAvIDE7XG4gICAgICAgICAgfSwgZnVuY3Rpb24ocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyOiBcIiwgcmVqZWN0ZWQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5yYXRlQW5pbWFsID0gZnVuY3Rpb24obnVtKSB7XG4gICAgICAgICAgaWYgKCEkc2NvcGUuYWxyZWFkeVJhdGVkKSB7XG4gICAgICAgICAgICAkc2NvcGUuYW5pbWFsUmF0aW5nID0gbnVtO1xuICAgICAgICAgICAgJHNjb3BlLmFscmVhZHlSYXRlZCA9IHRydWU7XG4gICAgICAgICAgICByYXRpbmdGYWN0b3J5LnJhdGVBbmltYWwoJHNjb3BlLmFuaW1hbElkLCBudW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoJHNjb3BlLnJlYWRPbmx5KSB7XG4gICAgICAgICAgJHNjb3BlLmdldEFuaW1hbFJhdGluZygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSgpKTtcbiIsIihmdW5jdGlvbigpe1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBhbmd1bGFyLm1vZHVsZShcInpvby1hcHBcIikuZmFjdG9yeShcImFuaW1hbEZhY3RvcnlcIiwgW1wiJGh0dHBcIiwgXCIkcVwiLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgICB2YXIgYW5pbWFsRmFjdG9yeSA9IHt9O1xuICAgIHZhciB1cmwgPSBcIi9cIjtcblxuICAgIGlmKGlvbmljICYmIGlvbmljLlBsYXRmb3JtICYmIGlvbmljLlBsYXRmb3JtLmlzQW5kcm9pZCgpKXtcbiAgICAgIHVybCA9IFwiL2FuZHJvaWRfYXNzZXQvd3d3L1wiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZldGNoQW5pbWFsQnlJZChpZCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIHZhciBhbmltYWxVcmwgPSB1cmwgKyBcImRhdGEvYW5pbWFsLXRleHRzL1wiICsgaWQgK1wiLmpzb25cIjtcbiAgICAgICRodHRwLmdldChhbmltYWxVcmwpLnRoZW4oZnVuY3Rpb24oYW5pbWFsRGF0YSl7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoYW5pbWFsRGF0YS5kYXRhKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGZhaWxlZCl7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChmYWlsZWQpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cblxuICAgIGFuaW1hbEZhY3RvcnkuZmV0Y2hBbmltYWxCeUlkID0gZmV0Y2hBbmltYWxCeUlkO1xuXG4gICAgcmV0dXJuIGFuaW1hbEZhY3Rvcnk7XG4gIH1dKTtcbn0oKSk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmZhY3RvcnkoXCJiYXJjb2RlRmFjdG9yeVwiLCBbXCIkY29yZG92YUJhcmNvZGVTY2FubmVyXCIsIFwiJHFcIixcblxuICBmdW5jdGlvbigkY29yZG92YUJhcmNvZGVTY2FubmVyLCAkcSkge1xuICAgIHZhciBiYXJjb2RlRmFjdG9yeSA9IHt9O1xuICAgIHZhciBjYWNoZWRJZCA9IG51bGw7XG5cbiAgICBmdW5jdGlvbiBzY2FuKCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgaWYgKGNhY2hlZElkKSB7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2FjaGVkSWQpO1xuICAgICAgfVxuXG4gICAgICAkY29yZG92YUJhcmNvZGVTY2FubmVyLnNjYW4oKS50aGVuKGZ1bmN0aW9uKHNjYW5uZWREYXRhKSB7XG4gICAgICAgIGNhY2hlZElkID0gc2Nhbm5lZERhdGEudGV4dDtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzY2FubmVkRGF0YS50ZXh0KTtcbiAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgYmFyY29kZUZhY3Rvcnkuc2NhbiA9IHNjYW47XG5cbiAgICByZXR1cm4gYmFyY29kZUZhY3Rvcnk7XG4gIH1dKTtcbn0oKSk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpXG4gIC5mYWN0b3J5KFwicmF0aW5nRmFjdG9yeVwiLCBbXCIkaHR0cFwiLCBcIiRxXCIsXG4gIGZ1bmN0aW9uKCRodHRwLCAkcSkge1xuXG4gICAgdmFyIHJhdGluZ0ZhY3RvcnkgPSB7fTtcbiAgICByYXRpbmdGYWN0b3J5LnJhdGVBbmltYWwgPSByYXRlQW5pbWFsO1xuICAgIHJhdGluZ0ZhY3RvcnkuZ2V0QW5pbWFsUmF0aW5nID0gZ2V0QW5pbWFsUmF0aW5nO1xuXG4gICAgZnVuY3Rpb24gcmF0ZUFuaW1hbChhbmltYWxJZCwgcmF0aW5nKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAkaHR0cC5wb3N0KFwiaHR0cDovL2dvbGFuZy1tYXJ0aW5hdG9yLnJoY2xvdWQuY29tL3JhdGluZy9cIiArIGFuaW1hbElkICsgXCIvXCIgKyByYXRpbmcpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdC5kYXRhKTtcbiAgICAgIH0sIGZ1bmN0aW9uKHJlamVjdFJlYXNvbil7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVqZWN0UmVhc29uKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRBbmltYWxSYXRpbmcoYW5pbWFsSWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHZhciB1cmwgPSBcImh0dHBzOi8vZ29sYW5nLW1hcnRpbmF0b3IucmhjbG91ZC5jb20vcmF0aW5nL1wiICsgYW5pbWFsSWQ7XG4gICAgICAkaHR0cCh7bWV0aG9kOiBcIkdFVFwiLCB1cmw6dXJsfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0LmRhdGEpO1xuICAgICAgfSwgZnVuY3Rpb24ocmVqZWN0UmVhc29uKXtcbiAgICAgICAgY29uc29sZS5sb2cocmVqZWN0UmVhc29uKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlamVjdFJlYXNvbik7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhdGluZ0ZhY3Rvcnk7XG4gIH1cbiAgXSk7XG59KCkpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5mYWN0b3J5KFwidHJhbnNsYXRpb25TZXJ2aWNlXCIsIFtmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJhbnNsYXRpb25TZXJ2aWNlID0ge307XG5cbiAgICB2YXIgdHJhbnNsYXRpb25NYXAgPSB7XG4gICAgICBcIkN6ZWNoXCI6IHtcbiAgICAgICAgXCJORVdTXCI6IFwiTm92aW5reVwiLFxuICAgICAgICBcIlJFQURfUVJcIjogXCJOYWN0aSBRUiBrb2RcIixcbiAgICAgICAgXCJRVUlUXCI6IFwiVWtvbmNpXCIsXG4gICAgICAgIFwiQ1pFQ0hcIjogXCJDZXNreVwiLFxuICAgICAgICBcIkVOR0xJU0hcIjogXCJBbmdsaWNreVwiLFxuICAgICAgICBcIkZPUl9DSElMRFJFTlwiOiBcIlBybyBkZXRpXCIsXG4gICAgICAgIFwiRk9SX0FEVUxUU1wiOiBcIlBybyBkb3NwxJtsw6lcIixcbiAgICAgICAgXCJNQVBcIjogXCJNYXBhXCIsXG4gICAgICAgIFwiQVVESU9cIjogXCJadnVrXCIsXG4gICAgICAgIFwiQUNUSU9OU19GT1JcIjogXCJNb3pub3N0aSBwcm8gXCIsXG4gICAgICAgIFwiUkFURVwiIDogXCJKYWsgc2UgdGkgbGliaW0/XCIsXG4gICAgICAgIFwiSE9NRVwiOiBcIkRvbXVcIixcbiAgICAgICAgXCJBTklNQUxfSE9NRV9TQ1JFRU5cIjogXCJadmlyZSAtIEluZm9ybWFjZVwiLFxuICAgICAgICBcIklORk9STUFUSU9OXCI6IFwiSW5mb3JtYWNlXCJcbiAgICAgIH0sXG4gICAgICBcIkVuZ2xpc2hcIjoge1xuICAgICAgICBcIk5FV1NcIjogXCJOZXdzXCIsXG4gICAgICAgIFwiUkVBRF9RUlwiOiBcIlJlYWQgUVIgY29kZVwiLFxuICAgICAgICBcIlFVSVRcIjogXCJRdWl0XCIsXG4gICAgICAgIFwiQ1pFQ0hcIjogXCJDemVjaFwiLFxuICAgICAgICBcIkVOR0xJU0hcIjogXCJFbmdsaXNoXCIsXG4gICAgICAgIFwiRk9SX0NISUxEUkVOXCI6IFwiRm9yIGNoaWxkcmVuXCIsXG4gICAgICAgIFwiRk9SX0FEVUxUU1wiOiBcIkZvciBhZHVsdHNcIixcbiAgICAgICAgXCJNQVBcIjogXCJNYXBcIixcbiAgICAgICAgXCJBVURJT1wiOiBcIkF1ZGlcIixcbiAgICAgICAgXCJBQ1RJT05TX0ZPUlwiOiBcIkFjdGlvbnMgZm9yXCIsXG4gICAgICAgIFwiUkFURVwiOiBcIkhvdyBkbyB5b3UgbGlrZSBtZT9cIixcbiAgICAgICAgXCJIT01FXCI6IFwiSG9tZVwiLFxuICAgICAgICBcIkFOSU1BTF9IT01FX1NDUkVFTlwiOiBcIkFuaW1hbCAtIEFib3V0XCIsXG4gICAgICAgIFwiSU5GT1JNQVRJT05cIjogXCJBYm91dFwiXG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZShrZXksIGxhbmd1YWdlKSB7XG4gICAgICByZXR1cm4gKHRyYW5zbGF0aW9uTWFwW2xhbmd1YWdlXSlba2V5XSB8fCBcIlwiO1xuICAgIH1cblxuICAgIHRyYW5zbGF0aW9uU2VydmljZS50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XG5cbiAgICByZXR1cm4gdHJhbnNsYXRpb25TZXJ2aWNlO1xuICB9XSk7XG59KCkpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5jb250cm9sbGVyKFwiQW5pbWFsQ29udHJvbGxlclwiLFxuICAgIFtcIiRzY29wZVwiLCBcIiRzdGF0ZVBhcmFtc1wiLCBcImFuaW1hbEZhY3RvcnlcIiwgXCJ0cmFuc2xhdGlvblNlcnZpY2VcIiwgXCIkc3RhdGVcIixcblxuXG4gIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBhbmltYWxGYWN0b3J5LCB0cmFuc2xhdGlvblNlcnZpY2UsICRzdGF0ZSkge1xuICAgIGNvbnNvbGUubG9nKCRzdGF0ZSk7XG4gICAgdmFyIGFuaW1hbElkID0gJHNjb3BlLmFuaW1hbElkID0gJHN0YXRlUGFyYW1zLmFuaW1hbElkO1xuICAgICRzY29wZS5sYW5nID0gJHN0YXRlUGFyYW1zLmxhbmc7XG4gICAgJHNjb3BlLmFuaW1hbCA9IHtcbiAgICAgIFwibGFiZWxcIjogXCJ1bmxvYWRlZFwiLFxuICAgICAgXCJmb3JBZHVsdHNcIjogXCJ1bmxvYWRlZFwiLFxuICAgICAgXCJtdWx0aUxhbmd1YWdlXCI6IFwiZmFsc2VcIixcbiAgICAgIFwiZm9yQ2hpbGRyZW5cIjogXCJ1bmxvYWRlZFwiXG4gICAgfTtcbiAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgJHNjb3BlLmFscmVhZHlSYXRlZCA9IGZhbHNlO1xuICAgICRzY29wZS5hY3RpdmVTdGF0ZSA9IFwiaW5mb3JtYXRpb25cIjtcblxuICAgIChmdW5jdGlvbiBpbml0aWFsaXplKCl7XG4gICAgICBhbmltYWxGYWN0b3J5LmZldGNoQW5pbWFsQnlJZChhbmltYWxJZCkudGhlbihmdW5jdGlvbihhbmltYWwpIHtcbiAgICAgICAgJHNjb3BlLmFuaW1hbCA9IGFuaW1hbDtcbiAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0sIGZ1bmN0aW9uKGZhaWxlZCkge1xuICAgICAgICBhbGVydChmYWlsZWQpO1xuICAgICAgfSk7XG4gICAgfSgpKTtcblxuICAgICRzY29wZS50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XG4gICAgJHNjb3BlLmdldEFuaW1hbExhYmVsID0gZ2V0QW5pbWFsTGFiZWw7XG4gICAgJHNjb3BlLmdldFRleHRGb3JDaGlsZHJlbiA9IGdldFRleHRGb3JDaGlsZHJlbjtcbiAgICAkc2NvcGUuZ2V0VGV4dEZvckFkdWx0cyA9IGdldFRleHRGb3JBZHVsdHM7XG5cbiAgICBmdW5jdGlvbiBnZXRBbmltYWxMYWJlbCgpIHtcbiAgICAgIGlmICgkc2NvcGUuYW5pbWFsLm11bHRpTGFuZ3VhZ2UgPT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJsYWJlbFwiICsgJHNjb3BlLmxhbmddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJsYWJlbFwiICsgJHNjb3BlLmFuaW1hbC5sYW5nXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUZXh0Rm9yQWR1bHRzKCkge1xuICAgICAgaWYgKCRzY29wZS5hbmltYWwubXVsdGlMYW5ndWFnZSA9PSBcInRydWVcIikge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmFuaW1hbFtcImZvckFkdWx0c1wiICsgJHNjb3BlLmxhbmddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWwuZm9yQWR1bHRzW1wiZm9yQWR1bHRzXCIgKyAkc2NvcGUuYW5pbWFsLmxhbmddO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFRleHRGb3JDaGlsZHJlbigpIHtcbiAgICAgIGlmICgkc2NvcGUuYW5pbWFsLm11bHRpTGFuZ3VhZ2UgPT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJmb3JDaGlsZHJlblwiICsgJHNjb3BlLmxhbmddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5hbmltYWxbXCJmb3JDaGlsZHJlblwiICsgJHNjb3BlLmFuaW1hbC5sYW5nXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2xhdGUoa2V5KSB7XG4gICAgICByZXR1cm4gdHJhbnNsYXRpb25TZXJ2aWNlLnRyYW5zbGF0ZShrZXksICRzY29wZS5sYW5nKSB8fCBrZXk7XG4gICAgfVxuICB9XSk7XG5cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5jb250cm9sbGVyKFwiQW5pbWFsTWFwQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkaW9uaWNMb2FkaW5nXCIsXG4gIFwiJGNvbXBpbGVcIixcblxuICBmdW5jdGlvbigkc2NvcGUsICRpb25pY0xvYWRpbmcsICRjb21waWxlKSB7XG4gICAgdmFyIGxhdExuZyA9IHt9O1xuICAgIHZhciBtYXBPcHRzID0ge307XG5cbiAgICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgICAgbGF0TG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyg0OS4yLDE2LjUpO1xuXG4gICAgICBtYXBPcHRzID0ge1xuICAgICAgICBjZW50ZXI6IGxhdExuZyxcbiAgICAgICAgem9vbTogMTUsXG4gICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVBcbiAgICAgIH07XG4gICAgfVxuICAgIGluaXRpYWxpemUoKTtcbiAgICAkc2NvcGUubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdvb2dsZU1hcFwiKSwgbWFwT3B0cyk7XG4gICAgfVxuICBdKTtcbn0oKSk7XG4iXX0=
