var writeYn = parent.g_menuList[window.location.pathname].writeYn;
var conditionApplyTargetDscd = '03'; //제공조건기본 조건적용대상구분코드
var pdInfoDscd = '02';
var treeType = 'SV';
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

$(window).bind('beforeunload',function(e) {
    if($('.most-significant-box').attr('data-edited') == 'true') {
        return bxMsg('warningDontSaved');
    }
});

var getTemplate = function(template) {
	var tpl = $.ajax({
		url: "tpl/" + template + ".html",
		async: false,
		dataType: "html"
	}).responseText;
	return Handlebars.compile(tpl);
};