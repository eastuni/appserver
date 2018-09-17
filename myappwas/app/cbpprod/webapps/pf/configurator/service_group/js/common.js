// OHS 2017.02.23 수정 - '2' -> '3' 상품그룹과 분리하기위함.
var pageType = '3';
// 2번으로 똑같이사용.

//var writeYn = parent.g_menuList['03011'].writeYn;
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