define(
    [
        'text!app/views/page/popup/CAPAC/popup-refAtrbt-search.html',
        'bx-component/ext-grid/_ext-grid',
        'bx/common/common-index-paging',
        'bx-component/popup/popup'
    ],
    function (
        tpl,
        ExtGrid,
        IndexPaging,
        Popup
    ) {
        var popupRefAtrbtSearch = Popup.extend({


            templates: {
                'tpl': tpl
            },


            attributes: {
                'style': 'width: 1020px; height: 800px;'
            },


            events: {
                'click #btn-search-condition-reset': 'reset', // 초기화
                'click #btn-search-condition-inquire': 'selectList', // 목록조회


                'click #btn-search-result-toggle': 'toggleSearchResult', // 그리드영역 접기
                'click #btn-search-condition-toggle': 'toggleSearchCondition', // 조회영역 접기


                'click #btn-popup-select': 'fn_select' // 선택버튼클릭
            },




//
//
//
            toggleSearchCondition : function() {
                fn_pageLayerCtrl(this.$el.find("#search-condition-area"), this.$el.find("#btn-search-condition-toggle"));
            },
            
            
            setComboBoxes: function () {
                var sParam = {};


                sParam = {};
                sParam.className = "refObjCd-wrap";
                sParam.targetId = "refObjCd";
                sParam.nullYn = "Y";
//                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0050";
                fn_getCodeList(sParam, this);   // 참조객체유형코드
            },


//
//
//
            reset : function() {
                this.$el.find("#search-condition-area [data-form-param='refObjCd']").val("");
                this.$el.find("#search-condition-area [data-form-param='refAtrbtNm']").val("");
                this.$el.find("#search-condition-area [data-form-param='refAtrbtDescCntnt']").val("");
            },


            init_pagingInfo : function() {
                var that = this;
                that.pgNbr = 1; // 페이지번호
                that.pgCnt = 1000; // 페이지건수
                that.acctgList = [];
            },
//
//
//
            selectList : function() {
                this.init_pagingInfo();
                this.fn_loadList();
            },
//
//
//
            selectNextList : function() {
                this.pageNum++;
                this.fn_loadList();
            },


//
//
//
            toggleSearchResult : function() {
                fn_pageLayerCtrl(this.$el.find("#popup-refAtrbt-search-grid"), this.$el.find("#btn-search-result-toggle"));
            },




//
//
//
            initialize: function (initData) {
                $.extend(this, initData);


                this.enableDim = true;
                this.initData = initData;
                this.createGrid();
            },


            createGrid: function () {
                var that = this;


                this.popupRefAtrbtSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'refObjCd', 'refAtrbtNm', 'refAtrbtDescCntnt']
                    , id: 'popupRefAtrbtSearchGrid'
                    , columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width : 80,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#refObjCd'),
                            flex: 1,
                            dataIndex: 'refObjCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#refObjNm'),
                            flex: 1,
                            dataIndex: 'refObjCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A0050',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#A0050' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#refAtrbt'),
                            flex: 2,
                            dataIndex: 'refAtrbtNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#refAtrbtNm'),
                            flex: 1,
                            dataIndex: 'refAtrbtDescCntnt',
                            style: 'text-align:center',
                            align: 'center'
                        }
                    ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        // 셀 에디팅 플러그인
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                clicksToEdit: 2,
                                listeners: {
                                    'beforeedit': function (editor, e) {
                                        return false;
                                    } // end of edit
                                } // end of listners
                            }) // end of Ext.create
                        ] // end of plugins
                    }, // end of gridConfig
                    listeners: {
                        click: {
                            element: 'body',
                            fn: function () {
                                that.$el.find('#btn-popup-select').addClass('on');
                            }
                        },
                        dblclick: {
                            element: 'body',
                            fn: function () {
                                that.fn_select();
                            }
                        }
                    }
                });
            },


//
//
//
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find(".popup-refAtrbt-search-grid").html(this.popupRefAtrbtSearchGrid.render({'height': CaPopGridHeight}));

                this.setComboBoxes();
                this.show();

                if(!fn_isNull(this.initData)) {
                    if(!fn_isNull(this.initData.refObjCd)) {
                    	
                    	var ele = document.getElementById('refObjCdBox');
                    	
                    	for ( i = 0, j = ele.length; i < j; i++ ) { 
	                    	if( ele.options[i].value == val ) { 
		                    	ele.options[i].selected = true; 
		                    	break; 
	                    	} 
                    	}
                    	
//                    	$("#refObjCdBox").val(this.initData.refObjCd).attr("selected", "selected");
                    	
//                        this.$el.find("#search-condition-area [data-form-param='refObjCd']").val(this.initData.refObjCd);
                    }


                    if(!fn_isNull(this.initData.refAtrbtNm)) {
                    	this.$el.find('#search-condition-area [data-form-param="refAtrbtNm"]').val(this.initData.refAtrbtNm);
                    }


                    if(!fn_isNull(this.initData.refAtrbtDescCntnt)) {
                    	this.$el.find('#search-condition-area [data-form-param="refAtrbtDescCntnt"]').val(this.initData.refAtrbtDescCntnt);
                    }


                    this.setSearchCondition(this.initData);
                }
            },


            setSearchCondition: function (data) {
                this.fn_loadList(data);
            },


//
//
//
            fn_loadList: function (data) {
                var that = this;
                var sParam = {};


                if (data != null) {
                	sParam.refObjCd     = data.refObjCd;
                } else {
                	sParam.refObjCd     = that.$el.find("#search-condition-area [data-form-param='refObjCd']").val();
                }
                sParam.refAtrbtNm   = that.$el.find("#search-condition-area [data-form-param='refAtrbtNm']").val();
                sParam.refAtrbtDescCntnt = that.$el.find("#search-condition-area [data-form-param='refAtrbtDescCntnt']").val();


                var linkData = {"header": fn_getHeader("CAPCM1608402"), "CaRefAtrbtMgmtSvcIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaRefAtrbtMgmtSvcOut.refAtrbtList;
                            var totCnt = list.length;


                            if(list != null) {
                            	
                            	
                            	$("#refObjCdBox").val(sParam.refObjCd).attr("selected", "selected");
                            	
                            	
                                that.popupRefAtrbtSearchGrid.setData(list);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                that.$el.find('#btn-popup-select').removeClass('on');
                            }
                        }   // end of suucess: fucntion
                    }
                });
            },




//
//
//
            fn_select: function () {
                var selectedData = this.popupRefAtrbtSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                    param = selectedData.data;
                }
                this.trigger('popUpSetData', param);
                this.close();
            },


//
//
//
            afterClose : function() {
                this.remove();
            }


        });


        return popupRefAtrbtSearch;
    }
);
