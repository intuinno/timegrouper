'use strict';

/**
 * @ngdoc function
 * @name timegrouperApp.controller:SummaryCtrl
 * @description
 * # SummaryCtrl
 * Controller of the timegrouperApp
 */
angular.module('timegrouperApp')
    .controller('SummaryCtrl', function($scope, $http, $firebaseObject, $firebaseArray, $location, $routeParams, $q, FBURL) {

        var ref = new Firebase(FBURL + '/sessions/')

        var sessionID = $routeParams.session;

        var locationSearch = $location.search();

        var newChildRef = new Firebase(FBURL + '/sessions/' + locationSearch.session);

        // sessionObj.$bindTo($scope, 'dimsum');

        // sessionID = locationSearch.session;

        var obj = $firebaseObject(newChildRef.child('summarySelection'));
       
       	obj.$bindTo($scope, 'selectedGroups');


        var objSumMat = $firebaseArray(newChildRef.child('summaryMat'));

        objSumMat.$loaded().then(function(){

        	var orderlist = $firebaseArray(newChildRef.child('orderlist'));
        	
        	orderlist.$loaded().then(function() {

        		$scope.summaryOrderList = orderlist;

 		       	$scope.summaryMatrix = objSumMat;
        	});
        	// $scope.$apply();
        	// console.log(objSumMat);
        });




        // objSumMat.$bindTo($scope, "summaryMatrix");

        // objOrderList.$bindTo($scope, "summaryOrderList");


    });
