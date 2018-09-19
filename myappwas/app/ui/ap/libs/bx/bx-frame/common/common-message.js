define(
	[
	 	'app/views/page/popup/CAPCM/popup-message'
	 	, 'app/views/page/popup/CAPCM/popup-cntct-aprvl'
	 	, 'app/views/page/popup/CAPCM/popup-cntct-aprvl-nonactiviti'
	 ]
	, function(
		PopupMessage
		, PopupCntctAprvl
		, PopupCntctAprvlNonactiviti
	) {
		var popupMessage = new PopupMessage(); // 팝업생성

		window.fn_commonChekResult = function(responseData) {
			
			//returnCode 0 : 정상, 1: 에러, 2 : 시스템에러, 3 : 책임자승인
    		var returnCode = responseData.header.returnCode;
    		if(returnCode == "1" || returnCode == "2") { // 에러
    			//경고창
    			this.popErrorMessage(responseData);
    			return false;
    		}
    		else if(returnCode == "3"){ //책임자승인
//    			console.log($.sessionStorage('inst_wflowUseYn'));
    			if($.sessionStorage('inst_wflowUseYn') && $.sessionStorage('inst_wflowUseYn') == "Y") {
    				this.popCntctAprvl(responseData);
    			}
    			else {
    				this.popupCntctAprvlNonactiviti(responseData);
    			}
    			
//    			this.popupCntctAprvlNonactiviti(responseData);

    			return false;
    		}
    		else {
    			return true;
    		}
		};
		
		// alert 메시지
		window.fn_alertMessage	= function(title, message) {
			  swal({
				    title: title
				    , text: message
				    , html: true
				    , cancelButtonText:bxMsg('cbb_items.ABRVTN#chk')
				    , timer: 2000
				  });
		};
		
		// confirm 메시지
		window.fn_confirmMessage = function(e, title, message, callbackFunction, that) {
			  e.preventDefault();
			  swal(
					  {
						  title: title
						  , text: message
						  , showCancelButton:true
						  , html: true
						  , confirmButtonText:bxMsg('cbb_items.ABRVTN#chk')
						  , cancelButtonText:bxMsg('cbb_items.ABRVTN#cncl')
						  , closeOnConfirm: true
						  , closeOnCancel: true
					  }
				  
					  , function (isConfirm) {
//						  console.log("isConfirm : "+isConfirm);
						  if (isConfirm === true) {
							  (typeof callbackFunction === 'function') && callbackFunction(that);
						  }
						  else {
							  return false;
						  }
					  }
			  );
		}
		
		/**
		 *  에러메시지 호출
		 */
		popErrorMessage = function(responseData) {
			var param = {};
			
			param.returnCode = responseData.header.returnCode;
			param.errorMessages = responseData.header.errorMessages;
				
			popupMessage.render(param);
		};
		
		/**
		 *  책임자승인 호출
		 */
		popCntctAprvl = function(responseData) {
			var param = {};
			param.data = responseData.header.data.aprvlId;
			
			var popupCntctAprvl = new PopupCntctAprvl(param); // 팝업생성
			popupCntctAprvl.render();
		};

		/**
		 *  책임자승인 호출 
		 */
		popupCntctAprvlNonactiviti = function(responseData) {
			var param = {};
			param.data = responseData.header.data.aprvlId;
			
			var popupCntctAprvlNonactiviti = new PopupCntctAprvlNonactiviti(param); // 팝업생성
			popupCntctAprvlNonactiviti.render();

			popupCntctAprvlNonactiviti.on('popUpSetData', function(param) { //callback function
				$.sessionStorage('globalAprvlId', param.aprvlId);
            });
		};
	} // end of define function
);  // end of define