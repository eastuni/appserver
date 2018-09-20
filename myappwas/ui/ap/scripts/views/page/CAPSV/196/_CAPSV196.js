define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPSV/196/_CAPSV196.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/time-picker/_time-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/message/message-alert'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , DatePicker
        , TimePicker
        , ExtGrid
        , alertMessage
        , commonInfo) {


        /**
		 * Backbone
		 */
    	var rsltCnt = 0;
        var CAPSV196View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPSV196-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }


            // 이벤트 설정
            , events: {
                  'click #btn-base-reset': 'resetBase'
                , 'click #btn-search': 'query'
                , 'click #btn-up-base' : 'toggleBase'
                , 'click #btn-up-grid' : 'toggleGrid'
            }


            /**
			 * initialize
			 */
            , initialize: function (initData) {
                var that = this;
                that.pgNbr = 1;
                that.pgCnt = 20;


                $.extend(that, initData);
                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);
                that.$el.html(that.tpl());


                var sParam1 = {};
                sParam1.cdNbr = "A0612"; // 채널코드


                bxProxy.all([{// 컴포넌트코드 로딩
		                url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam1}), success: function (responseData) {
		                    if (fn_commonChekResult(responseData)) {
		                    	comboCAPSV196 = new Ext.data.Store({
		                            fields: ['cd', 'cdNm'],
		                            data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
		                        });
		                    }
		                }
		            }]
                     ,{
                        success: function () {
                            that.CAPSV196Grid = new ExtGrid({
                                // 그리드 컬럼 정의
                                fields: ['dfrdId', 'dfrdNm', 'nodeNbr', 'bizDt', 'errSeqNbr', 'errPrcsngStsCd', 'errorPrcsNbrngTpCd', 'startSeqNbr',
                                         'endSeqNbr', 'errRgstrnTmstmp', 'prcsngEndTmstmp', 'errCd', 'errMsgCntnt', 'errGuid']
                                , id: 'CAPSV196Grid'
                                , columns: [{
                                    text: 'No'
                                    , dataIndex: 'rowIndex'
                                    , sortable: false
                                    , height: 25
                                    , flex: 2
                                    , style: 'text-align:center'
                                    , align: 'center'
                                    // other config you need....
                                    , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                        return rowIndex + 1;
                                        }
                                    }, {
                                    	text: bxMsg('cbb_items.AT#dfrdId')
                                    	, flex: 4
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
                                        text: bxMsg('cbb_items.AT#nodeNbr')
                                        , flex: 4
                                        , dataIndex: 'nodeNbr'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                    }
                                    ,  {
                                        text: bxMsg('cbb_items.AT#bizDt')
                                        , flex: 4
                                        , dataIndex: 'bizDt'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                   		, renderer: function (val) {
                                   			return that.convertDttmFormat(val);
		                            	}
                                    }
                                    ,{
                                        text: bxMsg('cbb_items.AT#errSeqNbr')
                                        , flex: 5
                                        , dataIndex: 'errSeqNbr'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    ,{
                                        text: bxMsg('cbb_items.AT#errPrcsngStsCd')
                                        , flex: 5
                                        , dataIndex: 'errPrcsngStsCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    	, renderer: function (val) {
                                        	index = comboCAPSV196.findExact('cd', val);
                                        	if (index != -1) {
                                        		rs = comboCAPSV196.getAt(index).data;
                                                return rs.cdNm;
                                            }
                                        }
                                    }
                                    ,{
                                        text: bxMsg('cbb_items.AT#errRgstrnTmstmp')
                                        , flex: 6
                                        , dataIndex: 'errRgstrnTmstmp'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    	, renderer: function (val) {
                                    		return that.convertDttmFormat(val);
		                            	}
                                    }
                                    ,{
                                        text: bxMsg('cbb_items.AT#prcsngEndTmstmp')
                                        , flex: 6
                                        , dataIndex: 'prcsngEndTmstmp'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    	, renderer: function (val) {
                                            return that.convertDttmFormat(val);
		                            	}
                                    }
                                    ,{
                                        text: bxMsg('cbb_items.AT#errGuid')
                                        , flex: 4
                                        , dataIndex: 'errGuid'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , hidden: true
                                    }
                                    ,{
                                        text: bxMsg('cbb_items.AT#errCd')
                                        , flex: 4
                                        , dataIndex: 'errCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , hidden: true
                                    }
                                    ,{
                                        text: bxMsg('cbb_items.AT#errPrcsngTpCd')
                                        , flex: 4
                                        , dataIndex: 'errPrcsngTpCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , hidden: true
                                    }
                                    ,{
                                        text: bxMsg('cbb_items.AT#startSeqNbr')
                                        , flex: 4
                                        , dataIndex: 'startSeqNbr'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , hidden: true
                                    }
                                ] // end of columns


                                , listeners: {
                                	viewready: function(grid, eOpts){
                                        grid.view.getEl().on( 'scroll', function(event, target) {
                                            var viewEndPosition = target.scrollHeight - target.offsetHeight;


                                            if ((viewEndPosition > 0) && (viewEndPosition <= target.scrollTop)){
                                               that.queryNext();
                                            }
                                        });
                                	},
                                    dblclick: {
                                        element: 'body'
                                        , fn: function () {
                                            // 더블클릭시 이벤트 발생
                                            that.doubleiClickGrid();
                                        }
                                    }
                                }
                            });


                            // 단일탭 그리드 렌더
                            that.createGrid();
                        } // end of success:.function
                    }); // end of bxProxy.all
            }


            /**
			 * render
			 */
            , render: function () {
                var that = this;


                // 데이터 피커 로드
                //this.loadDatePicker();
                fn_makeDatePicker(this.$el.find('[data-form-param="bizDt"]'));


                this.setBaseData(this, "", "X");


                return this.$el;
            }


            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {
                	that.$el.find('[data-form-param="bizDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));


//                	var baseCmnClndr = this.subViews['CAPSV196-baseClndr'].getValue();
//                	if (baseCmnClndr == null || baseCmnClndr == "") {
//                        this.subViews['CAPSV196-baseClndr'].setValue(getCurrentDate("yyyy-mm-dd"));
//                    }


                    that.$el.find('.CAPSV196-base-table [data-form-param="deferredId"]').val("");
/*                    that.$el.find('.CAPSV196-base-table [data-form-param="srvcCd"]').val("");
                    that.$el.find('.CAPSV196-base-table [data-form-param="chnlCd"]').val("");
*/
                }
            }


            /**
			 * 기본부 리셋
			 */
            , resetBase: function () {
                var that = this;


                //var baseClndr = this.subViews['CAPSV196-baseClndr'].getValue();
            	//if (baseClndr == null || baseClndr == "") {
            	//	this.subViews['CAPSV196-baseClndr'].setValue(getCurrentDate("yyyy-mm-dd"));
               // }


                that.$el.find('#rsltCnt').html(0);
            	that.$el.find('[data-form-param="bizDt"]').val(XDate($.sessionStorage('txDt')).toString('yyyy-MM-dd'));


                that.$el.find('.CAPSV196-base-table [data-form-param="deferredId"]').val("");
/*                that.$el.find('.CAPSV196-base-table [data-form-param="srvcCd"]').val("");
                that.$el.find('.CAPSV196-base-table [data-form-param="chnlCd"]').val("");*/


                that.CAPSV196Grid.resetData();
            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPSV196-base-table'));
                that.pgNbr=1;
                that.inquiryBaseData(sParam);
            }


            /**
             * 다음 조회
             */
            , queryNext: function () {
                var that = this;
                if(!that.morePage){
                	return;
                }
                var sParam = bxUtil.makeParamFromForm($('.CAPSV196-base-table'));
                that.pgNbr++;


                that.inquiryBaseData(sParam);
            }


            /**
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;


               sParam.bizDt = sParam.bizDt.replace(/-/gi,"");
               sParam.pgNbr = that.pgNbr;
               sParam.pgCnt = that.pgCnt;


                var linkData = {"header": fn_getHeader("PMT0408402"), "DfrdErrorLogSvcIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var tbList = responseData.DfrdErrorLogSvcListOut.dfrdErrorLogSvcOutList;


                            if (tbList != null || tbList.length > 0) {
                            	if (sParam.pgNbr == 1) {
                                    // 조회
                                    that.CAPSV196Grid.setData(tbList);
                                    that.$el.find('#rsltCnt').html(tbList.length);
                                    that.rsltCnt = tbList.length;
                                } else {
                                    // 다음 조회
                                    that.CAPSV196Grid.addData(tbList);


                                    that.rsltCnt = that.rsltCnt + tbList.length;
                                    that.$el.find('#rsltCnt').html(that.rsltCnt);
                                }
                                if(tbList.length < that.pgCnt){
                                	that.morePage = false;
                                	that.$el.find('#rsltCnt').html(that.rsltCnt);
                                }else{
                                	that.morePage = true;
                                }
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end
            /**
			 * 데이터 피커 로드 컴포넌트 데이터 피커를 사용
			 */
//            , loadDatePicker: function () {
//            	this.subViews['CAPSV196-baseClndr'] && this.subViews['CAPSV196-baseClndr'].remove();
//                this.subViews['CAPSV196-baseClndr'] = new DatePicker({
//                    inputAttrs: {'data-form-param': 'bizDt'},
//                    setTime: false
//                });
//                this.$el.find('.CAPSV196-base-bizDt-wrap').html(this.subViews['CAPSV196-baseClndr'].render());
//
//            }


            /**
			 * 그리드 생성
			 */
            , createGrid: function () {
                var that = this;


                this.$el.find("#CAPSV196-grid").html(this.CAPSV196Grid.render({'height': '450px'}));
            } // end of createGrid


            /**
			 * 그리드 행 더블클릭
			 */
            , doubleiClickGrid: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPSV196-base-table'));
                var selectedRecord = that.CAPSV196Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                	that.$el.trigger({
                        type: 'open-conts-page'
                    , pageHandler: 'CAPSV197'
                    , pageDPName: bxMsg('cbb_items.SCRN#CAPSV197')
                    , pageInitialize: true
                    , pageRenderInfo: {
                    	dfrdId: selectedRecord.data.dfrdId
                      , nodeNbr: selectedRecord.data.nodeNbr
                      , bizDt : selectedRecord.data.bizDt
                      , errorSeqNbr: selectedRecord.data.errSeqNbr
                    	}
                    });
                }


            }


            , toggleBase: function () {
                fn_pageLayerCtrl(this.$el.find("#CAPSV196-base-table"),this.$el.find('#btn-up-base'));
            }


            , toggleGrid: function () {
                fn_pageLayerCtrl(this.$el.find("#CAPSV196-grid"),this.$el.find('#btn-up-grid'));
            }
            , convertDttmFormat:function(val) {
            	var dttm=val;
                if(dttm){
	                if(dttm.length == 14){
	                	vDate = val.substr(0,8);
	                	vTime = val.substr(8,6);
	                	dttm = vDate + ' ' + vTime;
	                }else if(dttm.length == 8){
	                	dttm = val;
	                }
                }
                return dttm;
            }


        }); // end of Backbone.View.extend({




        return CAPSV196View;
    } // end of define function
); // end of define
