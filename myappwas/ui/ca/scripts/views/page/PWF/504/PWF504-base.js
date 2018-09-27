define(
    [
         'bx/common/config'
         ,'bx-component/message/message-alert'
         ,'bx-component/message/message-confirm'
         ,'bx-component/date-picker/_date-picker'
         ,'text!app/views/page/PWF/504/PWF504-base-tpl.html'
         ,'app/views/page/popup/popup-staffId'
         ,'bx/common/common-info'
   ],
   function (
         config
         , alertMessage
         , confirmMessage
         , DatePicker
         , tpl
         , PopupStaffId
         , commonInfo
   ){
    	 /*
    	  * 상수
    	  */
    	 var PAGE_COUNT = 10;


         var isSimple = true; //단순조회, 상세조회
         var pgCnt = PAGE_COUNT;
         var pgNbr = 1;


         var PWFBaseView = Backbone.View.extend({
               // 태그이름 설정
               tagName: 'section',
               // 클래스이름 설정
               className: 'PWF504-base-page',
               // 탬플릿 설정
               templates: {
                   'tpl': tpl
               }
               // 이벤트 설정
               , events: {
                   'click .PWF504-browse-btn': 'selectBase'
                   ,'click .PWF504-nxt-btn' : 'selectNextlBase'
                   ,'click .PWF504-filter-toggle-btn' : 'toggleFilterSection'
				   ,'click #pop5': 'popUpStaffId'
				   ,'click input[type="checkbox"][data-form-param="self"]': 'setStaff'
               }


               , initialize: function (initData) {
                   var that = this;


                   // initData 저장
                   $.extend(that, initData);


                   // 페이지 템플릿 설정
                   that.$el.html(that.tpl());


                   that.initializeGlobalVariables(); //전역변수 초기화
               }


               //전역변수 초기화
               , initializeGlobalVariables : function(){
            	   isSimple = true;
                   pgCnt = PAGE_COUNT;
                   pgNbr = 1;
               }


               , render: function() {
            	   function  fake_fn_getCodeList(sParam, that, selectStyle) {
	          			 var sectionArea = $(document.createElement('section'));
	          			 sectionArea.addClass("bx-combo-box-wrap");
	          			 sParam.className = "."+sParam.className;
	          	    	  that.$el.find(sParam.className).html("");


	          	    	  var selectArea = $(document.createElement('select'));
	          	    	  $(selectArea).addClass("bx-combo-box bx-form-item bx-compoenent-small");
	          	    	  selectStyle && $(selectArea).css(selectStyle);
	          	    	  $(selectArea).attr("data-form-param", sParam.targetId);


	          	    	  if(sParam.nullYn == "Y") {
	          	    		  var option = $(document.createElement('option')).val("").text(" ");
	          	    		  $(selectArea).append(option);
	          	    	  }


	          	    	  // Make elements by manual
	          	    	  if(sParam.cdNbr == "50026") { // Task 구분
	          	    		  var option01 = $(document.createElement('option')).val('01').text('대기 Task');
	          	    		  $(selectArea).append(option01);
	          	    		  var option02 = $(document.createElement('option')).val('02').text('완료 Task');
	          	    		  $(selectArea).append(option02);
	          	    	  }


	          	    	  $(sectionArea).html(selectArea);


	          	    	  that.$el.find(sParam.className).html(sectionArea);
            	   }


            	   var that = this;


            	   // 	데이터 피커 로드
            	   that.loadDatePicker();


                   sParam = {}; //데이터 초기화
                   selectStyle = {"width": '100%'}; //스타일 초기화
                   //combobox 정보 셋팅
                   sParam.className = "PWF504-taskDsCd-wrap";
                   sParam.targetId = "taskDsCd";
                   sParam.nullYn = "N";
                   //inData 정보 셋팅
                   sParam.cdNbr = "A0452"; //승인상태코드
                   // 콤보데이터 load
                   fn_getCodeList(sParam, this, selectStyle);


                   that.$el.find('[data-form-param="aprvlDemandDt1"]').css("width", "125px");
                   that.$el.find('[data-form-param="aprvlDemandDt2"]').css("width", "125px");


                   that.$el.find('[data-form-param="exctnDt1"]').css("width", "125px");
                   that.$el.find('[data-form-param="exctnDt2"]').css("width", "125px");
                   return this.$el;
               }
               , loadDatePicker: function () {
            	   this.subViews['aprvlDemandDt1'] && this.subViews['aprvlDemandDt1'].remove();
                   this.subViews['aprvlDemandDt2'] && this.subViews['aprvlDemandDt2'].remove();
                   this.subViews['exctnDt1'] && this.subViews['exctnDt1'].remove();
                   this.subViews['exctnDt2'] && this.subViews['exctnDt2'].remove();


                   this.subViews['aprvlDemandDt1'] = new DatePicker({
                	   inputAttrs: { 'data-form-param': 'aprvlDemandDt1'},
                	   setTime: false
                   });


                   this.subViews['aprvlDemandDt2'] = new DatePicker({
                	   inputAttrs: { 'data-form-param': 'aprvlDemandDt2' },
                	   setTime: false
                   });


                   this.subViews['exctnDt1'] = new DatePicker({
                	   inputAttrs: { 'data-form-param': 'exctnDt1'},
                	   setTime: false
                   });


                   this.subViews['exctnDt2'] = new DatePicker({
                	   inputAttrs: { 'data-form-param': 'exctnDt2' },
                	   setTime: false
                   });


                   // 데이터 피커 렌더
                   this.$el.find('.aprvlDemandDt1-wrap').html(this.subViews['aprvlDemandDt1'].render());
                   this.$el.find('.aprvlDemandDt2-wrap').html(this.subViews['aprvlDemandDt2'].render());
                   this.$el.find('.exctnDt1-wrap').html(this.subViews['exctnDt1'].render());
                   this.$el.find('.exctnDt2-wrap').html(this.subViews['exctnDt2'].render());
               }


               /* ======================================================================== */
               /*    Click select btn                                                      */
               /* ======================================================================== */
               //조회 버튼 클릭 - 조건 취합
               , assembleCommonBaseParam: function (_pageNum) {
            	    var that = this;


            	    var param = {};


					var instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);


					if (instCd == null) {
					    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
					     return;
					}


					// 조회 key값 set
					param.instCd = instCd;


					//승인요청자 기준 조회
					if(that.$el.find('input[type="checkbox"][data-form-param="self"]').is(":checked")){ //체크된 경우
						param.aprvlStsCd = that.$el.find('[data-form-param="taskDsCd"]').val(); //승인상태코드
					}else{ //승인자 기준 조회
						param.aprvlStaffId = commonInfo.getUserInfo().staffId;
						param.dlgtnAprvlStaffId = commonInfo.getUserInfo().staffId;
						param.dtlAprvlStsCd = that.$el.find('[data-form-param="taskDsCd"]').val(); //상세승인상태코드
//						param.aprvlStsCd = that.$el.find('[data-form-param="taskDsCd"]').val(); //상세승인상태코드
					}


					pageNum = _pageNum; //global 변수에 할당
					param.pageCount = pageCount;
					param.pageNum = pageNum;


					return param;
               }
               //조회 버튼 클릭
               , selectBase: function () {
					var that = this;


					var param = that.assembleCommonBaseParam(1);


					if(that.$el.find('.PWF504-filter-toggle-btn').text() == bxMsg('cbb_items.SCRNITM#filter-toggle-on')) {
						isSimple = true;
						that.selectSimple(param);
					}
					else {
						isSimple = false;
						that.selectDetail(param);
					}
               } // end of select function


               , selectNextlBase: function () {
            	    var that = this;


            	    var param = that.assembleCommonBaseParam(pageNum+1);


	                if(isSimple) {
	                	that.selectSimple(param);
               		} else {
               			that.selectDetail(param);
         			}
               } // end of select function
	           , selectSimple: function(param) {
	        	   var that = this;


//	                param.aprvlStsCd = that.$el.find('[data-form-param="taskDsCd"]').val(); //Task 구분
	                that.trigger('loadData', param);
	           }
               , selectDetail: function(param) {
	               var that = this;


	                param.aprvlDemandStaffId = that.$el.find('[data-form-param="aprvlDemandStaffId"]').val(); //승인요청스태프식별자


	                param.aprvlAplctnDtFrom = that.subViews['aprvlDemandDt1'].getValue(); //요청시작일
	                param.aprvlAplctnDtTo = that.subViews['aprvlDemandDt2'].getValue(); //요청종료일
	                param.lastAprvlDtFrom = that.subViews['exctnDt1'].getValue(); //실행시작일
	                param.lastAprvlDtTo = that.subViews['exctnDt2'].getValue(); //실행종료일


	                that.trigger('loadData', param);
            }
            , toggleFilterSection: function() {
            	var that = this;
            	that.$el.find('#filter-wrap').toggle();
            	if(that.$el.find('.PWF504-filter-toggle-btn').html() == bxMsg('cbb_items.SCRNITM#filter-toggle-on'))
            		that.$el.find('.PWF504-filter-toggle-btn').html(bxMsg('cbb_items.SCRNITM#filter-toggle-off'));
            	else
            		that.$el.find('.PWF504-filter-toggle-btn').html(bxMsg('cbb_items.SCRNITM#filter-toggle-on'));
            }
            , reset : function() {
            	var that = this;


            	that.$el.find('[data-form-param="aprvlDemandStaffId"]').val("");
            	that.$el.find('[data-form-param="aprvlDemandStaffNm"]').val("");
                that.$el.find('[data-form-param="custId"]').val("");
                that.$el.find('[data-form-param="custNm"]').val("");
                that.$el.find('[data-form-param="pdCd"]').val("");
                that.$el.find('[data-form-param="pdNm"]').val("");
                that.$el.find('[data-form-param="wflowIdKey"]').val("");
                that.$el.find('[data-form-param="wflowNm"]').val("");
                that.$el.find('[data-form-param="acctNbr"]').val("");
                that.$el.find('[data-form-param="aprvlDemandDt1"]').val("");
                that.$el.find('[data-form-param="aprvlDemandDt2"]').val("");
                that.$el.find('[data-form-param="exctnDt1"]').val("");
                that.$el.find('[data-form-param="exctnDt2"]').val("");


                that.trigger('reset');
            }
             /* ======================================================================== */
             /*    고객조회 팝업                                */
             /* ======================================================================== */
             , popupCustId: function() {
            	 var that = this;
            	 var param = {};


            	 param.type = "03";
            	 param.data =that.$el.find('[data-form-param="custNm"]').val(); //고객식별자명


            	 var popupScu100List = new PopupScu100List(param); // 팝업생성
            	 popupScu100List.render();


            	 popupScu100List.on('popUpSetData', function(param) {
            		 that.$el.find('[data-form-param="custId"]').val(param.custId);
            		 that.$el.find('[data-form-param="custNm"]').val(param.custNm);
            	 });
             }
             , popUpWflowId : function() {
            	 var that = this;
            	 var param = {};


            	 var instInfo = commonInfo.getInstInfo();
                 param.instCd = instInfo.instCd;


            	 var popupWflowId = new PopupWflowId(param); // 팝업생성
            	 popupWflowId.render();


            	 popupWflowId.on('popUpSetData', function(param) {


        		 that.$el.find('[data-form-param="wflowIdKey"]').val(param.wflowId); // 워크플로우식별자키
        		 that.$el.find('[data-form-param="wflowNm"]').val(param.wflowNm); // 워크플로우명
            	 });
             }
             , popUpPdCd: function() {
                 var that = this;
                 var param = {};


                 var popupPdCd = new PopupPdCd(param); // 팝업생성
                 popupPdCd.render();


                 popupPdCd.on('popUpSetData', function(param) {
                     that.$el.find('[data-form-param="pdCd"]').val(param.pdCd); // 상품식별자
                     that.$el.find('[data-form-param="pdNm"]').val(param.pdNm); // 상품명
                     // 팝업에서 추가로 받을 데이터는 여기서 추가로 정의함
                 });
             }


             , popUpStaffId: function() {
	           	 var that = this;
	                var param = {};


	                var popupStaffId = new PopupStaffId(param); // 팝업생성
	                popupStaffId.render();


	                popupStaffId.on('popUpSetData', function(param) {
	                	console.log(param);
	                    that.$el.find('[data-form-param="aprvlDemandStaffId"]').val(param.staffId); // 스태프 식별자
	                    that.$el.find('[data-form-param="aprvlDemandStaffNm"]').val(param.staffNm); // 스태프명
                });
            }
            , setStaff: function() { //자신 체크박스 클릭 시
            	var that = this;


            	var staffId = "";
            	var name = "";


            	if(that.$el.find('input[type="checkbox"][data-form-param="self"]').is(":checked")){
            		staffId = commonInfo.getUserInfo().staffId;
                	name = commonInfo.getUserInfo().name;
            	}


            	that.$el.find('[data-form-param="aprvlDemandStaffId"]').val(staffId); // 스태프 식별자
            	that.$el.find('[data-form-param="aprvlDemandStaffNm"]').val(name); // 스태프명
            }
        }); // end of Backbone.View.extend({


       return PWFBaseView;


     } // end of define function
); // end of define
