(function() {

  angular.module("zoo-app").controller("AnimalController", ["$scope", "$routeParams",


  function($scope, $routeParams) {
    $scope.animal = {
      text: {
        forChildren: "Lorem ipsum dolor sit amet, te mollis percipit pro. At posse oblique nec, te vel omnium viderer singulis. Nec omnium veritus id, cu odio novum eos. Vix vide vidisse nominavi no, at omittantur ullamcorper sea, eam ei veritus adolescens. No has quidam appetere dissentiunt, id graecis habemus per.",
        forAdults: "Lorem ipsum dolor sit amet, te mollis percipit pro. At posse oblique nec, te vel omnium viderer singulis. Nec omnium veritus id, cu odio novum eos. Vix vide vidisse nominavi no, at omittantur ullamcorper sea, eam ei veritus adolescens. No has quidam appetere dissentiunt, id graecis habemus per."
      }
    };
  }]);

})();
