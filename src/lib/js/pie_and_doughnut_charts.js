var visualize = function($element, layout, _this, chartjsUtils) {
  var id  = layout.qInfo.qId + "_chartjs_bar";

  var width_height = chartjsUtils.calculateMargin($element, layout);
  var width = width_height[0], height = width_height[1];

  //$element.empty();
  $element.html('<canvas id="' + id + '" width="' + width + '" height="'+ height + '"></canvas>');

  var palette = chartjsUtils.defineColorPalette(layout.color_selection);

  var palette_r = palette.map(function(d) {
    return "rgba(" + d + "," + layout.opacity + ")";
  });

  var data = layout.qHyperCube.qDataPages[0].qMatrix;

  if (layout.cumulative) {
    data = chartjsUtils.addCumulativeValues(data);
  }

  var ctx = document.getElementById(id);

  var myRadarChart = new Chart(ctx, {
      type: layout.pie_doughnut,
      data: {
          labels: data.map(function(d) { return d[0].qText; }),
          datasets: [{
              label: layout.qHyperCube.qMeasureInfo[0].qFallbackTitle,
              fill: layout.background_color_switch,
              data: data.map(function(d) { return d[1].qNum; }),
              backgroundColor: palette_r,
              borderColor: palette_r,
              pointBackgroundColor: palette_r,
              borderWidth: 1
          }]
      },
      options: {
        title:{
            display: layout.title_switch,
            text: layout.title
        },
        legend: {
          display: (layout.legend_position == "hide") ? false : true,
          position: layout.legend_position,
          onClick:function(evt, legendItem) {
            var values = [];
            var dim = 0;
            if(data[legendItem.index][0].qElemNumber<0) {
              //do nothing
            } else {
              values.push(data[legendItem.index][0].qElemNumber);
              _this.selectValues(dim, values, true);
            }
          }
        },
        scale: {
          ticks: {
            beginAtZero: true,
            callback: function(value, index, values) {
              return chartjsUtils.formatMeasure(value, layout);
            }
          }
        },
        tooltips: {
            mode: 'label',
            callbacks: {
                label: function(tooltipItems, data) {
                    return data.labels[tooltipItems.index] +': ' + chartjsUtils.formatMeasure(data.datasets[0].data[tooltipItems.index], layout);
                }
            }
        },
        responsive: true,
        events: ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"],
        onClick: function(evt) {
          var activePoints = this.getElementsAtEvent(evt);
          if(activePoints.length > 0) {
            chartjsUtils.makeSelectionsOnDataPoints(data[activePoints[0]._index][0].qElemNumber, _this);
          }
        }
      }
      // options: {
      //     scales: {
      //         yAxes: [{
      //             ticks: {
      //                 beginAtZero:true
      //             }
      //         }]
      //     }
      // }
  });
}
