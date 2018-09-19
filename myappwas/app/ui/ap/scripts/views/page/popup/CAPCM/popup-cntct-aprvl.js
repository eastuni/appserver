define(
    [
        'bx-component/popup/popup'
        , 'bx-component/message/message-alert'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/popup/CAPCM/popup-cntct-aprvl-tpl.html'
        , 'bx/common/common-message'
    ],
    function (Popup
        , alertMessage
        , ExtGrid
        , tpl) {


        var BxpAprvlPopup = Popup.extend({
            //태그 이름 설정
            tagName: 'section',


            //클래스 이름 설정
            className: 'popup-page',


            //템플릿설정
            templates: {
                'tpl': tpl
            }


            , attributes: {
                'style': 'width: 625px; height: 650px;'
            }


            , events: {
                'click .cancel-btn': 'close'
                , 'click .aprvl-btn': 'fn_cnctAprvl'
            }


            , initialize: function (initConfig) {
                var that = this;


                // Set Page
                this.$el.html(this.tpl());


                // Set Page modal 설정
                that.enableDim = true;


                this.$el.find('[data-form-param="aprvlId"]').val(initConfig.data);


                that.dataGrid = new ExtGrid({
                    fields: ['spvsrStaffCntnt', 'spvsrBrnchCntnt']
                    , id: 'dataGrid'
                    , columns: [
                        //NO.
                        {
                            text: 'No.'
                            , dataIndex: 'rowIndex',
                            style: 'text-align:center',
                            align: 'right'
                            , sortable: false
                            , width: 50
                            // other config you need..
                            , renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            return rowIndex + 1;
                        }
                        }
                        , {
                            text: bxMsg('cbb_items.AT#spvsrStaffCntnt'), flex: 1, dataIndex: 'spvsrStaffCntnt',
                            style: 'text-align:center',
                            align: 'left'
                        }
                        , {
                            text: bxMsg('cbb_items.AT#spvsrBrnchCntnt'), flex: 1, dataIndex: 'spvsrBrnchCntnt',
                            style: 'text-align:center',
                            align: 'left'
                        }
                    ]
                });//end of grid


            }//end of initialize


            , render: function () {
                var that = this;


                // 콤보데이터 로딩
                var sParam = {};
                var selectStyle = {};


                //결재사유코드
                sParam = {};
                selectStyle = {'width': '80%'};
                sParam.className = "SUP300-aprvlRsnCd-wrap";
                sParam.targetId = "aprvlRsnCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "12303";
                fn_getCodeList(sParam, this, selectStyle);


                var aprvlId = "";


                aprvlId = this.$el.find('[data-form-param="aprvlId"]').val();


                if (aprvlId != "" || aprvlId != null) {
                    this.fn_loadBase(aprvlId);
                } else {
                    this.setSUP300BaseData(that, "", "X");
                }


                that.$el.find(".data-grid").html(that.dataGrid.render({'height': '130px'}));
                that.dataGrid.resetData();
                that.show();
            }


            , setSUP300BaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {  // 초기화
                    that.$el.find('[data-form-param="aprvlRsnCd"]').val("");       //결재사유코드
                    that.$el.find('[data-form-param="aprvlRsnCd"]').prop("disabled", true); //결재사유코드 disabled
                    that.$el.find('[data-form-param="demandScrnId"]').val("");       //요청화면코드
                    that.$el.find('[data-form-param="demandScrnNm"]').val("");       //요청화면명
                    that.$el.find('[data-form-param="aprvlTrgtSrvcCd"]').val("");       //요청서비스코드
                    that.$el.find('[data-form-param="srvcNm"]').val("");      //요청서비스명
                    that.$el.find('[data-form-param="demandStaffCntnt"]').val("");       //요청스테프식별자내용
                    that.$el.find('[data-form-param="aprvlAplctnDt"]').val("");       //승인요청년월일
                    that.$el.find('[data-form-param="aprvlAplctnCntnt"]').val("");       //승인신청내용
                }
                else {
                    that.$el.find('[data-form-param="aprvlRsnCd"]').val(responseData.AprvlDemandSvcGetSpvsrOut.aprvlRsnCd);       //결재사유코드
                    that.$el.find('[data-form-param="aprvlRsnCd"]').prop("disabled", true); //결재사유코드 disabled
                    that.$el.find('[data-form-param="demandScrnId"]').val(responseData.AprvlDemandSvcGetSpvsrOut.demandScrnId);       //요청화면코드
                    that.$el.find('[data-form-param="demandScrnNm"]').val(responseData.AprvlDemandSvcGetSpvsrOut.demandScrnNm);       //요청화면명
                    that.$el.find('[data-form-param="aprvlTrgtSrvcCd"]').val(responseData.AprvlDemandSvcGetSpvsrOut.aprvlTrgtSrvcCd);       //요청서비스코드
                    that.$el.find('[data-form-param="srvcNm"]').val(responseData.AprvlDemandSvcGetSpvsrOut.srvcNm);       //요청서비스명
                    that.$el.find('[data-form-param="demandStaffCntnt"]').val(responseData.AprvlDemandSvcGetSpvsrOut.demandStaffCntnt);  //요청스테프식별자내용
                    that.$el.find('[data-form-param="aprvlAplctnDt"]').val(responseData.AprvlDemandSvcGetSpvsrOut.aprvlAplctnDt);       //승인요청년월일
                    that.$el.find('[data-form-param="aprvlAplctnCntnt"]').val(responseData.AprvlDemandSvcGetSpvsrOut.aprvlAplctnCntnt);       //승인신청내용
                }
            }


            //결재요청내용
            , fn_loadBase: function (param) {
                var that = this;
                sParam = {};


                sParam.aprvlId = that.$el.find('[data-form-param="aprvlId"]').val();


                var linkData = {"header": fn_getHeader("SSF3008401"), "AprvlDemandSvcGetSpvsrIn": sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {


                        // 에러여부 확인. 에러시 메시지 띄워주고 정상시 재조회 호출
                        if (fn_commonChekResult(responseData)) {
                            // 정상처리 메시지 출력
                            alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                            // 기본부 항목 set
                            that.setSUP300BaseData(that, responseData, "R");
                            var tbList = responseData.AprvlDemandSvcGetSpvsrOut.spvsrList;


                            if (tbList == null) {
                                that.dataGrid.resetData();
                            } else {
                                that.dataGrid.setData(tbList);
                            }
                        }
                    } // end of success: function.....
                }); // end of bxProxy.post....
            }


            //승인요청
            , fn_cnctAprvl: function () {
                var that = this;
                sParam = {};


                sParam.aprvlId = that.$el.find('[data-form-param="aprvlId"]').val();


                var linkData = {"header": fn_getHeader("SSF3008101"), "AprvlDemandSvcGetSpvsrIn": sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {


                        // 에러여부 확인. 에러시 메시지 띄워주고 정상시 재조회 호출
                        if (fn_commonChekResult(responseData)) {
                            // 정상처리 메시지 출력
                            alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));


                            //승인후 responds값으로 그리드 재셋팅
                            var tbList = responseData.AprvlDemandSvcGetSpvsrOut.spvsrList;


                            that.dataGrid.setData(tbList);


                        }//end of if
                    }//end of success
                });//end of bxProxy
            }
        });


        return BxpAprvlPopup;
    }
);
