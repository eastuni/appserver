define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPSV/197/_CAPSV197.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/message/message-alert'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , DatePicker
        , alertMessage
        , commonInfo
        ) {


        /**
		 * Backbone
		 */
        var CAPSV197View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPSV197-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-reset': 'resetBase'
                , 'click #btn-search': 'query'
                , 'click #btn-up-base' : 'toggleBase'
                , 'click #btn-info-toggle' : 'toggleDetail'
            }


            /**
			 * initialize
			 */
            , initialize: function (initData) {
                var that = this;


                $.extend(that, initData);
                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);
                that.$el.html(that.tpl());
            }


            /**
			 * render
			 */
            , render: function () {
                var that = this;


                that.dfrdId = that.param?that.param.dfrdId:"";
                that.nodeNbr = that.param?that.param.nodeNbr:0;
                that.bizDt = that.param?that.param.bizDt:"";
                that.errSeqNbr = that.param?that.param.errorSeqNbr:0;


                // 데이터 피커 로드
                fn_makeDatePicker(this.$el.find('.CAPSV197-base-table [data-form-param="bizDt"]'));
                this.loadDatePicker();


                var sParam1 = {};
                // combobox 정보 셋팅
                sParam1.className = "CAPSV197-errorPrcsngStsCd-wrap";
                sParam1.targetId = "errPrcsngStsCd";
                sParam1.nullYn = "Y";
                sParam1.disabled = true;
                sParam1.cdNbr = "A0612";


                // 콤보데이터 load
                fn_getCodeList(sParam1, this);


                var sParam2 = {};
                // combobox 정보 셋팅
                sParam2.className = "CAPSV197-errorPrcsngTpCd-wrap";
                sParam2.targetId = "errPrcsngTpCd";
                sParam2.nullYn = "Y";
                sParam2.disabled = true;
                sParam2.cdNbr = "A0613";


                // 콤보데이터 load
                fn_getCodeList(sParam2, this);


                if(that.param){


                	if(that.bizDt != null){
                		that.$el.find('.CAPSV197-base-table [data-form-param="bizDt"]').val(XDate(that.bizDt).toString('yyyy-MM-dd'));
                		//this.subViews['base-cmnClndr'].setValue(that.bizDt);
                	}else {
                		that.$el.find('.CAPSV197-base-table [data-form-param="bizDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
//	                	var baseCmnClndr = this.subViews['base-cmnClndr'].getValue();
//	                	if (baseCmnClndr == null || baseCmnClndr == "") {
//	                		this.subViews['base-cmnClndr'].setValue(getCurrentDate("yyyy-mm-dd"));
//	                	}
                	}


                	var sParam = {};


                	sParam.dfrdId = that.dfrdId;
                	sParam.nodeNbr = that.nodeNbr;
                	sParam.bizDt = that.bizDt;
                	sParam.errSeqNbr = that.errSeqNbr;


                	that.$el.find('.CAPSV197-base-table [data-form-param="dfrdId"]').val(that.dfrdId);
                	that.$el.find('.CAPSV197-base-table [data-form-param="nodeNbr"]').val(that.nodeNbr);
                	that.$el.find('.CAPSV197-base-table [data-form-param="errSeqNbr"]').val(that.errSeqNbr);


                	that.inquiryBaseData(sParam);
                }else{
                	this.setBaseData(this, "", "X");
                }


                return this.$el;
            }


            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, detail, type) {
                that = this;


                if (type == "X") {


                	/* 결과가 없을 경우 Input 필드의 값들은 그대로 유지 , output 필드의 값은 초기화 */
//                	var baseCmnClndr = this.subViews['base-cmnClndr'].getValue();
//                	if (baseCmnClndr == null || baseCmnClndr == "") {
//                        this.subViews['base-cmnClndr'].setValue(getCurrentDate("yyyy-mm-dd"));
//                    }


                	that.$el.find('.CAPSV197-base-table [data-form-param="bizDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
                	that.$el.find('.CAPSV197-base-table [data-form-param="errSeqNbr"]').val("");
                	that.$el.find('.CAPSV197-base-table [data-form-param="nodeNbr"]').val("");
                	that.$el.find('.CAPSV197-base-table [data-form-param="dfrdId"]').val("");


                	that.$el.find('.CAPSV197-detail-table [data-form-param="errSeqNbr"]').val("");
                	that.$el.find('.CAPSV197-detail-table [data-form-param="nodeNbr"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="dfrdNm"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="bizDt"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errPrcsngStsCd"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errPrcsngTpCd"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="startSeqNbr"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="endSeqNbr"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errRgstrnTmstmp"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="prcsngEndTmstmp"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errCd"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errMsgCntnt"]').val("");
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errGuid"]').val("");


                }else{


                	var bizDt = "";
                	if(detail.bizDt){
                		var val=detail.bizDt;
                		bizDt=val.substring(0,4)+"-"+val.substring(4,6)+"-"+val.substring(6,8)
                	};


                	var errRgstrnTmstmp = "";
                	if(detail.errRgstrnTmstmp){
                		errorRgstrnTmstmp=XDate(detail.errRgstrnTmstmp).toString('yyyy-MM-dd HH:mm:ss')
                	};


                	var prcsngEndTmstmp = "";
                	if(detail.prcsngEndTmstmp){
                		prcsngEndTmstmp=XDate(detail.prcsngEndTmstmp).toString('yyyy-MM-dd HH:mm:ss')
                	};


                	that.$el.find('.CAPSV197-detail-table [data-form-param="errGuid"]').val(detail.errGuid);
                	that.$el.find('.CAPSV197-detail-table [data-form-param="dfrdNm"]').val(detail.dfrdNm);
                	that.$el.find('.CAPSV197-detail-table [data-form-param="nodeNbr"]').val(detail.nodeNbr);
                	that.$el.find('.CAPSV197-detail-table [data-form-param="bizDt"]').val(that.convertDttmFormat(detail.bizDt));
                	that.$el.find('.CAPSV197-detail-table [data-form-param="errSeqNbr"]').val(detail.errSeqNbr);
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errPrcsngStsCd"]').val(detail.errPrcsngStsCd);
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errPrcsngTpCd"]').val(detail.errPrcsngTpCd);
                    that.$el.find('.CAPSV197-detail-table [data-form-param="startSeqNbr"]').val(detail.startSeqNbr);
                    that.$el.find('.CAPSV197-detail-table [data-form-param="endSeqNbr"]').val(detail.endSeqNbr);
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errRgstrnTmstmp"]').val(that.convertDttmFormat(detail.errRgstrnTmstmp));
                    that.$el.find('.CAPSV197-detail-table [data-form-param="prcsngEndTmstmp"]').val(that.convertDttmFormat(detail.prcsngEndTmstmp));
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errCd"]').val(detail.errCd);
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errMsgCntnt"]').val(detail.errMsgCntnt);
                    that.$el.find('.CAPSV197-detail-table [data-form-param="errGuid"]').val(detail.errGuid);


                }
            }


            /**
			 * 기본부 리셋
			 */
            , resetBase: function () {
                var that = this;


                /* 현재 날짜로 초기화 */
                that.$el.find('.CAPSV197-base-table [data-form-param="bizDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
                that.$el.find('.CAPSV197-base-table [data-form-param="errSeqNbr"]').val("");
            	that.$el.find('.CAPSV197-base-table [data-form-param="nodeNbr"]').val("");
            	that.$el.find('.CAPSV197-base-table [data-form-param="dfrdId"]').val("");


                that.$el.find('.CAPSV197-detail-table [data-form-param="errGuid"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="dfrdNm"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="nodeNbr"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="bizDt"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="errSeqNbr"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="errPrcsngStsCd"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="errPrcsngTpCd"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="startSeqNbr"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="endSeqNbr"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="errRgstrnTmstmp"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="prcsngEndTmstmp"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="errCd"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="errMsgCntnt"]').val("");
                that.$el.find('.CAPSV197-detail-table [data-form-param="errGuid"]').val("");
            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPSV197-base-table'));
                that.inquiryBaseData(sParam);
            }


            /**
			 * 데이터 피커 로드 컴포넌트 데이터 피커를 사용
			 */
            , loadDatePicker: function () {
//            	this.subViews['base-cmnClndr'] && this.subViews['base-cmnClndr'].remove();
//                this.subViews['base-cmnClndr'] = new DatePicker({
//                    inputAttrs: {'data-form-param': 'bizDt'},
//                    setTime: false
//                });
//                this.$el.find('.CAPSV197-base-bizDt-wrap').html(this.subViews['base-cmnClndr'].render());


                this.$el.find('.CAPSV197-base-table [data-form-param="bizDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));
            }
            /**
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;
                sParam.bizDt = sParam.bizDt.replace(/-/gi,"");
                //sParam.seqNbr=0;
                //입출력구분이랑 guid,거래년월일 파라미터 3개로 서비스 호출.
                var linkData = {"header": fn_getHeader("PMT0408401"), "DfrdErrorLogSvcIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var detail = responseData.DfrdErrorLogSvcOut;
                            if (detail != null) {
                            	that.setBaseData(this, detail, "");
                            }else{
                            	that.setBaseData(this, "", "X");
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            , toggleBase: function () {
                fn_pageLayerCtrl(this.$el.find("#CAPSV197-base-table"),this.$el.find('#btn-up-base'));
            }


            , toggleDetail: function () {
                fn_pageLayerCtrl(this.$el.find("#CAPSV197-detail-table"),this.$el.find('#btn-info-toggle'));
            }
            , convertDttmFormat:function(val) {
            	var dttm=val;
                if(dttm){
	                if(dttm.length == 14){
	                	vDate = val.substr(0,8);
	                	vTime = val.substr(8,6);
	                	dttm = vDate + ' ' + vTime;
	                }else if(dttm.length == 8){
	                	dttm = val;
	                }
                }
                return dttm;
            }


        }); // end of Backbone.View.extend({


        return CAPSV197View;
    } // end of define function
); // end of define
