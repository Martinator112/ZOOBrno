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
