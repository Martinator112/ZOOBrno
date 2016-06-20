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
