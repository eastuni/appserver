define(
    [
         'bx/common/config'
         ,'bx-component/message/message-alert'
         ,'bx-component/message/message-confirm'
         ,'bx-component/date-picker/_date-picker'
         ,'text!app/views/page/PWF/030/PWF030-base-tpl.html'
         ,'bx/common/common-info'
         ,'app/views/page/popup/popup-staffId'
         ,'app/views/page/popup/popup-custId'
         ,'bx/common/common-message'
   ],
   function (
         config
         , alertMessage
         , confirmMessage
         , DatePicker
         , tpl
         , commonInfo
         , PopupStaffId
         , PopupCust
   ) {
         var evtCd; // 이벤트코드
         var PWFBaseView = Backbone.View.extend({
               // 태그이름 설정
               tagName: 'section',


               // 클래스이름 설정
               className: 'PWF030-base-page',


               // 탬플릿 설정
               templates: {
                   'tpl': tpl
               }


         	   // 이벤트 설정
               , events: {
            	   'click .PWF030-browse-btn': 'fn_getTaskInfo'
            	   ,'click .PWF030-claim-btn': 'fn_claim'
            	   ,'click .PWF030-reassign-btn': 'fn_reassign'
                   ,'click .PWF030-execution-btn': 'fn_execute'
                   ,'click #pop_exctnStaffId': 'popUpStaff'
               }


               , initialize: function (initData) {
                   var that = this;


                   // initData 저장
                   $.extend(that, initData);


                   // 페이지 템플릿 설정
                   that.$el.html(that.tpl());
               }


               , render: function() {
            	   var that =this;


            	   // 	데이터 피커 로드
            	   that.loadDatePicker();


                   return this.$el;
               }


               , loadDatePicker: function () {
                   this.subViews['exctnStDt'] = new DatePicker({
                	   inputAttrs: { 'data-form-param': 'exctnStDt'},
                	   setTime: false
                   });


                   this.subViews['exctnEdDt'] = new DatePicker({
                	   inputAttrs: { 'data-form-param': 'exctnEdDt' },
                	   setTime: false
                   });


                   this.subViews['exctnStDt'].setLinkDatePicker('start', this.subViews['exctnEdDt']);
                   this.subViews['exctnEdDt'].setLinkDatePicker('end', this.subViews['exctnStDt']);


                   // 데이터 피커 렌더
                   this.$el.find('.PWF030-exctnStDt-wrap').html(this.subViews['exctnStDt'].render());
                   this.$el.find('.PWF030-exctnEdDt-wrap').html(this.subViews['exctnEdDt'].render());
               }


               , fn_claim: function() {
				   var that = this;
				   var sParam = {};


                   var instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);


              	   if (instCd == null) {
              		  alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                      return;
              	   }


                   sParam.instCd = instCd;
                   sParam.taskId = that.$el.find('[data-form-param="taskId"]').val();
                   sParam.exctnStaffId = that.$el.find('[data-form-param="exctnStaffId"]').val();
                   sParam.exctnStaffRoleNm = "claim";


                   var linkData = {"header":fn_getHeader("PWF0308201"), "ToDoMgmtSvcUpdateToDoMgmtListIn":sParam};
                   bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	  success: function(responseData) {
                 		 if(fn_commonChekResult(responseData)) {
                 			 alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                 		 }
                 	  }
                   });
	           }


               , fn_reassign: function() {
            	   var that = this;
	               var sParam = {};


                   if(!that.$el.find('[data-form-param="reasgndExctnStaffId"]').val()) {
                	   return false;
                   }


                   var instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);


              	   if (instCd == null) {
              		  alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                      return;
              	   }


                   sParam.instCd = instCd;
                   sParam.taskId = that.$el.find('[data-form-param="taskId"]').val();
                   sParam.exctnStaffId = that.$el.find('[data-form-param="reasgndExctnStaffId"]').val();
                   sParam.assignee = that.$el.find('[data-form-param="reasgndExctnStaffId"]').val();
                   sParam.taskOwnr = that.$el.find('[data-form-param="reasgndExctnStaffId"]').val();
                   sParam.exctnStaffRoleNm = "delegate";


                   var linkData = {"header":fn_getHeader("PWF0308201"), "ToDoMgmtSvcUpdateToDoMgmtListIn":sParam};


                   bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	  success: function(responseData) {
                 		 alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                 	  }
                   });
               }


               , fn_execute: function () {
                   var that = this;
                   var param = {};


                   console.log("pageHandler: " + that.$el.find('[data-form-param="pgHandler"]').val());
                   console.log("taskId: " + that.$el.find('[data-form-param="taskId"]').val());
                   console.log("wflowInstncId: " + that.$el.find('[data-form-param="wflowInstncId"]').val());


                   var pageHandler = that.$el.find('[data-form-param="pgHandler"]').val();


                   that.$el.trigger({
                	   type: 'open-conts-page',
                	   pageHandler: pageHandler,
                	   pageDPName: bxMsg('cbb_items.SCRN#' + pageHandler),
                   	   pageInitialize: true,
                   	   pageRenderInfo: {
                   		   taskId: that.$el.find('[data-form-param="taskId"]').val(),
                   		   wflowInstncId: that.$el.find('[data-form-param="wflowInstncId"]').val()
                   	   }


                   });
               } // end of fn_execute


            //메인페이지에서 넘어온 값 체크
            , fn_setTaskData : function(param) {
            	var that = this;


            	if(param) {
            		that.$el.find('[data-form-param="taskId"]').val(param.taskId);
           		 	that.$el.find('[data-form-param="taskNm"]').val(param.taskNm);


           		 	that.loadTaskData(param);
            	}
            }


            , fn_getTaskInfo : function() {
            	var that = this;


            	if(that.$el.find('[data-form-param="taskId"]').val()) {
            		var param = {};
            		param.taskId = that.$el.find('[data-form-param="taskId"]').val();


            		that.loadTaskData(param);
            	}
            }


            , loadTaskData : function(param) {
            	var that = this;


                var instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);


           	 	if (instCd == null) {
                   alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                   return;
           	 	}


            	var sParam = {};
                sParam.instCd = instCd; 
                sParam.taskId = param.taskId;


                var linkData = {"header":fn_getHeader("PWF0308401"), "ToDoMgmtSvcGetToDoMgmtListIn":sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData),{
              	  success: function(responseData) {
              		if(fn_commonChekResult(responseData)) {
                        var result = responseData.ToDoMgmtSvcGetToDoMgmtListOut;
//                      that.$el.find('[data-form-param="taskId"]').val(result.taskId);
                        that.$el.find('[data-form-param="taskNm"]').val(result.taskNm);
                        that.$el.find('[data-form-param="wflowId"]').val(result.wflowId);
                        that.$el.find('[data-form-param="wflowNm"]').val(result.wflowNm);
                        that.$el.find('[data-form-param="exctnStaffId"]').val(result.exctnStaffId);
                        that.$el.find('[data-form-param="exctnStaffNm"]').val(result.exctnStaffNm);
                        that.$el.find('[data-form-param="reasgndExctnStaffId"]').val(result.reasgndExctnStaffId);
                        that.$el.find('[data-form-param="reasgndExctnStaffNm"]').val(result.reasgndExctnStaffNm);
                        that.$el.find('[data-form-param="crtnDt"]').val(result.crtnDt);
                        that.$el.find('[data-form-param="exctnDt"]').val(result.exctnDt);
                        that.$el.find('[data-form-param="custId"]').val(result.custId);
                        that.$el.find('[data-form-param="custNm"]').val(result.custNm);
                        that.$el.find('[data-form-param="pdCd"]').val(result.pdCd);
                        that.$el.find('[data-form-param="pdNm"]').val(result.pdNm);
                        that.$el.find('[data-form-param="wflowInstncId"]').val(result.wflowInstncId);
                        that.$el.find('[data-form-param="pgHandler"]').val(result.pgHandlerCntnt);
                    }
              	  }
                });
            }


            , popUpStaff: function() {
	           	 var that = this;
	                var param = {};


	                var popupStaffId = new PopupStaffId(param); // 팝업생성
	                popupStaffId.render();


	                popupStaffId.on('popUpSetData', function(param) {	    
	                	console.log(param);
	                    that.$el.find('[data-form-param="exctnStaffId"]').val(param.staffId); // 스태프 식별자
	                    that.$el.find('[data-form-param="exctnStaffNm"]').val(param.staffNm); // 스태프명
                });
            }


             , popUpCust: function() {
            	 var that = this;
            	 var param = {};


            	 param.type = "03";
            	 param.data =that.$el.find('[data-form-param="custNm"]').val(); //고객식별자명


            	 var popupCust = new PopupCust(param); // 팝업생성
            	 popupCust.render();


            	 popupCust.on('popUpSetData', function(param) {
            		 that.$el.find('[data-form-param="custId"]').val(param.custId);
            		 that.$el.find('[data-form-param="custNm"]').val(param.custNm);
            	 });
             }
        }); // end of Backbone.View.extend({


       return PWFBaseView;


     } // end of define function
); // end of define
