/*
@Screen number  CAPSV192
@brief          후행관리상세/추가
@author         sungwon.kim
@history        2016.09.21  UI전환
*/
define(
    [
        'bx/common/config'
      , 'text!app/views/page/CAPSV/192/_CAPSV192.html'
      , 'bx/common/common-info'
    ]
    , function
      (
        config
      , tpl
      , commonInfo
      )
      {


        // global variable in this page
        var saveState;


        /**
         * Backbone
         */
        var CAPSV192View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
          , className: 'bx-container CAPSV192-page'
            // 탬플릿 설정
          , templates: {'tpl': tpl}
            // 이벤트 설정
          , events:
            {
                'click #btn-base-reset' : 'resetBaseArea'
              , 'click #btn-base-save'  : 'saveDeferredMainInfo'
              , 'click #btn-base-delete': 'deleteDeferredMainInfo'
              , 'click #btn-base-toggle': 'toggleBase'
            }
          , initialize: function (initParam)
            {
                var that = this;


                $.extend(that, initParam);


                that.$el.html(that.tpl());
                that.$el.attr('data-page', that.pageHandler);


                if (that.param.dfrdId != undefined) { //후행ID 유무에 따라서 saveState 설정
                  this.initCAPSV192DefaultData(this, "", "S");
                } else {
                  this.initCAPSV192DefaultData(this, "", "I");
                }


            }
          , render: function ()
            {
                var that = this;


                // combobox initailize
                fn_getCodeList({cdNbr:"A0601", nullYn:"Y", className:"CAPSV192-useYn-wrap"          , selectVal:that.param.useYn         }, this);
                fn_getCodeList({cdNbr:"A0602", nullYn:"Y", className:"CAPSV192-errorStopYn-wrap"    , selectVal:that.param.errStopYn   }, this);
                fn_getCodeList({cdNbr:"A0603", nullYn:"Y", className:"CAPSV192-errorSkpYn-wrap"     , selectVal:that.param.errSkpYn    }, this);
                fn_getCodeList({cdNbr:"A0604", nullYn:"Y", className:"CAPSV192-nodeExctnYn-wrap"    , selectVal:that.param.nodeExctnYn   }, this);
                fn_getCodeList({cdNbr:"A0605", nullYn:"Y", className:"CAPSV192-startTpCd-wrap"      , selectVal:that.param.startTpCd     }, this);
                fn_getCodeList({cdNbr:"A0606", nullYn:"Y", className:"CAPSV192-srvcPrcsngCd-wrap"   , selectVal:that.param.srvcPrcsngCd  }, this);
                fn_getCodeList({cdNbr:"A0607", nullYn:"Y", className:"CAPSV192-dfrdTxCd-wrap"       , selectVal:that.param.dfrdTxCd      }, this);
                fn_getCodeList({cdNbr:"A0608", nullYn:"Y", className:"CAPSV192-tblNbrgUseYn-wrap"   , selectVal:that.param.tblNbrgUseYn  }, this);
                fn_getCodeList({cdNbr:"A0614", nullYn:"Y", className:"CAPSV192-dailyTblYn-wrap"     , selectVal:that.param.dailyTblYn    }, this);


                return this.$el;
            }


            /**
             * 기본부 초기화
             */
          , initCAPSV192DefaultData: function (that, responseData, type)
            {
                var that=this, dataKey='data-form-param', dataFormParams, dataFormParam, isClear;


                // data-form-param attribute select
                dataFormParams = that.$('.CAPSV192-base-table ['+dataKey+']');


                if ( type == "I" || (type == "S") )
                {
                    isClear = type == "I";
                    saveState = isClear?'insert':'update';


                    for(i = 0; i < dataFormParams.length; i++ )
                    {
                        if (isClear)
                        {
                            $(dataFormParams[i]).val('');
                        }
                        else
                        {
                            dataFormParam = $(dataFormParams[i]).attr(dataKey);


                            if (that.param.hasOwnProperty(dataFormParam))
                            {
                                $(dataFormParams[i]).val(that.param[dataFormParam]);
                            }
                        }
                    }


                    if(!isClear)
                    {
                        that.$el.find('.CAPSV192-base-table [data-form-param="dfrdId"]').prop('readonly', true);
                    }
                }
            }
            /**
             * 화면 정보 저장
             */
          , saveDeferredMainInfo: function (event)
            {
                var that=this, sParam={}, dfrdMgmtSvcIO=[], item, dataKey='data-form-param', mandatoryKey='.asterisk'
                    , linkData, saveData, dataFormParams, dataFormParam, i;


                // data-form-param attribute select
                sParam.dfrdMgmtSvcIO = dfrdMgmtSvcIO;
                dataFormParams = that.$('.CAPSV192-base-table ['+dataKey+']');


                item={};
                for(i = 0; i < dataFormParams.length; i++ )
                {
                    dataFormParam = $(dataFormParams[i]).attr(dataKey);
                    // create sParam field and copy a data-form-param value
                    item[dataFormParam] = $(dataFormParams[i]).val();


                    // mandatory field check
                    if ( $(dataFormParams[i]).parent().is(mandatoryKey) && fn_isEmpty(item[dataFormParam]) )
                    {
                        $(dataFormParams[i]).focus();
                        fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                        return false;
                    }
                }


                item.chngUserId = commonInfo.getUserInfo().loinIdNbr;
                //sParam.orgCd = "998";
                if(commonInfo.getInstInfo().instCd) {
                	item.instCd = commonInfo.getInstInfo().instCd;
                }
                else {
                	item.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                }


                dfrdMgmtSvcIO.push(item);


                saveData = function ()
                {
                    // call the insert or update service by saveState conditions
                    if (saveState == 'update')
                    {
                        linkData = {"header":fn_getHeader("PMT0438201"), "DfrdMgmtSvcIn":sParam};
                    }
                    else
                    {
                        linkData = {"header":fn_getHeader("PMT0438101"), "DfrdMgmtSvcIn":sParam};
                    }


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData),
                    {
                        enableLoading: true
                      , success: function (responseData)
                        {
                            if (fn_commonChekResult(responseData))
                            {
                                fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
                                // Change the saveState value at the time of insert or update transaction success
                                saveState = 'update';
                                that.$el.find('.CAPSV192-base-table [data-form-param="dfrdId"]').prop('readonly', true);
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                };


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            }


            /**
             * 화면 정보 삭제
             */
          , deleteDeferredMainInfo: function ()
            {
                var that = this;
                var dfrdMgmtSvcIO=[];
                var item={};


                item.dfrdId = that.$el.find('.CAPSV192-base-table [data-form-param="dfrdId"]').val();
                dfrdMgmtSvcIO.push(item);
                sParam.dfrdMgmtSvcIO = dfrdMgmtSvcIO;


                if (fn_isEmpty(item.dfrdId))
                {
                    fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                    return;
                }


                var deleteData = function (that)
                {
                    var sParam = {};
                    sParam.dfrdMgmtSvcIO = dfrdMgmtSvcIO;
                    var linkData = {"header":fn_getHeader("PMT0438301"), "DfrdMgmtSvcIn":sParam};


                    // send post
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));


                                that.resetBaseArea();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#del'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);




            }


            /**
             * input data reset
             */
          , resetBaseArea: function ()
            {
                var that=this, dataKey='data-form-param', dataFormParams;


                // data-form-param attribute select
                dataFormParams = that.$('.CAPSV192-base-table ['+dataKey+']');


                for(i = 0; i < dataFormParams.length; i++ )
                {
                    // data-form-param clear
                    $(dataFormParams[i]).val('');
                }


                that.$('.CAPSV192-base-table [data-form-param="dfrdId"]').prop('readonly', false);


                saveState = 'insert';
            }
          , toggleBase: function ()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPSV192-base-table"), this.$el.find("#btn-base-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPSV192View;
    } // end of define function
); // end of define
