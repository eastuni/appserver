define(
    [
        'common/util',
        'common/component/loading-bar/_loading-bar',
        'text!views/app-deploy/application-deploy/components/app-item.html',
        'text!views/app-deploy/application-deploy/components/instance-item.html',
        'text!views/app-deploy/application-deploy/sub-pages/deploy/_deploy-tpl.html'
    ],
    function(
        commonUtil,
        LoadingBar,
        appItem,
        instanceItem,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl,
                'appItem': appItem,
                'instanceItem': instanceItem
            },

            events: {
                'click .app-select-page .pre-deploy-app-search [data-value]': 'selectPathType',
                'click .app-search-btn': 'loadAppList',
                'enter-component .pre-deploy-app-search input': 'loadAppList',

                'click .grid-list-item': 'toggleItemSelection',

                'click .application-btn': 'moveToApplicationTab',
                'click .instance-btn': 'moveToInstanceTab',

                'click .start-deploy-btn': 'startDeploy'
            },

            currentSubPage: '$appSelectPage',
            pathType: 'serverPath',
            serverPath: null,
            appNames: [],
            appFileNames: [],
            frmInstanceId: [],

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Dom Element Cache
                that.$stepBar = that.$el.find('.step-bar');
                that.$applicationBtn = that.$stepBar.find('.application-btn');
                that.$instanceBtn = that.$stepBar.find('.instance-btn');

                that.$appSelectPage = that.$el.find('.app-select-page');
                that.$pathTypeBtn = that.$appSelectPage.find('.pre-deploy-app-search [data-value]');
                that.$pathTypeBtns = [];
                ['serverPath', 'svnUrl'].forEach(function (pathType) {
                    that.$pathTypeBtns[pathType] = that.$appSelectPage.find('li[data-value="' + pathType + '"]');
                });
                that.$appSearchPath = that.$appSelectPage.find('input[data-form-param="path"]');
                that.$appList = that.$appSelectPage.find('.grid-list');

                that.$instanceSelectPage = that.$el.find('.instance-select-page');
                that.$instanceList = that.$instanceSelectPage.find('.grid-list');

                // Loading Bar setup
                that.subViews['appLoadingBar'] = new LoadingBar();
                that.$appSelectPage.find('.grid-list-section').append(that.subViews['appLoadingBar'].render());
                that.subViews['instanceLoadingBar'] = new LoadingBar();
                that.$instanceSelectPage.find('.grid-list-section').append(that.subViews['instanceLoadingBar'].render());
            },

            render: function() {
            	
            	var that = this;
            	
            	//bxm.admin.app.deploy.server.url 
            	commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
            			'DeployService', 'getServerUrlSetting', 'EmptyOMM', {}
            			), {
            		success: function (response) {
            			var serverUrl = response.RepositoryInfoOMM.serverPath;
            			that.$serverPath.val(serverUrl);
            		}
            	})
            	
                return this.$el;
            },

            loadAppList: function () {
                var that = this,
                    requestParam = {};
                that.appNames = [];
                that.appFileNames = [];

                that.serverPath = that.$appSearchPath.val();

                switch (that.pathType) {
                    case 'serverPath':
                        requestParam = {
                            serverPath: that.serverPath,
                            svnUrl: ''
                        };
                        break;
                    case 'svnUrl':
                        requestParam = {
                            serverPath: '',
                            svnUrl: that.serverPath
                        };
                        break;
                    default:
                }

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'DeployService', 'getRepositoryApplicationList', 'RepositoryInfoOMM', requestParam), {
                    beforeSend: function () {
                        that.subViews['appLoadingBar'].show();
                    },
                    success: function (response) {
                        var renderList = [];
                        response.BxmDeployAppListOMM.bxmDeployAppList.forEach(function (item) {
                            renderList.push(that.appItem(item));
                        });
                        that.$appList.html(renderList);
                    },
                    complete: function () {
                        that.subViews['appLoadingBar'].hide();
                    }
                });
            },

            loadInstanceList: function () {
                var that = this;
                that.frmInstanceId = [];

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('DeployService', 'getFrmInstanceList', 'EmptyOMM'), {
                    beforeSend: function () {
                        that.subViews['instanceLoadingBar'].show();
                    },
                    success: function (response) {
                        var renderList = [];
                        response.InstanceMonListOMM.instanceMonList.forEach(function (item) {
                            renderList.push(that.instanceItem(item));
                        });
                        that.$instanceList.html(renderList);
                    },
                    complete: function () {
                        that.subViews['instanceLoadingBar'].hide();
                    }
                });
            },

            moveToApplicationTab: function () {
                if (this.currentSubPage === '$appSelectPage') return;
                // 어플리케이션 탭으로는 validation 없이 이동 가능

                this.$applicationBtn.addClass('on');
                this.$instanceBtn.removeClass('on');

                this[this.currentSubPage].hide();
                this.currentSubPage = '$appSelectPage';
                this[this.currentSubPage].show();
            },

            moveToInstanceTab: function () {
                if (this.currentSubPage === '$instanceSelectPage') return;
                // 인스턴스 탭으로는 save/validation 후 이동
                if (this.currentSubPage === '$appSelectPage' && this.savePage(this.currentSubPage)) return;

                this.$applicationBtn.addClass('on');
                this.$instanceBtn.addClass('on');

                this[this.currentSubPage].hide();
                this.currentSubPage = '$instanceSelectPage';
                this[this.currentSubPage].show();

                this.loadInstanceList();
            },

            // 현재 위치한 페이지를 떠날 떄 페이지의 내용을 확인하고 저장함
            // 성공 시 0, 실패 시 -1 리턴
            savePage: function(page) {
                switch (page) {
                    case '$appSelectPage':
                        this.saveSelectedApps();
                        if (this.appNames.length && this.appFileNames.length) {
                            return 0;
                        } else {
                            swal({type: 'warning', title: '', text: bxMsg('app-deploy.app-select-instruction'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            return -1;
                        }
                        break;
                    case '$instanceSelectPage':
                        this.saveSelectedInstances();
                        if (this.frmInstanceId.length) {
                            return 0;
                        } else {
                            swal({type: 'warning', title: '', text: bxMsg('app-deploy.instance-select-instruction'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            return -1;
                        }
                        break;
                    default:
                }
            },

            saveSelectedApps: function () {
                var that = this,
                    selectedApps = that.$appList.find('.on');
                that.appNames = [];
                that.appFileNames = [];

                selectedApps.each(function (i, eachApp) {
                    var params = commonUtil.makeParamFromForm($(eachApp));
                    that.appNames.push(params.appName);
                    that.appFileNames.push(params.fileName);
                })
            },

            saveSelectedInstances: function () {
                var that = this,
                    selectedInstances = that.$instanceList.find('.on');
                that.frmInstanceId = [];

                selectedInstances.each(function (i, eachApp) {
                    var params = commonUtil.makeParamFromForm($(eachApp));
                    that.frmInstanceId.push(params.bxmInstanceId);
                })
            },

            toggleItemSelection: function (e) {
                var target = $(e.currentTarget);

                if (target.hasClass('on')) {
                    target.removeClass('on');
                } else {
                    target.addClass('on');
                }
            },

            selectPathType: function (e) {
                this.pathType = $(e.currentTarget).attr('data-value');

                this.$pathTypeBtn.removeClass('on');
                this.$pathTypeBtns[this.pathType].addClass('on');
            },

            startDeploy: function () {
                var that = this;

                if (that.savePage(that.currentSubPage)) return;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('DeployService', 'deployApplication', 'DeployApplicationOMM', {
                    serverPath: that.serverPath,
                    appNames: that.appNames.join('|'),
                    appFileNames: that.appFileNames.join('|'),
                    frmInstanceId: that.frmInstanceId.join('|')
                }), {
                    beforeSend: function () {
                        that.subViews['instanceLoadingBar'].show();
                    },
                    success: function (response) {
                        switch (response.ResponseCode.code) {
                            case 300:
                                swal({
                                    type: 'success',
                                    title: '',
                                    text: bxMsg('app-deploy.deploy-success-msg'),
                                    showCancelButton: true,
                                    customClass: 'sweet-alert-button-resize',
                                    confirmButtonText: bxMsg('app-deploy.move-to-deploy-home'),
                                    cancelButtonText: bxMsg('app-deploy.move-to-deploy-history')
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        window.location.hash = '#MENU00601/SUB01';
                                    } else {
                                        window.location.hash = '#MENU00602';
                                    }
                                });
                                that.moveToApplicationTab();
//                                that.$appSearchPath.val('');
                                that.$appList.html(null);
                                break;
                            case 301:
                                swal({type: 'error', title: '', text: bxMsg('app-deploy.deploy-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                break;
                            default:
                        }
                    },
                    complete: function () {
                        that.subViews['instanceLoadingBar'].hide();
                    }
                });
            }
        });
    }
);
