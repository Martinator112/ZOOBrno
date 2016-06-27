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
