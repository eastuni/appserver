/*
@Screen number  CAPSV191
@brief          후행조회
@author         sungwon.kim
@history        2016.09.20  변환
*/
define(
    [
        'bx/common/config'
      , 'text!app/views/page/CAPSV/191/_CAPSV191.html'
      , 'bx-component/ext-grid/_ext-grid'
      , 'bx/common/common-info'
    ]
    , function
      (
        config
      , tpl
      , ExtGrid
      , commonInfo
      )
      {
        /**
         * Backbone
         */
        var CAPSV191View = Backbone.View.extend(
        {
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
          , className: 'bx-container CAPSV191-page'
            // 템플릿 설정
          , templates: {'tpl': tpl}
            // 이벤트 설정
          , events:
            {
                'click #btn-search-condition-reset'  : 'resetSearchCondition'
              , 'click #btn-search-condition-add'    : 'addDeferredJob'
              , 'click #btn-search-condition-inquiry': 'inquiryDeferredJobList'
              , 'click #btn-search-condition-toggle' : 'toggleSearchCondition'
              , 'click #btn-search-result-toggle'    : 'toggleSearchResult'
            }


          /**
           * initialize
           */
          , initialize: function (initData)
            {
                var that = this;
                that.pgNbr = 1;
                that.pgCnt = 20;


                $.extend(that, initData);
                that.$el.html(that.tpl());


                that.CAPSV191Grid = new ExtGrid(
                {
                    // 그리드 컬럼 정의
                    fields: ['dfrdId','txCd','dfrdNm','useYn','chngUserId','chngOcrTmstmp'
                             ,'aplctnId','srvcNm','oprtnNm','errStopYn','errSkpYn','nodeExctnYn','startTpCd'
                             ,'srvcPrcsngCd','dfrdTxCd','exctnCyclScnd','dlyCyclScnd','fetchCnt'
                             ,'prlExctnCnt','trgtTblNm','dailyTblYn','trgtColumnNm','tblReaderBeanNm'
                             ,'tblNbrgUseYn','tblNbrgBeanNm']
                  , id: 'CAPSV191Grid'
                  , columns:
                    [
                        {
                            text: 'No'
                          , dataIndex: 'rowIndex'
                          , sortable: false
                          , width: 60
                          , height: 25
                          , style: 'text-align:center'
                          , align: 'center'
                          // other config you need....
                          , renderer: function (value, metaData, record, rowIndex)
                            {
                                return rowIndex + 1;
                            }
                        }
                      , {
                            text: bxMsg('cbb_items.AT#dfrdId')
                          , flex: 1
                          , dataIndex: 'dfrdId'
                          , editor: 'textfield'
                          , style: 'text-align:center'
                          , align: 'center'
                        }
                      , {
                            text: bxMsg('cbb_items.AT#txCd')
                          , flex: 1
                          , dataIndex: 'txCd'
                          , editor: 'textfield'
                          , style: 'text-align:center'
                          , align: 'center'
                        }
                      , {
                            text: bxMsg('cbb_items.AT#dfrdNm')
                          , flex: 3
                          , dataIndex: 'dfrdNm'
                          , editor: 'textfield'
                          , style: 'text-align:center'
                          , align: 'left'
                        }
                      , {
                            text: bxMsg('cbb_items.AT#useYn')
                          , flex: 1
                          , dataIndex: 'useYn'
                          , editor: 'textfield'
                          , style: 'text-align:center'
                          , align: 'center'
                          , renderer: function (val)
                            {
                                var valYn = val=="Y"?val:"N";
                                var classNm = valYn=="Y"?"s-yes":"s-no";
                                return "<span class=\"bw-sign "+classNm+"\">"+valYn+"</span>";
                            }
                        }
                      , {
                            text: bxMsg('cbb_items.AT#chngUserId')
                          , flex: 1
                          , dataIndex: 'chngUserId'
                          , editor: 'textfield'
                          , style: 'text-align:center'
                          , align: 'center'
                        }
                      , {
                            text: bxMsg('cbb_items.SCRNITM#baseDAndTm')
                          , flex: 2
                          , dataIndex: 'chngOcrTmstmp'
                          , editor: 'textfield'
                          , style: 'text-align:center'
                          , align: 'center'
                        }
                      , {
                            text: bxMsg('cbb_items.AT#aplctnNm')
                            , flex: 1
                            , dataIndex: 'aplctnId'
                            , style: 'text-align:center'
                            , align: 'left'
                            , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#srvcNm')
                          , flex: 1
                          , dataIndex: 'srvcNm'
                          , style: 'text-align:center'
                          , align: 'left'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#oprtnNm')
                          , flex: 1
                          , dataIndex: 'oprtnNm'
                          , style: 'text-align:center'
                          , align: 'left'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#errStopYn')
                          , flex: 1
                          , dataIndex: 'errStopYn'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                          , renderer: function (val)
                            {
                                var valYn = val=="Y"?val:"N";
                                var classNm = valYn=="Y"?"s-yes":"s-no";
                                return "<span class=\"bw-sign "+classNm+"\">"+valYn+"</span>";
                            }
                        }
                      , {
                            text: bxMsg('cbb_items.AT#errSkpYn')
                          , flex: 1
                          , dataIndex: 'errSkpYn'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                          , renderer: function (val)
                            {
                                var valYn = val=="Y"?val:"N";
                                var classNm = valYn=="Y"?"s-yes":"s-no";
                                return "<span class=\"bw-sign "+classNm+"\">"+valYn+"</span>";
                            }
                        }
                      , {
                            text: bxMsg('cbb_items.AT#nodeExctnYn')
                          , flex: 1
                          , dataIndex: 'nodeExctnYn'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                          , renderer: function (val)
                            {
                                var valYn = val=="Y"?val:"N";
                                var classNm = valYn=="Y"?"s-yes":"s-no";
                                return "<span class=\"bw-sign "+classNm+"\">"+valYn+"</span>";
                            }
                        }
                      , {
                            text: bxMsg('cbb_items.AT#startTpCd')
                          , flex: 1
                          , dataIndex: 'startTpCd'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#srvcPrcsngCd')
                          , flex: 1
                          , dataIndex: 'srvcPrcsngCd'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#dfrdTxCd')
                          , flex: 1
                          , dataIndex: 'dfrdTxCd'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#exctnCyclScnd')
                          , flex: 1
                          , dataIndex: 'exctnCyclScnd'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#dlyCyclScnd')
                          , flex: 1
                          , dataIndex: 'dlyCyclScnd'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#fetchCnt')
                          , flex: 1
                          , dataIndex: 'fetchCnt'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#prlExctnCnt')
                          , flex: 1
                          , dataIndex: 'prlExctnCnt'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#tgtTblNm')
                          , flex: 1
                          , dataIndex: 'trgtTblNm'
                          , style: 'text-align:center'
                          , align: 'left'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#dailyTblYn')
                          , flex: 1
                          , dataIndex: 'dailyTblYn'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                          , renderer: function (val)
                            {
                                var valYn = val=="Y"?val:"N";
                                var classNm = valYn=="Y"?"s-yes":"s-no";
                                return "<span class=\"bw-sign "+classNm+"\">"+valYn+"</span>";
                            }
                        }
                      , {
                            text: bxMsg('cbb_items.AT#trgtColumnNm')
                          , flex: 1
                          , dataIndex: 'trgtColumnNm'
                          , style: 'text-align:center'
                          , align: 'left'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#tblReaderBeanNm')
                          , flex: 1
                          , dataIndex: 'tblReaderBeanNm'
                          , style: 'text-align:center'
                          , align: 'left'
                          , hidden: true
                        }
                      , {
                            text: bxMsg('cbb_items.AT#tblNbrgUseYn')
                          , flex: 1
                          , dataIndex: 'tblNbrgUseYn'
                          , style: 'text-align:center'
                          , align: 'center'
                          , hidden: true
                          , renderer: function (val)
                            {
                                var valYn = val=="Y"?val:"N";
                                var classNm = valYn=="Y"?"s-yes":"s-no";
                                return "<span class=\"bw-sign "+classNm+"\">"+valYn+"</span>";
                            }
                        }
                      , {
                            text: bxMsg('cbb_items.AT#tblNbrgBeanNm')
                          , flex: 1
                          , dataIndex: 'tblNbrgBeanNm'
                          , style: 'text-align:center'
                          , align: 'left'
                          , hidden: true
                        }
                    ] // end of columns


                  // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                  , gridConfig: {} // end of gridConfig
                  , listeners:
                    {
                	    viewready: function(grid, eOpts)
                        {
                            grid.view.getEl().on('scroll', function(event, target)
                            {
                                var viewEndPosition = target.scrollHeight - target.offsetHeight;
                                if ((viewEndPosition > 0) && (viewEndPosition <= target.scrollTop))
                                {
                                   that.inquiryNext();
                                }
                            });
                        }
                      , dblclick: {
                            element: 'body'
                            , fn: function () {
                                //더블클릭시 이벤트 발생
                                that.doubleiClickGrid();
                            }
                        }
                    }
                });


                // 단일탭 그리드 렌더
                that.createGrid();
            } // end of initialize


            /**
             * render
             */
          , render: function ()
            {
                var that = this;
                return this.$el;
            } // end of render


            /**
              * resetSearchCondition
              */
          , resetSearchCondition: function ()
            {
                var that = this;


                that.CAPSV191Grid.resetData(); //그리드 데이터 리셋
                that.$('#CAPSV191-base-table [data-form-param="dfrdId"]').val("");
                that.$('#rsltCnt').html('0');
            }
          , toggleSearchCondition: function ()
            {
                fn_pageLayerCtrl(this.$el.find("#CAPSV191-base-table"), this.$el.find("#btn-search-condition-toggle"));
            }


            /**
             * inquiryDeferredJobList
             */
          , inquiryDeferredJobList: function ()
            {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('#CAPSV191-base-table'));
                that.pgNbr=1;
                that.inquiryDeferredJob(sParam);
            }


          	/**
          	 * Inquiry next page for deferred information
          	 */
          , inquiryNext:function()
	          {
	              var that = this;
	              if(that.CAPSV191Grid.store.data.length<that.totCnt)
	              {
	                  var sParam = bxUtil.makeParamFromForm($('#CAPSV191-base-table'));
	                  that.pgNbr++;
	                  that.inquiryDeferredJob(sParam);
	              }
	          }


            /**
             * inquiryDeferredJob
             */
          , inquiryDeferredJob: function (param)
            {
                // set the header
                var that = this;
                var sParam = param;
                sParam.pgNbr = that.pgNbr;
                sParam.pgCnt = that.pgCnt;
                sParam.totCntInqryYn = 'Y';
                var linkData = {
                    "header": fn_getHeader("PMT0438402")
                  , "DfrdMgmtSvcIn": sParam
                };


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var tbList = responseData.DfrdMgmtSvcListOut.dfrdMgmtSvcOutList;
                            that.totCnt = responseData.DfrdMgmtSvcListOut.totCnt;
                            if (that.totCnt > 0)
                            {
                                if(sParam.pgNbr == 1)
                                {
                                    that.CAPSV191Grid.setData(tbList);
                                    that.rsltCnt=tbList.length;
                                }
                                else
                                {
                                    that.CAPSV191Grid.addData(tbList);
                                    that.rsltCnt=that.rsltCnt+tbList.length;
                                }
                                that.$('#rsltCnt').html(that.rsltCnt);
                            }
                            else
                            {
                                that.$('#rsltCnt').html('0');
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end of inquiryDeferredJob


            /**
             * toggleSearchResult
             */
          , toggleSearchResult: function ()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPSV191Grid"), this.$el.find("#btn-search-result-toggle"));
            } // end of toggleSearchResult


            /**
             * createGrid
             */
          , createGrid: function ()
            {
                var that = this;
                this.$el.find(".CAPSV191Grid").html(this.CAPSV191Grid.render({'height': CgridHeight}));
            } // end of createGrid


            /**
             * doubleiClickGridRow
             */
          , doubleiClickGrid: function ()
            {
                var that = this;
                var selectedRecord = that.CAPSV191Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                    that.$el.trigger(
                    {
                        type: 'open-conts-page'
                      , pageHandler: 'CAPSV192'
                      , pageDPName: bxMsg('cbb_items.SCRN#CAPSV192')
                      , pageInitialize: true
                      , pageRenderInfo:
                        {
                            dfrdId: selectedRecord.data.dfrdId
                          , txCd: selectedRecord.data.txCd
                          , dfrdNm: selectedRecord.data.dfrdNm
                          , aplctnId: selectedRecord.data.aplctnId
                          , srvcNm: selectedRecord.data.srvcNm
                          , oprtnNm: selectedRecord.data.oprtnNm
                          , useYn: selectedRecord.data.useYn
                          , errorStopYn: selectedRecord.data.errStopYn
                          , errorSkpYn: selectedRecord.data.errSkpYn
                          , nodeExctnYn: selectedRecord.data.nodeExctnYn
                          , startTpCd: selectedRecord.data.startTpCd
                          , srvcPrcsngCd: selectedRecord.data.srvcPrcsngCd
                          , dfrdTxCd: selectedRecord.data.dfrdTxCd
                          , exctnCyclSecond: selectedRecord.data.exctnCyclScnd
                          , dlyCyclSecond: selectedRecord.data.dlyCyclScnd
                          , fetchCnt: selectedRecord.data.fetchCnt
                          , prlExctnCnt: selectedRecord.data.prlExctnCnt
                          , trgtTblNm: selectedRecord.data.trgtTblNm
                          , dailyTblYn: selectedRecord.data.dailyTblYn
                          , trgtColumnNm: selectedRecord.data.trgtColumnNm
                          , tblReaderBeanNm: selectedRecord.data.tblReaderBeanNm
                          , tblNbrgUseYn: selectedRecord.data.tblNbrgUseYn
                          , tblNbrgBeanNm: selectedRecord.data.tblNbrgBeanNm
                        }
                    });
                }
            }


            /**
             * addDeferredJob
             */
          , addDeferredJob: function ()
           {
                var that = this;


                that.$el.trigger({
                    type: 'open-conts-page'
                  , pageHandler: 'CAPSV192'
                  , pageDPName: bxMsg('cbb_items.SCRN#CAPSV192')
                  , pageInitialize: true
                  , pageRenderInfo: {}
                });
            } // end of addDeferredJob
        })
        ; // end of Backbone.View.extend({


        return CAPSV191View;
      } // end of define function
)
; // end of define
