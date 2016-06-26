(function() {

  angular.module("zoo-app").controller("AnimalController",
    ["$scope", "$stateParams", "animalFactory", "translationService",


  function($scope, $stateParams, animalFactory, translationService) {
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
