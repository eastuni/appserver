define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!views/batch/daemon-info/commit-setting-item-tpl.html',
        'text!views/batch/daemon-info/commit-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        Popup,
        itemTpl,
        tpl
    ) {

        var CommitSettingPopup = Popup.extend({

            className: 'md-small commit-setting-popup',

            templates: {
                itemTpl: itemTpl,
                tpl: tpl
            },

            events: {
                'click .add-commit-setting-btn': 'addCommitSetting',
                'click .del-commit-setting-btn': 'delCommitSetting',

                'click .save-commit-setting-btn': 'saveCommitSetting',
                'click .cancel-btn': 'close'
            },

            initialize: function() {
            },

            /**
             * commitSettingData : string
             */
            render: function(commitSettingData) {
                var renderData = {commitSettingList: commonUtil.changeQueryStringToArray(commitSettingData)};

                this.$el.html(this.tpl(renderData));
                this.$searchWrap = this.$el.find('.search-wrap');

                this.setCrossMarks();
                this.setDraggable();

                this.show();
            },

            addCommitSetting: function(e) {
                $(e.currentTarget).parent().parent().after(this.itemTpl());
                this.setCrossMarks();
            },

            delCommitSetting: function(e) {
                $(e.currentTarget).parent().parent().remove();
                this.setCrossMarks();
            },

            setCrossMarks: function () {
                var commitSettingItems = this.$searchWrap.find('ul.commit-setting-item');

                if (commitSettingItems.length === 1) {
                    $(commitSettingItems[0]).find('.del-commit-setting-btn').remove();
                } else {
                    if (!$(commitSettingItems[0]).find('.del-commit-setting-btn').length) {
                        $(commitSettingItems[0]).find('.add-commit-setting-btn').after(
                            '<button type="button" class="bw-btn del-commit-setting-btn"><i class="bw-icon i-25 i-func-del"></i></button>'
                        )
                    }
                }
            },

            saveCommitSetting: function() {
                var $commitSettingList,
                    $commitSettingItem,
                    commitSettingList = [],
                    stepNmVal,
                    intervalVal;

                $commitSettingList = this.$el.find('.commit-setting-item');

                for(var i = 0; i < $commitSettingList.length; i++){
                    $commitSettingItem = $($commitSettingList[i]);

                    stepNmVal = $commitSettingItem.find('.step-nm-input').val().trim();
                    intervalVal = $commitSettingItem.find('.interval-input').val().trim();

//                    if(!stepNmVal) {
//                        swal({type: 'warning', title: '', text: bxMsg('batch.step-nm-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
//                        return;
//                    }
//
//                    if(!intervalVal) {
//                        swal({type: 'warning', title: '', text: bxMsg('batch.interval-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
//                        return;
//                    }

                    if(stepNmVal && intervalVal) {
                    	commitSettingList.push(stepNmVal + '=' + intervalVal);
                    	this.trigger('add-commit-setting', commitSettingList.join(';') + ';');
                    	this.close();
                    } else {
                    	this.trigger('add-commit-setting', commitSettingList);
                    	this.close();
                    }
                }

            }

        });

        return CommitSettingPopup;
    }
);