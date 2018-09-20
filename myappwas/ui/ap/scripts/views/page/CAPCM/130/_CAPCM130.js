define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/130/_CAPCM130.html',
        'bx-component/ext-grid/_ext-grid'
    ]
    , function (
        config,
        tpl,
        ExtGrid


    ) {
        /**
         * Backbone
         */
        var CAPCM130View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPCM130-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'click #btn-search-result-save' : 'deleteCurrencyCodeList',
                'click #btn-base-attribute-save': 'saveBaseAttribute',


                'click #btn-search-condition-inquire': 'inquireCurrencyCodeList',


                'click #btn-base-attribute-reset'   : 'resetBaseAttribute',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-search-result-toggle'   : 'toggleSearchResult',
                'click #btn-base-attribute-toggle'  : 'toggleBaseAttribute',


                'change .CAPCM130-hndrdUnitCrncyYn-wrap' : 'changeHndrdUnitCrncyYn'
            }


            /**
             * initialize
             */
            , initialize: function (initData) {
                this.deleteList = [];


                $.extend(this, initData);
                this.initFlag = true;


                this.createGrid();
            },


            /**
             * render
             */
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find("#CAPCM130Grid").html(this.CAPCM130Grid.render({'height': CaGridHeight}));


                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM130-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPCM130-wrap #btn-base-attribute-save')
                                    			   ]);
                return this.$el;
            },


            createGrid: function () {
                var that = this;


                that.CAPCM130Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'crncyCd', 'crncyCdKorNm', 'crncyCdEngNm', 'crncyNbrCd' ,'isoNatCd' ,'ancmntCrncyDscd'
                             ,'stdCourierPostalDayCnt' ,'yrDayCnt' , 'exRtAncmntTrgtYn' ,'hndrdUnitCrncyYn' ,'euroCrncyUseYn' ,'dcmlPntLen'],
                    id: 'CAPCM130Grid',
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
                        	//통화코드
                            text: bxMsg('cbb_items.AT#crncyCd'),
                            flex: 1,
                            dataIndex: 'crncyCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                        	//통화코드한글명
                            text: bxMsg('cbb_items.AT#crncyCdKorNm'),
                            flex: 1,
                            dataIndex: 'crncyCdKorNm',
                            style: 'text-align:center',
                            align: 'center',
                        },


                        {
                        	//통화코드영문명
                            text: bxMsg('cbb_items.AT#crncyCdEngNm'),
                            flex: 1,
                            dataIndex: 'crncyCdEngNm',
                            style: 'text-align:center',
                            align: 'center'
                        },


                        {
                        	//통화번호코드
                            text: bxMsg('cbb_items.AT#crncyNbrCd'),
                            flex: 1,
                            dataIndex: 'crncyNbrCd',
                            style: 'text-align:center',
                            align: 'center',
                        },


                        {
                        	//ISO국가코드
                            text: bxMsg('cbb_items.AT#isoNatCd'),
                            flex: 1,
                            dataIndex: 'isoNatCd',
                            style: 'text-align:center',
                            align: 'center'
//	                        renderer: function (val) {
//	                        	return val ? bxMsg('cbb_items.CDVAL#40010' + val) : '';
//	                        }
                        },
                        {
                        	//고시통화구분코드
                        	text: bxMsg('cbb_items.AT#ancmntCrncyDscd'),
                        	//flex: 1,
                        	width:150,
                        	dataIndex: 'ancmntCrncyDscd',
                        	style: 'text-align:center',
                        	align: 'center',
                    		code: 'A0638',
                    		renderer: function (val) {
                    			return val ? bxMsg('cbb_items.CDVAL#A0638' + val) : '';
                    		}
                        },
                        {
                        	//표준특송우편일수
                        	text: bxMsg('cbb_items.AT#stdCourierPostalDayCnt'),
                        	flex: 1,
                        	dataIndex: 'stdCourierPostalDayCnt',
                        	style: 'text-align:center',
                        	align: 'right'
                        },


                        {
                        	//년일수
                        	text: bxMsg('cbb_items.AT#yrDayCnt'),
                        	//flex: 1,
                        	width:70,
                        	dataIndex: 'yrDayCnt',
                        	style: 'text-align:center',
                        	align: 'right'
                        },
                        {
                        	//환율고시대상여부
                        	text: bxMsg('cbb_items.AT#exRtAncmntTrgtYn'),
                        	//flex: 1,
                        	width:140,
                        	dataIndex: 'exRtAncmntTrgtYn',
                        	style: 'text-align:center',
                        	align: 'center',
                    		code: '10000',
	                        renderer: function (val) {
	                             return val ? bxMsg('cbb_items.CDVAL#10000' + val) : '';
	                        }
                        },
                        {
                        	//100단위통화여부
                        	text: bxMsg('cbb_items.AT#hndrdUnitCrncyYn'),
                        	flex: 1,
                        	dataIndex: 'hndrdUnitCrncyYn',
                        	style: 'text-align:center',
                        	align: 'center',
                    		code: '10000',
	                        renderer: function (val) {
	                             return val ? bxMsg('cbb_items.CDVAL#10000' + val) : '';
	                        }	


                        },
                        {
                        	//유로통화사용여부
                        	text: bxMsg('cbb_items.AT#euroCrncyUseYn'),
                        	flex: 1,
                        	dataIndex: 'euroCrncyUseYn',
                        	style: 'text-align:center',
                        	align: 'center',
                    		code: '10000',
	                        renderer: function (val) {
	                             return val ? bxMsg('cbb_items.CDVAL#10000' + val) : '';
	                        }
                        },


                        {
                        	//소수점자리수
                        	text: bxMsg('cbb_items.AT#dcmlPntLen'),
                        	flex: 1,
                        	dataIndex: 'dcmlPntLen',
                        	style: 'text-align:center',
                        	align: 'right'


                        },


                        {
                        	//삭제
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


                    listeners: {
                        click: {
                            element: 'body',
                            fn: function () {
                                that.selectGridRecord();
                            }
                        }
                    }
                });
            },


            //combobox 정보 셋팅
            setComboBoxes: function () {
                var sParam = {};


                sParam = {};
                sParam.className = "CAPCM130-crncyCd-wrap";
                sParam.targetId = "crncyCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "T0001";
                sParam.viewType = "ValNm";


                fn_getCodeList(sParam, this);   // 통화코드




                sParam = {};
                sParam.className = "CAPCM130-isoNatCd-wrap";
                sParam.targetId = "isoNatCd";
                sParam.nullYn = "Y";
                //sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "40010";
                sParam.viewType = "ValNm";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // ISO국가코드




                sParam = {};
                sParam.className = "CAPCM130-ancmntCrncyDscd-wrap";
                sParam.targetId = "ancmntCrncyDscd";
                sParam.nullYn = "N";


                //sParam.allNm = bxMsg('cbb_items.SCRNITM#al l');
                sParam.cdNbr = "A0638";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 고시통화구분


                sParam = {};
                sParam.className = "CAPCM130-exRtAncmntTrgtYn-wrap";
                sParam.targetId = "exRtAncmntTrgtYn";
                sParam.nullYn = "N";
               // sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "10000";
                sParam.viewType = "ValNm";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 환율고시대상여부 (여부 =10000)




                sParam = {};
                sParam.className = "CAPCM130-hndrdUnitCrncyYn-wrap";
                sParam.targetId = "hndrdUnitCrncyYn";
                sParam.nullYn = "N";
               // sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "10000";
                sParam.viewType = "ValNm";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 100단위통화여부 (여부 =10000)




                sParam = {};
                sParam.className = "CAPCM130-euroCrncyUseYn-wrap";
                sParam.targetId = "euroCrncyUseYn";
                sParam.nullYn = "N";
               // sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "10000";
                sParam.viewType = "ValNm";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 유로사용여부(여부 =10000)


            },


            //통화 콤보박스 재조회
            reloadCombo: function () {


            	var sParam = {};


                sParam = {};
                sParam.className = "CAPCM130-crncyCd-wrap";
                sParam.targetId = "crncyCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "T0001";
                sParam.viewType = "ValNm";


                fn_getCodeList(sParam, this);   // 통화코드


            },


            //그리드 클릭
            selectGridRecord: function () {
                if(this.CAPCM130Grid.grid.getSelectionModel().selected.items[0]) {
                    var selectedData = this.CAPCM130Grid.grid.getSelectionModel().selected.items[0].data;
                    this.setBaseAttribute(selectedData);
                }
            },


            //기본속성 셋팅
            setBaseAttribute: function (data) {
                var isCashManagementTarget = (data.cashMgmtTrgtYn == 'Y');
                this.initFlag = false;
                //통화코드 
                this.$el.find('#base-attribute-area [data-form-param="crncyCd"]').val(data.crncyCd);
                //통화코드한글명
                this.$el.find('#base-attribute-area [data-form-param="crncyCdKorNm"]').val(data.crncyCdKorNm);
                //통화코드영문명 
                this.$el.find('#base-attribute-area [data-form-param="crncyCdEngNm"]').val(data.crncyCdEngNm);
                //ISO국가코드 
                this.$el.find('#base-attribute-area [data-form-param="isoNatCd"]').val(data.isoNatCd);
                //통화번호코드 
                this.$el.find('#base-attribute-area [data-form-param="crncyNbrCd"]').val(data.crncyNbrCd);
                //고시통화구분 
                this.$el.find('#base-attribute-area [data-form-param="ancmntCrncyDscd"]').val( data.ancmntCrncyDscd);
                //환율고시대상여부 
                this.$el.find('#base-attribute-area [data-form-param="exRtAncmntTrgtYn"]').val( data.exRtAncmntTrgtYn);
                //표준특송우편일수 
                this.$el.find('#base-attribute-area [data-form-param="stdCourierPostalDayCnt"]').val(data.stdCourierPostalDayCnt);
                //년일수 
                this.$el.find('#base-attribute-area [data-form-param="yrDayCnt"]').val(data.yrDayCnt);
                //100단위통화여부 
                this.$el.find('#base-attribute-area [data-form-param="hndrdUnitCrncyYn"]').val( data.hndrdUnitCrncyYn);
                //유로통화사용여부 
                this.$el.find('#base-attribute-area [data-form-param="euroCrncyUseYn"]').val(data.euroCrncyUseYn);
                //소수점자리수 
                this.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').val( data.dcmlPntLen);       


                //통화코드 비활성화
                this.$el.find('#base-attribute-area [data-form-param="crncyCd"]').prop('disabled', true);
            },




            resetBaseAttribute: function () {


            	this.initFlag = true;
//                this.$el.find('#base-attribute-area [data-form-param="billCtgryFormDscd"] option:eq(0)').attr('selected', 'selected');
                //통화코드 
                this.$el.find('#base-attribute-area [data-form-param="crncyCd"]').val("");
                //통화코드한글명
                this.$el.find('#base-attribute-area [data-form-param="crncyCdKorNm"]').val("");
                //통화코드영문명 
                this.$el.find('#base-attribute-area [data-form-param="crncyCdEngNm"]').val("");
                //ISO국가코드 
                this.$el.find('#base-attribute-area [data-form-param="isoNatCd"]').val("");
                //통화번호코드 
                this.$el.find('#base-attribute-area [data-form-param="crncyNbrCd"]').val("");
                //고시통화구분 
                this.$el.find('#base-attribute-area [data-form-param="ancmntCrncyDscd"]').val("");
                //환율고시대상여부 
                this.$el.find('#base-attribute-area [data-form-param="exRtAncmntTrgtYn"] option:eq(0)').attr('selected', 'selected');
                //표준특송우편일수 
                this.$el.find('#base-attribute-area [data-form-param="stdCourierPostalDayCnt"]').val("0");
                //년일수 
                this.$el.find('#base-attribute-area [data-form-param="yrDayCnt"]').val("0");
                //100단위통화여부 
                this.$el.find('#base-attribute-area [data-form-param="hndrdUnitCrncyYn"] option:eq(0)').attr('selected', 'selected');
                //유로통화사용여부 
                this.$el.find('#base-attribute-area [data-form-param="euroCrncyUseYn"] option:eq(0)').attr('selected', 'selected');
                //소수점자리수 
                this.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').val("0");       


                this.$el.find('#base-attribute-area [data-form-param="crncyCd"]').prop('disabled', false);


            },


            inquireCurrencyCodeList: function () {
                // header 정보 set
                var that = this;
                var sParam = {};
                //기관코드 
                sParam.instCd       = $.sessionStorage('headerInstCd');
                //통화구분코드
                sParam.crncyCd      = this.$el.find('#search-condition-area [data-form-param="crncyCd"]').val();


                var linkData = {"header": fn_getHeader("CAPCM1308401"), "CaCrncyCdMgmtSvcIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {


                            var refAtrbtList = responseData.CaCrncyCdMgmtSvcListOut.crncyCdlist;
                            var totCnt = refAtrbtList.length;


                            // 서비스 입력항목
                            that.resetBaseAttribute();
                            if (refAtrbtList != null || refAtrbtList.length > 0) {
                                that.CAPCM130Grid.setData(refAtrbtList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");


                                // 삭제 로우 초기화
                                that.deleteList = [];
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            deleteCurrencyCodeList : function (event) {
                if(this.deleteList.length < 1) return;


                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var tbl = [];
                    var sParam = {};


                    $(that.deleteList).each(function(idx, data) {
                        var delList = {};


                        delList.instCd  = $.sessionStorage('headerInstCd');          


                        delList.crncyCd = data.crncyCd;


                        tbl.push(delList);
                    });
                    sParam.tblList = tbl ;




                    var linkData = {"header": fn_getHeader("CAPCM1308301"), "CaCrncyCdMgmtSvcSaveIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 재조회
                                that.inquireCurrencyCodeList();
                                that.reloadCombo();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },


            saveBaseAttribute: function (event) {
                var that = this;
                
              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var sParam = {};
                    var header =  new Object(); //header 변수 선언


                    sParam.instCd               = $.sessionStorage('headerInstCd');
                    sParam.crncyCd              = that.$el.find('#base-attribute-area [data-form-param="crncyCd"]').val();
                    sParam.crncyCdKorNm         = that.$el.find('#base-attribute-area [data-form-param="crncyCdKorNm"]').val();
                    sParam.crncyCdEngNm         = that.$el.find('#base-attribute-area [data-form-param="crncyCdEngNm"]').val();
                    sParam.isoNatCd             = that.$el.find('#base-attribute-area [data-form-param="isoNatCd"]').val();
                    sParam.crncyNbrCd           = that.$el.find('#base-attribute-area [data-form-param="crncyNbrCd"]').val();
                    sParam.ancmntCrncyDscd      = that.$el.find('#base-attribute-area [data-form-param="ancmntCrncyDscd"]').val();
                    sParam.exRtAncmntTrgtYn     = that.$el.find('#base-attribute-area [data-form-param="exRtAncmntTrgtYn"]').val();
                    sParam.stdCourierPostalDayCnt = that.$el.find('#base-attribute-area [data-form-param="stdCourierPostalDayCnt"]').val();
                    sParam.yrDayCnt               = that.$el.find('#base-attribute-area [data-form-param="yrDayCnt"]').val();
                    sParam.hndrdUnitCrncyYn     = that.$el.find('#base-attribute-area [data-form-param="hndrdUnitCrncyYn"]').val();
                    sParam.euroCrncyUseYn       = that.$el.find('#base-attribute-area [data-form-param="euroCrncyUseYn"]').val();
                    sParam.dcmlPntLen           = that.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').val();


//                    sParam.cashMgmtTrgtYn       = that.$el.find('#base-attribute-area #cashMgmtTrgtYn').prop('checked') ? 'Y' : 'N';


                    if(that.initFlag) {
                    	//등록
                    	header = fn_getHeader("CAPCM1308101");
                    }
                    else {
                    	//수정
                    	header = fn_getHeader("CAPCM1308201");
                    }


                    var linkData = {"header": header, "CaCrncyCdMgmtSvcSaveIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // 재조회
                                that.inquireCurrencyCodeList();
                                that.reloadCombo();
                            }
                        }
                    });
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find('#btn-search-condition-toggle'));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find('#btn-search-result-toggle'));
            },


            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#base-attribute-area'), this.$el.find('#btn-base-attribute-toggle'));
            },


            changeHndrdUnitCrncyYn : function() {					
            	var that = this;				
            	//CAPCM130-hndrdUnitCrncyYn-wrap




        	    if (that.$el.find('#base-attribute-area [data-form-param="hndrdUnitCrncyYn"]').val() == "Y")
    	    	{
        	    	//100단위 통화이면 소수점자리수는 없어야 한다.
        	    	that.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').prop('disabled', true);
        	    	that.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').val("0");
	    		}
        	    else
		    	{
        	    	that.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').prop('disabled', false);
		    	}
            }					


        }); // end of Backbone.View.extend({


        return CAPCM130View;
    } // end of define function
)
; // end of define
