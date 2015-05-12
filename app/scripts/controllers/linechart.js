'use strict';

/**
 * @ngdoc function
 * @name timegrouperApp.controller:LinechartCtrl
 * @description
 * # LinechartCtrl
 * Controller of the timegrouperApp
 */
angular.module('timegrouperApp')
    .controller('LinechartCtrl', function($scope, $http, $firebaseObject, $firebaseArray, $location, $routeParams, $q, FBURL) {

        var ref = new Firebase(FBURL + '/sessions/')

        var sessionID = $routeParams.session;

        var locationSearch = $location.search();

        var newChildRef = new Firebase(FBURL + '/sessions/' + locationSearch.session);

        // sessionObj.$bindTo($scope, 'dimsum');

        // sessionID = locationSearch.session;



        var objLabel = $firebaseObject(newChildRef.child('labelinfo'));
        objLabel.$loaded().then(function() {


            var obj = $firebaseObject(newChildRef.child('selectedNames'));

            obj.$loaded().then(function() {

                obj.$bindTo($scope, 'selectedPatches');
                objLabel.$bindTo($scope, 'dimsumLine');

                // $scope.selectedPatches.currentbrush = 'red';
                // updatePatches();

                // $scope.selectedPatches.currentbrush = 'blue';
                // updatePatches();

            });

        });


        $scope.$watch(function() {
            return $scope.selectedPatches;
        }, function(newVals, oldVals) {

            if (!newVals) {

                return;
            }

            updatePatches();



        }, true);

        var updatePatches = function() {

            var url = 'https://lit-hollows-6344.herokuapp.com/getPatches';

            if ($scope.selectedPatches.currentbrush === 'red') {

                $scope.selectedNames = $scope.selectedPatches.redArrayNames;
                $scope.currentbrush = 0;


            } else if ($scope.selectedPatches.currentbrush === 'blue') {
                $scope.selectedNames = $scope.selectedPatches.blueArrayNames;
                $scope.currentbrush = 1;


            }

            $scope.labelinfo = $scope.dimsumLine.labelinfo;


            console.log($scope.selectedNames);

            if ($scope.selectedNames.length > 36) {
                alert('You selected too many time lines series.  Would you please select fewer? ');
                return;
            }

            $http.post(url, {
                    patchId: $scope.selectedNames
                })
                .success(function(data, status, headers, config) {
                    // d3.json("data/all.json", function(data) {

                    data = JSON.parse(data);

                    console.log(data);

                    var patchData = [];

                    for (var i = 0; i < data.length; i++) {

                        for (var k in data[i]) {

                            if (data[i].hasOwnProperty(k)) {

                                var timeSeries = data[i][k].map(function(d, i) {
                                    return {
                                        x: i,
                                        y: d
                                    };
                                });

                                var patchProp = $scope.labelinfo.filter(function(d) {
                                    return d.name === k;
                                })[0];

                                patchData.push({
                                    key: k,
                                    values: timeSeries,
                                    app: patchProp.app,
                                    exploitable: patchProp.exploitable,
                                    updateMech: patchProp.updateMech
                                });
                            }
                        }
                    }

                    if ($scope.currentbrush === 0) {

                        $scope.lineData1 = patchData;
                        $scope.currentbrush = 1;

                    } else if ($scope.currentbrush === 1) {

                        $scope.lineData2 = patchData;
                        $scope.currentbrush = 0;
                    }


                    $scope.showTimeSeries = true;

                    console.log(patchData);




                })
                .error(function(data, status, headers, config) {
                    console.log(status);
                    alert("Server API error");
                });


        };



        $scope.lineOptions = {
            chart: {
                type: 'lineWithFocusChart',
                height: 450,
                width: 720,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 40
                },
                tooltipContent: function(key, x, y, e, graph) {
                    // console.log(e);
                    // console.log(graph);
                    var patchProp = $scope.labelinfo.filter(function(d) {
                        return d.name === key;
                    })[0];
                    return '<h3>' + key + '</h3>' +
                        '<h4> UpdateMech: ' + patchProp.updateMech + '</h4>' +

                        '<h4> exploitable: ' + patchProp.exploitable + '</h4>' +
                        '<p>' + y + ' at ' + x + '</p>';

                },

                useInteractiveGuideline: true,
                clipVoronoi: false,
                useVoronoi: false,

                transitionDuration: 500,
                xAxis: {
                    axisLabel: 'Date since deployed',
                    tickFormat: function(d) {
                        return d3.format(',f')(d);
                    }
                },
                x2Axis: {
                    tickFormat: function(d) {
                        return d3.format(',f')(d);
                    }
                },
                yAxis: {
                    axisLabel: 'Patch Rate',
                    tickFormat: function(d) {
                        return d3.format(',.2f')(d);
                    },
                    rotateYLabel: false
                },
                y2Axis: {
                    tickFormat: function(d) {
                        return d3.format(',.2f')(d);
                    }
                }

            }
        };


    });
