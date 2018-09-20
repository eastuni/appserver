define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/001/_CAPMT001.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPAT/popup-staffId'
        , 'app/views/page/popup/CAPSV/popup-service'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , commonInfo
        , PopupStaffId
        , PopupSrvcCd) {


        /**
		 * Backbone
		 */
        var CAPMT001View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT001-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
            	/*
                 * search-condition-area
                 */
                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-search-condition-inquire': 'inquireSearchCondition',
                'click #btn-search-condition-toggle': 'toggleSearchCondition',


                'click #btn-srvcCd-search':'popupSrvcCd',
                'click #btn-staffId-search':'popupStaffId',


                'click #btn-search-result-excel':'downloadExcel',
                'click #btn-search-result-toggle':'toggleSearchResult',


                'click #btn-detail-information-toggle':'toggleDetailInfomation',


                'click #tab-hdrCntnt':'tabHdrCntnt',
                'click #tab-inpCntnt':'tabInpCntnt',
                'click #tab-outpCntnt':'tabOutpCntnt'




            }


            /**
			 * initialize
			 */
            , initialize: function (initData) {
                var that = this;
                that.pgNbr = 1;
                that.pgCnt = 50;




                $.extend(that, initData);
                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);
                that.$el.html(that.tpl());


                var sParam1 = {};
                sParam1.cdNbr = "11930"; // 채널코드
                var sParam2 = {};
                sParam2.cdNbr = "A0126"; // 에러유무코드
                var sParam3 = {};
                sParam3.cdNbr = "A0132"; // 에러레벨코드
                var sParam4 = {};
                sParam4.cdNbr = "11603"; // 컴포넌트코드


                bxProxy.all([{
                        // 채널코드콤보 로딩
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore1 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                	},{// 에러유무콤보 로딩
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam2}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore2 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }
                	},{// 에러레벨콤보 로딩
		                url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam3}), success: function (responseData) {
		                    if (fn_commonChekResult(responseData)) {
		                        comboStore3 = new Ext.data.Store({
		                            fields: ['cd', 'cdNm'],
		                            data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
		                        });
		                    }
		                }
		            },{// 컴포넌트코드 로딩
		                url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam4}), success: function (responseData) {
		                    if (fn_commonChekResult(responseData)) {
		                        comboStore4 = new Ext.data.Store({
		                            fields: ['cd', 'cdNm'],
		                            data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
		                        });
		                    }
		                }
		            }]
                    , {
                        success: function () {
                            that.CAPMT001Grid = new ExtGrid({
                                // 그리드 컬럼 정의
                                fields: ['txHms', 'cmpntCd', 'srvcNm', 'chnlCd', 'staffId', 'errYn', 'errLvlCd', 'msgCd', 'guid']
                                , id: 'CAPMT001Grid'
                                , columns: [{
                                    text: 'No.'
                                    , dataIndex: 'rowIndex'
                                    , sortable: false
                                    , width : 80
                                    , height : 25
                                    , style: 'text-align:center'
                                    , align: 'right'
                                    // other config you need....
                                    , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                        return rowIndex + 1;
                                        }
                                    }	
	                        		, {
                                        text: bxMsg('cbb_items.AT#txHms')
                                        , flex: 3
                                        , dataIndex: 'txHms'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    	, renderer: function (val) {
                                    			ret = val.substring(0,2)+":"+val.substring(2,4)+":"+val.substring(4,6);
                                                return ret;
                                        }
                                    }
	                        		, {
                                        text: bxMsg('cbb_items.AT#cmpntCd')
                                        , flex: 3
                                        , dataIndex: 'cmpntCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , renderer: function (val) {
                                           	index = comboStore4.findExact('cd', val);
                                           	if (index != -1) {
                                           		rs = comboStore4.getAt(index).data;
                                                return rs.cdNm;
                                            }
                                        }
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#srvcNm')
                                        , flex: 7
                                        , dataIndex: 'srvcNm'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#chnlCd')
                                        , flex: 3
                                        , dataIndex: 'chnlCd'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                        , renderer: function (val) {
                                        	index = comboStore1.findExact('cd', val);
                                        	if (index != -1) {
                                        		rs = comboStore1.getAt(index).data;
                                                return rs.cdNm;
                                            }
                                        }
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#staffId')
                                        , flex: 4
                                        , dataIndex: 'staffId'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#errYn')
                                        , flex: 3
                                        , dataIndex: 'errYn'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                        , renderer: function (val) {
                                        	index = comboStore2.findExact('cd', val);
                                        	if (index != -1) {
                                        		rs = comboStore2.getAt(index).data;
                                                return rs.cdNm;
                                            }
                                        }
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#errLvlCd')
                                        , flex: 3
                                        , dataIndex: 'errLvlCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , renderer: function (val) {
                                        	index = comboStore3.findExact('cd', val);
                                        	if (index != -1) {
                                        		rs = comboStore3.getAt(index).data;
                                                return rs.cdNm;
                                            }
                                        }
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#msgCd')
                                        , flex: 4
                                        , dataIndex: 'msgCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                    	text: bxMsg('cbb_items.AT#guid')
                                    	, flex: 11
                                    	, dataIndex: 'guid'
                                    	, style: 'text-align:center'
                                    	, align: 'center'
                                    }
                                ] // end of columns


                                , listeners: {
                                	viewready: function(grid, eOpts){
                                        grid.view.getEl().on( 'scroll', function(event, target) {
                                            var viewEndPosition = target.scrollHeight - target.offsetHeight;


                                            if ((viewEndPosition > 0) && (viewEndPosition <= target.scrollTop)){
                                               that.queryNext();
                                            }
                                        });
                                	},
                                    click: {
                                        element: 'body'
                                        , fn: function () {
                                        	var selectedData = that.CAPMT001Grid.grid.getSelectionModel().selected.items[0];
                                        	if (!selectedData) {
                                        		return;
                                        	}


                                        	that.inquiryDetail(selectedData.data)
                                        }
                                    }
                                }
                            });


                            // 단일탭 그리드 렌더
                            that.$el.find("#CAPMT001Grid").html(that.CAPMT001Grid.render({'height': CaGridHeight}));
                        } // end of success:.function
                    }); // end of bxProxy.all
            }


            /**
			 * render
			 */
            , render: function () {
                var that = this;


                // 데이트 피커 로드
                this.loadDatePicker();
                this.setTimeInput();


                // 콤보데이터 로딩
                // 채널코드
                fn_getCodeList({className:"CAPMT001-chnlCd-wrap",targetId:"chnlCd",nullYn:"Y",allNm:bxMsg('cbb_items.SCRNITM#all'),cdNbr:"11930"}, this);
                //에러유무코드
                fn_getCodeList({className:"CAPMT001-errYnCd-wrap",targetId:"errYn",nullYn:"Y",allNm:bxMsg('cbb_items.SCRNITM#all'),cdNbr:"A0126"}, this);
                //에러레벨코드
                fn_getCodeList({className:"CAPMT001-errLvlCd-wrap",targetId:"errLvlCd",nullYn:"Y",allNm:bxMsg('cbb_items.SCRNITM#all'),cdNbr:"A0132"}, this);
                //컴포넌트코드
                fn_getCodeList({className:"CAPMT001-cmpntCd-wrap",targetId:"cmpntCd",nullYn:"Y",allNm:bxMsg('cbb_items.SCRNITM#all'),cdNbr:"11602"}, this);
                //상세정보
                // 채널코드
                fn_getCodeList({className:"CAPMT001-chnlCd-wrap2",targetId:"chnlCd",nullYn:"Y",cdNbr:"11930", disabled:true}, this);
                //에러유무코드
                fn_getCodeList({className:"CAPMT001-errYnCd-wrap2",targetId:"errYn",nullYn:"Y",cdNbr:"A0126", disabled:true}, this);
                //에러레벨코드
                fn_getCodeList({className:"CAPMT001-errLvlCd-wrap2",targetId:"errLvlCd",nullYn:"Y",cdNbr:"A0132", disabled:true}, this);
                //컴포넌트코드
                fn_getCodeList({className:"CAPMT001-cmpntCd-wrap2",targetId:"cmpntCd",nullYn:"Y",cdNbr:"11602", disabled:true}, this);
                //사용자그룹코드
                fn_getCodeList({className:"CAPMT001-userGrpCd-wrap2",targetId:"userGrpCd",nullYn:"Y",cdNbr:"11001", disabled:true}, this);


                this.resetSearchCondition();


                return this.$el;
            }


            /**
			 * 조회조건 초기화
			 */
            , resetSearchCondition: function () {
                that = this;
                var d = new Date();
                this.$el.find('#CAPMT001-condition-table [data-form-param="startTxHms"]').val(this.getHms(d, -1));
                this.$el.find('#CAPMT001-condition-table [data-form-param="endTxHms"]').val(this.getHms(d,0));
                this.$el.find('#CAPMT001-condition-table [data-form-param="txDt"]').val(getCurrentDate("yyyy-mm-dd"));
                that.$el.find('#CAPMT001-condition-table [data-form-param="cmpntCd"]').val("");
                that.$el.find('#CAPMT001-condition-table [data-form-param="srvcCd"]').val("");
                that.$el.find('#CAPMT001-condition-table [data-form-param="chnlCd"]').val("");
                that.$el.find('#CAPMT001-condition-table [data-form-param="staffId"]').val("");
                that.$el.find('#CAPMT001-condition-table [data-form-param="errYn"]').val("");
                that.$el.find('#CAPMT001-condition-table [data-form-param="errLvlCd"]').val("");


                if(that.CAPMT001Grid){
                	that.CAPMT001Grid.resetData();
                	that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
                }
            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            , inquireSearchCondition: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('#CAPMT001-condition-table'));
                that.conditionParam = sParam;
                that.pgNbr=1;
                that.inquiryList(sParam);
            }


            /**
             * 다음 조회
             */
            , queryNext: function () {
                var that = this;
                if(!that.morePage){
                	return;
                }
                var sParam = that.conditionParam
                that.pgNbr++;


                that.inquiryList(sParam);
            }


            /**
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryList: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;
                if(sParam.startTxHms){
                	sParam.startTxHms = fn_getTimeValue(sParam.startTxHms);
                }
                if(sParam.endTxHms){
                	sParam.endTxHms = fn_getTimeValue(sParam.endTxHms);
                }


                sParam.txDt = sParam.txDt.replace(/-/gi,"");
                sParam.pgNbr = that.pgNbr;
                sParam.pgCnt = that.pgCnt;


                var linkData = {"header": fn_getHeader("CAPMT0018401"), "inputDto": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	var data;
                        	for (var name in responseData) {
                        		if(name!="header") data=responseData[name];
                        	}
                        	var tbList = data.logList;
                            if (tbList != null || tbList.length > 0) {
                                if (sParam.pgNbr == 1) {
                                    // 조회
                                    that.CAPMT001Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(data.totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                } else {
                                    // 다음 조회
                                    that.CAPMT001Grid.addData(tbList);
//                                    that.CAPMT001Grid.grid.getSelectionModel().select((that.pgNbr-1) * that.pgCnt + tbList.length -1);
                                }
                                if(tbList.length < that.pgCnt){
                                	that.morePage = false;
                                	that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(that.CAPMT001Grid.getAllData().length)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                }else{
                                	that.morePage = true;
                                }
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end
            /**
             * 시간 조회
             * addHours (-/+) 시간
             */
            , getHms: function (date, addHours) { 
            	var d = date;
            	var hr = d.getHours();
            	var min = d.getMinutes();
            	var sec = d.getSeconds();


            	hr = hr + addHours;
            	if(hr < 0) hr=0;
            	if(hr >23) hr=23;


            	if (hr < 10) hr = "0" + hr;
            	if (min < 10) min = "0" + min;




            	reTime = hr + ":" + min + ":" + sec;
                return reTime;
            }
            /**
			 * 타임 포맷
			 */
            ,setTimeInput: function () {
                this.$el.find('#CAPMT001-condition-table [data-form-param="startTxHms"]').mask("99:99:99", {placeholder:"--:--:--"});
                this.$el.find('#CAPMT001-condition-table [data-form-param="endTxHms"]').mask("99:99:99", {placeholder:"--:--:--"});
            }
            /**
			 * 데이터 피커 로드 컴포넌트 데이터 피커를 사용
			 */
            , loadDatePicker: function () {
            	  fn_makeDatePicker(this.$el.find('#search-condition-area [data-form-param="txDt"]'));
            }


            /**
			 * 그리드 행 더블클릭
			 */
            , inquiryDetail: function (selectedData) {
                var that = this;
                var sParam = {"txDt":that.conditionParam.txDt,"guid":selectedData.guid};
                sParam.txDt = sParam.txDt.replace(/-/gi,"");
                sParam.seqNbr=0;
                var linkData = {"header": fn_getHeader("CAPMT0018402"), "inputDto": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	var data;
                        	for (var name in responseData) {
                        		if(name!="header") data=responseData[name];
                        	}
                        	that.displayDetail(data);
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy


            }
            /**
			 * 상세정보 
			 */
            , displayDetail: function (detail) {
                var that = this;
                var txHms = ""; 
                var txDt = ""; 
            	if(detail.txHms){
            		var val=detail.txHms;
            		txHms=val.substring(0,2)+":"+val.substring(2,4)+":"+val.substring(4,6)
            	};
            	if(detail.txDt){
            		var val=detail.txDt;
            		txDt=val.substring(0,4)+"-"+val.substring(4,6)+"-"+val.substring(6,8)
            	};


            	that.$el.find('#CAPMT001-detail-table [data-form-param="guid"]').val(detail.guid);
            	that.$el.find('#CAPMT001-detail-table [data-form-param="txDt"]').val(txDt);
            	that.$el.find('#CAPMT001-detail-table [data-form-param="txHms"]').val(txHms);
            	that.$el.find('#CAPMT001-detail-table [data-form-param="chnlCd"]').val(detail.chnlCd);
            	that.$el.find('#CAPMT001-detail-table [data-form-param="cmpntCd"]').val(detail.cmpntCd);
                that.$el.find('#CAPMT001-detail-table [data-form-param="srvcCd"]').val(detail.srvcCd);
                that.$el.find('#CAPMT001-detail-table [data-form-param="srvcNm"]').val(detail.srvcNm);
                that.$el.find('#CAPMT001-detail-table [data-form-param="deptId"]').val(detail.deptId);
                that.$el.find('#CAPMT001-detail-table [data-form-param="userGrpCd"]').val(detail.userGrpCd);
                that.$el.find('#CAPMT001-detail-table [data-form-param="staffId"]').val(detail.staffId);
                that.$el.find('#CAPMT001-detail-table [data-form-param="custId"]').val(detail.custId);
                that.$el.find('#CAPMT001-detail-table [data-form-param="errYn"]').val(detail.errYn);
                that.$el.find('#CAPMT001-detail-table [data-form-param="errLvlCd"]').val(detail.errLvlCd);
                that.$el.find('#CAPMT001-detail-table [data-form-param="msgCd"]').val(detail.msgCd);
                var errCntnt = "";
                if(detail.errYn == "Y"){
                	errorCntnt = detail.outpCntnt;
                }
                that.$el.find('#CAPMT001-detail-table [data-form-param="errCntnt"]').val(errCntnt);
                that.$el.find('#CAPMT001-detail-table [data-form-param="dtlMsgCntnt"]').val(detail.dtlMsgCntnt);
                that.$el.find('#CAPMT001-detail-table [data-form-param="sysErrMsgCntnt"]').val(detail.sysErrMsgCntnt);
                that.$el.find('#tab-hdrCntnt-table [data-form-param="hdrCntnt"]').val(detail.hdrCntnt);
                that.$el.find('#tab-inpCntnt-table [data-form-param="inpCntnt"]').val(detail.inpCntnt);
                that.$el.find('#tab-outpCntnt-table [data-form-param="outpCntnt"]').val(detail.outpCntnt);


            }
            /**
             * 스태프 조회 팝업
             */
           , popupStaffId : function() {
				var that = this;
				var param = {};
				param.type = "03";
				param.data = that.$el.find(".staffNm-wrap").html();
				var popupStaffIdObj = new PopupStaffId(param);
				popupStaffIdObj.render();
				popupStaffIdObj.on('popUpSetData', function(param) {
					that.$el.find('[data-form-param="staffId"]').val(param.staffId);
					// that.$el.find('[data-form-param="actorNm"]').val(param.nm);
				});
           }


           /**
            *  서비스코드조회 팝업          
            */
           , popupSrvcCd: function () {


               var that = this;
               var sParam = {};
               sParam.cmpntCd=that.$el.find('.CAPMT001-base-table [data-form-param="cmpntCd"]').val();
               var popupSrvcCd = new PopupSrvcCd(sParam); // 팝업생성
               popupSrvcCd.render();


               popupSrvcCd.on('popUpSetData', function (param) {
                   that.$el.find('[data-form-param="srvcCd"]').val(param.srvcCd); //서비스코드
//                   that.$el.find('[data-form-param="srvcNm"]').val(param.srvcNm); 
               });
           }
           /**
            *  엑셀 다운로드          
            */
           ,downloadExcelFile: function () {
           	var that = this;
           	that.CAPMT001Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPMT001')+"_"+getCurrentDate("yyyy-mm-dd"));
           }
           /**
            *  헤더 탭          
            */
           ,tabHdrCntnt : function() {
           	this.$el.find('.tab').removeClass("on-tab");
           	this.$el.find('#tab-hdrCntnt').addClass("on-tab");  


           	this.$el.find('#tab-hdrCntnt-table').css("display","table");
           	this.$el.find('#tab-inpCntnt-table').css("display","none");
           	this.$el.find('#tab-outpCntnt-table').css("display","none");
           }	
           /**
            *  인풋 탭          
            */
           ,tabInpCntnt : function() {
           	this.$el.find('.tab').removeClass("on-tab");
           	this.$el.find('#tab-inpCntnt').addClass("on-tab");  


           	this.$el.find('#tab-hdrCntnt-table').css("display","none");
           	this.$el.find('#tab-inpCntnt-table').css("display","table");
           	this.$el.find('#tab-outpCntnt-table').css("display","none");
           }
           /**
            *  아웃풋 탭          
            */
           ,tabOutpCntnt : function() {
           	this.$el.find('.tab').removeClass("on-tab");
           	this.$el.find('#tab-outpCntnt').addClass("on-tab");  


           	this.$el.find('#tab-hdrCntnt-table').css("display","none");
           	this.$el.find('#tab-inpCntnt-table').css("display","none");
           	this.$el.find('#tab-outpCntnt-table').css("display","table");
           }
           /**
            *  검색조건 토글         
            */
           ,toggleSearchCondition : function() {
        	   fn_pageLayerCtrl(this.$el.find("#search-condition-area"), this.$el.find("#btn-search-condition-toggle"));
           }
           /**
            *  검색결과 토글          
            */
           ,toggleSearchResult : function() {
        	   fn_pageLayerCtrl(this.$el.find("#search-result-area"), this.$el.find("#btn-search-result-toggle"));
           }
           /**
            *  상세정보 토글      
            */
           ,toggleDetailInfomation : function() {
        	   fn_pageLayerCtrl(this.$el.find("#detail-information-area"), this.$el.find("#btn-detail-information-toggle"));
           }
        }); // end of Backbone.View.extend({


        return CAPMT001View;
    } // end of define function
); // end of define
