define(
    [
         'bx/common/config'
         ,'bx-component/message/message-alert'
         ,'bx-component/message/message-confirm'
         ,'bx-component/date-picker/_date-picker'
         ,'text!app/views/page/PWF/020/PWF020-base-tpl.html'
         ,'app/views/page/popup/popup-custId'
         ,'app/views/page/popup/popup-staffId'
         ,'app/views/page/popup/popup-wflowId'
         ,'app/views/page/popup/popup-pdId'
         ,'bx/common/common-info'
   ],
   function (
         config
         , alertMessage
         , confirmMessage
         , DatePicker
         , tpl
         , PopupScu100List
         , PopupStaffId
         , PopupWflowId
         , PopupPdCd
         , commonInfo
   ){
         var isSimple = true; //단순조회, 상세조회
         var pgCnt = 20;
         var pgNbr = 1;


         var PWFBaseView = Backbone.View.extend({
               // 태그이름 설정
               tagName: 'section',
               // 클래스이름 설정
               className: 'PWF020-base-page',
               // 탬플릿 설정
               templates: {
                   'tpl': tpl
               }
               // 이벤트 설정
               , events: {
                    'click .PWF020-rst-btn': 'reset'
                   ,'click .PWF020-browse-btn': 'selectSimpleBase'
                   ,'click .PWF020-detail-browse-btn' : 'selectDetailBase'
                   ,'click .PWF020-nxt-btn' : 'selectNextlBase'	   
                   ,'click .PWF020-filter-toggle-btn' : 'toggleFilterSection'                	   
				   ,'click #pop2': 'popupCustId'
				   ,'click #pop3': 'popUpPdCd'
				   ,'click #pop4': 'popUpWflowId'
				   ,'click #pop5': 'popUpStaffId'
               }


               , initialize: function (initData) {
                   var that = this;


                   // initData 저장
                   $.extend(that, initData);


                   // 페이지 템플릿 설정
                   that.$el.html(that.tpl());
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
                   sParam.className = "PWF020-taskDsCd-wrap";
                   sParam.targetId = "taskDsCd";
                   sParam.nullYn = "N";
                   //inData 정보 셋팅
                   sParam.cdNbr = "11901";
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
               , selectSimpleBase: function () {
            	   var that = this;
	               var param = {};


	        	   isSimple = true;
	               var instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);


	             	if (instCd == null) {
	                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
	                     return;
	                }


	                // 조회 key값 set
	             	pgNbr = 1;
	                param.instCd = instCd;
	                param.pgCnt = pgCnt;
	                param.pgNbr = pgNbr;


	                that.selectSimple(param);
               } // end of select function
               , selectDetailBase: function () {
            	   var that = this;
	               var param = {};


	               isSimple = false;
	               var instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);


	             	if (instCd == null) {
	                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
	                     return;
	                }


	                // 조회 key값 set
	             	pgNbr = 1;
	                param.instCd = instCd;
	                param.pgCnt = pgCnt;
	                param.pgNbr = pgNbr;


	                that.selectDetail(param);
               } // end of select function


               , selectNextlBase: function () {
            	   var that = this;
	               var param = {};


	               var instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);


	             	if (instCd == null) {
	                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
	                     return;
	                }


	                // 조회 key값 set
	             	pgNbr++;
	                param.instCd = instCd;
	                param.pgCnt = pgCnt;
	                param.pgNbr = pgNbr;


	                if(isSimple) {
	                	that.selectSimple(param);
               		} else {
               			that.selectDetail(param);
         			}
               } // end of select function
	           , selectSimple: function(param) {
	        	   var that = this;


	                param.taskDsCd = that.$el.find('[data-form-param="taskDsCd"]').val(); //Task 구분
	                that.trigger('loadData', param);
	           }
               , selectDetail: function(param) {
	               var that = this;


	                param.taskDsCd = that.$el.find('[data-form-param="taskDsCd"]').val(); //Task 구분
	                param.aprvlDemandStaffId = that.$el.find('[data-form-param="aprvlDemandStaffId"]').val(); //승인요청스태프식별자
	                param.custId = that.$el.find('[data-form-param="custId"]').val(); //고객식별자
	                param.pdCd = that.$el.find('[data-form-param="pdCd"]').val(); //상품식별자
	                param.wflowIdKey = that.$el.find('[data-form-param="wflowIdKey"]').val(); //프로세스식별자
	                param.acctNbr = that.$el.find('[data-form-param="acctNbr"]').val(); //계좌번호


	                param.aprvlDemandDt1 = that.subViews['aprvlDemandDt1'].getValue(); //요청시작일
	                param.aprvlDemandDt2 = that.subViews['aprvlDemandDt2'].getValue(); //요청종료일
	                param.exctnDt1 = that.subViews['exctnDt1'].getValue(); //실행시작일
	                param.exctnDt2 = that.subViews['exctnDt2'].getValue(); //실행종료일


	                that.trigger('loadData', param);
            }
            , toggleFilterSection: function() {
            	var that = this;
            	that.$el.find('#filter-wrap').toggle();
            	if(that.$el.find('.PWF020-filter-toggle-btn').html() == bxMsg('cbb_items.SCRNITM#filter-toggle-on'))
            		that.$el.find('.PWF020-filter-toggle-btn').html(bxMsg('cbb_items.SCRNITM#filter-toggle-off'));
            	else 
            		that.$el.find('.PWF020-filter-toggle-btn').html(bxMsg('cbb_items.SCRNITM#filter-toggle-on'));
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
        }); // end of Backbone.View.extend({


       return PWFBaseView;


     } // end of define function
); // end of define
