// Reference for buttons:  https://www.d3-graph-gallery.com/graph/interactivity_button.html
// Reference for sliders https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
// Reference for legends: http://bl.ocks.org/jhubley/17aa30fd98eb0cc7072f
// Reference for gradient legends https://stackoverflow.com/questions/49739119/legend-with-smooth-gradient-and-corresponding-labels
d3.json('data_aggregated.geojson', function(error, data) {
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
      d3.csv('data_points.csv', function(error, data2) {
          //Hand CSV data off to global var,
          //so it's accessible later.
          if (error){
              console.log(error);
          } else {
              dataset2 = data2
              //points(data2);
          }
      });

    const h = 560;
    const w = 1000;
    const m = {top: 50,
            left: 50,
            right: 50,
            bottom: 100};

    const plot_w = w - m.left - m.right;
    const plot_h = h - m.bottom - m.top;

    var color_nevents = d3.scaleLog()
                  .range(["white", "#3F002D"])
                  .domain([d3.min(dataset, function(d) {
                      if (d.properties.tot_n_events!== 'NA')
                      {return d.properties.tot_n_events};}),

                  d3.max(dataset, function(d) {
                      if (d.properties.tot_n_events!== 'NA')
                      {return d.properties.tot_n_events};})
                           ]);
   var color_ndeaths = d3.scaleLog()
                 .range(["white", "#3F002D"])
                 .domain([d3.min(dataset, function(d) {
                     if ((d.properties.tot_n_fatalities!== 'NA') && (d.properties.tot_n_fatalities!== 0))
                     {return d.properties.tot_n_fatalities};}),

                 d3.max(dataset, function(d) {
                     if ((d.properties.tot_n_fatalities!== 'NA') && (d.properties.tot_n_fatalities!== 0))
                     {return d.properties.tot_n_fatalities};})
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

    d3.select("h2").text("Click on a country");

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
                                    .translate([(w/2)-20,h/2+30])
                                                        ;
        var path_temp = d3.geoPath().projection(projection_temp);

        //Plotting new path
        var new_p = svg.selectAll("path#large_country")
                        .remove()
                        .data(data.filter(function(country){
                               return country.properties.COUNTRY == c;}));

            new_p.exit().remove();

            new_p.enter()
               .append("path")
               .attr("d", path_temp)
               .style("fill",' #808080'	)
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
                .text(function() {return c})
        }
    function update_points(data, temp, centroid, c, type_conf) {
            // Make new projection with scaling

            var projection_temp = d3.geoMercator()
                                    .scale(scale*temp)
                                    .center(centroid)
                                    .translate([(w/2)-20,h/2+30])
                                    ;
            var path_temp = d3.geoPath()
                            .projection(projection_temp);

            var points = svg.selectAll("circle")
                    .exit().remove()
                    .data(dataset2.filter(function(b){
                                return b.COUNTRY == c;})
                                    .filter(function(d){
                                if(type_conf === 'All'){return d}
                                else{ return d.EVENT_TYPE === type_conf;}}))
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
                       if (b.EVENT_TYPE === "Battle")
                       {return "#990033"}
                       else if (b.EVENT_TYPE === "Riots/Protests")
                       {return "#e4a199"}
                       else if (b.EVENT_TYPE === "Remote violence")
                       {return "#88D9D6"}
                       else if (b.EVENT_TYPE === "Violence against civilians") {return "#88b4d9"}
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
                       .attr('fill', '#FFFFE0')
                       .attr('pointer-events', 'none');

                    // Number of deaths - text
                    svg.append("text")
                       .attr("id", "tooltip_small")
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

                    d3.selectAll('#legend1').append("text")
                        .attr("id", "actor_1")
                       .attr("text-anchor", "right")
                       .attr("x", projection_temp(centroid)[1] -200)
                       .attr("y", projection_temp(centroid)[2] - 200)
                       .attr("font-family", "Calibri")
                       .attr("font-size", "13px")
                       .attr("font-weight", "normal")
                       .attr("fill", "black")
                       .text('\n Actors involved: '.concat(point.ACTOR1).concat(' vs. ').concat(point.ACTOR2))

                   })

                .on("mouseout", function(point){
                    // Return to original color
                    d3.select(this)
                        .style("fill", function(b){
                            if (b.EVENT_TYPE.substr(0,6) === "Battle")
                            {return "#990033"}
                            else if (b.EVENT_TYPE === "Riots/Protests")
                            {return "#e4a199"}
                            else if (b.EVENT_TYPE === "Remote violence")
                            {return "#88D9D6"}
                            else if (b.EVENT_TYPE === "Violence against civilians") {return "#88b4d9"}
                     })
                    // Remove tooltips
                    d3.select("#tooltip_small").remove();
                    d3.select("#tooltip_rect").remove();
                    d3.select("#tooltip_rect_actors").remove();
                    d3.select("#tooltip_2").remove();
                    d3.select("#tooltip_3").remove();
                    d3.select("#actor_1").remove();
                    d3.select("#actor_2").remove();

                       });


        var legend = svg.selectAll("text")
            .exit().remove()
            .data(["Battle",
                    "Riots/Protests",
                    "Remote violence",
                    "Violence against civilians"])
                    ;

            legend.enter().append("text")
                              .attr("x", 15)
                              .attr("y", function(b,i){return  ((10 + i * 15) +300);})
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
                  .attr("x", 0)
                  .attr("y", function (b, i) { return (0 +i*15) + 300
                      ; })  // spacing
                  .attr("fill",function(b,i) {
                      if (b === "Battle")
                      {return "#990033"}
                      else if (b === "Riots/Protests")
                      {return "#e4a199"}
                      else if (b === "Remote violence")
                      {return "#88D9D6"}
                      else if (b === "Violence against civilians") {return "#88b4d9"}
                  })
                  .attr("id", "legendcheckbox")
                  .on("click", function(d){
                        var type_conf = d
                        var type = type_conf.substr(0, 3)
                        d3.select(this).attr("fill", function(b){
                            if (d3.select(this).attr("fill")  == "#ccc"){

                            // By completely upadting the points instead of changing the transparency/color, the user can get the 'latest' selected point to be on top of the others, which helps overcome to a point occlussion.
                                update_points(data, temp, centroid, c, type_conf)

                                if (b === "Battle") {return "#990033"}
                                else if (b === "Riots/Protests")
                                {return "#e4a199"}
                                else if (b === "Remote violence")
                                {return "#88D9D6"}
                                else if (b === "Violence against civilians") {return "#88b4d9"}
                                }
                                else {
                                d3.selectAll('circle#' + type).remove();
                                return "#ccc";
                            }
                                })
                    })

            svg.append("text")
                              .attr("x", 0)
                              .attr("y", 390)
                              .style("fill", "#777" )
                              .attr("text-anchor", "right")
                              .attr("font-family", "Calibri")
                              .attr("id", "temp")
                              .attr("font-size", "12px")
                              .attr("font-weight", "light")
                              .text('Click on the checkboxes to filter events!')




        }
    var background = svg.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("d", path)
            .attr('stroke', 'white')
            .style("fill", function(d){
                    return "lightgray"})

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
                           d3.select("#tooltip_country").remove()
                                   })
            .on('click', function(d) {

                // Get scale for new map according to size of the country
                if ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 100)
                || (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 100)) {temp =  2}
                else if ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 60) || (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 60)) {temp = 3}
                else if ((Math.abs(path.bounds(d)[1][0] - path.bounds(d)[0][0]) > 30) || (Math.abs(path.bounds(d)[1][1] - path.bounds(d)[0][1]) > 30)) {temp = 6}
                else {temp = 11}

                // Get name of the country clicked on
                var country_name = d.properties.COUNTRY

                // Get centroid of country to center
                var centroid = d3.geoCentroid(d)

                // Reset existing variables
                d3.selectAll("#click").remove();
                d3.select("h2").text("");
                svg.selectAll("#large_country").remove();
                svg.selectAll("#tooltip_small").remove();
                svg.selectAll("#temp").remove();
                // svg.selectAll("#tooltip_3").remove();
                d3.selectAll("circle").remove();

                d3.selectAll("#Bat").exit().remove();
                d3.selectAll("#Rio").exit().remove();
                d3.selectAll("#Rem").exit().remove();
                d3.selectAll("#Vio").exit().remove();
                d3.selectAll("#legendcheckbox").exit().remove();

                // Update map with new scale and center
                update_path(data, d, temp, centroid, country_name);
                // Update points with new scale and center
                update_points(data, temp, centroid, country_name, 'All')

                // Update header
                update_text_header(data,d, country_name)


            });

        var fill_by_thrsh = function(number){
            d3.selectAll('.legendgroup').remove()
            slider.property("value", number);
		    d3.select(".number").text(number);
                  background.transition()
                          .style("fill", function(d){
                                value = d.properties.tot_n_fatalities
                                if (value == "NA"){
                                    return "lightgray"}

                                else if (value >  number) {
                                    return "#993333"} else
                                    {return "lightgray"}}
                            )
                  background.on("mouseover", function(country){
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
                              .style("fill", function(d){
                                    value = d.properties.tot_n_fatalities
                                    if (value == "NA"){
                                        return "lightgray"}

                                    else if (value > number) {
                                        return "#993333"} else
                                        {return "lightgray"}}
                                )
                              d3.select("#tooltip_country").remove()
                              })
                      }
function changeColor() {
  var type_of_fill=d3.select('input[name="fillButton"]:checked').node().value;

  if (type_of_fill == 'n_events'){
      d3.selectAll('.legendgroup').remove()

      background.transition()
                .style("fill", function(d){
                          value = d.properties.tot_n_events
                          if (value !== "NA"){
                              return color_nevents(value)}
                          else{return "lightgray"}

                      });

     background.on("mouseover", function(country){
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
                      .style("fill", function(d){
                                value = d.properties.tot_n_events
                                if (value !== "NA"){
                                    return color_nevents(value)}
                                else{return "lightgray"}})
                    d3.select("#tooltip_country").remove()
                            })
    var svgLegend = d3.select('.grad_legend').append('svg')
            .attr('class', 'legendgroup')
            .attr("width",600);
    var defs = svgLegend.append('defs');

    var linearGradient = defs.append('linearGradient')
            .attr('id', 'linear-gradient');
    linearGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    // append multiple color stops by using D3's data/enter step
    linearGradient.selectAll("stop")
      .data([
        {offset: "0%", color: "white"},
        {offset: "100%", color: "#3F002D"}
      ])
      .enter().append("stop")
      .attr("offset", function(d) {
        return d.offset;
      })
      .attr("stop-color", function(d) {
        return d.color;
      });

    // append title
    svgLegend.append("text")
      .attr("class", "legendTitle")
      .attr("x", 0)
      .attr("y", 30)
      .style("text-anchor", "left")
      .text("Gradient scale - by number of events");

    // draw the rectangle and fill with gradient
    svgLegend.append("rect")
      .attr("x", 10)
      .attr("y", 0)
      .attr("width", 400)
      .attr("height", 10)
      .attr("class", "legendTitle")
      .style("fill", "url(#linear-gradient)");


    svgLegend.append("text")
        .attr("class", "legendTitle")
        .attr("x", 0)
        .attr("y", 10)
        .style("text-anchor", "left")
        .text(function(){
            return d3.min(dataset, function(d) {
                if (d.properties.tot_n_events!== 'NA')
                {return d.properties.tot_n_events};})
        });
    svgLegend.append("text")
            .attr("class", "legendTitle")
            .attr("x", 410)
            .attr("y", 10)
            .style("text-anchor", "left")
            .text(function(){
                return d3.max(dataset, function(d) {
                    if (d.properties.tot_n_events!== 'NA')
                    {return d.properties.tot_n_events};})
            });

  } else if (type_of_fill == 'n_deaths'){
        d3.selectAll('.legendgroup').remove()

        background.transition()
                .style("fill", function(d){
                      value = d.properties.tot_n_fatalities
                      if (value == "NA"){
                          return "lightgray"}
                      else if (value == '0') {
                          return "lightgray"}
                      else {return color_ndeaths(value)}
                  })
        background.on("mouseover", function(country){
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
                        .style("fill", function(d){
                              value = d.properties.tot_n_fatalities
                              if (value == "NA"){
                                  return "lightgray"}
                              else if (value == '0') {
                                  return "lightgray"}
                              else {return color_ndeaths(value)}
                          })
                    d3.select("#tooltip_country").remove()
                    })


                    var svgLegend = d3.select('.grad_legend').append('svg')
                            .attr('class', 'legendgroup')
                            .attr("width",600);
                    var defs = svgLegend.append('defs');

                    var linearGradient = defs.append('linearGradient')
                            .attr('id', 'linear-gradient');
                    linearGradient
                      .attr("x1", "0%")
                      .attr("y1", "0%")
                      .attr("x2", "100%")
                      .attr("y2", "0%");

                    // append multiple color stops by using D3's data/enter step
                    linearGradient.selectAll("stop")
                      .data([
                        {offset: "0%", color: "white"},
                        {offset: "100%", color: "#3F002D"}
                      ])
                      .enter().append("stop")
                      .attr("offset", function(d) {
                        return d.offset;
                      })
                      .attr("stop-color", function(d) {
                        return d.color;
                      });

                    // append title
                    svgLegend.append("text")
                      .attr("class", "legendTitle")
                      .attr("x", 0)
                      .attr("y", 30)
                      .style("text-anchor", "left")
                      .text("Gradient scale - by number of events");

                    // draw the rectangle and fill with gradient
                    svgLegend.append("rect")
                      .attr("x", 10)
                      .attr("y", 0)
                      .attr("width", 400)
                      .attr("height", 10)
                      .attr("class", "legendTitle")
                      .style("fill", "url(#linear-gradient)");


                    svgLegend.append("text")
                        .attr("class", "legendTitle")
                        .attr("x", 0)
                        .attr("y", 10)
                        .style("text-anchor", "left")
                        .text(function(){
                            return d3.min(dataset, function(d) {
                                if (d.properties.tot_n_fatalities!== 'NA')
                                {return d.properties.tot_n_fatalities};})
                        });
                    svgLegend.append("text")
                            .attr("class", "legendTitle")
                            .attr("x", 410)
                            .attr("y", 10)
                            .style("text-anchor", "left")
                            .text(function(){
                                return d3.max(dataset, function(d) {
                                    if (d.properties.tot_n_fatalities!== 'NA')
                                    {return d.properties.tot_n_fatalities};})

                });


    } else if (type_of_fill == 'n_deaths_100'){
                fill_by_thrsh('100')

            }

            }

    //Event listener
    d3.select("#fillButton").on("change", changeColor)
    // Create legends

    var slider = d3.select(".slider")
    		.append("input")
    			.attr("type", "range")
    			.attr("min", 0)
    			.attr("max", 3000)
    			.attr("step", 150)
    			.on("input", function() {
                    d3.selectAll('.legendTitle').remove();
    				var val = this.value;
    				fill_by_thrsh(val.toString());
    			});

// Code for legends referenced: https://stackoverflow.com/questions/49739119/legend-with-smooth-gradient-and-corresponding-labels



}




// tooltip
// scales
// boton de ver solo con mas de una muerte
// slider de anios
