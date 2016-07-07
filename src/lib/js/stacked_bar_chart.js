var visualize = function($element, layout, _this, chartjsUtils) {
  var id  = layout.qInfo.qId + "_chartjs_stacked_bar";
  var ext_width = $element.width(), ext_height = $element.height();
  var margin = {top: 20, right: 20, bottom: 50, left: 40},
      width = ext_width - margin.left - margin.right,
      height = ext_height - margin.top - margin.bottom;

  //$element.empty();
  $element.html('<canvas id="' + id + '" width="' + width + '" height="'+ height + '"></canvas>');

  var palette = chartjsUtils.defineColorPalette(layout.color_selection);

  var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;

  var result_set = chartjsUtils.flattenData(qMatrix);
  var flatten_data = result_set[0];
  var dim2_unique_values = result_set[1];
  var dim2_unique_elem_nums = result_set[2];

  // Sort by Alphabetic order
  if (layout.sort) {
    dim2_unique_values.sort()
  }

  //Group by dimension1
  var data_grouped_by_dim1 = _.groupBy(flatten_data, 'dim1')

  //Create a container for formatted_data_array
  var formatted_data_array = [];
  formatted_data_array["dim1"] = [];
  formatted_data_array["dim1_elem"] = [];

  // Initialize arrays for dimension values
   formatted_data_array = chartjsUtils.initializeArrayWithZero(_.size(data_grouped_by_dim1), dim2_unique_values, formatted_data_array);

  // Store hypercube data to formatted_data_array
  formatted_data_array = chartjsUtils.storeHypercubeDataToArray(data_grouped_by_dim1, formatted_data_array);

  // Culculate cumulative sum when cumulative switch is on
  if (layout.cumulative) {
    formatted_data_array = chartjsUtils.addCumulativeValuesOnTwoDimensions(dim2_unique_values, formatted_data_array);
  }

  // Create datasets for Chart.js rendering
  var datasets = [];
  for(var i=0; i<dim2_unique_values.length; i++ ) {
    var subdata = [];
    subdata.label = dim2_unique_values[i];
    subdata.backgroundColor = "rgba(" + palette[i] + "," + layout.opacity + ")";
    subdata.data = formatted_data_array[dim2_unique_values[i]];
    datasets.push(subdata);
  }

  var chart_data = {
      labels: formatted_data_array["dim1"],
      datasets: datasets
  };

  var ctx = document.getElementById(id);
  var myStackedBar = new Chart(ctx, {
      type: 'bar',
      data: chart_data,
      options: {
          title:{
              display: layout.title_switch,
              text: layout.title
          },
          legend: {
            display: (layout.legend_position == "hide") ? false : true,
            position: layout.legend_position,
            onClick: function(evt, legendItem) {
              var values = [];
              var dim = 1;
              if(dim2_unique_elem_nums[legendItem.text]<0) {
                //do nothing
              } else {
                values.push(dim2_unique_elem_nums[legendItem.text]);
                _this.selectValues(dim, values, true);
              }
            }
          },
          tooltips: {
              mode: 'label'
          },
          responsive: true,
          scales: {
              xAxes: [{
                  stacked: true,
                  scaleLabel: {
                    display: layout.datalabel_switch,
                    labelString: layout.qHyperCube.qDimensionInfo[0].qFallbackTitle
                  }
              }],
              yAxes: [{
                  stacked: true,
                  scaleLabel: {
                    display: layout.datalabel_switch,
                    labelString: layout.qHyperCube.qMeasureInfo[0].qFallbackTitle
                  },
                  ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                      return chartjsUtils.formatMeasure(value, layout);
                    }
                  }
              }]
          },
          tooltips: {
              mode: 'label',
              callbacks: {
                  label: function(tooltipItems, data) {
                      return data.datasets[tooltipItems.datasetIndex].label +': ' + chartjsUtils.formatMeasure(tooltipItems.yLabel, layout);
                  }
              }
          },
          events: ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"],
          onClick: function(evt) {
            var activePoints = this.getElementsAtEvent(evt);
            if(activePoints.length > 0) {
              chartjsUtils.makeSelectionsOnDataPoints(formatted_data_array["dim1_elem"][activePoints[0]._index], _this);
            }
          }
      }
  });
}
