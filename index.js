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
      d3.csv('sample_data.csv', function(error, data2) {
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
    var active = d3.select(null);

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

    function update_path(data, d) {
        d3.select('#large_country').remove();
        //Country characteristics
        var country_name = d.properties.ADM0_A3

       //Characteristics for scaling projection
       if  ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 80)
           ||
            (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 80))
           {temp =  2} else if
           ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 30)
           ||
            (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 30))
           {temp = 4} else
           {temp = 11}

               // Make new projection with scaling
        var center_ = d3.geoCentroid(d)
        var projection_temp = d3.geoMercator()
                                    .scale(scale*temp)
                                    .center(center_)
                                    .translate([(w/2)-60,h/2+30])
                                    ;
        var path_temp = d3.geoPath().projection(projection_temp);

        //Plotting new path
        var new_p = svg.selectAll("path#large_country")
                        .remove()
                        .data(data.filter(function(country){
                               return country.properties.ADM0_A3 == country_name;}))

            new_p.enter()
               .append("path")
               .transition()
               .attr("d", path_temp)
               .style("fill", '#A9A9A9')
               .attr("id",'large_country')
           }

    function update_text_header(data,d){
        var country_name = d.properties.ADM0_A3
        d3.select('h2')
                .append("text")
                .attr("text-anchor", "left")
                .attr("font-family", "Calibri")
                .attr("font-size", "13px")
                .attr("font-weight", "light")
                .attr("fill", "#929292")
                .attr('pointer-events', 'none')
                .text(function() {
                    return country_name
                })

        }
    function update_points(data,d) {
        d3.select("#tooltip").remove();

        if  ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 80)
            ||
             (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 80))
            {temp =  2} else if
            ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 30)
            ||
             (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 30))
            {temp = 4} else
            {temp = 11}

        // Make new projection with scaling
        var center_ = d3.geoCentroid(d)
        var projection_temp = d3.geoMercator()
                                .scale(scale*temp)
                                .center(center_)
                                .translate([(w/2)-80,h/2+30])
                                ;
        var path_temp = d3.geoPath().projection(projection_temp);

        svg.selectAll("circle")
                   .attr("id", "temp_circle")
                   .data(dataset2.filter(function(b){
                   return b.EVENT_ID_CNTY.substring(0,3) == d.properties.ADM0_A3;}))
                   .enter()
                   .append("circle")
                   .attr("cx", function(d) {
                       return projection_temp([d.LONGITUDE, d.LATITUDE])[0];
                   })
                   .attr("cy", function(d) {
                       return projection_temp([d.LONGITUDE, d.LATITUDE])[1];
                   })
                   .attr("r", 5)
                   .style("fill", "#3F002D")
                   .style("opacity", 0.75)

            .on("mouseover", function(point){

               var xPosition = projection_temp([point.LONGITUDE, point.LATITUDE])[0];
               var yPosition = projection_temp([point.LONGITUDE, point.LATITUDE])[1];
               d3.select(this)
                   .style("fill","red")

               svg.append('rect')
                   .attr("id", "tooltip_rect")
                   .attr("x", xPosition -50)
                   .attr("y", yPosition)
                   .attr('width', 100)
                   .attr('height', 20)
                   .style("opacity", .8)
                   .attr('fill', 'lightsteelblue')
                   .attr('pointer-events', 'none');

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
                d3.select(this).style("fill","#3F002D")
                d3.select("#tooltip").remove();
                d3.select("#tooltip_rect").remove();
                d3.select("#tooltip_rect_actors").remove();
                d3.select("#tooltip_2").remove()
                d3.select("#tooltip_3").remove();
                   });
             }


    svg.selectAll("path")

        .data(data.filter(function(d){
                return d.properties.dac_category_name == "total";})
        .filter(function(d){
                return d.properties.fiscal_year == 2018;}))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "boundary")
        .attr('stroke', 'white')
        .style("fill", function(d){
            var value = d.properties.funding;
            var type = d.properties.dac_category_name;
            var year = d.properties.fiscal_year;
            if(value){
                return color(value)
            } else {
                return "#ccc"
            }
        })
        .on("mouseover", function(country){
            country_center = d3.geoCentroid(country)
            temp = d3.select(this)
                .style("fill","lightgray")

                var xPosition = projection([country_center][0])[0];
                var yPosition = projection([country_center][0])[1];

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
                    .text(country.properties.ADM0_A3)
                ;
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
            svg.selectAll("#large_country").remove()
            svg.selectAll("#tooltip").remove()
            svg.selectAll("#tooltip_2").remove()
            svg.selectAll("#tooltip_3").remove()

            svg.selectAll("circle").remove()
            d3.select("h2").text("");
            update_path(data, d);
            update_points(data, d)
            update_text_header(data,d)
        });


        var conflict_types = ["Battle", "Riots/Protests", "Remote violence", "Violence against civilians"]

        var dropdownChange = function() {
            console.log(d3.select(this))
            var type_conf = d3.select(this).property('EVENT_TYPE')

            dataset2 = dataset2.filter(function(tc){
                   return tc.EVENT_TYPE == type_conf;})
            console.log(dataset2)
                };

        var dropdown = d3.select("#vis-container")
                .insert("select", "svg")
                .on("change", dropdownChange);

            dropdown.selectAll("option")
                .data(conflict_types)
              .enter().append("option")
                .attr("value", function (d) { return d; })
                .text(function (d) {
                    return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
                            });

}




// d3.select("#timeslide").on("input", function() {
//     update(+this.value);
// });
//
// function update(value) {
//     document.getElementById("range").innerHTML=month[value];
//     inputValue = month[value];
//     d3.selectAll(".incident")
//         .attr("fill", dateMatch);
// }
//
// function dateMatch(data, value) {
//     var d = new Date(data.properties.OPEN_DT);
//     var m = month[d.getMonth()];
//     if (inputValue == m) {
//         this.parentElement.appendChild(this);
//         return "red";
//     } else {
//         return "#999";
//     };
// }
//
// rodents.selectAll( "path" )
//     .data( rodents_json.features )
//     .enter()
//     .append( "path" )
//     .attr("fill", initialDate)
//     .attr("stroke", "#ccc")
//     .attr("d", geoPath)
//     .attr("class","incident")
//     .on("mouseover", function(d){
//         d3.select("h2").text(d.properties.LOCATION_STREET_NAME);
//         d3.select(this).attr("class","incident hover");
//     })
//     .on("mouseout", function(d){
//         d3.select("h2").text("");
//         d3.select(this).attr("class","incident");
//     });
