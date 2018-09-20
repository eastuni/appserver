/*
@Screen number  CAPSV194
@brief          후행실행
@author         sungwon.kim
@history        2016.09.21  변환
*/
define(
    [
        'bx/common/config'
      , 'text!app/views/page/CAPSV/194/_CAPSV194.html'
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
        var CAPSV194View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
          , className: 'bx-container CAPSV194-page'
            // 탬플릿 설정
          , templates: {'tpl': tpl}
            // 이벤트 설정
          , events:
            {
                'click #btn-search-condition-reset'  : 'resetSearchCondition'
              , 'click #btn-search-condition-inquiry': 'inquiry'
              , 'click #btn-search-condition-toggle' : 'toggleSearchCondition'
              , 'click #btn-search-result-toggle'    : 'toggleSearchResult'
            }


            /**
             * initialize
             */
          , initialize: function (initData)
            {
                var that=this;
                that.pgNbr = 1;
                that.pgCnt = 20;


                $.extend(that, initData);
                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);
                that.$el.html(that.tpl());


                that.codeList = {};


                // corrent grid stylesheet
                this.cssCorrect();


                bxProxy.all([
                    {
                        url: sUrl
                      , param: JSON.stringify({"header":fn_getHeader("CAPCM0038400"),"CaCmnCdSvcGetCdListByCdNbrIn":{cdNbr:"A0610"}})
                      , success: function(responseData)
                        {
                            if (fn_commonChekResult(responseData))
                            {
                                that.codeList['A0610'] = new Ext.data.Store(
                                {
                                    fields: ['cd', 'cdNm']
                                  , data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
                  , {
                        url: sUrl
                      , param: JSON.stringify({"header":fn_getHeader("CAPCM0038400"),"CaCmnCdSvcGetCdListByCdNbrIn":{cdNbr:"A0611"}})
                      , success: function(responseData)
                        {
                            if (fn_commonChekResult(responseData))
                            {
                                that.codeList['A0611'] = new Ext.data.Store(
                                {
                                    fields: ['cd', 'cdNm']
                                  , data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
                ]
              , {
                    success: function()
                    {
                        that.CAPSV194Grid = new ExtGrid(
                        {
                            // 그리드 컬럼 정의
                            fields: ['dfrdId', 'dfrdNm', 'bizDt', 'nodeNbr', 'prlPrcsngSeqNbr', 'dfrdExctnPrcsngCd', 'dfrdExctnStsCd',
                                     'currentSeqNbr', 'startTmstmp', 'errCd']
                          , id: 'CAPSV194Grid'
                          , columns:
                            [
                                {
                                    text: 'No'
                                  , dataIndex: 'rowIndex'
                                  , sortable: false
                                  , height: 25
                                  , flex: 2
                                  , style: 'text-align:center'
                                  , align: 'center'
                                    // other config you need....
                                  , renderer: function (value, metaData, record, rowIndex, colIndex, sotre)
                                    {
                                        return rowIndex + 1;
                                    }
                                }
                              , {
                                    text: bxMsg('cbb_items.AT#dfrdId')
                                  , flex: 5
                                  , dataIndex: 'dfrdId'
                                  , style: 'text-align:center'
                                  , align: 'left'
                                }
                              , {
                                    text: bxMsg('cbb_items.AT#dfrdNm')
                                  , flex: 8
                                  , dataIndex: 'dfrdNm'
                                  , style: 'text-align:center'
                                  , align: 'left'
                                }
                              , {
                                    text: bxMsg('cbb_items.AT#bizDt')
                                  , flex: 7
                                  , dataIndex: 'bizDt'
                                  , style: 'text-align:center'
                                  , align: 'center'
                                  , renderer: function(val)
                                    {
                                        return val;
                                    }
                                }
                              , {
                                    text: bxMsg('cbb_items.AT#nodeNbr')
                                  , flex: 5
                                  , dataIndex: 'nodeNbr'
                                  , style: 'text-align:center'
                                  , align: 'center'
                                }
                              , {
                                    text: bxMsg('cbb_items.AT#prlPrcsngSeqNbr')
                                  , flex: 6
                                  , dataIndex: 'prlPrcsngSeqNbr'
                                  , style: 'text-align:center'
                                  , align: 'center'
                                }
                              , {
                                    text: bxMsg('cbb_items.AT#dfrdExctnPrcsngCd')
                                  , flex: 4
                                  , dataIndex: 'dfrdExctnPrcsngCd'
                                  , style: 'text-align:center'
                                  , align: 'center'
                                  , renderer: function(val)
                                    {
                                        var index = that.codeList['A0610'].findExact('cd', val);
                                        if (index != -1)
                                        {
                                            var rs = that.codeList['A0610'].getAt(index).data;
                                            return rs.cdNm;
                                        }
                                    }
                                }
                              , {
                                    text: bxMsg('cbb_items.AT#dfrdExctnStsCd')
                                  , flex: 4
                                  , dataIndex: 'dfrdExctnStsCd'
                                  , style: 'text-align:center'
                                  , align: 'center'
                                  , renderer: function(val)
                                    {
                                        var index = that.codeList['A0611'].findExact('cd', val);
                                        if (index != -1)
                                        {
                                            var rs = that.codeList['A0611'].getAt(index).data;
                                            return rs.cdNm;
                                        }
                                    }
                                }
                              , {
                                    text: bxMsg('cbb_items.AT#currentSeqNbr')
                                  , flex: 4
                                  , dataIndex: 'currentSeqNbr'
                                  , style: 'text-align:center'
                                  , align: 'center'
                                }
                              , {
                                    text: bxMsg('cbb_items.AT#startTmstmp')
                                  , flex: 6
                                  , dataIndex: 'startTmstmp'
                                  , style: 'text-align:center'
                                  , align: 'center'
                                  , renderer: function(val)
                                    {
                                        var vDate, vTime;
                                        vDate = val.substr(0,8);
                                        vTime = val.substr(8,6);
                                        return vDate+' '+vTime;
                                    }
                                }
                              , {
                                    text: bxMsg('cbb_items.AT#errCd')
                                  , flex: 4
                                  , dataIndex: 'errCd'
                                  , style: 'text-align:center'
                                  , align: 'center'
                                }
                            ] // end of columns


                          , listeners:
                            {
                                viewready: function(grid, eOpts)
                                {
                                    grid.view.getEl().on( 'scroll', function(event, target)
                                    {
                                        var viewEndPosition = target.scrollHeight - target.offsetHeight;
                                        if ((viewEndPosition > 0) && (viewEndPosition <= target.scrollTop))
                                        {
                                           that.inquiryNext();
                                        }
                                    });
                                }
                              , dblclick:
                                {
                                    element: 'body'
                                    , fn: function () {
                                        that.doubleiClickGrid();
                                    }
                                }
                            }
                        });


                        // single grid render
                        that.createGrid();
                    }
                });
            }


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
                that = this;
                that.$('#CAPSV194-base-table [data-form-param="dfrdId"]').val("");
                that.$('#CAPSV194-base-table [data-form-param="nodeNbr"]').val("");
                this.CAPSV194Grid.resetData();
                that.$('#rsltCnt').html('0');
            }


          , toggleSearchCondition: function ()
            {
                fn_pageLayerCtrl(this.$el.find("#CAPSV194-base-table"), this.$el.find("#btn-search-condition-toggle"));
            }


            /**
             * Inquiry Deferred execution history
             */
          , inquiry: function ()
            {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('#CAPSV194-base-table'));
                that.pgNbr=1;
                that.inquiryBaseData(sParam);
            }


            /**
             * Inquiry next page for deferred exectuion history
             */
          , inquiryNext:function()
            {
                var that = this;
                if(that.CAPSV194Grid.store.data.length<that.totCnt)
                {
                    var sParam = bxUtil.makeParamFromForm($('#CAPSV194-base-table'));
                    that.pgNbr++;
                    that.inquiryBaseData(sParam);
                }
            }


            /**
             * inquiryBaseData
             */
          , inquiryBaseData: function (param)
            {
                // header 정보 set
                var that = this;
                var sParam = param;
                sParam.pgNbr = that.pgNbr;
                sParam.pgCnt = that.pgCnt;
                sParam.totCntInqryYn = 'Y';


                var linkData = {"header": fn_getHeader("PMT0418402"), "DfrdExctnMgmtSvcIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var tbList = responseData.DfrdExctnMgmtSvcListOut.dfrdExctnMgmtSvcOutList;
                            that.totCnt = responseData.DfrdExctnMgmtSvcListOut.totCnt;
                            if (that.totCnt > 0)
                            {
                                if(sParam.pgNbr == 1)
                                {
                                    that.CAPSV194Grid.setData(tbList);
                                    that.rsltCnt=tbList.length;
                                }
                                else
                                {
                                    that.CAPSV194Grid.addData(tbList);
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
            } // end


            /**
             * toggleSearchResult
             */
          , toggleSearchResult: function ()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPSV194Grid"), this.$el.find("#btn-search-result-toggle"));
            } // end of toggleSearchResult


            /**
             * createGrid
             */
          , createGrid: function ()
            {
                this.$(".CAPSV194Grid").html(this.CAPSV194Grid.render({'height': CgridHeight}));
            } // end of createGrid


            /**
             * doubleiClickGrid
             */
          , doubleiClickGrid: function ()
            {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPSV194-base-table'));
                var selectedRecord = that.CAPSV194Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                    that.$el.trigger(
                    {
                        type: 'open-conts-page'
                      , pageHandler: 'CAPSV195'
                      , pageDPName: bxMsg('cbb_items.SCRN#CAPSV195')
                      , pageInitialize: true
                      , pageRenderInfo:
                        {
                            dfrdId: selectedRecord.data.dfrdId
                          , nodeNbr: selectedRecord.data.nodeNbr
                          , bizDt: selectedRecord.data.bizDt
                          , prlPrcsngSeqNbr: selectedRecord.data.prlPrcsngSeqNbr
                          , dfrdExctnPrcsngCd: selectedRecord.data.dfrdExctnPrcsngCd
                        }
                    });
                }
            }
          , cssCorrect: function ()
            {
                // Incorrect style sheet for grid modifying correct, such as .x-grid-header-ct or .x-box-inner height attributes in stylesheet class
                var _styleSheets = document.styleSheets, _cssRules=[], _selector=['.x-grid-header-ct','.x-box-inner'], _removeText=[''], _href, _i;
                for(_i = 0; _i < _styleSheets.length; _i++)
                {
                    _href = _styleSheets[_i].href;
                    if ( !fn_isEmpty(_href) && _href.indexOf('workspace-style.css') > 0 )
                    {
                        _cssRules = _styleSheets[_i].cssRules;
                        break;
                    }
                }
                for(_i = 0; _i < _cssRules.length; _i++)
                {
                    if (_cssRules[_i] instanceof CSSStyleRule)
                    {
                        for(var _x=0; _x<_selector.length; _x++)
                        {
                            if ( _cssRules[_i].selectorText == _selector[_x] )
                            {
                                _cssRules[_i].style.height="";
                            }
                        }
                    }
                }
            }
        }); // end of Backbone.View.extend({




        return CAPSV194View;
      } // end of define function
); // end of define
