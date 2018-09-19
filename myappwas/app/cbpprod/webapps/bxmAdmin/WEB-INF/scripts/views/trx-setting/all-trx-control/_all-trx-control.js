define(
    [
        'common/util',
        'common/component/loading-bar/_loading-bar',
        'views/trx-setting/all-trx-control/all-trx-control-popup',
        'text!views/trx-setting/all-trx-control/_all-trx-control-tpl.html'
    ],
    function(
        commonUtil,
        LoadingBar,
        AllTrxControlPopup,
        tpl
    ) {

        var AllTrxControlView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .edit-all-trx-control-btn': 'showEditAllTrxControlPopup'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['allTrxControlPopup'] = new AllTrxControlPopup();
                that.subViews['allTrxControlPopup'].on('edit-all-trx-control', function() {
                    that.loadAllTrxControl();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                that.$allTrxControlDetail = that.$el.find('.all-trx-control-detail');
            },

            render: function() {
                this.$allTrxControlDetail.append(this.subViews['detailLoadingBar'].render());
                this.loadAllTrxControl();

                return this.$el;
            },

            showEditAllTrxControlPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$allTrxControlDetail);

                this.subViews['allTrxControlPopup'].render(renderData);
            },

            loadAllTrxControl: function() {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData('TRXControlService', 'getTrxControl', 'TestParamOMM');

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var trxControlOMM = response.TRXControlOMM;

                        commonUtil.makeFormFromParam(that.$allTrxControlDetail, trxControlOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }

        });

        return AllTrxControlView;
    }
);