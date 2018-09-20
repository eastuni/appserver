define(
    [
        'bx/common/config',
        'text!app/views/page/CAPSV/051/_CAPSV051.html',
        'bx-component/ext-grid/_ext-grid',
        'bx/common/common-info',
        'bx-component/message/message-alert'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        commonInfo,
        alertMessage
    ) {


        /**
         * Backbone
         */
        var CAPSV051View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPSV051-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-search-condition-inquire': 'inquireScreenList',


                'click #btn-search-result-excel': 'downloadExcelFile',
                'click #btn-search-result-edit': 'moveToNewPage',
                'click #btn-search-result-save': 'clickSaveScreenList',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-additional-search-condition-toggle': 'toggleAdditionalCondition',
                'click #btn-search-result-toggle': 'toggleSearchResult'
            },


//
//
//
            initialize: function (initData) {
                var that = this;


                $.extend(that, initData);
                that.$el.html(that.tpl());


                that.deleteList = [];
                that.saveList = [];
                that.comboStore1 = {};
                that.TargetObj =[];


                var sParam = {};
                sParam.cdNbr = "11603";


                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                bxProxy.all([
                        {
                            // 컴포넌트콤보로딩
                            url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {


                            if (fn_commonChekResult(responseData)) {
                                that.comboStore1 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                        }
                    ]
                    , {
                    success: function () {
                        that.CAPSV051Grid = new ExtGrid({
                            // 그리드 컬럼 정의
                            fields: ['rowIndex', 'cmpntCd', 'scrnId', 'scrnNm', 'useLngScrnNm', 'scrnUseYn', 'menuTrgtScrnYn', 'instCd',
                             {
                                name: 'checkUseYn',
                                type: 'boolean',
                                convert: function (value, record) {
                                    return record.get('scrnUseYn') === 'Y';
                                    ;
                                }
                            },
                             { 
                                name: 'checkScrnYn',
                                type: 'boolean',
                                convert: function (value, record) {
                                    return record.get('menuTrgtScrnYn') === 'Y';
                                    ;
                                }
                            },
                            { name : 'flagTp',
                              type : 'text'
                            }],
                            id: 'CAPSV051Grid',
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
                                }
                                , {
                                    text: bxMsg('cbb_items.SCRNITM#cmpnt'),flex: 1,dataIndex: 'cmpntCd',style: 'text-align:center',align: 'left',
                                    editor:
                                    {
                                        xtype: 'combobox',
                                        store: that.comboStore1,
                                        displayField: 'cdNm',
                                        valueField: 'cd'
                                    },
                                    renderer: function (val) {
                                        var index = that.comboStore1.findExact('cd', val);


                                        if (index != -1) {
                                            var rs = that.comboStore1.getAt(index).data;


                                            return rs.cdNm;
                                        }
                                    }
                                }
                                , {text: bxMsg('cbb_items.AT#scrnId'),flex: 1,dataIndex: 'scrnId',style: 'text-align:center',align: 'left'}
                                , {text: bxMsg('cbb_items.AT#scrnNm'),flex: 1,dataIndex: 'scrnNm',style: 'text-align:center',align: 'left'}
                                , {text: bxMsg('cbb_items.SCRNITM#loginLngScrnNm'),flex: 1,dataIndex: 'useLngScrnNm',style: 'text-align:center',align: 'left'}
                                , {text: bxMsg('cbb_items.SCRNITM#useYn'),flex: 1,dataIndex: 'useLngScrnNm',style: 'text-align:center',align: 'left'}
                                , {text: bxMsg('cbb_items.SCRNITM#useYn'),flex: 1,dataIndex: 'checkUseYn',style: 'text-align:center',align: 'center'
                            	,xtype: 'checkcolumn'
                            	,editor: {
                                         xtype: 'checkbox',
                                         cls: 'x-grid-checkheader-editor'
                            	}
                                ,columntype: 'checkbox'
                            	, stopSelection: false
                            	,header : '<input type="checkbox" disabled />' + bxMsg('cbb_items.SCRNITM#useYn')
//                                 	, renderer : function(val) {


//                                        currentRecord.set('scrnUseYn', val ? 'Y' : 'N');
//                                 	}
                            	//TODO : 공통적인 부분 빼고, 소스 정리
                                ,listeners: 
                                  {
                                        click: function (_this, cell, rowIndex, eOpts) {
                                            var currentRecord = that.CAPSV051Grid.store.getAt(rowIndex),
                                                changedChecked = !currentRecord.get('checkUseYn');


                                            currentRecord.set('scrnUseYn', changedChecked ? 'Y' : 'N');
                                            currentRecord.set('checkUseYn', changedChecked);
                                            //that.saveList.push(currentRecord.data);
                                            that.CAPSV051Grid.store.getAt(rowIndex).set('flagTp', 'Y');
                                        }
		                                ,headerclick: function(header, column, e, t,eOpts) {
		                                    console.log(that.CAPSV051Grid.store);
		                                    var selections = that.CAPSV051Grid.store.getRange(),
	                                            i = 0,
	                                            len = selections.length;


	                                        for (; i < len; i++) {
	                                        	 if( e.target.checked ){
	                                        		 if( e.target.checked === ( that.CAPSV051Grid.store.getAt(i).data.scrnUseYn==='Y')){
	                                        			 that.CAPSV051Grid.store.getAt(i).set('flagTp', '');
	                                        		 }else{
		                                                 that.CAPSV051Grid.store.getAt(i).set('scrnUseYn', 'Y');
		                                                 that.CAPSV051Grid.store.getAt(i).set('checkUseYn', 'Y'); 
		                                              	 that.CAPSV051Grid.store.getAt(i).set('flagTp', 'Y');
	                                        		 }
	                                        	 }else{
	                                        		 if( !e.target.checked === ( that.CAPSV051Grid.store.getAt(i).data.scrnUseYn==='N')){
	                                        			 that.CAPSV051Grid.store.getAt(i).set('flagTp', '');
	                                        		 }else{
		                                        		 that.CAPSV051Grid.store.getAt(i).set('scrnUseYn', 'N');
		                                                 that.CAPSV051Grid.store.getAt(i).set('checkUseYn', 'N');
	                                        			 that.CAPSV051Grid.store.getAt(i).set('flagTp', 'Y');
	                                        		 }
	                                        	 }
	                                        }
		                               }
                                   }
                                }
                                , {text: bxMsg('cbb_items.AT#menuTrgtScrnYn'),flex: 1,dataIndex: 'checkScrnYn',style: 'text-align:center',align: 'center'
                                	,xtype: 'checkcolumn'
                                	,editor: {
                                             xtype: 'checkbox',
                                             cls: 'x-grid-checkheader-editor'
                                	}
                                    ,columntype: 'checkbox'
                                	, stopSelection: false
                                	,header : '<input type="checkbox" disabled />' + bxMsg('cbb_items.AT#menuTrgtScrnYn')
                                    ,listeners: 
                                    {
                                        click: function (_this, cell, rowIndex, eOpts) {
                                            var currentRecord = that.CAPSV051Grid.store.getAt(rowIndex),
                                                changedChecked = !currentRecord.get('checkScrnYn');


                                            currentRecord.set('menuTrgtScrnYn', changedChecked ? 'Y' : 'N');
                                            currentRecord.set('checkScrnYn', changedChecked);
                                            //that.saveList.push(currentRecord.data);
                                            that.CAPSV051Grid.store.getAt(rowIndex).set('flagTp', 'Y');
                                        }
	                                    ,headerclick: function(header, column, e, t,eOpts) {
	                                        console.log(that.CAPSV051Grid.store);
	                                        var selections = that.CAPSV051Grid.store.getRange(),
                                                i = 0,
                                                len = selections.length;


	                                        for (; i < len; i++) {
	                                        	 if( e.target.checked ){
	                                        		 if( e.target.checked === ( that.CAPSV051Grid.store.getAt(i).data.menuTrgtScrnYn==='Y')){
	                                        			 that.CAPSV051Grid.store.getAt(i).set('flagTp', '');
	                                        		 }else{
		                                                 that.CAPSV051Grid.store.getAt(i).set('menuTrgtScrnYn', 'Y');
		                                                 that.CAPSV051Grid.store.getAt(i).set('checkScrnYn', 'Y'); 
		                                              	 that.CAPSV051Grid.store.getAt(i).set('flagTp', 'Y');
	                                        		 }
	                                        	 }else{
	                                        		 if( !e.target.checked === ( that.CAPSV051Grid.store.getAt(i).data.menuTrgtScrnYn==='N')){
	                                        			 that.CAPSV051Grid.store.getAt(i).set('flagTp', '');
	                                        		 }else{
		                                        		 that.CAPSV051Grid.store.getAt(i).set('menuTrgtScrnYn', 'N');
		                                                 that.CAPSV051Grid.store.getAt(i).set('checkScrnYn', 'N');
	                                        			 that.CAPSV051Grid.store.getAt(i).set('flagTp', 'Y');
	                                        		 }
	                                        	 }
	                                        }


//                                            for (; i < len; i++) {
//                                            	 if( e.target.checked ){
//                                                     that.CAPSV051Grid.store.getAt(i).set('menuTrgtScrnYn', 'Y');
//                                                     that.CAPSV051Grid.store.getAt(i).set('checkScrnYn', 'Y');
//                                            	 }else{
//                                            		   that.CAPSV051Grid.store.getAt(i).set('menuTrgtScrnYn', 'N');
//                                                       that.CAPSV051Grid.store.getAt(i).set('checkScrnYn', 'N');
//                                            	 }
//                                            	 
//                                            	 that.checkListDupScrnYnData(that, i);
//                                            }
	                                   }
                                    }
                                 }
                                , {text: bxMsg('cbb_items.AT#instCd'), dataIndex: 'instCd', hidden : true}
                                , {
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
//		  					, selType: 'checkboxmodel' 
//    		  				, rowModel: { mode: 'MULTI'}


                            }, // end of gridConfig
                            listeners: {
                                dblclick: {
                                    element: 'body',
                                    fn: function () {
                                    	var selectedData = that.CAPSV051Grid.grid.getSelectionModel().selected.items[0];
                                    	if (!selectedData) {
                                    		return;
                                    	}


                                    	that.moveToNewPage("", selectedData.data)
                                    }
                                }
                            }
                        });


                        that.$el.find("#CAPSV051Grid").html(that.CAPSV051Grid.render({'height': CaGridHeight}));
                    } // end of success:.function
                }); // end of bxProxy.all
            },


//
//
//
            render: function () {
                var that = this;


                that.setComboBoxes();

                //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPSV051-wrap #btn-search-result-save')
                                    			   ]);
                
                
                return this.$el;
            },


//
//
//
            checkListDupScrnYnData: function(that, i){
           	 if( that.saveList.length >= 1){
           		 for (j = 0; j < that.saveList.length; j++){
           			 if(that.CAPSV051Grid.store.getAt(i).data.scrnId === that.saveList[j].scrnId ){
           				 that.saveList[j].menuTrgtScrnYn = that.CAPSV051Grid.store.getAt(i).data.menuTrgtScrnYn;
           			 }else{
           				 that.saveList.push(that.CAPSV051Grid.store.getAt(i).data);
           			 }
           		 }


           	 }else{
           		 that.saveList.push(that.CAPSV051Grid.store.getAt(i).data);
           	 }
           },


           checkListDupUseYnData: function(that, i){
          	 if( that.saveList.length >= 1){
          		 for (j = 0; j < that.saveList.length; j++){
          			 if(that.CAPSV051Grid.store.getAt(i).data.scrnId === that.saveList[j].scrnId ){
          				 that.saveList[j].scrnUseYn = that.CAPSV051Grid.store.getAt(i).data.scrnUseYn;
          			 }else{
          				 that.saveList.push(that.CAPSV051Grid.store.getAt(i).data);
          			 }
          		 }


          	 }else{
          		 that.saveList.push(that.CAPSV051Grid.store.getAt(i).data);
          	 }
         },


//
//
//
            createGrid: function () {
                var that = this;




            },


//
//
//
            setComboBoxes: function () {
                var sParam;


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPSV051-cmpntCd-wrap";
                sParam.targetId = "cmpntCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "11603";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPSV051-scrnUseYn-wrap";
                sParam.targetId = "scrnUseYn";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "10000"; // 여부
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPSV051-menuTrgtScrnYn-wrap";
                sParam.targetId = "menuTrgtScrnYn";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "10000"; // 여부
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


//
//
//
            resetSearchCondition: function () {
                var that = this;


                that.$el.find('#CAPSV051-base-table [data-form-param="cmpntCd"] option:eq(0)').attr("selected", "selected");
                that.$el.find('#CAPSV051-base-table [data-form-param="scrnId"]').val("");
                that.$el.find('#CAPSV051-base-table [data-form-param="scrnNm"]').val("");
                that.$el.find('#additional-CAPSV051-base-table [data-form-param="useLngScrnNm"]').val("");
                that.$el.find('#additional-CAPSV051-base-table [data-form-param="scrnUseYn"] option:eq(0)').attr("selected", "selected");
                that.$el.find('#additional-CAPSV051-base-table [data-form-param="menuTrgtScrnYn"] option:eq(0)').attr("selected", "selected");
            },


//
//
//
            inquireScreenList: function () {
                var that = this;
                var sParam = {};
                that.saveList =[];
                that.TargetObj =[];
                that.deleteList =[];


                // 조회 key값 set


                if(commonInfo.getInstInfo().instCd) {
            		sParam.instCd = commonInfo.getInstInfo().instCd;
            	}
            	else {
            		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
            	}


                sParam.cmpntCd = that.$el.find('#CAPSV051-base-table [data-form-param="cmpntCd"]').val();
                sParam.scrnId = that.$el.find('#CAPSV051-base-table [data-form-param="scrnId"]').val();
                sParam.scrnNm = that.$el.find('#CAPSV051-base-table [data-form-param="scrnNm"]').val();
                sParam.useLngScrnNm = that.$el.find('#additional-CAPSV051-base-table [data-form-param="useLngScrnNm"]').val();
                sParam.scrnUseYn = that.$el.find('#additional-CAPSV051-base-table [data-form-param="scrnUseYn"]').val();
                sParam.menuTrgtScrnYn = that.$el.find('#additional-CAPSV051-base-table [data-form-param="menuTrgtScrnYn"]').val();


                var linkData = {"header": fn_getHeader("CAPSV0508401"), "CaScrnMgmtSvcGetScrnInfoListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {


                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaScrnMgmtSvcGetScrnInfoListOut) {
                            	var totCnt = responseData.CaScrnMgmtSvcGetScrnInfoListOut.totCnt;
                            	that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                var tbList = responseData.CaScrnMgmtSvcGetScrnInfoListOut.tblNm;
                                if (tbList != null || tbList.length > 0) {
                                    that.CAPSV051Grid.setData(tbList);
                                    that.TargetObj = tbList;


                                    that.CAPSV051Grid.store.sort([{property: 'scrnNm', direction: 'ASC'}]);
                                }
                            }
                        }
                    }
                });
            },


//
//
//
            downloadExcelFile: function () {
            	var that = this;
            	that.CAPSV051Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV051')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


//
//
//
            moveToNewPage: function (e, param) {
            	if(!param) {
            		// 편집 버튼 클릭 시 그리드의 선택된 값을 가져 온다.
            		param = {};
            		var selectedData = this.CAPSV051Grid.grid.getSelectionModel().selected.items[0];
                	if (selectedData) {
                		param.scrnId = selectedData.data.scrnId;
                		param.useLngScrnNm = selectedData.data.useLngScrnNm;
                	}
                	else {
                		param.scrnId = "";
                		param.useLngScrnNm = "";
                	}
            	}


                this.$el.trigger({
                    type: 'open-conts-page',
                    pageHandler: 'CAPSV050',
                    pageDPName: bxMsg('cbb_items.SCRN#CAPSV050'),
                    pageInitialize: true,
                    pageRenderInfo: {
                    	scrnId : param.scrnId
                    	, scrnNm : param.useLngScrnNm
                    }
                });
            },


//
//
//
            clickSaveScreenList: function () {
            	var that = this;


//            	if(this.deleteList.length < 1 && this.saveList.length < 1 ) {
//            		return;
//            	}
            	this.saveScreenList(that);


//            	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.saveScreenList, this);
//
//            	
//            	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_save'), bxMsg('cbb_items.SCRNITM#dataChkMsg'), this.saveScreenList, this);


            },


//
//
//
            saveScreenList: function (that) {
            	var removeList = [];
            	var inList = [];
            	var sParam = {};


				if( that.CAPSV051Grid.store.getRange().length > 0){
					 for (j = 0; j < that.CAPSV051Grid.store.getRange().length; j++){
					 	if( that.CAPSV051Grid.store.getAt(j).data.flagTp === 'Y'){
					 		that.saveList.push(that.CAPSV051Grid.store.getAt(j).data);
					 	}


         		    }
				}


            	if(this.deleteList.length >=1  ){
             	   $(that.deleteList).each(function(idx, data) {
             		var sub = {};
             		sub.scrnId = data.scrnId;
             		removeList.push(sub);
             		sParam.removeList = removeList;
             	   });         
             	}
            	if( this.saveList.length >=1 ){
             	    $(this.saveList).each(function(idx, data) {
             		var sub = {};
             		sub.scrnId = data.scrnId;
             		sub.menuTrgtScrnYn = data.menuTrgtScrnYn;
             		sub.scrnUseYn = data.scrnUseYn;
            		sub.instCd = data.instCd;


             		inList.push(sub);
             		sParam.inList = inList;
             	   });        
             	}


            	if(this.deleteList.length < 1 && this.saveList.length < 1 ) {
        		return;
        	    }

            	//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

            	var linkData = {};
//            	if(this.deleteList.length > 1 ) {
//            		linkData = {"header": fn_getHeader("CAPSV0518302"), "CaScrnMgmtSvcRemoveScrnInfoListIn": sParam};
//            	}
//            	
            	if(this.saveList.length >= 1 || this.deleteList.length >= 1 ) {
            		linkData = {"header": fn_getHeader("CAPSV0518503"), "CaScrnMgmtSvcSaveScrnInfoInList": sParam};
            	}


            	// ajax호출
            	bxProxy.post(sUrl, JSON.stringify(linkData), {
            		enableLoading: true
            		, success: function (responseData) {
            			if (fn_commonChekResult(responseData)) {
            				fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


            				// 재조회
            				that.inquireScreenList();
            			}
            		}   // end of suucess: fucntion
            	}
            	); // end of bxProxy
            },


//
//
//
            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find("#CAPSV051-base-table"), this.$el.find("#btn-search-condition-toggle"));
            },


//
//
//
            toggleAdditionalCondition: function () {
                fn_pageLayerCtrl(this.$el.find("#additional-CAPSV051-base-table"), this.$el.find("#btn-additional-search-condition-toggle"));
            },


//
//
//
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find("#CAPSV051Grid"), this.$el.find("#btn-search-result-toggle"));
            }
        });


        return CAPSV051View;
    }
);


