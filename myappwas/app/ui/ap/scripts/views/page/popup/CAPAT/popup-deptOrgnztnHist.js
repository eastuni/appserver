define(
    [
        'bx-component/popup/popup'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/popup/CAPAT/popup-deptOrgnztnHist-tpl.html'
        , 'bx/common/common-message'
    ],
    function (Popup
        , ExtGrid
        , tpl) {
    	var rsltCnt;//검색건수
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
            	'style': 'width: 1200px; height: 800px;'
            },


            events: {
                 'click .cancel-btn': 'close'
                 , 'click #btn-popup-search-modal': 'popPageLayerCtrl' // 조회영역 접기       	
                 , 'click #btn-popup-tree-modal': 'popGridLayerCtrl' // 그리드영역 접기
            },


            initialize: function (initConfig) {
                var that = this;


                // Set Page
                this.$el.html(this.tpl());


                // Set Page modal 설정
                if (new String(initConfig.modal) == 'false') {
                    that.enableDim = false;
                } else {
                    that.enableDim = true;
                }


                // 부서조직관계유형코드  
                var sParam = {};
                var comboStore1 = {};
                sParam.cdNbr = "11953";
                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                // 부서조직관계상태코드  
                sParam = {};
                var comboStore2 = {};
                sParam.cdNbr = "A0121";
                var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                bxProxy.all([
                    // 부서조직관계유형코드 콤보코드 로딩
                    {
                        url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore1 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
                        }
                    }
                  ,// 부서조직관계상태코드 콤보코드 로딩
                  {
                     url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore2 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
                     }
                   }
                ], {
                    success: function () {
                        // Set Grid
                        that.dataGrid = new ExtGrid({
                            fields: ['No', 'dtogRelCd', 'upDeptYn', 'dept', 'dtogRelSeqNbr', 'dtogRelStsCd', 'relStartDt', 'relEndDt', 'relDeptId', 'relDeptNm']
                            , columns: [
                                {
                                    text: bxMsg('cbb_items.SCRNITM#No')
                                    , dataIndex: 'rowIndex'
                                    , sortable: false
                                    , width : 50
                                    , style: 'text-align:center'
                                    , height: 25
                                    , align: 'center'
                                    , renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                    	rsltCnt = rowIndex + 1;
                                    	return rowIndex + 1;
                                    }
                                }
                                , {
                                    text: bxMsg('cbb_items.SCRNITM#deptOrgnztnRel'),
                                    width: 150,
                                    dataIndex: 'dtogRelCd',
                                    style: 'text-align:center',
                                    align: 'center',
                                    renderer: function (val) {
                                        index = comboStore1.findExact('cd', val);
                                        if (index != -1) {
                                            rs = comboStore1.getAt(index).data;
                                            return rs.cdNm;
                                        }
                                    } // end of render
                                } // end of
                                , {
                                    text: bxMsg('cbb_items.SCRNITM#rel'),
                                    width: 80,
                                    dataIndex: 'upDeptYn',
                                    style: 'text-align:center',
                                    align: 'center',
                                    renderer: function (val) {


                                    	if(val == "Y") {
                                    		return bxMsg('cbb_items.SCRNITM#UP');
                                    	}
                                    	else if(val == "N") {
                                    		return bxMsg('cbb_items.SCRNITM#DOWN');
                                    	}
                                    } // end of render
                                } // end of   
                                , {
                                    text: bxMsg('cbb_items.SCRNITM#deptId'),
                                    width: 150,
                                    dataIndex: 'deptId',
                                    style: 'text-align:center',
                                    align: 'center',
                                    renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                    	return record.get("relDeptId");


                                    } // end of render
                                } // end of 
                                , {
                                    text: bxMsg('cbb_items.SCRNITM#deptNm'),
                                    width: 200,
                                    dataIndex: 'deptNm',
                                    style: 'text-align:center',
                                    align: 'center',
                                    renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                    	return record.get("relDeptNm");


                                    } // end of render
                                } // end of 
                                , {
                                    text: bxMsg('cbb_items.SCRNITM#seqNbr'),
                                    width: 180,
                                    dataIndex: 'dtogRelSeqNbr',
                                    style: 'text-align:center',
                                    align: 'center'
                                }
                                , {
                                    text: bxMsg('cbb_items.SCRNITM#relSts'),
                                    width: 150,
                                    dataIndex: 'dtogRelStsCd',
                                    style: 'text-align:center',
                                    align: 'center',
                                    renderer: function (val) {
                                    	index = comboStore2.findExact('cd', val);


                                    	if (index != -1) {
                                            rs = comboStore2.getAt(index).data;
                                            return rs.cdNm;
                                        }
                                    } // end of render
                                } // end of
                                , {
                                    text: bxMsg('cbb_items.SCRNITM#relStartDt'),
                                    width: 80,
                                    dataIndex: 'relStartDt',
                                    style: 'text-align:center',
                                    align: 'center',
                                    renderer: function (val) {
                                        return XDate(val).toString('yyyy-MM-dd');
                                    } // end of render
                                } // end of 
                                , {
                                    text: bxMsg('cbb_items.SCRNITM#relEndDt'),
                                    width: 80,
                                    dataIndex: 'relEndDt',
                                    style: 'text-align:center',
                                    align: 'center',
                                    renderer: function (val) {
                                        return XDate(val).toString('yyyy-MM-dd');
                                    } // end of render
                                } // end of 
                                , {
                                    width: 0,
                                    dataIndex: 'relDeptId',
                                    hidden : true
                                } // end of 
                                , {
                                    width: 0,
                                    dataIndex: 'relDeptNm',
                                    hidden: true
                                } // end of 
                            ]                            
                        });


                        that.$el.find(".data-grid").html(that.dataGrid.render({'height': CaPopGridHeight}));
                        that.dataGrid.resetData();
                        that.show();


                        if (typeof initConfig != 'undefined') {
                        	that.$el.find('[data-form-param="deptId"]').val(initConfig.deptId);
                        	that.$el.find('[data-form-param="deptNm"]').val(initConfig.deptNm);


                            that.fn_loadList(initConfig);
                        }
                    } // end of success:.function
                }); // end of bxProxy.all




            },


            render: function () {
            },


            fn_loadList: function (param) {
                var that = this;
                sParam = {};
                sParam.instCd = param.instCd;
                sParam.deptId = param.deptId;


                var linkData = {"header": fn_getHeader("CAPDT0040401"), "CaDeptOrgnztnRelSrchSvcGetHistIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            that.dataGrid.setData(responseData.CaDeptOrgnztnRelSrchSvcGetHistOut.orgnztnRelHist);
                            //검색건수
                        	that.$el.find('#rsltCnt').html(rsltCnt);
                        }
                    }
                });
            },
            afterClose: function () {
                this.remove();
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




        });


        return BxpUserPopup;
    }
);
