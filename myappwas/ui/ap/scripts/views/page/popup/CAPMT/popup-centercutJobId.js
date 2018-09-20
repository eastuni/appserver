define(
    [
        'bx-component/popup/popup'
        , 'bx-component/message/message-alert'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/popup/CAPMT/popup-centercutJobId.html'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPCM/popup-message'
    ],
    function (Popup
        , alertMessage
        , ExtGrid
        , tpl
        , commonInfo
        , PopupMessage) {


        var BxpUserPopup = Popup.extend({
            //태그 이름 설정
            tagName: 'section',


            //클래스 이름 설정
            className: 'popup-page',


            //템플릿설정
            templates: {
                'tpl': tpl
            },


            attributes: {
                'style': 'width: 1020px; height: 800px;'
            },


            events: {
                'click #btn-search-condition-reset':'fn_base_reset'
              , 'click #btn-search-condition-inquiry': 'fn_loadList'
              , 'click #btn-base-section-toggle':'fn_base_toggle'
              , 'click #btn-grid-section-toggle':'fn_grid_toggle'
              , 'click #btn-popup-cancel': 'close'
              , 'click #btn-popup-select': 'fn_select'
              , 'keydown [data-form-param="jobId"]': 'fn_enterSelect'
            },


            initialize: function (initConfig) {
                var that = this;


                // Set Page
                this.$el.html(this.tpl());


                $.extend(that, initConfig);


                // Set Page modal 설정
                that.enableDim = true;
                var sParam1 = {cdNbr:"11603"}; // 컴포넌트코드


                // Set Grid
                bxProxy.all([
                    {// 컴포넌트코드콤보 로딩
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore1 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
	                            });
	                        }
	                    }
	            	}]
	                , {
	                    success: function () {
	                        that.dataGrid = new ExtGrid({
	                            // 그리드 컬럼 정의
	                            fields: ['cmpntCd','jobId', 'jobNm', 'trgtSrvcCd', 'jobDesc']
	                            , id: 'POPUPCCJOBGrid'
	                            , columns: [{
	                                text: 'No'
	                                , dataIndex: 'rowIndex'
	                                , sortable: false
	                                , flex: 1
                                    , height: 25
	                                , style: 'text-align:center'
	                                , align: 'right'
	                                // other config you need....
	                                , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
	                                    return rowIndex + 1;
	                                    }
	                                }
		                            , {
		                            	text: bxMsg('cbb_items.AT#cmpntCd')
		                            	, flex: 4
		                            	, dataIndex: 'cmpntCd'
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
	                                    text: bxMsg('cbb_items.AT#jobId')
	                                    , flex: 3
	                                    , dataIndex: 'jobId'
	                                    , style: 'text-align:center'
	                                    , align: 'center'
	                                }
	                        		, {
	                                    text: bxMsg('cbb_items.AT#jobNm')
	                                    , flex: 4
	                                    , dataIndex: 'jobNm'
	                                    , style: 'text-align:center'
	                                    , align: 'left'


	                                }
	                                , {
	                                    text: bxMsg('cbb_items.AT#trgtSrvcCd')
	                                    , flex: 3
	                                    , dataIndex: 'trgtSrvcCd'
	                                    , style: 'text-align:center'
	                                    , align: 'center'
	                                }
	                                , {
	                                    text: bxMsg('cbb_items.SCRNITM#jobDesc')
	                                    , flex: 5
	                                    , dataIndex: 'jobDesc'
	                                    , style: 'text-align:center'
	                                    , align: 'left'
	                                }
	                            ] // end of columns


	                            , listeners: {
	                                dblclick: {
	                                    element: 'body'
	                                    , fn: function () {
	                                        // 더블클릭시 이벤트 발생
	                                    	that.fn_select();
	                                    }
	                                }
	                            }
	                        });
		                     // 단일탭 그리드 렌더
	                         that.createGrid();


                    } // end of success:.function
                }); // end of bxProxy.all
            },


            render: function () {
            	var that = this;
            	// 컴포넌트 코드
                fn_getCodeList({className:"popup-cmpntCd-wrap",targetId:"cmpntCd",nullYn:"Y",cdNbr:"11603",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);
            }
            /**
			 * 그리드 생성
			 */
            , createGrid: function () {
            	var that = this;
                that.$el.find(".popup-grid-section").html(that.dataGrid.render({'height': '360px'}));
                that.dataGrid.resetData();
                that.show();
            } // end of createGrid
            ,fn_base_reset:function()
            {
                var that = this;
                that.dataGrid.resetData();
                that.$('.popup-base-section [data-form-param="cmpntCd"]').val("");
                that.$('.popup-base-section [data-form-param="jobId"]').val("");
                that.$('#rsltCnt').html('0');
            }
            ,fn_loadList: function (e, param) {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.popup-base-section'));
                if(that.instCd){
                	sParam.instCd=that.instCd;
                }
                var linkData = {"header": fn_getHeader("PMT0308402"), "inputDto": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                    	if (fn_commonChekResult(responseData)) {
                            var data;
                            for (var name in responseData) {
                                if(name!="header") data=responseData[name];
                            }
                            var tbList = data.list;
                            if (tbList != null && tbList.length > 0) {
                                // 조회
                                that.dataGrid.setData(tbList);
                                that.$('#rsltCnt').html(tbList.length);
                            }else{
                            	 that.dataGrid.resetData();
                                 that.$('#rsltCnt').html('0');
                            }
                        }
                    }   // end of suucess: fucntion
                });
            }
            ,fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".popup-base-section"), this.$el.find("#btn-base-section-toggle"));
            }
            ,fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".popup-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            },
            fn_select: function () {
                var selectedData = this.dataGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                    param.jobId = selectedData.data.jobId;
                }
                this.trigger('popUpSetData', param);
                this.close();
            },


            afterClose: function () {
                this.remove();
            }
            , fn_enterSelect: function (event) {
                event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if (keyID == 13) { //enter
                    this.fn_loadList();
                }
            }
            //경고창
            , popErrorMessage: function (responseData) {
                var messageParam = {};
                messageParam.messageCode = responseData.header.messageCode;
                messageParam.messages = responseData.header.messages;
                messageParam.detailMessages = responseData.header.detailMessages;
                messageParam.traceMessage = responseData.header.traceMessage;


                var popupMessage = new PopupMessage(messageParam); // 팝업생성
                popupMessage.render();
            }
        });


        return BxpUserPopup;
    }
);
