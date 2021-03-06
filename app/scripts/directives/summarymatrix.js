'use strict';

/**
 * @ngdoc directive
 * @name timegrouperApp.directive:summarymatrix
 * @description
 * # summarymatrix
 */
angular.module('timegrouperApp')
    .directive('summarymatrix', function() {
        return {
            restrict: 'EAC',
            scope: {
                similarity: "=",
                orderlist: "=",
                selectednames: '=',
                myorder: "=",
                selectedrange: '=',
            },

            link: function postLink(scope, element, attrs) {

                // var trendData = parseData(scope.data);

                var margin = {
                        top: 80,
                        right: 0,
                        bottom: 10,
                        left: 80
                    },
                    width = 720,
                    height = 720;

                scope.$watch('similarity', function(newVals, oldVals) {

                    if (!newVals) {
                        return
                    }

                    if (newVals.length > 0 && scope.orderlist) {

                        return renderDataChange(scope.similarity, scope.orderlist);

                    } else {

                        return
                    }


                }, true);

                scope.$watch('myorder', function(newVals, oldVals) {

                    if (!newVals) {
                        return
                    }


                    return order(newVals);



                }, true);



                scope.$watch('orderList', function(newVals, oldVals) {

                    if (!newVals) {

                        return;
                    }

                    renderDataChange(scope.similarity, scope.orderlist);

                }, true);

                scope.$watch('selectednames', function(newVals, oldVals) {

                    if (!newVals) {

                        return;
                    } else if (newVals.length === 1) {

                        return;
                    } else if (!scope.similarity || !scope.orderlist){
                        return;
                    }


                    renderDataChange(scope.similarity, scope.orderlist);

                }, true);

                // scope.$watch(function() {
                //     return angular.element(window)[0].innerWidth;
                // }, function() {
                //     return parseData(scope.data);
                // });

                var x, z, color, orders, svg;

                function renderDataChange(simMat, orderList) {

                    // var highlightInfo;

                    // if (scope.selectednames) {

                    //     highlightInfo = scope.selectednames.map(checkHighlight);

                    // }

                    function checkHighlight(patchName) {

                        var patch = scope.labelinfo.filter(function(d) {
                            return d.name === patchName.name;
                        });

                        return scope.highlight[patch[0].app];
                    }


                    x = d3.scale.ordinal().rangeBands([0, width]);
                    z = d3.scale.linear().domain([0, 4]).clamp(true);
                    // color = d3.scale.linear().range([d3.hsl(0,1,.5), d3.hsl(359,1,.5)]);
                    var max = d3.max(simMat, function(d) {
                        return d3.max(d, function(h) {
                            return h.z;
                        });
                    });



                    var min = d3.min(simMat, function(d) {
                        return d3.min(d, function(h) {
                            return h.z;
                        });
                    });

                    color = d3.scale.linear()
                        .domain([min, (min + max) * .5, max])
                        .range(["#d7191c", "#ffffbf", "#2c7bb6"])
                        .interpolate(d3.interpolateHcl);

                    var brush = d3.svg.brush()
                        .x(x)
                        .y(x)
                        .on('brushstart', brushstart)
                        .on("brush", brushed)
                        .on('brushend', brushend);




                    // color.domain([min, max]);

                    d3.select(element[0]).selectAll('svg').remove();

                    svg = d3.select(element[0]).append("svg")
                        .classed("matrix", true)
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .style("margin-left", -margin.left + "px")
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    var matrix = simMat,
                        nodes = orderList,
                        n = nodes.length;

                    // Precompute the orders.
                    orders = {
                        name: d3.range(n).sort(function(a, b) {
                            return d3.ascending(nodes[a].name, nodes[b].name);
                        }),
                        count: d3.range(n).sort(function(a, b) {
                            return nodes[b].count - nodes[a].count;
                        }),
                        group: d3.range(n).sort(function(a, b) {
                            return nodes[b].group - nodes[a].group;
                        }),
                        index: d3.range(n).sort(function(a, b) {
                            return nodes[a].index - nodes[b].index;
                        })
                    };

                    // The default sort order.
                    x.domain(orders.index);


                    svg.append("rect")
                        .attr("class", "background")
                        .attr("width", width)
                        .attr("height", height);

                    var row = svg.selectAll(".row")
                        .data(matrix)
                        .enter().append("g")
                        .attr("class", "row")
                        .attr("transform", function(d, i) {
                            return "translate(0," + x(i) + ")";
                        })
                        .each(row);

                    row.append("line")
                        .attr("x2", width);

                    row.append("text")
                        .attr("x", -6)
                        .attr("y", x.rangeBand())
                        .attr("dy", ".01em")
                        .classed('patchtext', true)
                        .attr("text-anchor", "end")
                        .text(function(d, i) {
                            // return nodes[i].name;
                            return '';
                        });

                    var column = svg.selectAll(".column")
                        .data(matrix)
                        .enter().append("g")
                        .attr("class", "column")
                        .attr("transform", function(d, i) {
                            return "translate(" + x(i) + ")rotate(-90)";
                        });

                    column.append("line")
                        .attr("x1", -width);

                    column.append("text")
                        .attr("x", 6)
                        .attr("y", x.rangeBand())
                        .attr("dy", ".01em")
                        .classed('patchtext', true)
                        .attr("text-anchor", "start")
                        .text(function(d, i) {
                            // return nodes[i].name;
                            return '';
                        });

                    // drawHeatMapLegends();


                    function row(row) {
                        var cell = d3.select(this).selectAll(".cell")
                            // .data(row.filter(function(d) {
                            //     return d.z;
                            // }))
                            .data(row)
                            .enter().append("rect")
                            .attr("class", function(d, i) {

                                if (!scope.selectednames.arrayNames || scope.selectednames.arrayNames.length === 0) {
                                    return 'cell';
                                } else {

                                    var base = 'cell selecting';

                                    if (typeof scope.selectednames.arrayNames.indexOf === "function") {

                                        if (scope.selectednames.arrayNames.indexOf((scope.orderlist[d.x]).name) !== -1 && scope.selectednames.arrayNames.indexOf((scope.orderlist[d.y]).name) !== -1) {

                                            base = base + '  selected';
                                        }
                                    }
                                    return base;
                                }
                            })
                            .attr("x", function(d) {
                                return x(d.x);
                            })
                            .attr("width", x.rangeBand())
                            .attr("height", x.rangeBand())
                            // .style("fill-opacity", function(d) {
                            //     return z(d.z);
                            // })
                            .style("fill", function(d) {
                                return color(d.z);
                            })
                            .on("mouseover", mouseover)
                            .on("mouseout", mouseout);
                    }

                    function mouseover(p) {
                        d3.selectAll(".row text").classed("active", function(d, i) {
                            return i == p.y;
                        });
                        d3.selectAll(".column text").classed("active", function(d, i) {
                            return i == p.x;
                        });
                    }

                    function mouseout() {
                        d3.selectAll("text").classed("active", false);
                    }





                    var gBrush = svg.append('g')
                        .attr("class", 'brush')
                        .call(brush);

                    function brushed() {
                        var extent0 = brush.extent(),
                            extent1;

                        // console.log(extent0);
                        d3.selectAll('.cell').classed('selected', function(d) {
                            if (extent0[0][0] <= (x(d.x + 1)) && x(d.x) <= extent0[1][0]) {

                                if (extent0[0][1] <= (x(d.y + 1)) && x(d.y) <= extent0[1][1]) {

                                    return true;
                                }

                            }

                            return false;
                        });

                    }

                    function brushstart() {
                        d3.selectAll('.cell')
                            .classed("selecting", true);
                    }

                    function brushend() {
                        d3.selectAll('.cell').classed("selecting", !d3.event.target.empty());
                        var extent0 = brush.extent(),
                            extent1;
                        var selectedNames = ['none'];

                        var selectedX = [];
                        var selectedY = [];

                        d3.selectAll('.cell').classed('selected', function(d) {
                            if (extent0[0][0] <= (x(d.x + 1)) && x(d.x) <= extent0[1][0]) {

                                if (extent0[0][1] <= (x(d.y + 1)) && x(d.y) <= extent0[1][1]) {

                                    if (selectedNames.indexOf(nodes[d.x].name) === -1) {
                                        selectedNames.push(nodes[d.x].name);
                                    }



                                    if (selectedNames.indexOf(nodes[d.y].name) === -1) {
                                        selectedNames.push(nodes[d.y].name);
                                    }

                                    selectedX.push(d.x);
                                    selectedY.push(d.y);

                                    return true;
                                }

                            }


                            return false;
                        });

                        var p1 = [d3.min(selectedX), d3.min(selectedY)];
                        var p2 = [d3.max(selectedX), d3.max(selectedY)];
                        console.log(p1);
                        // x.invert(extent0[1][1]);


                        scope.selectednames.arrayNames = selectedNames;
                        scope.selectedrange = [p1, p2];
                        // console.log(selectedNames);
                        scope.$apply();

                    }

                }

                var drawHeatMapLegends = function() {

                    var colorDomain = color.domain();

                    var textMargin = 20;

                    var widthHeatMap = 20;
                    var heightHeatMap = height - 2 * textMargin;


                    var yScaleForHeatMap = d3.scale.linear()
                        .domain(colorDomain)
                        .rangeRound([0 + textMargin, height / 2, height - textMargin]);

                    var values = d3.range(colorDomain[0], colorDomain[2], (colorDomain[2] - colorDomain[0]) / heightHeatMap);

                    var g = svg.append("g")
                        .attr("class", "legend");

                    g.append("text")
                        .attr("x", -100)
                        .attr("y", 15)
                        .attr("dy", ".35em")
                        .style("text-anchor", "left")
                        .text("more similar (" + d3.round(colorDomain[0], 1) + ")")
                        .attr('transform', function(d, i) { // NEW
                            var vert = yScaleForHeatMap(values[0]); // NEW
                            var horz = width + widthHeatMap + 5; // NEW
                            return 'translate(' + horz + ',' + vert + ')rotate(-90)'; // NEW
                        });

                    g.append("text")
                        .attr("x", 0)
                        .attr("y", 15)
                        .attr("dy", ".35em")
                        .style("text-anchor", "left")
                        .text("less similar (" + d3.round(colorDomain[2], 1) + ")")
                        .attr('transform', function(d, i) { // NEW
                            var vert = yScaleForHeatMap(values[values.length - 1]); // NEW
                            var horz = width + widthHeatMap + 5; // NEW
                            return 'translate(' + horz + ',' + vert + ')rotate(-90)'; // NEW
                        });


                    var heatmap = g.selectAll("rect")
                        .data(values)
                        .enter().append("rect")
                        .attr("x", width + 10)
                        .attr("y", yScaleForHeatMap)
                        .attr("width", 20)
                        .attr("height", 1)
                        .style("fill", color);



                };

                function order(value) {
                    x.domain(orders[value]);

                    var t = svg.transition().duration(2500);

                    t.selectAll(".row")
                        .delay(function(d, i) {
                            return x(i) * 4;
                        })
                        .attr("transform", function(d, i) {
                            return "translate(0," + x(i) + ")";
                        })
                        .selectAll(".cell")
                        .delay(function(d) {
                            return x(d.x) * 4;
                        })
                        .attr("x", function(d) {
                            return x(d.x);
                        });

                    t.selectAll(".column")
                        .delay(function(d, i) {
                            return x(i) * 4;
                        })
                        .attr("transform", function(d, i) {
                            return "translate(" + x(i) + ")rotate(-90)";
                        });
                }

            }
        };
    });
