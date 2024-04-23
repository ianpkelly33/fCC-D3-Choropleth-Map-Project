const countyDataset = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const educationDataset = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

Promise.all([d3.json(countyDataset), d3.json(educationDataset)])
  .then(data => choropleth(data[0], data[1]))
  .catch(err => console.log(err));

const choropleth = (countyData, edData) => {
  const colors = d3.scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeGreens[9]);

  const xScale = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);

  const handleMouseover = (event, d) => {
    d3.select("#tooltip")
      .html(() => {
        const result = edData.filter(obj => obj.fips === d.id);
        if (result[0]) {
          return (
            result[0]["area_name"] + ", " +
            result[0]["state"] + ": " +
            result[0].bachelorsOrHigher + "%"
          );
        }
        return 0;
      })
      .attr("data-education", () => {
        const result = edData.filter(obj => obj.fips === d.id);
        if (result[0]) {
          return result[0].bachelorsOrHigher;
        }
        return 0;
      })
      .style("top", event.pageY - 28 + "px")
      .style("left", event.pageX + 10 + "px")
      .style("opacity", 1);
  };
  const handleMouseout = () => d3.select("#tooltip").style("opacity", 0);

  const svg = d3.select(".visHolder")
    .append("g")
    .selectAll("path")
    .data(topojson.feature(countyData, countyData.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("data-education", d => {
      const result = edData.filter(obj => obj.fips === d.id);
      if (result[0]) {
        return result[0].bachelorsOrHigher;
      }
      return 0;
    })
    .attr("fill", d => {
      const result = edData.filter(obj => obj.fips === d.id);
      if (result[0]) {
        return colors(result[0].bachelorsOrHigher);
      }
      return colors(0);
    })
    .attr("d", d3.geoPath())
    .on("mouseover", handleMouseover)
    .on("mouseout", handleMouseout);

  svg.append("path")
    .datum(topojson.mesh(countyData, countyData.objects.states, (a, b) => a !== b))
    .attr("class", "states")
    .attr("d", d3.geoPath());

  const legend = svg.append("g")
    .attr("id", "legend")
    .attr("transform", "translate(0,40)");

  legend.selectAll("rect")
    .data(
      colors.range().map(d => {
        d = colors.invertExtent(d);
        if (d[0] === null) {
          d[0] = xScale.domain()[0];
        }
        if (d[1] === null) {
          d[1] = xScale.domain()[1];
        }
        return d;
      })
    )
    .enter()
    .append("rect")
    .attr("height", 8)
    .attr("x", d => xScale(d[0]))
    .attr("width", d => d[0] && d[1] ? xScale(d[1]) - xScale(d[0]) : xScale(null))
    .attr("fill", d => colors(d[0]));

  legend.append("text")
    .attr("class", "caption")
    .attr("x", xScale.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold");

  legend.call(
    d3.axisBottom(xScale)
      .tickSize(13)
      .tickFormat(xScale => Math.round(xScale) + "%")
      .tickValues(colors.domain())
  )
    .select(".domain")
    .remove();
};
