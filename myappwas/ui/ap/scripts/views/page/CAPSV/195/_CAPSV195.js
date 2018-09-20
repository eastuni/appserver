/*
@Screen number  CAPSV195
@brief          후행실행상세내역
@author         sungwon.kim
@history        2016.09.21  변환
*/
define(
    [
        'bx/common/config'
      , 'text!app/views/page/CAPSV/195/_CAPSV195.html'
      , 'bx/common/common-info'
    ]
    , function
      (
        config
      , tpl
      , commonInfo
      )
      {
        /**
         * Backbone
         */
        var CAPSV195View = Backbone.View.extend(
        {
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
          , className: 'bx-container CAPSV195-page'
            // 탬플릿 설정
          , templates: {'tpl': tpl}
            // 이벤트 설정
          , events:
            {
                'click #btn-base-toggle': 'toggleBase'
              , 'change .CAPSV195-detail-area [data-form-param="bizDt"]':'dateFormatter'
              , 'change .CAPSV195-detail-area [data-form-param="startTmstmp"]':'dateFormatter'
            }


            /**
             * initialize
             */
          , initialize: function (initData)
            {
                var that = this;


                $.extend(that, initData);
                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);
                that.$el.html(that.tpl());
            }


            /**
             * render
             */
          , render: function ()
            {
                var that = this;


                // combobox initailize
                fn_getCodeList({cdNbr:"A0610", nullYn:"Y", disabled:true, className:"CAPSV195-dfrdExctnPrcsngCd-wrap"  }, this);
                fn_getCodeList({cdNbr:"A0611", nullYn:"Y", disabled:true, className:"CAPSV195-dfrdExctnStsCd-wrap"}, this);


                if(that.param)
                {
                    var sParam = {};


                    sParam.dfrdId=that.param.dfrdId;
                    sParam.nodeNbr=that.param.nodeNbr;
                    sParam.bizDt=that.param.bizDt;
                    sParam.prlPrcsngSeqNbr=that.param.prlPrcsngSeqNbr;
                    sParam.dfrdExctnPrcsngCd=that.param.dfrdExctnPrcsngCd;


                    that.inquiryBaseData(sParam);
                }else{
                    this.initCAPSV195DefaultData(this, "", "X");
                }


                return this.$el;
            }


            /**
             * initCAPSV195DefaultData
             */
          , initCAPSV195DefaultData: function (that, detail, type)
            {
                that=this;
                var dataKey='data-form-param', dataFormParams, dataFormParam, isClear;


                // data-form-param attribute select
                dataFormParams = that.$('.CAPSV195-detail-area ['+dataKey+']');


                isClear = type == "X";


                for(i = 0; i < dataFormParams.length; i++ )
                {
                    if (isClear)
                    {
                        $(dataFormParams[i]).val('');
                    }
                    else
                    {
                        dataFormParam = $(dataFormParams[i]).attr(dataKey);


                        if (detail.hasOwnProperty(dataFormParam))
                        {
                            $(dataFormParams[i]).val(detail[dataFormParam]).trigger('change');
                        }
                    }
                }
            }


            /**
             * 기본부 조회 버튼 클릭
             */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPSV195-detail-area'));
                that.inquiryBaseData(sParam);
            }
            /**
             * 기본부 정보로 그리드 조회
             */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;
                //sParam.seqNbr=0;
                //입출력구분이랑 guid,거래년월일 파라미터 3개로 서비스 호출.
                var linkData = {"header": fn_getHeader("PMT0418401"), "DfrdExctnMgmtSvcIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var detail = responseData.DfrdExctnMgmtSvcOut;
                            if (detail != null) {
                                that.initCAPSV195DefaultData(this, detail, "");
                            }else{
                                that.initCAPSV195DefaultData(this, "", "X");
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


          , toggleBase: function ()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPSV195-detail-area"), this.$el.find("#btn-base-toggle"));
            }
          , dateFormatter: function(e)
            {
                var val = $(e.currentTarget).val(), vDate, vTime;
                switch(val.length)
                {
                    case 8:
                        vDate = val;
                        val = vDate;
                        break;
                    case 14:
                        vDate = val.substr(0,8);
                        vTime = val.substr(8,6);
                        val = vDate+' '+vTime;
                        break;
                    default:
                        break;
                }
                $(e.currentTarget).val(val);
            }
        }); // end of Backbone.View.extend({


        return CAPSV195View;
    } // end of define function
); // end of define
