'use strict';

/**
 * @ngdoc function
 * @name timegrouperApp.controller:Demo2Ctrl
 * @description
 * # Demo2Ctrl
 * Controller of the timegrouperApp
 */
angular.module('timegrouperApp')
    .controller('Demo2Ctrl', function($scope, $http, $firebaseObject, $firebaseArray, $location, $routeParams, $q, FBURL) {

        var summaryMatLabel, summaryMat, originalLabel, originalMat;
        $scope.showTimeSeries = false;
        $scope.dimsumLabel = {
            labelinfo: [-1]
        };
        $scope.dimsumPatch = {
            redArrayNames: [-1],
            blueArrayNames: [-1],
            currentbrush: 0

        };

        $scope.summaryRange = [];
        $scope.isSummaryVisible = true;
        $scope.simMetrics = [{
            name: 'euclidean',
            detail: 'euclidean distance based on input data'
        }, {
            name: 'pca_euc',
            detail: '#extract feature vector from input based on PCA, then use Euclidean distance PCA: principle component analysis'
        }, {
            name: 'nmf_euc',
            detail: '#extract feature based on NMF, then use Euclidean distance, NMF: non-negative matrix factorization'
        }, {
            name: 'ica_euc',
            detail: '#extract feature based on ICA, then use Euclidean distance, ICA: independent component analysis'
        }, {
            name: 'cosine',
            detail: '#cosine distance based on input data'
        }, {
            name: 'pca_cos',
            detail: '#extract feature based on PCA, then use cosine distance'
        }, {
            name: 'nmf_cos',
            detail: '#extract feature based on NMF, then use cosine distance'
        }, {
            name: 'ica_cos',
            detail: '#extract feature based on ICA, then use cosine distance'
        }];

        $scope.simMetric = $scope.simMetrics[5];

        $scope.algorithms = [{
            name: 'kmeans',
            detail: '#kmeans clustering'
        }, {
            name: 'ap',
            detail: '#affinity propagation'
        }, {
            name: 'meanshift',
            detail: '#means shift'
        }, {
            name: 'spectral',
            detail: '#spectral clustering'
        }, {
            name: 'hc',
            detail: '#hierarchical clustering'
        }, {
            name: 'dbscan',
            detail: '# DBSCAN'
        }];

        $scope.algorithm = $scope.algorithms[1];

        $scope.appNames = {
            chrome: true,
            firefox: true,
            acroread: true,
            thunderbird: true,
            flashplayer: true,
            quicktime: true,
            msword: true,
            opera: true,
            safari: true,
            wireshark: true
        };

        $scope.appNamesHighlight = {
            chrome: true,
            firefox: true,
            acroread: true,
            thunderbird: true,
            flashplayer: true,
            quicktime: true,
            msword: true,
            opera: true,
            safari: true,
            wireshark: true
        };

        $scope.updateMechanisms = [{
            label: 'Manual Update',
            selected: true,
            value: 'MU'
        }, {
            label: 'Prompted Download',
            selected: true,
            value: 'PD'
        }, {
            label: 'Prompted Install',
            selected: true,
            value: 'PI'
        }, {
            label: 'Silent Update',
            selected: true,
            value: 'SU'
        }];

        $scope.updateMechanismsForTimeSeries = [{
            label: 'Manual Update',
            selected: true,
            value: 'MU'
        }, {
            label: 'Prompted Download',
            selected: true,
            value: 'PD'
        }, {
            label: 'Prompted Install',
            selected: true,
            value: 'PI'
        }, {
            label: 'Silent Update',
            selected: true,
            value: 'SU'
        }];

        $scope.exploitableOnly = false;


        $scope.exploitableOnlyForTimeSeries = false;

        var clearCharts = function() {

            $scope.summaryMatrix = [];
            $scope.summaryOrderList = [];
        }


        $scope.loadData = function() {

            clearCharts();

            var url = 'https://lit-hollows-6344.herokuapp.com/getSimMatrix';

            var appNames = [];

            for (var key in $scope.appNames) {

                if ($scope.appNames.hasOwnProperty(key)) {

                    if ($scope.appNames[key]) {
                        appNames.push(key);
                    }

                }
            }

            var updateMechs = $scope.updateMechanisms.filter(function(d) {
                return d.selected;
            });

            updateMechs = updateMechs.map(function(d) {
                return d.value;
            });

            // console.log(updateMechs);

            var argument = {
                simMetric: $scope.simMetric.name,
                cAlgorithm: $scope.algorithm.name,
                appName: appNames,
                updateMech: updateMechs
            };

            if ($scope.exploitableOnly) {
                argument.exploitable = 'true';
            }


            $http.post(url, argument)
                .success(function(data, status, headers, config) {
                    // d3.json("data/all.json", function(data) {

                    console.log(data);

                    if (data.length === 4) {

                        summaryMatLabel = data[0];
                        summaryMat = data[1];
                        originalLabel = data[2];
                        originalMat = data[3];

                        summaryMatLabel.splice(summaryMat.length, summaryMatLabel.length - summaryMat.length);

                        var data = summaryMat.map(function(row, i) {
                            return row.map(function(value, j) {
                                return {
                                    x: j,
                                    y: i,
                                    z: +value
                                };
                            });
                        });

                        $scope.summaryMatrix = data;

                        var namesList = summaryMatLabel.map(function(d, i) {
                            return {
                                name: d.name,
                                count: 0,
                                group: 1,
                                index: i,
                                patches: d.patches
                            };
                        });

                        $scope.summaryOrderList = namesList;
                        $scope.labelinfo = originalLabel;

                    } else if (data.length === 2) {

                        summaryMatLabel = data[0];
                        summaryMat = data[1];

                        summaryMatLabel.splice(summaryMat.length, summaryMatLabel.length - summaryMat.length);

                        var data = summaryMat.map(function(row, i) {
                            return row.map(function(value, j) {
                                return {
                                    x: j,
                                    y: i,
                                    z: +value
                                };
                            });
                        });

                        $scope.simMatrix = data;

                        var namesList = summaryMatLabel.map(function(d, i) {
                            return {
                                name: d.name,
                                count: 0,
                                group: 1,
                                index: i,
                                patches: d.patches
                            };
                        });

                        $scope.orderList = namesList;

                        $scope.noSummary = true;

                        $scope.labelinfo = summaryMatLabel;


                    }

                    $scope.dimsumLabel.labelinfo = $scope.labelinfo;
                })
                .error(function(data, status, headers, config) {
                    console.log(status);
                });

        };


        // loadData();
        var parsedData = [];
        $scope.orders = ['name', 'index', 'count', 'group'];

        var patchData;
        $scope.currentbrush = 0;

        var updatePatches = function() {

            var url = 'https://lit-hollows-6344.herokuapp.com/getPatches';

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

                    patchData = [];

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


        $scope.lineData1 = [];
        $scope.lineData2 = [];

        $scope.$watch(function() {
            return $scope.selectedNames;
        }, function(newVals, oldVals) {

            if (!newVals) {

                return;
            }

            if ($scope.currentbrush === 0) {


                $scope.dimsumPatch.redArrayNames = $scope.selectedNames;
                $scope.dimsumPatch.currentbrush = 'red';

            } else if ($scope.currentbrush === 1) {

                $scope.dimsumPatch.blueArrayNames = $scope.selectedNames;
                $scope.dimsumPatch.currentbrush = 'blue';
            }



            updatePatches();



        }, true);

        $scope.$watch(function() {
            return $scope.updateMechanismsForTimeSeries;
        }, function(newVals, oldVals) {

            if (!$scope.selectedNames) {
                return;
            }

            filterPatches();

        }, true);

        $scope.$watch(function() {
            return $scope.exploitableOnlyForTimeSeries;
        }, function(newVals, oldVals) {

            if (!$scope.selectedNames) {
                return;
            }

            filterPatches();

        }, true);

        var filterPatches = function() {

            var filteredNames = $scope.selectedNames.filter(function(d) {
                var patch = originalLabel.filter(function(p) {
                    return p.name === d;
                })[0];

                var updateMech = $scope.updateMechanismsForTimeSeries.filter(function(d) {
                    return d.value === patch.updateMech;
                })[0];

                if ($scope.exploitableOnlyForTimeSeries && patch.exploitable === false) {
                    return false;
                }

                if (updateMech.selected) {
                    return true;
                } else {
                    return false;
                }
            });

            $scope.lineData1 = patchData.filter(function(d) {
                return filteredNames.indexOf(d.key) !== -1;
            });

            $scope.lineData2 = patchData.filter(function(d) {
                return filteredNames.indexOf(d.key) !== -1;
            });

        };



        $scope.$watch(function() {
            return $scope.selectedGroups;
        }, function(newVals, oldVals) {

            var temp = [];

            var selectedPatches = [];

            if (!newVals || newVals.arrayNames.length === 1) {
                return;
            }

            for (var i = 0; i < newVals.arrayNames.length; i++) {
                var j = parseInt(newVals.arrayNames[i].slice(5));

                if (!isNaN(j)) {
                    var patches = summaryMatLabel[j].patches;
                    for (var k = 0; k < patches.length; k++) {

                        if (selectedPatches.indexOf(patches[k]) === -1) {

                            selectedPatches.push(patches[k]);

                        }
                    }
                }

            }



            // console.log(selectedPatches);

            function isSelectedPatches(d, i) {
                if (selectedPatches.indexOf(originalLabel[i].name) === -1) {
                    return false;
                } else {
                    return true;
                }
            }

            var filteredMat = originalMat.filter(isSelectedPatches);

            var filteredMat = filteredMat.map(function(d) {
                return d.filter(isSelectedPatches);
            });

            // console.log(filteredMat);

            var data = filteredMat.map(function(row, i) {
                return row.map(function(value, j) {
                    return {
                        x: j,
                        y: i,
                        z: +value
                    };
                });
            });

            $scope.simMatrix = data;

            var namesList = selectedPatches.map(function(d, i) {
                return {
                    name: d,
                    count: 0,
                    group: 1,
                    index: i
                };
            });

            $scope.orderList = namesList;

            // $scope.$apply();



        }, true);

        $scope.selectAllAppNames = function() {
            $scope.appNames = {
                chrome: true,
                firefox: true,
                acroread: true,
                thunderbird: true,
                flashplayer: true,
                quicktime: true,
                msword: true,
                opera: true,
                safari: true,
                wireshark: true
            };
        };

        $scope.deselectAllAppNames = function() {
            $scope.appNames = {
                chrome: false,
                firefox: false,
                acroread: false,
                thunderbird: false,
                flashplayer: false,
                quicktime: false,
                msword: false,
                opera: false,
                safari: false,
                wireshark: false
            };
        };

        $scope.selectAllAppNamesHighlight = function() {
            $scope.appNamesHighlight = {
                chrome: true,
                firefox: true,
                acroread: true,
                thunderbird: true,
                flashplayer: true,
                quicktime: true,
                msword: true,
                opera: true,
                safari: true,
                wireshark: true
            };
        };

        $scope.deselectAllAppNamesHighlight = function() {
            $scope.appNamesHighlight = {
                chrome: false,
                firefox: false,
                acroread: false,
                thunderbird: false,
                flashplayer: false,
                quicktime: false,
                msword: false,
                opera: false,
                safari: false,
                wireshark: false
            };
        };

        $scope.selectAllUpdateMechanisms = function() {

            $scope.updateMechanisms.forEach(function(d) {
                d.selected = true;
            });
        };

        $scope.deselectAllUpdateMechanisms = function() {

            $scope.updateMechanisms.forEach(function(d) {
                d.selected = false;
            });
        };

        $scope.selectAllUpdateMechanismsTimeSeries = function() {

            $scope.updateMechanismsForTimeSeries.forEach(function(d) {
                d.selected = true;
            });
        };

        $scope.deselectAllUpdateMechanismsTimeSeries = function() {

            $scope.updateMechanismsForTimeSeries.forEach(function(d) {
                d.selected = false;
            });
        };



        var sessionID;
        $scope.selectedGroups = {
            arrayNames: [-1]
        };


        $scope.launchSession = function(handler) {

            if (!sessionID) {

                var promise = createSession();

                promise.then(function(newSessionID) {

                        handler(newSessionID);
                    },
                    function(reason) {

                        alert('Failed' + reason);
                    });
            } else {

                handler(sessionID);

            }


        };

        var handleSession = function() {

            var locationSearch = $location.search();

            if (locationSearch.session) {


                var sessionArray = $firebaseArray(new Firebase(FBURL + '/sessions/summary'));

                sessionArray.$bindTo($scope, 'selectedGroups');

                sessionID = locationSearch.session;

            }



        };

        $scope.openNewWindow = function(sessionID) {

            var url = '#/summary/';
            url = url + '?session=';
            url = url + sessionID;

            window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=800, left=500, width=800, height=600");

        };

        $scope.openNewLineWindow = function(sessionID) {

            var url = '#/line/';
            url = url + '?session=';
            url = url + sessionID;

            window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=800, left=500, width=800, height=600");

        };

        $scope.openNewInspector = function(sessionID) {

            var url = '#/inspect/' + $routeParams.csvKey;
            url = url + '?session=';
            url = url + sessionID;

            window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=800, height=800");

        };

        $scope.openNewQR = function(sessionID) {

            var url = $location.protocol() + '://' + $location.host() + '/#/summary/?session=' + sessionID;

            $scope.qrcodeURL = url;
            $scope.isQRcodeVisible = true;

        };

        $scope.openNewLineQR = function(sessionID) {

            var url = $location.protocol() + '://' + $location.host() + '/#/line/?session=' + sessionID

            $scope.qrcodeLineURL = url;
            $scope.isLineQRcodeVisible = true;

        };

        function createSession() {

            return $q(function(resolve, reject) {

                var emptyDimsum = {
                    summarySelection: [-1],
                    dummy: 1,
                    simSelection: [],
                    summaryMat: [-1],
                    orderlist: [-1],
                    selectedNames: {
                        redArrayNames: [-1],
                        blueArrayNames: [-1]
                    },
                    labelinfo: {
                        labelinfo: [-1]
                    }
                }

                var ref = new Firebase(FBURL + '/sessions/');
                var sync = $firebaseArray(ref);

                sync.$add(emptyDimsum).then(function(newChildRef) {
                    console.log("added record with id " + newChildRef.key());

                    var parentObj = $firebaseObject(newChildRef);

                    parentObj.$loaded().then(function() {

                        parentObj.summarySelection = $scope.selectedGroups;
                        parentObj.summaryMat = $scope.summaryMatrix;
                        parentObj.orderlist = $scope.summaryOrderList;
                        parentObj.labelinfo = $scope.dimsumLabel;
                        parentObj.selectedNames = $scope.dimsumPatch;

                        parentObj.$save().then(function(newChildRef) {

                            var obj = $firebaseObject(newChildRef.child('summarySelection'));
                            obj.$bindTo($scope, 'selectedGroups');

                            var objPatches = $firebaseObject(newChildRef.child('selectedNames'));
                            objPatches.$bindTo($scope, 'dimsumPatch');

                            var dimsumLableInfo = $firebaseObject(newChildRef.child('labelinfo'));
                            dimsumLableInfo.$bindTo($scope, 'dimsumLabel');


                            var objSumMat = $firebaseArray(newChildRef.child('summaryMat'));
                            // objSumMat.$bindTo($scope, "summaryMatrix");

                            var objOrderList = $firebaseArray(newChildRef.child('orderlist'));
                            // objOrderList.$bindTo($scope, "summaryOrderList");

                            $location.search({
                                session: newChildRef.key()
                            });

                            sessionID = newChildRef.key();

                            resolve(newChildRef.key());



                        });



                    });



                }, function(reason) {

                    reject(reason);
                });

            });

        };



    });
