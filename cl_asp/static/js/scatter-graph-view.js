var svg, tooltip
var margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    padding = 2,
    minRadius = 5,
    maxRadius = 7;

function createScatterGraph(placement) {
    svg = d3.select(placement)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom().on("zoom", function() {
            svg.attr("transform", d3.event.transform)
        }))
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    tooltip = d3.select(placement)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")

}

function plotData(data, placement) {
    svg.selectAll("*").remove();
    var xScale = d3.scaleLinear()
        // .domain([d3.min(function(d){return d.x}), d3.max(function(d){return d.x})])
        .range([0, width]);
    var yScale = d3.scaleLinear()
        // .domain([d3.min(function(d){return d.y}), d3.max(function(d){return d.y})])
        .range([height, 0]);
    var xAxis = d3.axisBottom()
        .scale(xScale);
    var yAxis = d3.axisLeft()
        .scale(yScale);

    // add basic axes, all points, calculate scales
    xScale.domain(d3.extent(data, function(d) {
        return d.x
    }));
    yScale.domain(d3.extent(data, function(d) {
        return d.y
    }));

    var lassoStart = function() {
        lasso.items()
            .attr("r", minRadius) // reset size
            .style("fill", null) // clear all of the fills
            .classed({
                "not_possible": true,
                "selected": false
            }); // style as not possible
    };

    var lassoDraw = function() {
        // Style the possible dots
        lasso.possibleItems()
            .classed("not_possible", false)
            .classed("possible", true);

        // Style the not possible dot
        lasso.notPossibleItems()
            .classed("not_possible", true)
            .classed("possible", false);
    };

    var lassoEnd = function(d) {
        // Reset the color of all dots
        lasso.items()
            .classed("not_possible", false)
            .classed("possible", false);

        // Style the selected dots
        lasso.selectedItems()
            .classed("selected", true)
            .attr("r", maxRadius)

        var selected = lasso.selectedItems().data()
        var indices = []
        for (var i = 0; i < selected.length; i++) {
            indices.push(selected[i]['index']);
        }

        for (var i = 0; i < indices.length; i++) {
            for (var j = 0; j < data.length; j++) {
                if (indices[i] == data[j]['index']) {
                    data[j]['selected'] = true;
                }
            }
        }
        // Reset the style of the not selected dots
        lasso.notSelectedItems()
            .attr("r", minRadius);
    };

    // Create the area where the lasso event can be triggered
    var lasso_area = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("opacity", 0);

    var lasso = d3.lasso()
        .closePathSelect(true)
        .closePathDistance(75)
        // .items(circles)
        .targetArea(lasso_area)
        .on("start", lassoStart)
        .on("draw", lassoDraw)
        .on("end", lassoEnd);

    // <!> UNDERDEVELOPED - intergrate lasso selection with the zoom capability:
    // svg.call(lasso);

    var mouseover = function(d) {
        if (!d.selected) {
            d3.select(this).transition()
                .duration('50')
                .attr("r", maxRadius)
                .attr('opacity', '.5');
        }
        var coords = d3.mouse(this),
            y_offset = -25,
            x_offset = 50;

        tooltip.transition()
            .duration(10)
            .style("opacity", 1);

        tooltip.html(d.word)
            .style("left", (coords[0] + x_offset) + "px")
            .style("top", (coords[1] - y_offset) + "px");
    }

    var mouseleave = function(d) {
        if (!d.selected) {
            d3.select(this).transition()
                .duration("50")
                .attr("r", minRadius)
                .attr("opacity", 0.7);
        }

        tooltip.transition()
            .duration(400)
            .style("opacity", 0);
    }

    var selectPoint = function(d) {
        d.selected = !d.selected
        if (d.selected) {
            d3.select(this).transition()
                .duration('50')
                .attr("r", maxRadius)
                .attr('opacity', '1')
                // .classed("selected", true)
                .attr("fill", 'yellow');
        } else {
            d3.select(this).transition()
                .duration('50')
                .attr("r", minRadius)
                .attr('opacity', '.7')
                // .classed("selected", false)
                .attr("fill", function(d) {
                    return myColor(d.label)
                })
        }
        updateSelectedWords(data)
    }

    var myColor = d3.scaleOrdinal()
        .domain(data.map(function(o) {
            return o.label
        }))
        .range(d3.schemeSet3);

    var circles = svg.selectAll(".point")
        .data(data)
        .enter().append("circle")
        .attr("class", "point")
        .attr("r", function(d) {
            return (d.selected ? maxRadius : minRadius)
        })
        .attr("cx", function(d) {
            return xScale(d.x);
        })
        .attr("cy", function(d) {
            return yScale(d.y);
        })
        .attr("fill", function(d) {
            return (d.selected ? 'yellow' : myColor(d.label))
        })
        .attr("opacity", function(d) {
            return (d.selected ? 1 : 0.7)
        })
        .style("stroke", "black")
        .on("mouseover", mouseover)
        .on("click", selectPoint)
        .on("mouseleave", mouseleave);

    // lasso.items(d3.selectAll(".point"));

    // word labels
    svg.append("g")
        .attr("class", "pointlabels")
        .attr("visibility", "hidden")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("dy", "0.35em")
        .attr("x", d => xScale(d.x) + 10)
        .attr("y", d => yScale(d.y))
        .text(d => d.word);

    //<!> UNDERDEVELOPED - Create polygons to show class neighborhoods:
    // var dataByLabel = d3.nest()
    //     .key(function(d) {
    //         return d.label;
    //     })
    //     .entries(data);
    // console.log(dataByLabel)
    // var points = dataByLabel.map((d) => [xScale(d.x), yScale(d.y)]);
    // var hull = d3.polygonHull(points);
    // console.log(hull);

    cb = document.getElementById('toggle-labels');
    if (cb.checked) {
        d3.selectAll(".pointlabels").attr("visibility", "visible");
    }
    updateSelectedWords(data)
}

function updateSelectedWords(data) {
    var filter = data.filter(function(d) {
        return d.selected == true
    });

    var div = d3.select('#entity-selected-words');
    div.selectAll('span').remove();

    var span = div.selectAll('span').data(filter);
    span.enter()
        .append("span")
        .text(function(d) {
            return d.word + " "
        })

    var mask = []
    for (i = 0; i < data.length; i++) {
        mask.push(data[i].selected);
    }
    mask = mask.map(Number)

    $.ajax({
        url: "set_selected",
        data: {
            "mask": JSON.stringify(mask)
        },
        success: function(data) {
            response = JSON.parse(data);
        }
    });
}

function setLabelVisibility(cboxValue) {
    if (cboxValue) {
        d3.selectAll(".pointlabels").attr("visibility", "visible");
    } else {
        d3.selectAll(".pointlabels").attr("visibility", "hidden");
    }
}

function toggleLasso() {
    console.log("can't be done!")
}
