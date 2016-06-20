(function(){
  "use strict";

  angular.module("zoo-app").factory("animalFactory", ["$http", "$q", function($http, $q) {
    var animalFactory = {};
    var url = "/";

    if(ionic.Platform.isAndroid()){
      url = "/android_asset/www/";
    }

    function fetchAnimalById(id) {
      var deferred = $q.defer();

      $http.get(url + "data/animal-texts/" + id +".json").then(function(animalData){
        deferred.resolve(animalData.data);
      });

      return deferred.promise;
    }

    animalFactory.fetchAnimalById = fetchAnimalById;

    return animalFactory;
  }]);
}());
