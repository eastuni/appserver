define(
	[
		'bx/common/config'
		, 'bx-component/message/message-alert'
		, 'bx-component/message/message-confirm'
		, 'bx-component/date-picker/_date-picker'
		, 'bx/common/common-info'
        , 'bx/common/common-arrUIGenerate'

	]
	, function(
		config
		, alertMessage
		, confirmMessage
		, DatePicker
	) {

		//변경조건조회
		fn_arrChngScreenGenerate = function (inParam,format,thatDiv) {

			var linkData = {"header": fn_getHeader("PAR0208402"), "ArrChngScrnIn": inParam};

			//ajax 호출
			bxProxy.post(sUrl, JSON.stringify(linkData), {
				enableLoading: true,
				success: function (data) {
					if(fn_commonChekResult(data)) {
						fn_generateUIWithData(data, format, thatDiv)
					}
				}
			});
		};

	}, // end of define function


	//변경입력값가져오기
	fn_arrChngInputGenerate = function (thatDiv) {
		return fn_getArrInputGenerate(thatDiv);
	}

);  // end of define