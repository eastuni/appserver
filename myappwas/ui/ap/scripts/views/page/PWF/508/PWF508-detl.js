define(
    [
        'bx/common/config'
        , 'bx-component/message/message-alert'
        , 'bx-component/message/message-confirm'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/PWF/508/PWF508-detl-tpl.html'
        , 'app/views/page/popup/popup-xtnAttr'
        , 'bx/common/common-info'
        , 'bx/common/common-message'
    ],
    function (config
        , alertMessage
        , confirmMessage
        , DatePicker
        , ExtGrid
        , tpl
        , PopupXtnAttr
        , commonInfo) {
        var aprvlCndNbrBase = "";
        var instCdBase = "";
        var dtlNewData = {
            "val": ""
        };


        var PWF508DetlView = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'PWF508-detl-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                'click .PWF508-reset-btn': 'resetPWF508Detl'
                , 'click .PWF508-save-btn': 'savePWF508Detl'
                , 'click .PWF508-delete-btn': 'deletePWF508Detl'
                , 'click .PWF508-addRow-btn': 'addPWF508Detl'
                , 'click .PWF508-delRow-btn': 'delPWF508Detl'
                , 'change .PWF508-atrbtVldtnWayCd-wrap': 'chngAtrbtVldtnWayCd'
                , 'click #PWF-xtnAtrbtNm-Pop1': 'popUpBrowseXtnAttr'
            }


            , initialize: function (initData) {
                var that = this;
                that.initFlag = true;


                // initData 저장
                $.extend(that, initData);


                // 페이지 템플릿 설정
                that.$el.html(that.tpl());


                var sParam = {};
                var selectStyle = {};


                //속성타입코드
                sParam = {};
                selectStyle = {};
                sParam.className = "PWF508-atrbtTpCd-wrap";
                sParam.targetId = "atrbtTpCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "10001";
                fn_getCodeList(sParam, this, selectStyle);


                //속성검증방법코드
                sParam = {};
                selectStyle = {};
                sParam.className = "PWF508-atrbtVldtnWayCd-wrap";
                sParam.targetId = "atrbtVldtnWayCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "A0019";
                fn_getCodeList(sParam, this, selectStyle);


                /* ------------------------------------------------------------ */
                that.PWF508DtlGrid = new ExtGrid({
                    /* ------------------------------------------------------------ */
                    // 단일탭 그리드 컬럼 정의
                    fields: ['val']
                    , id: 'PWF508SingleGrid'
                    , columns: [
                        {
                            text: 'No.'
                            , dataIndex: 'rowIndex',
                            style: 'text-align:center',
                            align: 'right'
                            , sortable: false
                            , width: 50
                            // other config you need....
                            , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                            return rowIndex + 1;
                        }
                        }
                        , {text: bxMsg('cbb_items.AT#vldtnRule'), width: 700, dataIndex: 'val', editor: 'textfield', style: 'text-align:center'}
                    ] // end of columns
                    , gridConfig: {
                        // 셀 에디팅 플러그인
                        // 2번 클릭시, 에디팅할 수 있도록 처리
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 2
                            }) // end of Ext.create
                        ] // end of plugins
                    } // end of gridConfig
                });


                // 단일탭 그리드 렌더
                that.createGrid("dtl");
            }// end of initialize


            , render: function () {


                // 기본부 초기화
                this.resetPWF508Detl();


                return this.$el;
            }


            // 그리드 생성
            , createGrid: function (target) {
                if (target == "dtl") {
                    this.$el.find(".PWF508-dtl-grid").html(this.PWF508DtlGrid.render({'height': 100}));
                }
            }
            , loadAprvlCndNbr: function (param) {
                aprvlCndNbrBase = param.aprvlCndNbr;
            }


            /* ======================================================================== */
            /* 입출력 항목 set */
            /* ======================================================================== */
            , setDetlData: function (param) {
                var that = this;


                that.initFlat = false;


                // 조회 key항목 disabled 처리
                //분개규칙일련번호
                that.$el.find('[data-form-param="aprvlCndNbr"]').val(param.AprvlCndMgmtGetAprvlCondXtnInfoIO.aprvlCndNbr);
                that.$el.find('[data-form-param="aprvlCndNbr"]').prop("disabled", false);
                //테이블명
                that.$el.find('[data-form-param="tblNm"]').val(param.AprvlCndMgmtGetAprvlCondXtnInfoIO.tblNm);
                that.$el.find('[data-form-param="tblNm"]').prop("disabled", true);
                //확장속성명
                that.$el.find('[data-form-param="xtnAtrbtNm"]').val(param.AprvlCndMgmtGetAprvlCondXtnInfoIO.xtnAtrbtNm);
                that.$el.find('[data-form-param="xtnAtrbtNm"]').prop("disabled", true);
                //속성타입코드
                that.$el.find('[data-form-param="atrbtTpCd"]').val(param.AprvlCndMgmtGetAprvlCondXtnInfoIO.atrbtTpCd);
                that.$el.find('[data-form-param="atrbtTpCd"]').prop("disabled", false);
                //속성검증방법코드
                that.$el.find('[data-form-param="atrbtVldtnWayCd"]').val(param.AprvlCndMgmtGetAprvlCondXtnInfoIO.atrbtVldtnWayCd);
                that.$el.find('[data-form-param="atrbtVldtnWayCd"]').prop("disabled", false);
                //최소값
                that.$el.find('[data-form-param="minVal"]').val(param.AprvlCndMgmtGetAprvlCondXtnInfoIO.minVal);
                that.$el.find('[data-form-param="minVal"]').prop("disabled", false);
                //최대값
                that.$el.find('[data-form-param="maxVal"]').val(param.AprvlCndMgmtGetAprvlCondXtnInfoIO.maxVal);
                that.$el.find('[data-form-param="maxVal"]').prop("disabled", false);


                //조회값에 대한 ChangeEvent
                this.chngAtrbtVldtnWayCd();
            }


            /* ======================================================================== */
            /*   입출력 항목 초기화
             /* ======================================================================== */
            , resetPWF508Detl: function () {


                var that = this;


                that.initFlag = true;


                //테이블명
                that.$el.find('[data-form-param="tblNm"]').val("");
                that.$el.find('[data-form-param="tblNm"]').prop("disabled", false);
                //추가속성명
                that.$el.find('[data-form-param="xtnAtrbtNm"]').val("");
                that.$el.find('[data-form-param="xtnAtrbtNm"]').prop("disabled", false);
                //속성타입코드
                that.$el.find('[data-form-param="atrbtTpCd"]').val("");
                that.$el.find('[data-form-param="atrbtTpCd"]').prop("disabled", false);
                //속성검증방법코드
                that.$el.find('[data-form-param="atrbtVldtnWayCd"]').val("");
                that.$el.find('[data-form-param="atrbtVldtnWayCd"]').prop("disabled", false);
                //최소값
                that.$el.find('[data-form-param="minVal"]').val("");
                that.$el.find('[data-form-param="minVal"]').prop("disabled", false);
                //최대값
                that.$el.find('[data-form-param="maxVal"]').val("");
                that.$el.find('[data-form-param="maxVal"]').prop("disabled", false);


                //리셋시 리스트 visible
                this.$el.find('[class="PWF508-dtl-grid"]').show();
                this.$el.find('[class="bx-btn bx-btn-small PWF508-add-btn"]').prop("hidden", false);
                this.$el.find('[class="bx-btn bx-btn-small PWF508-delete-btn"]').prop("hidden", false);


                //초기화시 범위 테이블 hidden
                that.$el.find('[id="rangeTable"]').prop("hidden", true);


                that.PWF508DtlGrid.resetData();
            }
            /* ======================================================================== */
            /*   상세그리드 행추가
             /* ======================================================================== */
            , addPWF508Detl: function () {
                this.PWF508DtlGrid.addData(dtlNewData);
            }


            /* ======================================================================== */
            /*   상세그리드 행추가
             /* ======================================================================== */
            , delPWF508Detl: function () {
                var that = this;
                var gridAllData = that.PWF508DtlGrid.getAllData();
                var selectedRows = that.PWF508DtlGrid.getSelectedItemRow();


                if (gridAllData.length === 0 || selectedRows.length === 0) {
                    return;
                }


                that.PWF508DtlGrid.store.remove(selectedRows[0]);
            } // end of 행삭제


            /* ======================================================================== */
            /*   속성검증코드 변경 EVENT : (범위타입검증: 범위검증Rule 테이블만 활성화, 리스트타입검증 : 그리드만 활성화)
             /* ======================================================================== */
            , chngAtrbtVldtnWayCd: function () {
                if (this.$el.find('[data-form-param="atrbtVldtnWayCd"]').val() == "R") {
                    //범위 테이블 visible
                    this.$el.find('[id="rangeTable"]').prop("hidden", false);


                    //리스트 테이블 hidden
                    this.$el.find('[class="PWF508-dtl-grid"]').hide();
                    this.$el.find('[class="bx-btn bx-btn-small PWF508-add-btn"]').prop("hidden", true);
                    this.$el.find('[class="bx-btn bx-btn-small PWF508-delete-btn"]').prop("hidden", true);


                    this.$el.find('[class="bx-btn bx-btn-small PWF508-addRow-btn"]').prop("hidden", true);
                    this.$el.find('[class="bx-btn bx-btn-small PWF508-delRow-btn"]').prop("hidden", true);
                } else {
                    //범위 테이블 hidden
                    this.$el.find('[id="rangeTable"]').prop("hidden", true);


                    //리스트 테이블 visible
                    this.$el.find('[class="PWF508-dtl-grid"]').show();
                    this.$el.find('[class="bx-btn bx-btn-small PWF508-add-btn"]').prop("hidden", false);
                    this.$el.find('[class="bx-btn bx-btn-small PWF508-delete-btn"]').prop("hidden", false);


                    this.$el.find('[class="bx-btn bx-btn-small PWF508-addRow-btn"]').prop("hidden", false);
                    this.$el.find('[class="bx-btn bx-btn-small PWF508-delRow-btn"]').prop("hidden", false);
                }
            }


            /* ======================================================================== */
            /*   조회
             /* ======================================================================== */
            , selDtlData: function (param) {
                var that = this;
                var sParam = {};
                var instInfo = commonInfo.getInstInfo();
                instCdBase = instInfo.instCd;


                that.initFlag = false;


                if (param != null) {
                    sParam.aprvlCndNbr = param.raw.aprvlCndNbr;
                    sParam.tblNm = param.raw.tblNm;
                    sParam.xtnAtrbtNm = param.raw.xtnAtrbtNm;
                    sParam.instCd = instCdBase;
                } else {
                    sParam.aprvlCndNbr = aprvlCndNbrBase;
                    sParam.tblNm = that.$el.find('[data-form-param="tblNm"]').val();
                    sParam.xtnAtrbtNm = that.$el.find('[data-form-param="xtnAtrbtNm"]').val();
                    sParam.instCd = instCdBase;
                }


                var linkData = {"header": fn_getHeader("PWF4028402"), "AprvlCndMgmtSvcAprvlCondXtnInfoIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            //검증 룰부분 배열
                            var tbList = responseData.AprvlCndMgmtGetAprvlCondXtnInfoIO.listVal;


                            //배열의 각 값들 Object형태로 변경해서 삽입후 배열에 리스트 형태로 삽입
                            if (tbList != null || tbList.length > 0) {
                                var arr = [];
                                $.each(tbList, function (key, val) {
                                    var nextObj = new Object();
                                    var next = "";
                                    next = val;
                                    nextObj.val = val;
                                    arr.push(nextObj);
                                });


                                //aprvlCndNbrBase 저장
                                aprvlCndNbrBase = responseData.AprvlCndMgmtGetAprvlCondXtnInfoIO.aprvlCndNbr;
                                that.PWF508DtlGrid.setData(arr);


                                //상세의 기본부 데이터 셋팅
                                that.setDetlData(responseData);
                            }
                            else {
                                that.PWF508DtlGrid.resetData();
                            }
                        }
                    }   // end of suucess: fucntion
                });     // end of bxProxy
            }//end of function


            /* ======================================================================== */
            /*   저장기능 (등록/수정) 처리
             /* ======================================================================== */
            , savePWF508Detl: function () {
                var that = this;
                var sParam = {};
                var header = new Object();
                var headerParam = {};
                var instInfo = commonInfo.getInstInfo();
                instCdBase = instInfo.instCd;


                // UICME0004 필수 입력 항목입니다.
                if (fn_isNull(aprvlCndNbrBase)) {
                    alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#aprvlCndNbr") + "]");
                    return;
                }


                // 입력항목 set
                //기관코드
                sParam.instCd = instCdBase;
                // 결재조건번호
                sParam.aprvlCndNbr = aprvlCndNbrBase;
                // 테이블명
                sParam.tblNm = that.$el.find('[data-form-param="tblNm"]').val();
                // 확장속성명
                sParam.xtnAtrbtNm = that.$el.find('[data-form-param="xtnAtrbtNm"]').val();
                // 속성타입코드
                sParam.atrbtTpCd = that.$el.find('[data-form-param="atrbtTpCd"]').val();
                // 속성검증방법코드
                sParam.atrbtVldtnWayCd = that.$el.find('[data-form-param="atrbtVldtnWayCd"]').val();
                // 최소값
                sParam.minVal = that.$el.find('[data-form-param="minVal"]').val();
                // 최대값
                sParam.maxVal = that.$el.find('[data-form-param="maxVal"]').val();
                // 검증Rule
                sParam.listVal = [];
                tbList = that.PWF508DtlGrid.getAllData();
                tbListCnt = that.PWF508DtlGrid.getAllData().length;


                //검증Rule배열 형태 변경 listVal[object, object] --> listVal[01, 02]
                $(tbList).each(function (idx, data) {
                    sParam.listVal.push(data.val);
                });


                if (fn_isNull(sParam.aprvlCndNbr) || fn_isNull(sParam.tblNm) || fn_isNull(sParam.xtnAtrbtNm)) {
                	alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#aprvlCndNbr") + "]");
                    return;
                }


                if(sParam.atrbtVldtnWayCd == 'L') {
                    var gridAllData = that.PWF508DtlGrid.getAllData();


                    if (gridAllData.length === 0) {
                        alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#vldtnRule") + "]");
                        return;
                    }
                }


                // 범위 검증인 경우 최소, 최대는 필수 입력
                if(sParam.atrbtVldtnWayCd == 'R') {
                	if(fn_isEmpty(sParam.minVal)) {
                		alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#minVal") + "]");
	                    that.$el.find('[data-form-param="minVal"]').focus();
	                    return;
                	}


                	if(fn_isEmpty(sParam.maxVal)) {
                		alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#maxVal") + "]");
	                    that.$el.find('[data-form-param="maxVal"]').focus();
	                    return;
                	}


                	if(fn_isNumber(sParam.minVal) && fn_isNumber(sParam.maxVal)) {
                		if(Number(sParam.minVal) > Number(sParam.maxVal)) {
                			alertMessage.error(bxMsg('cbb_err_msg.UICME0028') + " [" + bxMsg("cbb_items.AT#minVal") + "]");
                			that.$el.find('[data-form-param="minVal"]').focus();
                			return;
                		} 
                	} else {
                		if(sParam.minVal > sParam.maxVal) {
                			alertMessage.error(bxMsg('cbb_err_msg.UICME0028') + " [" + bxMsg("cbb_items.AT#minVal") + "]");
                			that.$el.find('[data-form-param="minVal"]').focus();
                			return;
                		}
                	}
                }


                if (that.initFlag) {  // 등록
                    var linkData = {"header": fn_getHeader("PWF4028102"), "AprvlCndMgmtSvcAprvlCondXtnInfoIO": sParam};
                }
                else {
                    var linkData = {"header": fn_getHeader("PWF4028202"), "AprvlCndMgmtGetAprvlCondXtnInfoIO": sParam};
                }


                // ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        // 에러여부 확인
                        if (fn_commonChekResult(responseData)) {
                            alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));


                            param = {}
                            param.instCd = instCdBase;
                            param.aprvlCndNbr = aprvlCndNbrBase;


                            // 재조회
                            that.trigger('loadData', param);
                        }
                    }   // end of success: function
                });     // end of bxProxy
            }           // end of savePWF508Detl: function


            /* ======================================================================== */
            /*   삭제 처리
             /* ======================================================================== */
            , deletePWF508Detl: function () {
                var that = this;
                var sParam = {};
                var header = new Object();
                var headerParam = {};
                var instInfo = commonInfo.getInstInfo();
                instCdBase = instInfo.instCd;


                // UICME0004 필수 입력 항목입니다.
                if (fn_isNull(aprvlCndNbrBase)) {
                    alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#aprvlCndNbr") + "]");
                    return;
                }


                // 입력항목 set
                //기관코드
                sParam.instCd = instCdBase;
                // 결재조건번호
                sParam.aprvlCndNbr = aprvlCndNbrBase;
                // 테이블명
                sParam.tblNm = that.$el.find('[data-form-param="tblNm"]').val();
                // 확장속성명
                sParam.xtnAtrbtNm = that.$el.find('[data-form-param="xtnAtrbtNm"]').val();


                if (fn_isNull(sParam.tblNm)) {
                    alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#tblNm") + "]");
                    return;
                }


                if (fn_isNull(sParam.xtnAtrbtNm)) {
                    alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#xtnAtrbtNm") + "]");
                    return;
                }


                var linkData = {"header": fn_getHeader("PWF4028302"), "AprvlCndMgmtSvcAprvlCondXtnInfoIO": sParam};


                // ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        // 에러여부 확인
                        if (fn_commonChekResult(responseData)) {
                            alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                            that.resetPWF508Detl();


                            param = {}
                            param.instCd = instCdBase;
                            param.aprvlCndNbr = aprvlCndNbrBase;


                            // 재조회
                            that.trigger('loadData', param);
                        }
                    }   // end of success: function
                });     // end of bxProxy
            }           // end of deletePWF508Detl: function


            /* ======================================================================== */
            /*   확장속성명 팝업
             /* ======================================================================== */
            , popUpBrowseXtnAttr: function () {


                var that = this;


                var popupXtnAttr = new PopupXtnAttr(); // 팝업생성
                popupXtnAttr.render();


                popupXtnAttr.on('popUpSetData', function (param) {
                    that.$el.find('[data-form-param="tblNm"]').val(param.tblNm); //테이블명
                    that.$el.find('[data-form-param="xtnAtrbtNm"]').val(param.xtnAtrbtNm); //확장속성명
                });
            }
        }); // end of Backbone.View.extend({


        return PWF508DetlView;


    } // end of define function
); // end of define
