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
  var dim2_unique_values = [], dim2_unique_elem_nums = [];

  var data = qMatrix.map(function(d) {
    if(dim2_unique_values.indexOf(d[1].qText) < 0){
      dim2_unique_values.push(d[1].qText);
      dim2_unique_elem_nums[d[1].qText] = d[1].qElemNumber ;
    }
    return({
      dim1: d[0].qText,
      dim1_elem: d[0].qElemNumber,
      dim2: d[1].qText,
      mea1: d[2].qNum
    });
  })

  // Sort by Alphabetic order
  if (layout.sort) {
    dim2_unique_values.sort()
  }

  //Group by dimension1
  var data_grouped_by_dim1 = _.groupBy(data, 'dim1')

  //Create a container for result
  var result = [];
  result["dim1"] = [];
  result["dim1_elem"] = [];
  var cumulativeDataset  = [];

  // Initialize arrays for dimension values
   result = chartjsUtils.initializeArrayWithZero(_.size(data_grouped_by_dim1), dim2_unique_values, result);

  var i = 0;
  var wholeSum = 0;
  _.each(data_grouped_by_dim1, function(d) {
      result["dim1"][i] = d[0].dim1;
      result["dim1_elem"][i] = d[0].dim1_elem;
      var eachSum = 0; //Cumulative Sum
    _.each(d, function(dd){
      result[dd.dim2][i] = dd.mea1;
      eachSum += dd.mea1;
    })
    wholeSum += eachSum;
    cumulativeDataset[i] = wholeSum;
    i++;
  });

  // Culculate cumulative sum when cumulative switch is on
  if (layout.cumulative) {
    result = chartjsUtils.addCumulativeValuesOnTwoDimensions(dim2_unique_values, result);
  }

  // Create datasets for Chart.js rendering
  var datasets = [];
  for(var i=0; i<dim2_unique_values.length; i++ ) {
    var subdata = [];
    subdata.label = dim2_unique_values[i];
    subdata.backgroundColor = "rgba(" + palette[i] + "," + layout.opacity + ")";
    subdata.data = result[dim2_unique_values[i]];
    datasets.push(subdata);
  }

  // Define dataset for cumulative line
  // if (layout.cumulative_line) {
  //   var subdata = [];
  //   subdata.label = "Cumulative Line";
  //   subdata.fill = false;
  //   subdata.type = "line";
  //   subdata.position = "right";
  //   subdata.backgroundColor = "rgba(255,0,0,0.5)";
  //   subdata.data = cumulativeDataset;
  //   datasets.push(subdata);
  // }

  var barChartData = {
      labels: result["dim1"],
      datasets: datasets
  };

  var ctx = document.getElementById(id);
  var myStackedBar = new Chart(ctx, {
      type: 'bar',
      data: barChartData,
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
              chartjsUtils.makeSelectionsOnDataPoints(result["dim1_elem"][activePoints[0]._index], _this);
            }
          }
      }
  });
}
