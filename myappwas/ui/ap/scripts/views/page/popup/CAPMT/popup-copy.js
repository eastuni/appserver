define([
        	'bx-component/popup/popup'
        	,'text!app/views/page/popup/CAPMT/popup-copy.html'
        ]
    , function (
    		Popup
    		,tpl
        ) {
        var popupCopy = Popup.extend({
        	templates: {
                'tpl': tpl
            }

        	, attributes: {
        		'style': 'width: 1020px; height: 800px;'
        	}

        	, events: {
        	     'click #btn-popup-cancel': 'close' //취소
        	    , 'click #btn-popup-select': 'fn_select'// 선택버튼클릭
            }

            , initialize: function (initConfig) {
                var that = this;

                this.$el.html(this.tpl());

                $.extend(that, initConfig);

                that.enableDim = true;
                
                that.fn_loadList();

                that.$el.find('#popup-copy-from-area [data-form-param="instNm"]').val(initConfig.fromInstNm);
                that.$el.find('#popup-copy-from-area [data-form-param="wflowNm"]').val(initConfig.fromWflowNm);

            }
            , render: function () {
                var that = this;
                that.show();
            }

            , fn_loadList: function () {
                var that = this;
                that.fn_getInstCdList();
            }
            /*기관코드 생성*/
            , fn_getInstCdList : function() {
            	var that = this;
                var sParam = {};

                sParam.instCd = "";
                sParam.instNm = "";

                var linkData = {"header": fn_getHeader("CAPCM0308402"), "CaInstMgmtSvcGetInstIn": sParam};

                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                	
                    success: function (responseData) {
                    	var returnCode = responseData.header.returnCode;
                    	that.$('#CAPMT-popup-copy-instSelectArea option').remove();
                    	if(returnCode == "0") { // 정상
                    		if (responseData.CaInstMgmtSvcGetInstOut) {
                            	// 기관코드 콤보 설정
                            	var $selectInst = that.$("#CAPMT-popup-copy-instSelectArea");
                            	var $selectInstfrom = that.$("#CAPMT-popup-copy-from-instSelectArea");
                            	
                            	var instList = responseData.CaInstMgmtSvcGetInstOut.instList;
                            	
                            	$(instList).each(function(idx, item) {
                            		// 건수만큼 자식 생성
                            		var optionText = item.instNm;
                            		var optionValue = item.instCd;
                            		
                            		$selectInst.append($(document.createElement('option')).val(optionValue).text(optionText));
                            		$selectInstfrom.append($(document.createElement('option')).val(optionValue).text(optionText));
                            	});
                            }
                    	}
                    }
                });
            }

            , fn_select: function () {
            	var that = this;
                var param = bxUtil.makeParamFromForm($('#popup-copy-to-area'));


                if (!param.wflowNm) {
                    return;
                } 
                
                this.trigger('popUpSetData', param);
                this.close();
            }

            , afterClose : function() {
            	var that = this;
            	that.remove();
            }

        });

        return popupCopy;
    }
);
