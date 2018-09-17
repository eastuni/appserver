var writeYn = parent.g_menuList[window.location.pathname].writeYn;
var codeMapObj = {}, codeArrayObj = {};

(function() {
    if(parent.codeMapObj){
        codeMapObj = parent.codeMapObj;
        codeArrayObj = parent.codeArrayObj;
    }else{
        var codeMap = '[$codeMessage]', codeArray;

        codeArray = JSON.parse(codeMap.split('&quot;').join('"'));

        codeMapObj = PFUtil.convertArrayToMap(codeArray[0], 'codeName', 'codeList');

        jQuery.each(codeMapObj, function (codeType, codeUnits) {
            var codeUnit = {};

            codeUnits.forEach(function (code, i) {
                codeUnit[code.code] = code.name;
            });

            codeMapObj[codeType] = codeUnit;
            codeArrayObj[codeType] = codeUnits;
        });
    }
})();

var getTemplate = function(template) {
	var tpl = $.ajax({
		url: "tpl/" + template + ".html",
		async: false,
		dataType: "html"
	}).responseText;
	return Handlebars.compile(tpl);
};