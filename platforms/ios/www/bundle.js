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

  .state('Animal', { url: 'animal',
    templateUrl: 'Partials/animal.html',
    controller: 'AnimalController'
  })

  .state('LoadAnimal', {url: 'loadAnimal',
    templateUrl: 'Partials/load-animal.html',
    controller: 'BarcodeScannerController'
  })

  .state('Animal.forChildren', {
    url: 'animal/for-children',
    templateUrl: 'Partials/for-children.html',
    controller: 'AnimalController'
  })

  .state('Animal.forAdults', {
    url: 'animal/for-adults',
    templateUrl: 'Partials/for-adults.html',
    controller: 'AnimalController'
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

  angular.module("zoo-app").controller("AnimalController", ["$scope",


  function($scope) {
    $scope.animal = {
      text: {
        forChildren: "Lorem ipsum dolor sit amet, te mollis percipit pro. At posse oblique nec, te vel omnium viderer singulis. Nec omnium veritus id, cu odio novum eos. Vix vide vidisse nominavi no, at omittantur ullamcorper sea, eam ei veritus adolescens. No has quidam appetere dissentiunt, id graecis habemus per.",
        forAdults: "Lorem ipsum dolor sit amet, te mollis percipit pro. At posse oblique nec, te vel omnium viderer singulis. Nec omnium veritus id, cu odio novum eos. Vix vide vidisse nominavi no, at omittantur ullamcorper sea, eam ei veritus adolescens. No has quidam appetere dissentiunt, id graecis habemus per."
      }
    };
  }]);

})();

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInpvby1hcHAuanMiLCJDb250cm9sbGVycy9BbmltYWwuanMiLCJDb250cm9sbGVycy9Ib21lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW9uaWMgU3RhcnRlciBBcHBcblxuLy8gYW5ndWxhci5tb2R1bGUgaXMgYSBnbG9iYWwgcGxhY2UgZm9yIGNyZWF0aW5nLCByZWdpc3RlcmluZyBhbmQgcmV0cmlldmluZyBBbmd1bGFyIG1vZHVsZXNcbi8vICdzdGFydGVyJyBpcyB0aGUgbmFtZSBvZiB0aGlzIGFuZ3VsYXIgbW9kdWxlIGV4YW1wbGUgKGFsc28gc2V0IGluIGEgPGJvZHk+IGF0dHJpYnV0ZSBpbiBpbmRleC5odG1sKVxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xuKGZ1bmN0aW9uKCkge1xuYW5ndWxhci5tb2R1bGUoJ3pvby1hcHAnLCBbJ2lvbmljJ10pXG5cbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnSG9tZScsIHsgdXJsOiAnLycsXG4gICAgLypJZiBpbiBhIGZvbGRlciwgdGVtcGxhdGUvd2VsY29tZS5odG1sKi9cbiAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2hvbWUuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICB9KVxuXG4gIC5zdGF0ZSgnQW5pbWFsJywgeyB1cmw6ICdhbmltYWwnLFxuICAgIHRlbXBsYXRlVXJsOiAnUGFydGlhbHMvYW5pbWFsLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBbmltYWxDb250cm9sbGVyJ1xuICB9KVxuXG4gIC5zdGF0ZSgnTG9hZEFuaW1hbCcsIHt1cmw6ICdsb2FkQW5pbWFsJyxcbiAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2xvYWQtYW5pbWFsLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdCYXJjb2RlU2Nhbm5lckNvbnRyb2xsZXInXG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwuZm9yQ2hpbGRyZW4nLCB7XG4gICAgdXJsOiAnYW5pbWFsL2Zvci1jaGlsZHJlbicsXG4gICAgdGVtcGxhdGVVcmw6ICdQYXJ0aWFscy9mb3ItY2hpbGRyZW4uaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FuaW1hbENvbnRyb2xsZXInXG4gIH0pXG5cbiAgLnN0YXRlKCdBbmltYWwuZm9yQWR1bHRzJywge1xuICAgIHVybDogJ2FuaW1hbC9mb3ItYWR1bHRzJyxcbiAgICB0ZW1wbGF0ZVVybDogJ1BhcnRpYWxzL2Zvci1hZHVsdHMuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FuaW1hbENvbnRyb2xsZXInXG4gIH0pO1xuXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvXCIpO1xufSlcblxuLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXG4gICAgICAvLyBEb24ndCByZW1vdmUgdGhpcyBsaW5lIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSBhcmUgZG9pbmcuIEl0IHN0b3BzIHRoZSB2aWV3cG9ydFxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xufSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuXG4gIGFuZ3VsYXIubW9kdWxlKFwiem9vLWFwcFwiKS5jb250cm9sbGVyKFwiQW5pbWFsQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIixcblxuXG4gIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICRzY29wZS5hbmltYWwgPSB7XG4gICAgICB0ZXh0OiB7XG4gICAgICAgIGZvckNoaWxkcmVuOiBcIkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCB0ZSBtb2xsaXMgcGVyY2lwaXQgcHJvLiBBdCBwb3NzZSBvYmxpcXVlIG5lYywgdGUgdmVsIG9tbml1bSB2aWRlcmVyIHNpbmd1bGlzLiBOZWMgb21uaXVtIHZlcml0dXMgaWQsIGN1IG9kaW8gbm92dW0gZW9zLiBWaXggdmlkZSB2aWRpc3NlIG5vbWluYXZpIG5vLCBhdCBvbWl0dGFudHVyIHVsbGFtY29ycGVyIHNlYSwgZWFtIGVpIHZlcml0dXMgYWRvbGVzY2Vucy4gTm8gaGFzIHF1aWRhbSBhcHBldGVyZSBkaXNzZW50aXVudCwgaWQgZ3JhZWNpcyBoYWJlbXVzIHBlci5cIixcbiAgICAgICAgZm9yQWR1bHRzOiBcIkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCB0ZSBtb2xsaXMgcGVyY2lwaXQgcHJvLiBBdCBwb3NzZSBvYmxpcXVlIG5lYywgdGUgdmVsIG9tbml1bSB2aWRlcmVyIHNpbmd1bGlzLiBOZWMgb21uaXVtIHZlcml0dXMgaWQsIGN1IG9kaW8gbm92dW0gZW9zLiBWaXggdmlkZSB2aWRpc3NlIG5vbWluYXZpIG5vLCBhdCBvbWl0dGFudHVyIHVsbGFtY29ycGVyIHNlYSwgZWFtIGVpIHZlcml0dXMgYWRvbGVzY2Vucy4gTm8gaGFzIHF1aWRhbSBhcHBldGVyZSBkaXNzZW50aXVudCwgaWQgZ3JhZWNpcyBoYWJlbXVzIHBlci5cIlxuICAgICAgfVxuICAgIH07XG4gIH1dKTtcblxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgYW5ndWxhci5tb2R1bGUoXCJ6b28tYXBwXCIpLmNvbnRyb2xsZXIoXCJIb21lQ29udHJvbGxlclwiLCBbXCIkc2NvcGVcIiwgXCIkc3RhdGVcIixcblxuICBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSkge1xuICAgICRzY29wZS5sb2FkQW5pbWFsID0gbG9hZEFuaW1hbDtcbiAgICAkc2NvcGUucXVpdCA9IHF1aXQ7XG5cbiAgICBmdW5jdGlvbiBsb2FkQW5pbWFsKCkge1xuICAgICAgJHN0YXRlLmdvKFwiQW5pbWFsXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHF1aXQoKSB7XG5cbiAgICB9XG4gIH1dKTtcblxuXG5cblxufSkoKTtcbiJdfQ==
