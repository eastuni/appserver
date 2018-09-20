define(
    [
        'bx-component/popup/popup'
        , 'bx-component/message/message-alert'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/popup/CAPDC/popup-docId-tpl.html'
        , 'bx/common/common-info'
    ],
    function (Popup
        , alertMessage
        , ExtGrid
        , tpl
        , commonInfo) {


    	var gPopupStaffInstCd = null;
    	var deptId = null;
    	var rsltCnt;//검색건수


        var BxpUserPopup = Popup.extend({
            tagName: 'section',
            className: 'popup-page',
            templates: {
                'tpl': tpl
            },
            attributes: {
              	'style': 'width: 1020px; height: 780px;'
            },
            events: {
                  'click .search-btn': 'loadList'
                , 'click .cancel-btn': 'close'
                , 'click .select-btn': 'selectItem'
                , 'keydown .searchKey': 'enterSelect'
                , 'click #btn-popup-search-modal': 'popPageLayerCtrl' // 조회영역 접기       	
                , 'click #btn-popup-grid-modal': 'popGridLayerCtrl' // 그리드영역 접기
                , 'click .search-reset': 'reset' // 초기화
            },
            initialize: function (initConfig) {
                var that = this;
                // Set Page
                this.$el.html(this.tpl());
                // Set Page modal 설정
                that.enableDim = true;


                var sParam = {};
                sParam.cdNbr = "11603"; // 서비스콤포넌트코드 
                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
                var comboStore1 = null;


                bxProxy.all([
                             // 서비스컴포넌트콤보로딩
                             {url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
                                 if (fn_commonChekResult(responseData)) {
                                     comboStore1 = new Ext.data.Store({
                                         fields: ['cd', 'cdNm'],
                                         data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
                                     }); 


                                     // add option to 검색조건 combobox 
                                     var comboParam = {};
                                     comboParam.className = "popup-base-cmpontCd-wrap";
                                     comboParam.tbl = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl;
                                     comboParam.valueNm = "cd";
                                     comboParam.textNm = "cdNm";
                                     comboParam.nullYn = "Y";
                                     comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');


                                     fn_makeComboBox(comboParam, that);                                     
                                 }
                             }}                              
                          ]
                          , {
                              success: function () {   


                            	/* ------------------------------------------------------------ */
			                    that.dataGrid = new ExtGrid({
			                        /* ------------------------------------------------------------ */
			                        // 단일탭 그리드 컬럼 정의
			                        fields: ['rowIndex', 'cmpntCd', 'docId', 'docNm', 'loinLngDocNm', 'docStsCd', 'docTypeCd', 'docMkngTpCd']
			                        , id: 'CAPDC002Grid'
			                        , columns: [
										{
										    text: 'No.'
										    , dataIndex: 'rowIndex'
										    , sortable: false
										    , width : 80
										    , height : 25
										    , style: 'text-align:center'
										    , align: 'center'
										    , renderer: function (value, metaData, record, rowIndex) {
										    	record.data.rowIndex = rowIndex + 1;
										        return record.data.rowIndex;
										    }
										}
			                            , {text: bxMsg('cbb_items.SCRNITM#cmpnt'), flex: 1, dataIndex: 'cmpntCd', style: 'text-align:center', align: 'left',
	                                       renderer: function(val) {
	                                    	   index = comboStore1.findExact('cd', val);
                                               if(index != -1) {
                                            	   rs = comboStore1.getAt(index).data;
                                                   return rs.cdNm;
                                               }
                                           } // end of render	
			                            }
			                            , {text: bxMsg('cbb_items.AT#docId'),flex: 2, dataIndex: 'docId', style: 'text-align:center', align: 'left'}
			                            , {text: bxMsg('cbb_items.AT#docNm'),flex: 2, dataIndex: 'docNm', style: 'text-align:center', align: 'left'}
			                            , {hidden: true, dataIndex: 'loinLngDocNm'}
			                            , {hidden: true, dataIndex: 'docStsCd'}
			                            , {hidden: true, dataIndex: 'docTypeCd'}
			                            , {hidden: true, dataIndex: 'docMkngTpCd'}
			                        ] // end of columns
			                        , listeners: {
			                            dblclick: {
			                                element: 'body',
			                                fn: function () {
			                                    that.selectItem();
			                                }
			                            }
			                        }
			                    });


			                    // 단일탭 그리드 렌더
			                    that.$el.find("#popup-doc-grid").html(that.dataGrid.render({'height': CaGridHeight}));
			                    that.dataGrid.resetData();
			                    that.show();


                              } // end of success:.function
                }); // end of bxProxy.all	
            },
            render: function () {
            },
            loadList: function (e, param) {
                var that = this;
                var sParam = {};


                that.$el.find('#rsltCnt').html(0);
                that.dataGrid.resetData();


                sParam.cmpntCd = that.$el.find('.popup-doc-table [data-form-param="cmpntCd"]').val();
                sParam.docId = that.$el.find('.popup-doc-table [data-form-param="docId"]').val();
                sParam.docNm = that.$el.find('.popup-doc-table [data-form-param="docNm"]').val();


                var linkData = {"header": fn_getHeader("CAPDC0018401"), "CaDocSrchSvcGetDocListIn": sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaDocSrchSvcGetDocListOut) {
                            	var rsltCnt = responseData.CaDocSrchSvcGetDocListOut.docList.length;
                                that.dataGrid.setData(responseData.CaDocSrchSvcGetDocListOut.docList);
                                //검색건수
                            	that.$el.find('#rsltCnt').html(fn_setComma(rsltCnt));
                            }
                        }
                    }
                });


            },
            /**
             * 선택버튼 클릭 시 실행 
             */
            selectItem: function () {
                var selectedData = this.dataGrid.grid.getSelectionModel().selected.items[0];
                var param = {};
                if (!selectedData) {
                    return;
                } else {
                	param.cmpntCd = selectedData.data.cmpntCd;
                    param.docId = selectedData.data.docId;
                    param.docNm = selectedData.data.docNm;
                    param.loinLngDocNm = selectedData.data.loinLngDocNm;
                    param.docStsCd = selectedData.data.docStsCd;
                    param.docTpCd = selectedData.data.docTpCd;
                    param.docMkngTpCd = selectedData.data.docMkngTpCd;
                }
                this.trigger('popUpSetData', param);
                this.close();
            },
            afterClose: function () {
                this.remove();
            },
            /**
             * 검색어 입력박스에 enter key 입력 시 실행 
             */
            enterSelect: function (event) {
                event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if (keyID == 13) { //enter
                    this.loadList();
                }
            },


            /**
             * 그리드영역 접기
             */
            popGridLayerCtrl: function(){
        		fn_pageLayerCtrl(this.$el.find("#popup-doc-grid-area"));
            },


            /**
             * 조회영역 접기
             */
            popPageLayerCtrl: function(){
        		fn_pageLayerCtrl(this.$el.find("#popup-search-area"));
            },


            /**
             * 입력항목 초기화
             */
            reset: function(){
            	var that = this;


                that.$el.find('.popup-doc-table input').val("");
                that.$el.find('.popup-doc-table select').each(function(){ 
	        		this.selectedIndex = 0;	
	        	});


                that.$el.find('#rsltCnt').html(0);
                that.dataGrid.resetData();                
            }
        });
        return BxpUserPopup;
    }
);
