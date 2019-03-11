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
            //    .on("click", stopped, true);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", w)
        .attr("height", h)
        // .on("click", reset);

    var scale  = 220;
    var offset = [w/8.5, h/2.5];
    var projection = d3.geoMercator()
                       .scale(scale)
                       .translate(offset);

    var path = d3.geoPath()
             .projection(projection);


    svg.selectAll("path")

        .data(data.filter(function(d){
                return d.properties.dac_category_name == "total";})
                  .filter(function(d){
                    return d.properties.fiscal_year == 2018;}))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "boundary")
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

        .on("mouseover", function(d){
            // Function for creating points
            function update() {
              var s = svg.selectAll("circle")
                  .attr("id", "temp_circle")
                  .data(dataset2.filter(function(b){
                          console.log(b.EVENT_ID_CNTY.substring(0,3))
                          return b.EVENT_ID_CNTY.substring(0,3) == d.properties.ADM0_A3;}))

                  s.enter()
                      .append("circle")
                      .attr("cx", function(d) {
                      return projection_temp([d.LONGITUDE, d.LATITUDE])[0];
                      })
                      .attr("cy", function(d) {
                      return projection_temp([d.LONGITUDE, d.LATITUDE])[1];
                      })
                      .attr("r", 3)
                      .style("fill", "yellow")
                      .style("opacity", 0.75)

                    s.exit().remove();
                };

            // Section for creating the country outline
            if ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 80) || (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 80)){temp =  1.5} else if ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 30) || (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 30)) {temp = 3} else  {temp = 7}

            var center_ = d3.geoCentroid(d)
            var projection_temp = d3.geoMercator()
                               .scale(scale*temp)
                               .center(center_)
                               .translate([(w/2)-80,h/2+30])
                               ;
            var path_temp = d3.geoPath().projection(projection_temp);

            d3.select(this)
                .style("fill","#FFCC66")
                .attr("d", path_temp)

            // Update circles
            update();
            })


        .on("mouseout", function(d){
            d3.select("#temp_circle").remove();
            var value = d.properties.funding;
            if(value){
            d3.select(this).style("fill",color(value))
                            .attr("d", path)
            } else {
            d3.select(this).style("fill","ccc")}
            ;
        })


    // General characteristics
    const title = svg.selectAll('.title')
                    .data([{label: 'Total aid received'}]);
    title.enter()
            .append('text')
            .attr('class', 'title')
            .attr('x', d => x_scale_ax(.4))
            .attr('y', d => y_scale_ax(.03))
            .attr('font-size', 25)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .text(d => d.label);

    const subtitle = svg.selectAll('.subtitle').data([{label: 'Agregate amount of aid received from the United States'}]);

    subtitle.enter()
            .append('text')
            .attr('class', 'subt')
            .attr('x', d => x_scale_ax(.4))
            .attr('y', d => y_scale_ax(.055))
            .attr('text-anchor', 'middle')
            .attr('font-size', 17)
            .attr('font-family', 'sans-serif')
            .text(d => d.label);

    const caption = svg.selectAll('.subtitle').data([{label: 'Source: USAID dataset available at https://explorer.usaid.gov/'}]);
    caption.enter()
            .append('text')
            .attr('class', 'title')
            .attr('x', d => x_scale_ax(.5))
            .attr('y', d => y_scale_ax(.9))
            .attr('text-anchor', 'middle')
            .attr('font-size', 12)
            .attr('font-family', 'sans-serif')
            .text(d => d.label);

    const caption2 = svg.selectAll('.subtitle').data([{label: ' &  ACLED dataset available at https://www.prio.org/Data/Armed-Conflict/'}]);

    caption2.enter()
            .append('text')
            .attr('class', 'title')
            .attr('x', d => x_scale_ax(.5))
            .attr('y', d => y_scale_ax(.95))
            .attr('text-anchor', 'middle')
            .attr('font-size', 12)
            .attr('font-family', 'sans-serif')
            .text(d => d.label);


/// ADDING POINTS: This is also a test just with a subsample of 600 points, corresponding to the specific type: Violence against civilians.



    // function points(data2){
    //     svg.selectAll("circle")
    //     .data(data2.filter(function(b){
    //         console.log(b)
    //             return b.EVENT_ID_CNTY == d.properties.ADM0_A3;})
    //     .enter()
    //     .append("circle")
    //     .attr("cx", function(d) {
    //     return projection([d.LONGITUDE, d.LATITUDE])[0];
    //     })
    //     .attr("cy", function(d) {
    //     return projection([d.LONGITUDE, d.LATITUDE])[1];
    //     })
    //     .attr("r", 3)
    //     .style("fill", "yellow")
    //     .style("opacity", 0.75)}
    //
    //     .on("mouseover", function(d){
    //         d3.select(this)
    //         .style("fill","#88D9D6")
    //
    //     var xPosition = projection([d.LONGITUDE, d.LATITUDE])[0];
    //     var yPosition = projection([d.LONGITUDE, d.LATITUDE])[1];
    //     svg.append("text")
    //     .attr("id", "tooltip")
    //     .attr("x", xPosition)
    //     .attr("y", yPosition)
    //     .attr("text-anchor", "middle")
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", "11px")
    //     .attr("font-weight", "bold")
    //     .attr("fill", "black")
    //     .text(d.FATALITIES);
    //
    //         })
    //
    //
    //     .on("mouseout", function(d){
    //         d3.select(this)
    //         .style("fill","yellow")
    //         d3.select("#tooltip").remove();
    //     });
    //
    //   }
    //
    // svg.append('circle')
    //           .attr('cx', x_scale_ax(.1))
    //           .attr('cy', y_scale_ax(.72))
    //           .attr('r', 8)
    //           .attr('fill', "yellow")
    //
    //
    // svg.append('text')
    //           .attr('class', 'label')
    //           .attr('x', d => x_scale_ax(.11))
    //           .attr('y', d => y_scale_ax(.73))
    //           .attr('text-anchor', 'right')
    //           .attr('font-size', 12)
    //           .text(d => ' Violence against civilians');
}
