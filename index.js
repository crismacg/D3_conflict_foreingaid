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
             .data(data)
             .enter()
             .append("path")
             .attr("d", path)
             .attr("class", "boundary")
             .style("fill", "#ccc")

    svg.selectAll("path")
        .data(data.filter(function(d){
                return d.properties.dac_category_name == "NA";})
                 .filter(function(d){
                    return d.properties.fiscal_year == "NA";}))
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "boundary")
        .style("fill", "#ccc")
    //This filtering is to create a first static graph
        .data(data.filter(function(d){
                return d.properties.dac_category_name == "total";})
                  .filter(function(d){
                    return d.properties.fiscal_year == 2003;}))
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

    // The mouseover will be replaced by a Clicking mechanisms that allows to zoom in onto a country.

        .on("mouseover", function(d){
            d3.select(this)
            .style("fill","orange")})

        .on("mouseout", function(d){
            var value = d.properties.funding;
            if(value){
            d3.select(this).style("fill",color(value))
            } else {
            d3.select(this).style("fill","ccc")}
        })

    const title = svg.selectAll('.title')
                    .data([{label: 'Total aid received'}]);
    title.enter()
            .append('text')
            .attr('class', 'title')
            .attr('x', d => x_scale_ax(.4))
            .attr('y', d => y_scale_ax(.07))
            .attr('font-size', 25)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .text(d => d.label);

    const subtitle = svg.selectAll('.subtitle').data([{label: 'Agregate amount of aid received from the United States'}]);

    subtitle.enter()
            .append('text')
            .attr('class', 'subt')
            .attr('x', d => x_scale_ax(.4))
            .attr('y', d => y_scale_ax(.095))
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

    d3.csv('sample_data.csv', function(error, data2) {
          //Hand CSV data off to global var,
          //so it's accessible later.
          if (error){
              console.log(error);
          } else {
              dataset2 = data2
              points(data2);
          }
      });


      function points(data){
        svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
        return projection([d.LONGITUDE, d.LATITUDE])[0];
        })
        .attr("cy", function(d) {
        return projection([d.LONGITUDE, d.LATITUDE])[1];
        })
        .attr("r", 3)
        .style("fill", "yellow")
        .style("opacity", 0.75)
        .on("mouseover", function(d){
            d3.select(this)
            .style("fill","#88D9D6")
            })

        .on("mouseout", function(d){
            d3.select(this)
            .style("fill","yellow")});

      }

    svg.append('circle')
              .attr('cx', x_scale_ax(.1))
              .attr('cy', y_scale_ax(.72))
              .attr('r', 8)
              .attr('fill', "yellow")


    svg.append('text')
              .attr('class', 'label')
              .attr('x', d => x_scale_ax(.11))
              .attr('y', d => y_scale_ax(.73))
              .attr('text-anchor', 'right')
              .attr('font-size', 12)
              .text(d => ' Violence against civilians');
// REFERENCE CODE FOR ZOOMING IN THE FUTURE - REFERENCE: https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
// const countries = ["FJI", "TZA", "SAH", "CAN", "USA", "KAZ", "UZB", "PNG", "IDN", "ARG", "CHL", "COD", "SOM", "KEN", "SDN", "TCD", "HTI", "DOM", "RUS", "BHS", "FLK", "NOR", "GRL", "ATF", "TLS", "ZAF", "LSO", "MEX", "URY", "BRA", "BOL", "PER", "COL", "PAN", "CRI", "NIC", "HND", "SLV", "GTM", "BLZ", "VEN", "GUY", "SUR", "FRA", "ECU", "PRI", "JAM", "CUB", "ZWE", "BWA", "NAM", "SEN", "MLI", "MRT", "BEN", "NER", "NGA", "CMR", "TGO", "GHA", "CIV", "GIN", "GNB", "LBR", "SLE", "BFA", "CAF", "COG", "GAB", "GNQ", "ZMB", "MWI", "MOZ", "SWZ", "AGO", "BDI", "ISR", "LBN", "MDG", "PSX", "GMB", "TUN", "DZA", "JOR", "ARE", "QAT", "KWT", "IRQ", "OMN", "VUT", "KHM", "THA", "LAO", "MMR", "VNM", "PRK", "KOR", "MNG", "IND", "BGD", "BTN", "NPL", "PAK", "AFG", "TJK", "KGZ", "TKM", "IRN", "SYR", "ARM", "SWE", "BLR", "UKR", "POL", "AUT", "HUN", "MDA", "ROU", "LTU", "LVA", "EST", "DEU", "BGR", "GRC", "TUR", "ALB", "HRV", "CHE", "LUX", "BEL", "NLD", "PRT", "ESP", "IRL", "NCL", "SLB", "NZL", "AUS", "LKA", "CHN", "TWN", "ITA", "DNK", "GBR", "ISL", "AZE", "GEO", "PHL", "MYS", "BRN", "SVN", "FIN", "SVK", "CZE", "ERI", "JPN", "PRY", "YEM", "SAU", "ATA", "CYN", "CYP", "MAR", "EGY", "LBY", "ETH", "DJI", "SOL", "UGA", "RWA", "BIH", "MKD", "SRB", "MNE", "KOS", "TTO", "SDS"]
//     var zooming = function(d) {
//         projection.translate(offset).scale(500);
//         svg.selectAll("path")
//         .attr("d", path);
//         }
//
//     var zoom = d3.zoom()
//                 .scaleExtent([1, 8])
//                 .on("zoom", zooming);
//     svg.append("path")
//           .datum(countries, function(a, b) { return a !== b; })
//           .attr("class", "mesh")
//           .attr("d", path);
//
//
//     function clicked(d) {
//         if (active.node() === this) return reset();
//         active.classed("active", false);
//         active = d3.select(this).classed("active", true);
//
//         var bounds = path.bounds(d),
//             dx = bounds[1][0] - bounds[0][0],
//             dy = bounds[1][1] - bounds[0][1],
//             x = (bounds[0][0] + bounds[1][0]) / 2,
//             y = (bounds[0][1] + bounds[1][1]) / 2,
//             scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / w, dy / h))),
//             translate = [w / 2 - scale * x, h / 2 - scale * y];
//
//         svg.transition()
//             .duration(750)
//             .call(zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );
//       }
//
//     function reset() {
//         active.classed("active", false);
//         active = d3.select(null);
//
//         svg.transition()
//             .duration(750)
//             .call( zoom.transform, d3.zoomIdentity );
//       }
//
//     function zoomed() {
//         g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
//         g.attr("transform", d3.event.transform); // updated for d3 v4
//       }
//       function stopped() {
//         if (d3.event.defaultPrevented) d3.event.stopPropagation();
//       }
}
