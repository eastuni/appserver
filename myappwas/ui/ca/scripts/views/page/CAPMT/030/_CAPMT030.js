define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/030/_CAPMT030.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPSV/popup-service'
        , 'app/views/page/popup/CAPCM/popup-class-search'
        , 'app/views/page/popup/CAPMT/popup-centercutJobId'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        , PopupSrvcCd
        , PopupClassLayerTpCd
        , PopupCentercutJobId
        ) {


        /**
		 * Backbone
		 */
        var CAPMT030View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT030-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-reset'		: 'resetBase'
                , 'click #btn-base-section-inquiry'		: 'query'
                , 'click #btn-base-section-save'		: 'saveDetail'
                , 'click #btn-base-section-toggle': 'fn_base_toggle'
                , 'click #btn-detail-section-toggle': 'fn_detail_toggle'
                , 'click #btn-popup-jobId'		: 'popupJobId'
                , 'click #btn-popup-service'	: 'popupTrgtSrvc'
            	, 'click #btn-popup-class-search'	: 'popupInpDtoNm'
            	, 'change .CAPMT030-detail-section [data-form-param="errStopYn"]'			: 'errorStopYnSelected'
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
                // 데이터 피커 로드
                this.loadDatePicker();
                this.setTimePicker();


                // 콤보데이터 로딩
                fn_getCodeList({className:"CAPMT030-useYn-wrap",targetId:"useYn",nullYn:"N",cdNbr:"10000"}, this);
                fn_getCodeList({className:"CAPMT030-cmpntCd-wrap",targetId:"cmpntCd",nullYn:"N",cdNbr:"11603",disabled:true}, this);
                fn_getCodeList({className:"CAPMT030-inpDataTpCd-wrap",targetId:"inpDataTpCd",nullYn:"N",cdNbr:"A0395"}, this);
                fn_getCodeList({className:"CAPMT030-schdlTpCd-wrap",targetId:"schdlTpCd",nullYn:"N",cdNbr:"A0396"}, this);
                fn_getCodeList({className:"CAPMT030-logLvlCd-wrap",targetId:"logLvlCd",nullYn:"N",cdNbr:"A0124"}, this);
                fn_getCodeList({className:"CAPMT030-atmtcExctnDscd-wrap",targetId:"atmtcExctnDscd",nullYn:"N",cdNbr:"A0398"}, this);
                fn_getCodeList({className:"CAPMT030-prityCd-wrap",targetId:"prityCd",nullYn:"N",cdNbr:"A0397"}, this);
                fn_getCodeList({className:"CAPMT030-dtCnvrsnExctnYn-wrap",targetId:"dtCnvrsnExctnYn",nullYn:"N",cdNbr:"10000"}, this);
                fn_getCodeList({className:"CAPMT030-errorPrcsngMthdCd-wrap",targetId:"errPrcsngMthdCd",nullYn:"N",cdNbr:"A0400"}, this);
                fn_getCodeList({className:"CAPMT030-errorStopYn-wrap",targetId:"errStopYn",nullYn:"N",cdNbr:"A0510"}, this);
                fn_getCodeList({className:"CAPMT030-stopSqntlPrcsngKeyYn-wrap",targetId:"stopSqntlPrcsngKeyYn",nullYn:"N",cdNbr:"10000"}, this);
                fn_getCodeList({className:"CAPMT030-instncAssignMthdCd-wrap",targetId:"instncAssignMthdCd",nullYn:"N",cdNbr:"A0399"}, this);


                this.resetBase();
                this.resetDetail();
                return this.$el;
            }


            /**
			 * 기본부 리셋
			 */
            , resetBase: function () {
            	that = this;
            	that.$el.find('.CAPMT030-base-section [data-form-param="jobId"]').val("");


            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm(that.$el.find('.CAPMT030-base-section'));


                that.inquiryBaseData(sParam);
            }


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT030-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


            , fn_detail_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT030-detail-section"), this.$el.find("#btn-detail-section-toggle"));
            }


            , setTimePicker:function()
            {
                var that = this;
                that.$el.find('.CAPMT030-detail-section [data-form-param="atmtcExctnStartHms"]').mask("99:99",{placeholder:"--:--"});
                that.$el.find('.CAPMT030-detail-section [data-form-param="atmtcExctnEndHms"]').mask("99:99",{placeholder:"--:--"});
            }


            /**
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;
                var linkData = {"header": fn_getHeader("PMT0308401"), "inputDto": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	 var data;
                             for (var name in responseData) {
                                 if(name!="header") data=responseData[name];
                             }
                            if(!data){
                                fn_alertMessage("", bxMsg("cbb_items.SCRNITM#no-data-msg"));
                            }else{
                            	that.dto = data;
                            	that.setDetailData();
                            }


                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            /**
			 * 상세부 정보 reset.
			 */
            , resetDetail: function (param) {
                var that = this;


                var resetData = {};
                that.dto=resetData;
                that.setDetailData();


            } // end
            /**
			 * set 상세부 정보.
			 */
            , setDetailData: function () {
                var that = this;
                var dto = that.dto;
//				<!-- 센터컷 명 -->
                that.$el.find('.CAPMT030-detail-section [data-form-param="jobNm"]').val(dto.jobNm);
//				<!-- 센터컷 사용여부 -->
                that.$el.find('.CAPMT030-detail-section [data-form-param="useYn"]').val(dto.useYn);
//				<!-- 센터컷  설명-->
                that.$el.find('.CAPMT030-detail-section [data-form-param="jobDescCntnt"]').val(dto.jobDescCntnt);
//				<!-- 대상서비스코드 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="trgtSrvcCd"]').val(dto.trgtSrvcCd);
//				<!-- 대상서비스 입력 DTO -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="trgtSrvcInpDtoNm"]').val(dto.trgtSrvcInpDtoNm);
//				<!-- 서비스컴포넌트코드-->
				that.$el.find('.CAPMT030-detail-section [data-form-param="cmpntCd"]').val(dto.cmpntCd);
//				<!-- 입력데이터유형코드 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="inpDataTpCd"]').val(dto.inpDataTpCd);
//				<!-- 병렬처리건수 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="prlPrcsngCnt"]').val(dto.prlPrcsngCnt);
//				<!-- 스케줄유형코드 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="schdlTpCd"]').val(dto.schdlTpCd);
//				<!-- 스케줄건수 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="schdlCnt"]').val(dto.schdlCnt);
//				<!-- 로그레벨 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="logLvlCd"]').val(dto.logLvlCd);
//				<!-- 자동실행구분코드 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="atmtcExctnDscd"]').val(dto.atmtcExctnDscd);
//				<!-- 자동실행시간 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="atmtcExctnStartHms"]').val(fn_setTimeValue(dto.atmtcExctnStartHms).replace(/:$/,''));
				that.$el.find('.CAPMT030-detail-section [data-form-param="atmtcExctnEndHms"]').val(fn_setTimeValue(dto.atmtcExctnEndHms).replace(/:$/,''));
//				that.subViews['CAPMT030-baseTime1'].setValue(dto.atmtcExctnStartHms);
//				that.subViews['CAPMT030-baseTime2'].setValue(dto.atmtcExctnEndHms);


//				<!-- 우선순위코드 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="prityCd"]').val(dto.prityCd);
//				<!-- 일자전환수행여부 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="dtCnvrsnExctnYn"]').val(dto.dtCnvrsnExctnYn);
//				<!-- 오류처리방법-->
				that.$el.find('.CAPMT030-detail-section [data-form-param="errPrcsngMthdCd"]').val(dto.errPrcsngMthdCd);
//				<!-- 최대시도횟수 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="maxAtmptCnt"]').val(dto.maxAtmptCnt);
//				<!-- 오류중지여부 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="errStopYn"]').val(dto.errStopYn);
//				<!-- 오류중지 조건 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="errStopCndCd"]').val(dto.errStopCndCd);
//				<!-- 순차처리키중지여부 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="stopSqntlPrcsngKeyYn"]').val(dto.stopSqntlPrcsngKeyYn);
//				<!-- 재처리대기시간(분) -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="rprcsngWaitingHms"]').val(dto.rprcsngWaitingHms);
//				<!-- 인스턴스지정방식 -->
				that.$el.find('.CAPMT030-detail-section [data-form-param="instncAssignMthdCd"]').val(dto.instncAssignMthdCd);
//				<!-- 대상인스턴스목록 -->
//				" data-form-param="trgtInstncList" class="bx-form-item bx-component-small" />


            } // end
            /**
			 * 상세부 정보 저장 버튼
			 */
            , saveDetail: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm(that.$el.find('.CAPMT030-detail-section'));
                sParam.jobId=that.$el.find('.CAPMT030-base-section [data-form-param="jobId"]').val();
                if(!fn_isNull(sParam.atmtcExctnStartHms))
                {
                    sParam.atmtcExctnStartHms = fn_getTimeValue(sParam.atmtcExctnStartHms);
                }
                if(!fn_isNull(sParam.atmtcExctnEndHms))
                {
                    sParam.atmtcExctnEndHms = fn_getTimeValue(sParam.atmtcExctnEndHms);
                }


                var linkData = {"header": fn_getHeader("PMT0308101"), "inputDto": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    enableLoading: true
	                    , success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));
	                            // 재조회
	                            that.query();
	                        }
	                    }   // end of suucess: fucntion
	                }); // end of bxProxy
           }// end
            /**
			 * 데이터 피커 로드 컴포넌트 데이터 피커를 사용
			 */
            , loadDatePicker: function () {
            }
            /**
             *  작업식별자조회 팝업
             */
            , popupJobId: function () {


            	var that = this;
            	var sParam = {};
            	var popup = new PopupCentercutJobId(sParam); // 팝업생성
            	popup.render();


            	popup.on('popUpSetData', function (param) {
            		that.$el.find('[data-form-param="jobId"]').val(param.jobId); //작업식별자
            	});
            }
            /**
             *  서비스코드조회 팝업
             */
            , popupTrgtSrvc: function () {


                var that = this;
                var sParam = {};
                var popupSrvcCd = new PopupSrvcCd(sParam); // 팝업생성
                popupSrvcCd.render();


                popupSrvcCd.on('popUpSetData', function (param) {
                    that.$el.find('[data-form-param="trgtSrvcCd"]').val(param.srvcCd); //서비스코드
                    that.$el.find('[data-form-param="cmpntCd"]').val(param.cmpntCd); //서비스코드
//                    that.$el.find('[data-form-param="trgtSrvcInpDtoNm"]').val(param.InpDto); 
                });
            }
            /**
             *  입력 DTO 조회 팝업
             */
            , popupInpDtoNm: function () {


                var that = this;
                var popup = new PopupClassLayerTpCd({classLayerTp:"DTO"}); // 팝업생성
                popup.render();


                popup.on('popUpSetData', function (param) {
                    var fullName = param.pckgNm + '.' + param.classNm;
                    that.$el.find('[data-form-param="trgtSrvcInpDtoNm"]').val(fullName); //서비스코드
                });
            }
            /**
             *  errorStopYnSelected
             */
            , errorStopYnSelected: function () {


            	var that = this;
            	var errorStop = that.$el.find('.CAPMT030-detail-section [data-form-param="errStopYn"]').val();
            	var elCnd = that.$el.find('.CAPMT030-detail-section [data-form-param="errStopCndCd"]');
            	if(errorStop === "C")
        		{
            		elCnd.removeProp("disabled");
        		}else{
        			elCnd.prop("disabled", "disabled");
        		}
            }


        }); // end of Backbone.View.extend({


        return CAPMT030View;
    } // end of define function
); // end of define
