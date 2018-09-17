;
(function() {
  var pfui_config_110_config_debug;
  pfui_config_110_config_debug = function() {
    //from seajs
    function getScriptAbsoluteSrc(node) {
      return node.hasAttribute ? // non-IE6/7
        node.src : // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute('src', 4);
    }
    var PFUI = window.PFUI = window.PFUI || {};
    PFUI.use = seajs.use;
    PFUI.config = seajs.config;
    var scripts = document.getElementsByTagName('script'),
      loaderScript = scripts[scripts.length - 1],
      src = getScriptAbsoluteSrc(loaderScript),
      loaderPath = src.substring(0, src.lastIndexOf('/')),
      debug = loaderScript.getAttribute('debug') === 'true' ? true : false;
    PFUI.loaderScript = loaderScript;
    //PFUI Configuration path
    seajs.config({
      paths: {
        'pfui': loaderPath
      }
    });
    PFUI.setDebug = function(debug) {
      PFUI.debug = debug;
      //Only the files below the pfui directory use -min.js
      var regexp = new RegExp('^(' + loaderPath + '\\S*).js$');
      if (!debug) {
        seajs.config({
          map: [
            [
              regexp, '$1-min.js'
            ]
          ]
        });
      } else {
        var map = seajs.data.map;
        var mapReg;
        if (!map) {
          return;
        }
        for (var i = map.length - 1; i >= 0; i--) {
          mapReg = map[i][0];
          if (Object.prototype.toString.call(mapReg) === '[object RegExp]' && mapReg.toString() === regexp.toString()) {
            map.splice(i, 1);
          }
        }
      }
    };
    PFUI.setDebug(debug);
    // All modules are dependent on jquery, so define a jquery module and return directly
    if (window.jQuery) {
      window.define('jquery', [], function() {
        return window.jQuery;
      });
    }
  }();
}());