(function(){
  angular.module("zoo-app").controller("BarcodeScannerController", ["$scope", "$location", "$cordovaBarcodeScanner",
    function($scope, $location, $cordovaBarcodeScanner) {

      $scope.scannedData = "";

      if (ionic.Platform.isAndroid()) {
        $cordovaBarcodeScanner.scan().then(function(scannedData) {
          $scope.scannedData = scannedData;
          $location.path("/animal/" + scannedData.text);
        }, function(failedData) {
          $location.path("/");
        });
      } else {
        $location.path("/");
      }

    }]);
}());
