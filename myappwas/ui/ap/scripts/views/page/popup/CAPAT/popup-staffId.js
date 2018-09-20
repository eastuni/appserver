define(
    [
        'bx-component/popup/popup'
        , 'bx-component/message/message-alert'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/popup/CAPAT/popup-staffId-tpl.html'
        , 'bx/common/common-info'
    ],
    function (Popup
        , alertMessage
        , ExtGrid
        , tpl
        , commonInfo) {


    	var deptId = null;
    	var rsltCnt;//검색건수


        var BxpUserPopup = Popup.extend({
            tagName: 'section',
            className: 'popup-page',
            templates: {
                'tpl': tpl
            },
            attributes: {
              	'style': 'width: 1020px; height: 800px;'
            },
            events: {
                'click .search-btn': 'fn_loadList'
                , 'click .cancel-btn': 'close'
                , 'click .select-btn': 'fn_select'
                , 'keydown .nm': 'fn_enterSelect'
                , 'click #btn-popup-search-modal': 'popPageLayerCtrl' // 조회영역 접기       	
                , 'click #btn-popup-tree-modal': 'popGridLayerCtrl' // 그리드영역 접기
                , 'click #btn-popup-service-reset': 'reset' // 초기화
            },
            initialize: function (initConfig) {
                var that = this;
                // Set Page
                this.$el.html(this.tpl());
                // Set Page modal 설정
                that.enableDim = true;

                if(initConfig){
                	if(initConfig.instCd){
                		this.instCd = initConfig.instCd;
                	}
                	if(initConfig.deptId){
                		this.deptId = initConfig.deptId;
                	}
                	if(initConfig.deptNm){
                		this.deptNm = initConfig.deptNm;
                	}
                }else{
                	this.instCd = $.sessionStorage('instCd');
                }

                // Set Grid
                that.dataGrid = new ExtGrid({
                    fields: ['No', 'deptId', 'deptNm', 'staffId', 'staffNm']
                    , columns: [
                        {
                            text: "No"
                            , dataIndex: 'rowIndex'
                            , sortable: false
                            , height: 25
                            , flex: 1
                            , style: 'text-align:center', align: 'center'
                            , renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            	rsltCnt = rowIndex + 1;
                            	return rowIndex + 1;
                        }
                        }
                        , {
                            text: bxMsg('cbb_items.AT#deptId'),
                            flex: 5,
                            dataIndex: 'deptId',
                            style: 'text-align:center',
                            align: 'center'
                        }
                        , {
                            text: bxMsg('cbb_items.AT#deptNm'),
                            flex: 7,
                            dataIndex: 'deptNm',
                            style: 'text-align:center',
                            align: 'center'
                        }
                        , {
                            text: bxMsg('cbb_items.AT#staffId'),
                            flex: 5,
                            dataIndex: 'staffId',
                            style: 'text-align:center',
                            align: 'center'
                        }
                        , {
                            text: bxMsg('cbb_items.AT#staffNm'),
                            flex: 7,
                            dataIndex: 'staffNm',
                            style: 'text-align:center',
                            align: 'center'
                        }
                    ]
                    , listeners: {
                        click: {
                            element: 'body',
                            fn: function () {
                                that.fn_select();
                            }
                        }
                    }
                });
                that.$el.find(".data-grid").html(that.dataGrid.render({'height': CaPopGridHeight}));
                that.dataGrid.resetData();


                if(that.deptId != null && that.deptId != undefined){
                    //부서명 변경 못하게!
            	  	that.$el.find(".deptNm").attr('disabled', true);
                }
                if(that.deptNm != null && that.deptNm != undefined){
            	  	that.$el.find(".deptNm").val(that.deptNm);
                }


                that.show();
            },
            render: function () {
            },
            fn_loadList: function (e, param) {
                var that = this;
                var sParam = {};
                
                sParam.instCd = this.instCd;

                sParam.staffNm = that.$el.find('.nm').val();
                sParam.deptNm = that.$el.find('.deptNm').val();
                if(this.deptId != null && this.deptId != undefined){
                    sParam.deptId = this.deptId; //로그인한 사람의 부서식별자
                }

                var linkData = {"header": fn_getHeader("CAPSF0038402"), "CaStaffSrchSvcGetStaffListIn": sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaStaffSrchSvcGetStaffListOut) {
                                that.dataGrid.setData(responseData.CaStaffSrchSvcGetStaffListOut.staffList);
                                //검색건수
                            	that.$el.find('#rsltCnt').html(rsltCnt);
                            }
                        }
                    }
                });


            },


            fn_select: function () {
                var selectedData = this.dataGrid.grid.getSelectionModel().selected.items[0];
                var param = {};
                if (!selectedData) {
                    return;
                } else {
                	param.instCd = this.instCd;
                    param.staffId = selectedData.data.staffId;
                    param.staffNm = selectedData.data.staffNm;
                    param.deptId = selectedData.data.deptId;
                    param.deptNm = selectedData.data.deptNm;
                }
                this.trigger('popUpSetData', param);
                this.close();
            },
            afterClose: function () {
                this.remove();
            },


            fn_enterSelect: function (event) {
                event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if (keyID == 13) { //enter
                    this.fn_loadList();
                }
            },


            /**
             * 그리드영역 접기
             */
            popGridLayerCtrl: function(){
        		var that = this;
        		fn_pageLayerCtrl(that.$el.find("#popup-service-grid"));
            },


            /**
             * 조회영역 접기
             */
            popPageLayerCtrl: function(){
        		var that = this;


        		fn_pageLayerCtrl(that.$el.find("#popup-search-area"));
            },


            /**
             * 입력항목 초기화
             */
            reset: function(){
        		var that = this;
        	  	that.$el.find(".popup-service-table [data-form-param='staffNm']").val("");
        	  	if(that.deptNm == null && that.deptNm == undefined){
            	  	that.$el.find(".popup-service-table [data-form-param='deptNm']").val("");        	  		
        	  	}
            }
        });
        return BxpUserPopup;
    }
);
