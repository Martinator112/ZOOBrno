// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
(function() {
angular.module('zoo-app', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('Home', { url: '/',
    /*If in a folder, template/welcome.html*/
    templateUrl: 'Partials/home.html',
    controller: 'HomeController'
  })

  .state('LoadAnimal', { url: 'load-animal',
    templateUrl: 'Partials/load-animal.html',
    controller: 'LoadAnimalController'
  })

  .state('LoadAnimal.forChildren', {
    url: 'load-animal/for-children',
    templateUrl: 'Partials/For-Children.html',
    controller: 'LoadAnimalController'
  });

  $urlRouterProvider.otherwise("/");
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
})();

(function() {
  angular.module("zoo-app").controller("HomeController", ["$scope", "$state",

  function($scope, $state) {
    $scope.loadAnimal = loadAnimal;
    $scope.quit = quit;

    function loadAnimal() {
      $state.go("LoadAnimal");
    }

    function quit() {

    }
  }]);




})();

(function() {

  angular.module("zoo-app").controller("LoadAnimalController", ["$scope",


  function($scope) {

  }]);

})();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInpvby1hcHAuanMiLCJDb250cm9sbGVycy9Ib21lLmpzIiwiQ29udHJvbGxlcnMvTG9hZEFuaW1hbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW9uaWMgU3RhcnRlciBBcHBcblxuLy8gYW5ndWxhci5tb2R1bGUgaXMgYSBnbG9iYWwgcGxhY2UgZm9yIGNyZWF0aW5nLCByZWdpc3RlcmluZyBhbmQgcmV0cmlldmluZyBBbmd1bGFyIG1vZHVsZXNcbi8vICdzdGFydGVyJyBpcyB0aGUgbmFtZSBvZiB0aGlzIGFuZ3VsYXIgbW9kdWxlIGV4YW1wbGUgKGFsc28gc2V0IGluIGEgPGJvZHk+IGF0dHJpYnV0ZSBpbiBpbmRleC5odG1sKVxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xuKGZ1bmN0aW9uKCkge1xuYW5ndWxhci5tb2R1bGUoJ3pvby1hcHAnLCBbJ2lvbmljJ10pXG5cbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnSG9tZScsIHsgdXJsOiAnLycsXG4gICAgLypJZiBpbiBhIGZvbGRlciwgdGVtcGxhdGUvd2VsY29tZS5odG1sKi9cbiAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2hvbWUuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICB9KVxuXG4gIC5zdGF0ZSgnTG9hZEFuaW1hbCcsIHsgdXJsOiAnbG9hZC1hbmltYWwnLFxuICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvbG9hZC1hbmltYWwuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0xvYWRBbmltYWxDb250cm9sbGVyJ1xuICB9KVxuXG4gIC5zdGF0ZSgnTG9hZEFuaW1hbC5mb3JDaGlsZHJlbicsIHtcbiAgICB1cmw6ICdsb2FkLWFuaW1hbC9mb3ItY2hpbGRyZW4nLFxuICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvRm9yLUNoaWxkcmVuLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdMb2FkQW5pbWFsQ29udHJvbGxlcidcbiAgfSk7XG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9cIik7XG59KVxuXG4ucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cbiAgICAgIC8vIERvbid0IHJlbW92ZSB0aGlzIGxpbmUgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91IGFyZSBkb2luZy4gSXQgc3RvcHMgdGhlIHZpZXdwb3J0XG4gICAgICAvLyBmcm9tIHNuYXBwaW5nIHdoZW4gdGV4dCBpbnB1dHMgYXJlIGZvY3VzZWQuIElvbmljIGhhbmRsZXMgdGhpcyBpbnRlcm5hbGx5IGZvclxuICAgICAgLy8gYSBtdWNoIG5pY2VyIGtleWJvYXJkIGV4cGVyaWVuY2UuXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcbiAgICB9XG4gICAgaWYod2luZG93LlN0YXR1c0Jhcikge1xuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuICAgIH1cbiAgfSk7XG59KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5jb250cm9sbGVyKFwiSG9tZUNvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsIFwiJHN0YXRlXCIsXG5cbiAgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpIHtcbiAgICAkc2NvcGUubG9hZEFuaW1hbCA9IGxvYWRBbmltYWw7XG4gICAgJHNjb3BlLnF1aXQgPSBxdWl0O1xuXG4gICAgZnVuY3Rpb24gbG9hZEFuaW1hbCgpIHtcbiAgICAgICRzdGF0ZS5nbyhcIkxvYWRBbmltYWxcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcXVpdCgpIHtcblxuICAgIH1cbiAgfV0pO1xuXG5cblxuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5jb250cm9sbGVyKFwiTG9hZEFuaW1hbENvbnRyb2xsZXJcIiwgW1wiJHNjb3BlXCIsXG5cblxuICBmdW5jdGlvbigkc2NvcGUpIHtcblxuICB9XSk7XG5cbn0pKCk7XG4iXX0=
