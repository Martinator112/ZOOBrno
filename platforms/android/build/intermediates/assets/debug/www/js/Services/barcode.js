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
