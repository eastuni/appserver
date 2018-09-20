// EAV 모델관리 권한으로 적용
var writeYn = parent.g_menuList['/setting/eav_model/index.htm'].writeYn;
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

// 해당기능 사용하지 않음
//$(window).bind('beforeunload',function(e) {
//    if($('.most-significant-box').attr('data-edited') == 'true') {
//        return bxMsg('warningDontSaved');
//    }
//});

var getTemplate = function(template) {
	var tpl = $.ajax({
		url: "tpl/" + template + ".html",
		async: false,
		dataType: "html"
	}).responseText;
	return Handlebars.compile(tpl);
};