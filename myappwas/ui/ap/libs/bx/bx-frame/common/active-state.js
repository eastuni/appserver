define(function() {

    var activeLayer = null,
        activePopup = null;

    function registLayer(layer) {
        removeLayer();
        activeLayer = layer;
    }

    function removeLayer() {
        activeLayer && activeLayer.close();
        activeLayer = null;
    }

    return {
        registLayer: registLayer,
        removeLayer: removeLayer
    }
});