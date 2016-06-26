(function(){
  "use strict";

  angular.module("zoo-app").directive("zooRatingStars", zooRatingStars);

  zooRatingStars.$inject = ["ratingFactory"];

  function zooRatingStars(ratingFactory) {
    return {
      restrict: "E",
      scope: {
        animalId: "="
      },
      templateUrl: "Partials/Directives/zoo-rating-stars.html",
      link: function($scope, $element, $attrs) {

        $scope.rateAnimal = ratingFactory.rateAnimal;
        $scope.getAnimalRating = ratingFactory.getAnimalRating;
      }
    };
  }
}());
