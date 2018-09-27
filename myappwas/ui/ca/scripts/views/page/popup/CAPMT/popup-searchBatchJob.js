define(
    [
        'bx-component/popup/popup'
        , 'bx-component/message/message-alert'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/popup/CAPMT/popup-searchBatchJob-tpl.html'
        , 'bx/common/common-info'
    ],
    function (Popup
        , alertMessage
        , ExtGrid
        , tpl
        , commonInfo) {
        var BxpUserPopup = Popup.extend({
            tagName: 'section',
            className: 'popup-page',
            templates: {
                'tpl': tpl
            },
            attributes: {
                'style': 'width: 710px; height: 655px;'
            },
            events: {
                'click #btn-search-condition-reset': 'fn_base_reset'
                , 'click #btn-search-condition-inquiry': 'fn_loadList'
                , 'click #btn-base-section-toggle':'fn_base_toggle'
                , 'click #btn-grid-section-toggle':'fn_grid_toggle'
                , 'click #btn-popup-cancel': 'close'
                , 'click #btn-popup-select': 'fn_select'
            },
            initialize: function (initConfig) {
                var that = this;


                this.$el.html(this.tpl());
                that.enableDim = true;


                var sParam1 = {cdNbr:"A0218"}; // 배치작업검색기준코드
                var sParam2 = {cdNbr:"A0217"}; // 배치컴포넌트코드


                bxProxy.all([{
                    // 배치컴포넌트코드
                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            comboStore1 = new Ext.data.Store({
                                fields: ['cd', 'cdNm'],
                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
                            });
                        }
                    }
                }
                ,{// 배치작업유형코드
                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam2}), success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            comboStore2 = new Ext.data.Store({
                                fields: ['cd', 'cdNm'],
                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
                            });
                        }
                    }
            	} ]
                , {
                    success: function () {
		                that.dataGrid = new ExtGrid({
		                    fields: ['batchJobId', 'batchJobNm','batchAplctnNm']
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
		                            text: bxMsg('cbb_items.CDVAL#A021801'),
		                            width: 200,
		                            dataIndex: 'batchJobId',
		                            style: 'text-align:center',
		                            align: 'left'
		                        }
		                        , {
		                            text: bxMsg('cbb_items.CDVAL#A021802'),
		                            width: 200,
		                            dataIndex: 'batchJobNm',
		                            style: 'text-align:center',
		                            align: 'left'
		                        }
		                        , {
		                            text: bxMsg('cbb_items.CD#A0217'),
		                            flex: 5,
		                            dataIndex: 'batchAplctnNm',
		                            style: 'text-align:center',
		                            align: 'left'
		                            , renderer: function (val) {
                                       	index = comboStore2.findExact('cd', val);
                                       	if (index != -1) {
                                       		rs = comboStore2.getAt(index).data;
                                               return rs.cdNm;
                                           }
                                     }
		                        }
		                    ]
		                    , listeners: {
		                        dblclick: {
		                            element: 'body',
		                            fn: function () {
		                                that.fn_select();
		                            }
		                        }
		                    }
		                });
		                that.$el.find(".popup-grid-section").html(that.dataGrid.render({'height': '360px'}));
		                that.dataGrid.resetData();
		                that.show();
                    } // end of success:.function
                }); // end of bxProxy.all
            },
            render: function (initConfig) {
            	 // 배치작업검색기준코드
                fn_getCodeList({className:"popup-batchJobSrchCrtrCd-wrap",targetId:"batchJobSrchCrtrCd",nullYn:"N",cdNbr:"A0218"}, this);
            },
            fn_base_reset:function()
            {
                var that = this;
                that.dataGrid.resetData();
                that.$('.popup-base-section [data-form-param="batchJobSrchCrtrCd"]').val("01");
                that.$('.popup-base-section [data-form-param="srchItm"]').val("");
                that.$('#rsltCnt').html('0');
            },
            fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".popup-base-section"), this.$el.find("#btn-base-section-toggle"));
            },
            fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".popup-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            },
            fn_loadList: function (e, param) {
                var that = this;
                sParam = {};
                var header = new Object();


                sParam.batchJobSrchCrtrCd = that.$el.find('[data-form-param="batchJobSrchCrtrCd"]').val();
                sParam.srchBaseCntnt = that.$el.find('[data-form-param="srchItm"]').val();


                header = fn_getHeader("PMT0208403");
                var linkData = {"header": header, "BatchJobMgntSvcSearchIn": sParam};
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            if (responseData.BatchJobMgntSvcListOut) {
                                that.dataGrid.setData(responseData.BatchJobMgntSvcListOut.outList);
                                if(responseData.BatchJobMgntSvcListOut.outList != null && responseData.BatchJobMgntSvcListOut.outList.length > 0)
                                {
                                    that.$('#rsltCnt').html(responseData.BatchJobMgntSvcListOut.outList.length);
                                }
                                else
                                {
                                    that.$('#rsltCnt').html('0');
                                }
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


                	param.batchJobId = selectedData.data.batchJobId;
                	param.batchJobNm = selectedData.data.batchJobNm;
                	param.batchAplctnNm = selectedData.data.batchAplctnNm;
                }
                this.trigger('popUpSetData', param);
                this.close();
            },
            afterClose: function () {
                this.remove();
            }
        });
        return BxpUserPopup;
    }
);
