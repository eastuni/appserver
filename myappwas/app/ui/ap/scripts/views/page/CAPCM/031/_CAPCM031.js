define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPCM/031/_CAPCM031.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/message/message-alert'
        , 'app/views/page/popup/CAPSV/popup-attribute-search'
        , 'app/views/page/popup/CAPCM/popup-class-search'
        , 'app/views/page/popup/CAPCM/popup-institution-search'
        , 'app/views/page/popup/CAPCM/popup-code-search'
    ]
    , function (config
        , tpl
        , ExtGrid
        , alertMessage
        , PopupStdAtrbt
        , PopupClassLayerTpCd
        , PopupInstCd
        , PopupCdM) {


        /**
         * Backbone
         */
        var PCM031View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container PCM031-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #base-reset-btn': 'resetArea'
                , 'click #base-search-btn': 'queryParmAtrbt'
                , 'click #detail-reset-btn': 'resetDetailArea'
                , 'click #detail-save-btn': 'saveParmAtrbt'
                , 'click #detail-delete-btn': 'deleteParmAtrbt'
                , 'click .PCM031-stdAtrbt-btn': 'openStdAtrbt'
                , 'click .PCM031-classLayerTpCd-btn': 'openClassLayerTpCd'
                , 'click .PCM031-instCd-btn': 'openInstCd'
                , 'click .PCM031-code-btn': 'openCdM'	
                , 'change .PCM031-atrbtVldtnWayCd-wrap': 'fn_changeAtrbtVldtnWayCd'
            	, 'click #up-grid-btn': 'areaUpDown'	




            		, 'click #alertTest': 'alertTest'	
            }


            , alertTest : function() {
            	fn_confirmMessage("에러", "에러입니다.");
            }
            /**
             * initialize
             */
            , initialize: function (initData) {
                var that = this;


                $.extend(that, initData);


                that.$el.html(that.tpl());


                var sParam = {};
                sParam.cdNbr = "11310"; // 기관파라미터유형코드
                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                bxProxy.all([
                    {
                        url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore1 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }]
                    , {
                        success: function () {
                            that.PCM031Grid1 = new ExtGrid({
                                // 그리드 컬럼 정의
                                fields: ['instParmTpCd', 'parmAtrbtNm', 'parmDesc', 'parmKorDesc', 'atrbtVldtnWayCd', 'atrbtVldtnRule', 'atrbtVldtnXtnRule', 'jsonCmbBoxCntnt']
                                , id: 'PCM031Grid1'
                                , columns: [{
                                    text: 'No.'
                                    , dataIndex: 'rowIndex'
                                    , sortable: false
                                    , flex: 1
                                    , style: 'text-align:center'
                                    , align: 'right'
                                    // other config you need....
                                    , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                        return rowIndex + 1;
                                      }
                                	}
                                    , {
                                        text: bxMsg('cbb_items.AT#instParmTpCd')
                                        , flex: 3
                                        , dataIndex: 'instParmTpCd'
                                        , style: 'text-align:center'
                                        , align: 'left'
                                        , editor: {
                                            xtype: 'combobox'
                                            , store: comboStore1
                                            , displayField: 'cdNm'
                                            , valueField: 'cd'
                                        }
	                                    ,
	                                    renderer: function (val) {
	                                        index = comboStore1.findExact('cd', val);
	                                        if (index != -1) {
	                                            rs = comboStore1.getAt(index).data;
	                                            return rs.cdNm
	                                        }
	                                    } // end of render
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#parmAtrbtNm')
                                        , flex: 6
                                        , dataIndex: 'parmAtrbtNm'
                                        , style: 'text-align:center'
                                        , align: 'left'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#parmDesc')
                                        , flex: 6
                                        , dataIndex: 'parmDesc'
                                        , style: 'text-align:center'
                                        , align: 'left'	
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#parmKorDesc')
                                        , flex: 3
                                        , dataIndex: 'parmKorDesc'
                                        , style: 'text-align:center'
                                        , align: 'left'	
                                        , hidden: true,	
                                    }                  
                                    , {
                                        text: bxMsg('cbb_items.AT#atrbtVldtnWayCd')
                                        , flex: 3
                                        , dataIndex: 'atrbtVldtnWayCd'
                                        , style: 'text-align:center'
                                        , align: 'left'
                                        , hidden: true
                                    }                  
                                    , {
                                        text: bxMsg('cbb_items.AT#atrbtVldtnRule')
                                        , flex: 3
                                        , dataIndex: 'atrbtVldtnRule'
                                        , style: 'text-align:center'
                                        , align: 'left'
                                        , hidden: true 	
                                    }                  
                                    , {
                                        text: bxMsg('cbb_items.AT#atrbtVldtnXtnRule')
                                        , flex: 3
                                        , dataIndex: 'atrbtVldtnXtnRule'
                                        , style: 'text-align:center'
                                        , align: 'left'
                                        , hidden: true	
                                    }                  
                                    , {
                                        text: bxMsg('cbb_items.AT#jsonCmbBoxCntnt')
                                        , flex: 3
                                        , dataIndex: 'jsonCmbBoxCntnt'
                                        , style: 'text-align:center'
                                        , align: 'left'
                                        , hidden: true	
                                    }                  
                                ] // end of columns


                                , gridConfig: {
                                    // 셀 에디팅 플러그인
                                    plugins: [
                                        Ext.create('Ext.grid.plugin.CellEditing', {
                                            // 1번 클릭시, 에디팅할 수 있도록 처리
                                            clicksToEdit: 1
                                            , listeners: {
                                                'beforeedit': function (editor, e) {
                                                    return false;
                                                } // end of beforeedit
                                            } // end of listners
                                        }) // end of Ext.create
                                    ] // end of plugins
                                } // end of gridConfig
                                , listeners: {
                                    click: {
                                        element: 'body'
                                        , fn: function () {
                                            //더블클릭시 이벤트 발생
                                            that.doubleiClickGrid1();
                                        }
                                    }
                                }
                            });


                            // 단일탭 그리드 렌더
                            that.createGrid();
                        } // end of success:.function
                    });
            }


            /**
             * render
             */
            , render: function () {
                var that = this;


                // 콤보데이터 로딩
                var sParam = {};
                sParam.className = "PCM031-instParmTpCd-wrap";
                sParam.targetId = "instParmTpCd";
                sParam.nullYn = "N";
                sParam.cdNbr = "11310"; // 기관파라미터유형코드


                fn_getCodeList(sParam, this);


                var sParam = {};
                sParam.className = "PCM031-atrbtVldtnWayCd-wrap";
                sParam.targetId = "atrbtVldtnWayCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "10002"; // 속성검증구분코드


                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                return this.$el;
            }


            /**
             * 기본부 초기화
             */
            , resetArea: function () {
                var that = this;


                that.$el.find('.PCM031-base-table [data-form-param="parmAtrbtNm"]').val("");
                that.$el.find('.PCM031-base-table [data-form-param="parmDesc"]').val("");


                that.PCM031Grid1.resetData();
            }


            /**
             * 상세부 초기화
             */
            , resetDetailArea: function () {
                var that = this;


                that.$el.find('.PCM031-detail-table [data-form-param="instParmTpCd"]').val("");
                that.$el.find('.PCM031-detail-table [data-form-param="parmAtrbtNm"]').val("");
                that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnWayCd"]').val("");
                that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnRule"]').val("");
                that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnXtnRule"]').val("");
                that.$el.find('.PCM031-detail-table [data-form-param="jsonCmbBoxCntnt"]').val("");
            }


            /**
             * 그리드 생성
             */
            , createGrid: function () {
                var that = this;


                this.$el.find(".PCM031-grid1").html(this.PCM031Grid1.render({'height': CgridHeight}));
            } // end of createGrid


            /**
             * 조회 버튼 클릭
             */
            , queryParmAtrbt: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.PCM031-base-table'));


                that.resetDetailArea();
                that.inquiryBaseData(sParam);
            }


            /**
             * 조회
             */
            , inquiryBaseData: function (param) {
                var that = this;
                var sParam = param;


                var linkData = {"header": fn_getHeader("CAPCM0318401"), "CaInstMgmtSvcAtrbtIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var rsltList = responseData.CaInstMgmtSvcAtrbtOut.instParmAtrbtList;


                            if (rsltList != null || rsltList.length > 0) {
                                that.PCM031Grid1.setData(rsltList);
                            }
                            else {
                                that.PCM031Grid1.resetData();
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            /**
             * 저장 버튼 클릭
             */
            , saveParmAtrbt: function () {
                var that = this;
                var sParam = {};
                var instParmAtrbtList = [];
                var row = {};


                row.instParmTpCd = that.$el.find('.PCM031-detail-table [data-form-param="instParmTpCd"]').val();
                row.parmAtrbtNm = that.$el.find('.PCM031-detail-table [data-form-param="parmAtrbtNm"]').val();
                row.atrbtVldtnWayCd = that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnWayCd"]').val();


                if(!(row.atrbtVldtnWayCd == "T")) {
                    row.atrbtVldtnRuleCntnt = that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnRule"]').val();
                } else {
                    row.atrbtVldtnRuleCntnt = that.$el.find('.PCM031-detail-table [data-form-param="clHrarcyCd"]').val();
                }


                row.atrbtVldtnXtnRuleCntnt = that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnXtnRule"]').val();
                row.jsonCmbBoxCntnt = that.$el.find('.PCM031-detail-table [data-form-param="jsonCmbBoxCntnt"]').val();


                // 입력 검증
                if(fn_isEmpty(row.parmAtrbtNm)) {
                  alertMessage.error(bxMsg('cbb_err_msg.AUICME0004') + " [" + bxMsg("cbb_items.AT#parmAtrbtNm") + "]");
                  that.$el.find('.PCM031-detail-table [data-form-param="parmAtrbtNm"]').focus();
                  return;
                }


                if(fn_isEmpty(row.instParmTpCd)) {
                    alertMessage.error(bxMsg('cbb_err_msg.AUICME0004') + " [" + bxMsg("cbb_items.AT#instParmTpCd") + "]");
                    that.$el.find('.PCM031-detail-table [data-form-param="instParmTpCd"]').focus();
                    return;
                }


                instParmAtrbtList.push(row);
                sParam.instParmAtrbtList = instParmAtrbtList;


                var linkData = {"header": fn_getHeader("CAPCM0318101"), "CaInstMgmtSvcAtrbtIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                            // 재조회
                            that.queryParmAtrbt();
                        }
                    }
                });
            }


            /**
             * 삭제 버튼 클릭
             */
            , deleteParmAtrbt: function () {
                var that = this;
                var sParam = {};
                var instParmAtrbtList = [];
                var row = {};


                row.parmAtrbtNm = that.$el.find('.PCM031-detail-table [data-form-param="parmAtrbtNm"]').val();


                // 입력 검증
                if(fn_isEmpty(row.parmAtrbtNm)) {
                  alertMessage.error(bxMsg('cbb_err_msg.AUICME0004') + " [" + bxMsg("cbb_items.AT#parmAtrbtNm") + "]");
                  that.$el.find('.PCM031-detail-table [data-form-param="parmAtrbtNm"]').focus();
                  return;
                }


                instParmAtrbtList.push(row);
                sParam.instParmAtrbtList = instParmAtrbtList;


                var linkData = {"header": fn_getHeader("CAPCM0318301"), "CaInstMgmtSvcAtrbtIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                            // 재조회
                            that.queryParmAtrbt();
                        }
                    }
                });
            }


            /**
             * 그리드 행 더블클릭
             */
            , doubleiClickGrid1: function () {
                var that = this;


                var selectedRecord = that.PCM031Grid1.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                }


                that.$el.find('.PCM031-detail-table [data-form-param="instParmTpCd"]').val(selectedRecord.data.instParmTpCd);
                that.$el.find('.PCM031-detail-table [data-form-param="parmAtrbtNm"]').val(selectedRecord.data.parmAtrbtNm);
                that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnWayCd"]').val(selectedRecord.data.atrbtVldtnWayCd);
                that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnRule"]').val(selectedRecord.data.atrbtVldtnRuleCntnt);
                that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnXtnRule"]').val(selectedRecord.data.atrbtVldtnXtnRuleCntnt);
                that.$el.find('.PCM031-detail-table [data-form-param="jsonCmbBoxCntnt"]').val(selectedRecord.data.jsonCmbBoxCntnt);
            }


            /**
             * 팝업-표준속성
             */
            , openStdAtrbt: function () {
                var that = this;


                var param = {};


                var popupStdAtrbt = new PopupStdAtrbt(param);


                popupStdAtrbt.render();
                popupStdAtrbt.on('popUpSetData', function (param) {
                	console.log(param.atrbtNm);
                    that.$el.find('.PCM031-detail-table [data-form-param="parmAtrbtNm"]').val(param.atrbtNm);
                });
            }            


            /**
             * 팝업-클래스유형
             */
            , openClassLayerTpCd: function () {
                var that = this;


                var param = {};
                param.useSubsetCdYn = 'Y';
                param.usePckgYn = 'N';


                var popupClassLayerTpCd = new PopupClassLayerTpCd(param);


                popupClassLayerTpCd.render();
                popupClassLayerTpCd.on('popUpSetData', function(param) {
                	console.log(param.classNm);
                	that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnXtnRule"]').val(param.classNm);
                });
            }


            /**
             * 팝업-기관코드
             */
            , openInstCd: function () {
                var that = this;


                var param = {};
                param.savePsblYn = 'Y';


                var popupInstCd = new PopupInstCd(param);


                popupInstCd.render();
                popupInstCd.on('popUpSetData', function (param) {


                });
            }


            /**
             * 팝업-코드
             */
            , openCdM: function () {
                var that = this;


                var param = {};


                var popupCdM = new PopupCdM(param);


                popupCdM.render();
                popupCdM.on('popUpSetData', function (param) {
                	that.$el.find('.PCM031-detail-table [data-form-param="atrbtVldtnRule"]').val(param.cdNbr);
                });
            }            


            /**
             * 검증코드 변경
             */
            , fn_changeAtrbtVldtnWayCd: function () {
                var that = this;
                var atrbtVldtnWayCd = that.$el.find('[data-form-param="atrbtVldtnWayCd"]').val(); //속성검증방법


                that.$el.find('[data-form-param="atrbtVldtnRule"]').val("");


                if (atrbtVldtnWayCd == "C") {
                    that.$el.find('.PCM031-code-btn').show(); //코드버튼
                    that.$el.find('.atrbtVldtnRuleText').show();
                    that.$el.find('.PCM031-clHrarcyCd-wrap').hide();
                } else if(atrbtVldtnWayCd == "T") {
                    that.$el.find('.PCM031-code-btn').hide(); //코드버튼
                    that.$el.find('.atrbtVldtnRuleText').hide();
                    that.$el.find('.PCM031-clHrarcyCd-wrap').show();
                } else {
                    that.$el.find('.PCM031-code-btn').hide(); //코드버튼 숨김
                    that.$el.find('.atrbtVldtnRuleText').show();
                    that.$el.find('.PCM031-clHrarcyCd-wrap').hide();
                }
            }


            , areaUpDown : function(event) {
            	// common.js 함수 호출
            	fn_pageLayerCtrl("#"+$(event.currentTarget).attr("data-info"));
            }
        }); // end of Backbone.View.extend({


        return PCM031View;
    } // end of define function
); // end of define
