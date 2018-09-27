define(
    [
        'bx/common/config',
        'text!app/views/page/CAPSV/032/_CAPSV032.html',
        'bx-component/ext-grid/_ext-grid',
        'bx/common/common-info'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        commonInfo
    ) {


        /**
         * Backbone
         */
        var CAPSV032View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPSV032-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-search-condition-inquire': 'inquireServiceStatus',


                'click #btn-search-result-excel': 'downloadGridDataWithExcel',
                'click #btn-search-result-edit': 'selectGridRecord',
                'click #btn-search-result-save': 'saveServices',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-additional-search-condition-toggle': 'toggleAdditionalCondition',
                'click #btn-search-result-toggle': 'toggleSearchResult'
            },


            initialize: function (initData) {
            	 var that = this;
                $.extend(that, initData);
                that.$el.html(that.tpl());


                that.pgNbr = 1;
                that.pgCnt = 500;


                that.$el.attr('data-page', that.pageHandler);


                that.deleteList = [];
                that.saveList = [];
                that.createGrid();
            },


            render: function () {
            	   var that = this;
            	//that.$el.html(this.tpl());
              //  that.$el.find("#CAPSV032Grid").html(that.CAPSV032Grid.render({'height': CaGridHeight}));


                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPSV032-wrap #btn-search-result-save')
                                    			   ]);
                return this.$el;
            },


            createGrid: function () {
                var that = this;


                that.CAPSV032Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'cmpntCd', 'srvcCd', 'srvcNm', 'useYn', 'srvcStsCd', 'txBlckngYn', 'inpDtoNm','txRstrctnCntnt',
                        'inpDtoNm', 'aplyStartDt', 'instCd',
                        {
                            name: 'checkUseYn',
                            type: 'boolean',
                            convert: function (value, record) {
                                return record.get('useYn') === 'Y';
                                ;
                            }
                        },
                        { name : 'flagTp',
                            type : 'text'
                        }],
                    id: 'CAPSV032Grid',
                    columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width: 80,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        }, 
                        {
                            text: bxMsg('cbb_items.SCRNITM#cmpnt'),
                            flex: 1,
                            dataIndex: 'cmpntCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '11602',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#11602' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#srvcCd'),
                            flex: 1,
                            dataIndex: 'srvcCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#srvcNm'),
                            flex: 1,
                            dataIndex: 'srvcNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.AT#useYn')
                            ,flex: 1
                            ,dataIndex: 'checkUseYn'
                            ,style: 'text-align:center'
                            ,align: 'center'
                        	,xtype: 'checkcolumn'
                        	,editor: {
                                     xtype: 'checkbox',
                                     cls: 'x-grid-checkheader-editor'
                        	}
                            ,columntype: 'checkbox'
                        	, stopSelection: false
                        	,header : '<input type="checkbox" />' + bxMsg('cbb_items.SCRNITM#useYn')
                            ,listeners: 
                                  {
                                click: function (_this, cell, rowIndex, eOpts) {
                                    var currentRecord = that.CAPSV032Grid.store.getAt(rowIndex),
                                        changedChecked = !currentRecord.get('checkUseYn');


                                    currentRecord.set('useYn', changedChecked ? 'Y' : 'N');
                                    currentRecord.set('checkUseYn', changedChecked);
                                    that.CAPSV032Grid.store.getAt(rowIndex).set('flagTp', 'Y');
                                },
                                headerclick: function(header, column, e, t,eOpts) {
                                    console.log(that.CAPSV032Grid.store);
                                    var selections = that.CAPSV032Grid.store.getRange(),
                                        i = 0,
                                        len = selections.length;


                                    for (; i < len; i++) {
                                    	 if( e.target.checked ){
                                    		 if( e.target.checked === ( that.CAPSV032Grid.store.getAt(i).data.useYn==='Y')){
                                    			 that.CAPSV032Grid.store.getAt(i).set('flagTp', '');
                                    		 }else{
                                                 that.CAPSV032Grid.store.getAt(i).set('useYn', 'Y');
                                                 that.CAPSV032Grid.store.getAt(i).set('checkUseYn', 'Y'); 
                                              	 that.CAPSV032Grid.store.getAt(i).set('flagTp', 'Y');
                                    		 }
                                    	 }else{
                                    		 if( !e.target.checked === ( that.CAPSV032Grid.store.getAt(i).data.useYn==='N')){
                                    			 that.CAPSV032Grid.store.getAt(i).set('flagTp', '');
                                    		 }else{
                                        		 that.CAPSV032Grid.store.getAt(i).set('useYn', 'N');
                                                 that.CAPSV032Grid.store.getAt(i).set('checkUseYn', 'N');
                                    			 that.CAPSV032Grid.store.getAt(i).set('flagTp', 'Y');
                                    		 }
                                    	 }
                                    }
                               }
                           }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#srvcSts'),
                            flex: 1,
                            dataIndex: 'srvcStsCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A0052',
                            renderer: function (val) {
                                return bxMsg('cbb_items.CDVAL#A0052' + val);
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#txRstrctnCntnt'),
                            flex: 1,
                            dataIndex: 'txRstrctnCntnt',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.SCRNITM#del'),
                            style: 'text-align:center',
                            items: [
                                {
                                    //  icon: 'images/icon/x-delete-16.png'
                                    iconCls : "bw-icon i-25 i-func-trash",
                                    tooltip: bxMsg('tm-layout.delete-field'),
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                                        that.deleteList.push(record.data);
                                        grid.store.remove(record);
                                    }
                                }
                            ]
                        }
                    ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        // 셀 에디팅 플러그인
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                clicksToEdit: 2
                                , listeners: {
                                    'beforeedit': function (editor, e) {
                                        return false;
                                    } // end of edit
                                } // end of listners
                            }) // end of Ext.create
                        ] // end of plugins
                    }, // end of gridConfig
                    listeners: {
                    	viewready: function(grid, eOpts){
                            grid.view.getEl().on( 'scroll', function(event, target) {
                                var viewEndPosition = target.scrollHeight - target.offsetHeight;


                                if ((viewEndPosition > 0) && (viewEndPosition <= target.scrollTop)){
                                   that.queryNext();
                                }
                            });
                    	},
                        dblclick: {
                            element: 'body',
                            fn: function () {
                                that.selectGridRecord();
                            }
                        }
                    }


                });
                that.$el.find("#CAPSV032Grid").html(that.CAPSV032Grid.render({'height': CaGridHeight}));
            },


            setComboBoxes: function () {
                var sParam;


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPSV032-cmpntCd-wrap";
                sParam.targetId = "cmpntCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "11603";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPSV032-srvcSts-wrap";
                sParam.targetId = "srvcSts";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "A0052"; // 서비스상태코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPSV032-useYn-wrap";
                sParam.targetId = "useYn";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "10000"; // 여부
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPSV032-txRstrctnCntnts-wrap";
                sParam.targetId = "txRstrctnCntnt";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "11308"; // 서비스제한유형코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            resetSearchCondition: function () {
                this.$el.find('#search-condition-area [data-form-param="cmpntCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="srvcCd"]').val("");
                this.$el.find('#search-condition-area [data-form-param="srvcNm"]').val("");
                this.$el.find('#additional-search-condition-area [data-form-param="srvcSts"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#additional-search-condition-area [data-form-param="useYn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#additional-search-condition-area [data-form-param="txRstrctnCntnt"] option:eq(0)').attr("selected", "selected");
            },
            /**
             * 다음 조회
             */
             queryNext: function () {
                var that = this;
                if(!that.morePage){
                	return;
                }
                var sParam = that.conditionParam
                that.pgNbr++;


                that.inquireServiceStatus(sParam);
            },


            inquireServiceStatus: function () {
                var that = this;
                var sParam = {};

                that.deleteList = [];

                // 조회 key값 set
                sParam.cmpntCd = this.$el.find('[data-form-param="cmpntCd"]').val(); // 컴포넌트코드
                sParam.srvcCd = this.$el.find('[data-form-param="srvcCd"]').val(); // 서비스코드
                sParam.srvcNm = this.$el.find('[data-form-param="srvcNm"]').val(); // 서비스명
                sParam.pgNbr = that.pgNbr;
                sParam.pgCnt = that.pgCnt;




                sParam.useYn = this.$el.find('#additional-search-condition-area [data-form-param="useYn"]').val(); // 사용여부
                sParam.srvcStsCd = this.$el.find('#additional-search-condition-area [data-form-param="srvcSts"]').val(); // 서비스상태코드
                sParam.txRstrctnCntnt = this.$el.find('#additional-search-condition-area [data-form-param="txRstrctnCntnts"]').val(); // 거래제한구분


                if (sParam == null) {
                    this.CAPSV032Grid.resetData();
                    return;
                }


                if (commonInfo.getInstInfo().instCd) {
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    sParam.instCd = "";
                    fn_alertMessage("", bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                    return;
                }


                that.conditionParam = sParam;
                var linkData = {"header": fn_getHeader("CAPSV0328400"), "CaStdSrvcIoMgmtSvcGetInstSrvcListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {


                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaStdSrvcIoMgmtSvcGetInstSrvcListOut) {
                                var tbList = responseData.CaStdSrvcIoMgmtSvcGetInstSrvcListOut.tblNm;
                                var totCnt = tbList.length;

                              

                                if (tbList != null || tbList.length > 0) {
                                    if (sParam.pgNbr == 1) {
                                        // 조회
                                        that.CAPSV032Grid.setData(tbList);
                                        //that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+responseData.CaStdSrvcIoMgmtSvcGetInstSrvcListOut.totalCount+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                    } else {
                                        // 다음 조회
                                        that.CAPSV032Grid.addData(tbList);
//                                        that.CAPMT001Grid.grid.getSelectionModel().select((that.pgNbr-1) * that.pgCnt + tbList.length -1);
                                    }
                                    if(tbList.length < that.pgCnt){
                                    	that.morePage = false;
                                    	that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(that.CAPSV032Grid.getAllData().length)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                    }else{
                                    	that.morePage = true;
                                    }
                                }
//
//                                if (tbList != null || tbList.length > 0) {
//                                    that.CAPSV032Grid.setData(tbList);
//                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totalCount)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
//                                }
                            }
                        }
                    }
                });
            },


            downloadGridDataWithExcel: function () {
                this.CAPSV032Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV032')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            selectGridRecord: function () {
                var selectedRecord = this.CAPSV032Grid.grid.getSelectionModel().selected.items[0];


                if(selectedRecord) {
                    this.openServicePage(selectedRecord);
                } else {
                    return;
                }
            },


            openServicePage: function (selectedRecord) {
                var srvcCd      = '';
                var srvcNm      = '';
                var inpDtoNm    = '';


                if(selectedRecord.data) {
                    srvcCd      = selectedRecord.data.srvcCd;
                    srvcNm      = selectedRecord.data.srvcNm;
                    inpDtoNm    = selectedRecord.data.inpDtoNm;
                }


                this.$el.trigger({
                    type: 'open-conts-page',
                    pageHandler: 'CAPSV008',
                    pageDPName: bxMsg('cbb_items.SCRN#CAPSV008'),
                    pageInitialize: true,
                    pageRenderInfo: {
                        srvcCd: srvcCd,
                        srvcNm: srvcNm,
                        inpDtoNm: inpDtoNm
                    }
                });
            },


            saveServices: function () {
                var that = this;
                
              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                saveData();


                function saveData() {
                    var table = [];
                	var inList = [];
                    var sParam = {};


    				if( that.CAPSV032Grid.store.getRange().length > 0){
   					 for (j = 0; j < that.CAPSV032Grid.store.getRange().length; j++){
   					 	if( that.CAPSV032Grid.store.getAt(j).data.flagTp === 'Y'){
   					 		that.saveList.push(that.CAPSV032Grid.store.getAt(j).data);
   					 	}


            		    }
    				} 	


                    $(that.deleteList).each(function(idx, data) {
                        var sub = {};
                        sub.srvcCd      = data.srvcCd;
                        sub.srvcUseYn   = data.useYn;
                        sub.srvcStsCd   = data.srvcStsCd;
                        sub.instCd      = data.instCd; // 헤더의 기관코드
                        sub.aplyStartDt = data.aplyStartDt;
                        table.push(sub);
                        sParam.tblNm = table;
                    });


                	if( that.saveList.length >=1 ){
                 	    $(that.saveList).each(function(idx, data) {
                 		var sub = {};
                 		sub.srvcCd      = data.srvcCd;
                 		sub.srvcUseYn   = data.useYn;
                 		sub.instCd      = data.instCd;
                 		inList.push(sub);
                 		sParam.saveList = inList;
                 	   });        
                 	}


                    var linkData = {"header": fn_getHeader("CAPSV0088203"), "CaSrvcMgmtSvcChngListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.saveList = [];
                                that.deleteList = [];
                                that.inquireServiceStatus();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                //fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_save'), bxMsg('cbb_items.SCRNITM#data-update-msg'), saveData, this);
            },




            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find("#search-condition-area"), this.$el.find("#btn-search-condition-toggle"));
            },


            toggleAdditionalCondition: function () {
                fn_pageLayerCtrl(this.$el.find("#additional-search-condition-area"), this.$el.find("#btn-additional-search-condition-toggle"));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find("#search-result-area"), this.$el.find("#btn-search-result-toggle"));
            }
        });


        return CAPSV032View;
    }
);


