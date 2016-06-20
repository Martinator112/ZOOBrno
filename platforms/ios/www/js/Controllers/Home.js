(function() {
  angular.module("zoo-app").controller("HomeController", ["$scope", "$state",

  function($scope, $state) {
    $scope.loadAnimal = loadAnimal;
    $scope.quit = quit;

    function loadAnimal() {
      $state.go("Animal");
    }

    function quit() {

    }
  }]);




})();
