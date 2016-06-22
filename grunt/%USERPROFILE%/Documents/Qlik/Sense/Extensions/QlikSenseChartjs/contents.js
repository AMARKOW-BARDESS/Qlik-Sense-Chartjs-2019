var chartjs = [
  {
    name:"Bar Chart",
    id:1,
    src:"bar_chart.js",
    min_dims:1,
    max_dims:1,
    measures:1
  },
  {
    name:"Stacked Bar Chart",
    id:2,
    src:"stacked_bar_chart.js",
    min_dims:2,
    max_dims:2,
    measures:1
  },
  {
    name:"Line Chart",
    id:3,
    src:"line_chart.js",
    min_dims:1,
    max_dims:1,
    measures:1
  },
  {
    name:"Multi-Series Line Chart",
    id:4,
    src:"multi_series_line_chart.js",
    min_dims:2,
    max_dims:2,
    measures:1
  },
  {
    name:"Radar Chart",
    id:5,
    src:"radar_chart.js",
    min_dims:1,
    max_dims:1,
    measures:1
   },
  {
    name:"Radar Multiple",
    id:6,
    src:"multiple_radar_chart.js",
    min_dims:2,
    max_dims:2,
    measures:1
  },
  {
    name:"Polar Area Chart",
    id:7,
    src:"polar_area_chart.js",
    min_dims:1,
    max_dims:1,
    measures:1
   },
];

var chart_options = chartjs.map(function(d) {
  return {
    value: d.id,
    label: d.name
  }
});
