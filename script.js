const width = 960;
const height = 600;
const svg = d3.select("#choropleth").attr("width", width).attr("height", height);
const tooltip = d3.select("#tooltip");
const legend = d3.select("#legend");

const educationApi = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countiesApi = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(countiesApi), d3.json(educationApi)])
  .then(([countyData, educationData]) => {
    const counties = topojson.feature(countyData, countyData.objects.counties).features;
    const education = new Map(educationData.map((d) => [d.fips, d]));
    console.log(education);
    const colorScale = d3
      .scaleQuantize()
      .domain([d3.min(educationData, (d) => d.bachelorsOrHigher), d3.max(educationData, (d) => d.bachelorsOrHigher)])
      .range(d3.schemeOranges[5]);

    svg
      .selectAll(".county")
      .data(counties)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("d", d3.geoPath())
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => education.get(d.id)?.bachelorsOrHigher || 0)
      .attr("fill", (d) => colorScale(education.get(d.id)?.bachelorsOrHigher || 0))
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .attr("data-education", education.get(d.id)?.bachelorsOrHigher || 0)
          .html(`Name: ${education.get(d.id).area_name}<br>FIPS: ${d.id}<br>Educazione: ${education.get(d.id)?.bachelorsOrHigher}%`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
    console.log(svg.data(counties));

    const legendScale = d3.scaleLinear().domain(colorScale.domain()).range([0, 300]);

    const legendAxis = d3.axisBottom(legendScale).ticks(5);

    legend.attr("width", 320).attr("height", 50).append("g").attr("transform", "translate(10,20)").call(legendAxis);

    legend
      .selectAll("rect")
      .data(colorScale.range())
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * 60 + 10)
      .attr("y", 0)
      .attr("width", 60)
      .attr("height", 20)
      .attr("fill", (d) => d);
  })
  .catch((error) => {
    console.error("Error loading data:", error);
  });
