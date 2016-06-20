(function(){
  angular.module("zoo-app").controller("BarcodeScannerController", ["$scope", "$cordovaBarcodeScanner",
    function($scope, $cordovaBarcodeScanner) {

      $scope.scannedData = "";
      $cordovaBarcodeScanner.scan().then(function(scannedData) {
        $scope.scannedData = scannedData;
        console.log(scannedData);
      });

    }]);
}());
