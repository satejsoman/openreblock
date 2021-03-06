/*eslint no-use-before-define: [2, "nofunc"]*/

var map = L.map('map', { zoomControl: false }),
    autoSlideInt;

var tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'joeahand.jc5epc4l',
    accessToken: 'pk.eyJ1Ijoiam9lYWhhbmQiLCJhIjoiaDd1MEJZQSJ9.fl3WTCt8MGNOSCGR_qqz7A'
});

var topoLayer = new L.TopoJSON(null, {
    style: function(feature) {
        'use strict';
        if (feature.properties.road === 'true') {
            return NEW_ROAD_STYLES;
        } else if (feature.properties.original_road === 'true') {
            return ORIGINAL_ROAD_STYLES;
        } else if (feature.properties.interior === 'true') {
            return INNER_STYLES;
        } else {
            return DEFAULT_STYLES;
        }
    }
});

var numberWithCommas = function(x) {
    'use strict';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

var setStats = function(data) {
    'use strict';
    $('#stat-paths').text(data.pathLen);
    $('#stat-parcels').text(numberWithCommas(data.parcelArea));
    $('#stat-area').text(data.pathPercent);
    $('#stat-isolated').text(data.isolatedParcels);
};

var autoSlide = function () {
  'use strict';
  var curVal = $('.step-slider').slider('value');

  if(curVal === (projectData.totalSteps - 1)) {
    console.log('done sliding');
    //$('.step-slider').slider('value', 0);
    clearInterval( autoSlideInt );
  } else {
    $('.step-slider').slider('value', (curVal + 1));
  }
};

var initSlider = function(steps) {
    'use strict';
    $('.step-slider').slider({
        max: steps,
        change: function(event, ui) {
            if (event.originalEvent) {
              clearInterval( autoSlideInt );
            }
            var step = ui.value,
                stepData = projectData.steps[step];
            if (typeof stepData !== 'undefined') {
                setStats(stepData);
            }
            var newFilePath = projectData.filePath + step + '.topo.json';
            loadTopoLayer(topoLayer, newFilePath, true);
        }
    });
};

function loadTopoLayer(layer, file, replace) {
    'use strict';
    $.getJSON(file)
      .done(
        function(topoData) {
            if (replace === true) {
                topoLayer.clearLayers();
                layer.addData(topoData);
            } else {
                layer.addData(topoData);
                layer.addTo(map);
                map.fitBounds(layer.getBounds());

                initSlider(projectData.totalSteps - 1);
                setStats(projectData.steps[0]);
                autoSlideInt = setInterval(autoSlide, projectData.intTime);
            }
    });
}

var filePath = projectData.filePath + '0.topo.json';

tiles.addTo(map);
loadTopoLayer(topoLayer, filePath, false);

