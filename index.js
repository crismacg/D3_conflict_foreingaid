// import {geoPath, geoCylindricalStereographic} from 'd3-geo';
// import {select} from 'd3-selection';
// import {interpolateInferno} from 'd3-scale-chromatic';
// import {scaleLinear} from 'd3-scale';

d3.json('foreign_aid.geojson', function(error, data) {
      //Hand CSV data off to global var,
      //so it's accessible later.
      if (error){
          console.log(error);
      } else {
          dataset = data.features
          myVis(data.features);
      }
  });


  function myVis(data) {
      d3.csv('sample_data_v3.csv', function(error, data2) {
          //Hand CSV data off to global var,
          //so it's accessible later.
          if (error){
              console.log(error);
          } else {
              dataset2 = data2
              //points(data2);
          }
      });
    console.log(data);
    console.log('hi!')


    const h = 560;
    const w = 1000;
    const m = {top: 50,
            left: 50,
            right: 50,
            bottom: 100};

    const plot_w = w - m.left - m.right;
    const plot_h = h - m.bottom - m.top;
    const min_date = d3.min(data, function(d) {
                return d.properties.fiscal_year;})
    const max_date = d3.max(data, function(d) {
                return d.properties.fiscal_year;})

    var color = d3.scaleLinear()
                  .range(["#ead3d7", "#e4a199"])
                  .domain([d3.min(data, function(d) {
                                return d.properties.funding;}),
                           d3.max(data, function(d) {
                                return d.properties.funding;})
                           ]);

    var color2 = d3.scaleOrdinal().range(["#009999","#990033","#FF9966","#88D9D6"]);

    var x_scale_ax = d3.scaleLinear()
                       .domain([1,0])
                       .range([plot_w, m.left])

                       ;
    var y_scale_ax = d3.scaleLinear()
                       .domain([1,0])
                       .range([h, 0 ])
                       ;

    var svg = d3.select('.first')
                .append('svg')
                .attr('width', w)
                .attr('height', h)

    d3.select("h2").text("Click over a country");

    var scale  = 290;
    var offset = [w/9, h/2.5];
    var projection = d3.geoMercator()
                       .scale(scale)
                       .translate(offset);

    var path = d3.geoPath()
             .projection(projection);

    function update_path(data, d, temp, centroid, c) {
        d3.select('#large_country').remove();

        var center_ = d3.geoCentroid(d)
        var projection_temp = d3.geoMercator()
                                    .scale(scale*temp)
                                    .center(centroid)
                                    .translate([(w/2)-60,h/2+30])
                                                        ;
        var path_temp = d3.geoPath().projection(projection_temp);

        //Plotting new path
        var new_p = svg.selectAll("path#large_country")
                        .remove()
                        .data(data.filter(function(country){
                               return country.properties.ADM0_A3 == c;}))

            new_p.enter()
               .append("path")
               .transition()
               .attr("d", path_temp)
               .style("fill", '#A9A9A9')
               .attr("id",'large_country')
           }

    function update_text_header(data,d, c){

        d3.select('h2')
                .append("text")
                .attr("text-anchor", "left")
                .attr("font-family", "Calibri")
                .attr("font-size", "13px")
                .attr("font-weight", "light")
                .attr("fill", "#929292")
                .attr('pointer-events', 'none')
                .text(function() {
                    return c
                })

        }
    function update_points(data, temp, centroid, c, type_conf) {
            // Make new projection with scaling

            var projection_temp = d3.geoMercator()
                                    .scale(scale*temp)
                                    .center(centroid)
                                    .translate([(w/2)-60,h/2+30])
                                    ;
            var path_temp = d3.geoPath().projection(projection_temp);

            svg.selectAll("circle")
                    .exit()
                    .data(dataset2.filter(function(b){
                    return b.EVENT_ID_CNTY.substring(0,3) == c;}).filter(function(d){
                                    if(type_conf === 'All'){
                                        return d
                                    } else{
                                    return d.EVENT_TYPE === type_conf;}}))
                   .enter()
                   .append("circle")
                   .attr("id", function(d){
                        return d.EVENT_TYPE.substr(0,3)})
                   .attr("cx", function(d) {
                       return projection_temp([d.LONGITUDE, d.LATITUDE])[0];
                   })
                   .attr("cy", function(d) {
                       return projection_temp([d.LONGITUDE, d.LATITUDE])[1];
                   })
                   .attr("r", 5)
                   .style("fill", function(b){
                        return color2(b.EVENT_TYPE)
                    })
                   .style("opacity", 0.75)

                .on("mouseover", function(point){
                   // Coordinates used to position text
                    var xPosition = projection_temp([point.LONGITUDE, point.LATITUDE])[0];
                    var yPosition = projection_temp([point.LONGITUDE, point.LATITUDE])[1];
                    d3.select(this)
                       .style("fill","red")

                    // Background for text
                    svg.append('rect')
                       .attr("id", "tooltip_rect")
                       .attr("x", xPosition -50)
                       .attr("y", yPosition)
                       .attr('width', 100)
                       .attr('height', 20)
                       .style("opacity", .8)
                       .attr('fill', 'lightsteelblue')
                       .attr('pointer-events', 'none');

                    // Number of deaths - text
                    svg.append("text")
                       .attr("id", "tooltip")
                       .attr("x", xPosition)
                       .attr("y", yPosition + 13)
                       .attr("text-anchor", "middle")
                       .attr("font-family", "Calibri")
                       .attr("font-size", "13px")
                       .attr("font-weight", "normal")
                       .attr("fill", "black")
                       .attr('background-color', 'white')
                       .attr('pointer-events', 'none')
                       .text('Num. fatalities: '.concat(point.FATALITIES))

                    // Background for information
                    svg.append('rect')
                        .attr("id", "tooltip_rect_actors")
                        .attr("x",  x_scale_ax(.55))
                        .attr("y", y_scale_ax(.8) )
                        .attr('width', 400)
                        .attr('height', 40)
                        .style("opacity", .9)
                        .attr('fill', 'lightsteelblue')
                        .attr('pointer-events', 'none')
                        .attr('stroke', 'steelblue');

                    // Text for information
                    svg.append("text")
                       .attr("id", "tooltip_2")
                       .attr("x", x_scale_ax(.55) + 200)
                       .attr("y", y_scale_ax(.8) + 15 )
                       .attr("text-anchor", "middle")
                       .attr("font-family", "Calibri")
                       .attr("font-size", "13px")
                       .attr("font-weight", "normal")
                       .attr("fill", "black")
                       .attr('pointer-events', 'none')
                       .text('Actor involved: '.concat(point.ACTOR1))

                    // Text for information
                    svg.append("text")
                        .attr("id", "tooltip_3")
                        .attr("x",  x_scale_ax(.55) + 200)
                        .attr("y",  y_scale_ax(.8) + 30 )
                        .attr("text-anchor", "middle")
                        .attr("font-family", "Calibri")
                        .attr("font-size", "13px")
                        .attr("font-weight", "normal")
                        .attr("fill", "black")
                        .attr('pointer-events', 'none')
                        .attr('pointer-events', 'none')
                        .text('Second actor involved: '.concat(point.ACTOR2))
                       ;
                   })

                .on("mouseout", function(point){
                    // Return to original color
                    d3.select(this)
                       .style("fill", function(d){
                           return color2(d.EVENT_TYPE)
                      })

                    // Remove tooltips
                    d3.select("#tooltip").remove();
                    d3.select("#tooltip_rect").remove();
                    d3.select("#tooltip_rect_actors").remove();
                    d3.select("#tooltip_2").remove();
                    d3.select("#tooltip_3").remove();

                       });

// Reference code from: http://bl.ocks.org/jhubley/17aa30fd98eb0cc7072f
        var legend = d3.select("#legend")
            .selectAll("text")
            .exit().remove()
            .data(["Battle",
                    "Riots/Protests",
                    "Remote violence",
                    "Violence against civilians"])
                    ;
            legend.enter().append("text")
                              .attr("x", 115)
                              .attr("y", function(b,i){return  (10 + i * 15);})
                              .attr("class", "legend")
                              .style("fill", "#777" )
                              .attr("font-family", "Calibri")
                              .attr("font-size", "13px")
                              .attr("font-weight", "light")
                              .text(function(b){
                                  return b;})

            //checkboxes
            legend.enter().append("rect")
                  .attr("width", 10)
                  .attr("height", 10)
                  .attr("x", 100)
                  .attr("y", function (b, i) { return (0 +i*15); })  // spacing
                  .attr("fill",function(b,i) {
                      return color2(b);
                  })
                  .attr("class", function(d,i){return "legendcheckbox " + d})
                  .on("click", function(d){
                        var type_conf = d
                        var type = type_conf.substr(0, 3)
                        d3.select(this).attr("fill", function(b){
                            if (d3.select(this).attr("fill")  == "#ccc"){

                            // By completely upadting the points instead of changing the transparency/color, the user can get the 'latest' selected point to be on top of the others, which helps overcome to a point occlussion.
                                update_points(data, temp, centroid, c, type_conf)
                                //d3.selectAll('circle#' + type).style("fill", function(b){
                                //     return color2(b.EVENT_TYPE)
                                // })

                                return color2(b);
                                } else {
                                //d3.selectAll('circle#' + type).style('fill', 'transparent')
                                d3.selectAll('circle#' + type).remove();
                                return "#ccc";
                            }
                                })
                    })




        }

    svg.selectAll("path")
        .data(data.filter(function(d){
            return d.properties.fiscal_year == 2018;}))
        .enter()
        .append("path")
        .attr("d", path)
        .attr('stroke', 'white')
        .style("fill", function(d){
            var value = d.properties.funding;
            var type = d.properties.dac_category_name;
            var year = d.properties.fiscal_year;
            if(year == 2018){
                return color(value)
            } else {
                return "#ccc"
            }
        })
        .on("mouseover", function(country){
            // Get country centroid to align text
            country_center = d3.geoCentroid(country)

            // Change color on mouseover
            temp = d3.select(this).style("fill","lightgray")

            // Get coordinates for centering text
            var xPosition = projection([country_center][0])[0];
            var yPosition = projection([country_center][0])[1];

            // Appending text
            svg.append("text")
                .attr("id", "tooltip_country")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("text-anchor", "middle")
                .attr("font-family", "Calibri")
                .attr("font-size", "13px")
                .attr("font-weight", "light")
                .attr("fill", "gray")
                .attr('pointer-events', 'none')
                .text(country.properties.ADM0_A3);
            })

        .on("mouseout", function(country){
            d3.select(this)
               .style('fill', function(d){
                    var value = d.properties.funding;
                    if(value){
                        return color(value)
                    } else {
                        return "#ccc"
                    }})
            d3.select("#tooltip_country").remove()

        })

        .on('click', function(d) {

            // Get scale for new map according to size of the country
            if ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 80)
            || (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 80)) {temp =  2}
            else if ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 30) || (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 30)) {temp = 4}
            else {temp = 11}

            // Get name of the country clicked on
            var country_name = d.properties.ADM0_A3

            // Get centroid of country to center
            var centroid = d3.geoCentroid(d)

            // Reset existing variables
            d3.selectAll("#click").remove();
            d3.select("h2").text("");
            svg.selectAll("#large_country").remove();
            svg.selectAll("#tooltip").remove();
            svg.selectAll("#tooltip_2").remove();
            svg.selectAll("#tooltip_3").remove();
            svg.selectAll("circle").remove();

            // Update map with new scale and center
            update_path(data, d, temp, centroid, country_name);

            // Update points with new scale and center

            update_points(data, temp, centroid, country_name, 'All')

            // Update header
            update_text_header(data,d, country_name)
        });

        // To do:
        // 1. add sliderTime
        // 2. update all with slider
        // 3. remove and update legend
        // 5. add barchart
        // 6. add background


        // var sliderTime = d3
        //         .sliderBottom()
        //         .min(d3.min(data.properties.fiscal_year))
        //         .max(d3.max(data.properties.fiscal_year))
        //         .step(1000 * 60 * 60 * 24 * 365)
        //         .width(300)
        //         .tickFormat(d3.timeFormat('%Y'))
        //         .tickValues(data.properties.fiscal_year)
        //         .default(new Date(2018))
        //         .on('onchange', val => {
        //           d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
        //         });
        //
        // var gTime = d3
        //     .select('div#slider-time')
        //     .append('svg')
        //     .attr('width', 500)
        //     .attr('height', 100)
        //     .append('g')
        //     .attr('transform', 'translate(30,30)');
        //
        // gTime.call(sliderTime);
        //
        // d3.select('p#value-time')
        //   .text(d3.timeFormat('%Y')(sliderTime.value()));


}
