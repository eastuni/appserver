define(
    [
        'common/util',
        'common/component/loading-bar/_loading-bar',
        'text!views/app-deploy/application-deploy/components/app-item.html',
        'text!views/app-deploy/application-deploy/components/instance-item.html',
        'text!views/app-deploy/application-deploy/components/ip-item.html',
        'text!views/app-deploy/application-deploy/sub-pages/pre-deploy/_pre-deploy-tpl.html'
    ],
    function(
        commonUtil,
        LoadingBar,
        appItem,
        instanceItem,
        ipItem,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl,
                'appItem': appItem,
                'instanceItem': instanceItem,
                'ipItem': ipItem
            },

            events: {
                'click .app-select-page .pre-deploy-app-search [data-value]': 'selectPathType',
                'click .ip-select-page .pre-deploy-app-search [data-value]': 'selectValidateTime',
                'click .app-search-btn': 'loadAppList',
                'enter-component .pre-deploy-app-search input': 'loadAppList',

                'click .grid-list-item': 'toggleItemSelection',

                'click .application-btn': 'moveToApplicationTab',
                'click .instance-btn': 'moveToInstanceTab',
                'click .validation-btn': 'moveToValidationTab',

                'click .start-pre-deploy-btn': 'startPreDeploy'
            },

            currentSubPage: '$appSelectPage',
            pathType: 'serverPath',
            serverPath: null,
            appNames: [],
            appFileNames: [],
            frmInstanceId: [],
            validateIpList: [],
            timeout: 10,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Dom Element Cache
                that.$stepBar = that.$el.find('.step-bar');
                that.$applicationBtn = that.$stepBar.find('.application-btn');
                that.$instanceBtn = that.$stepBar.find('.instance-btn');
                that.$validationBtn = that.$stepBar.find('.validation-btn');

                that.$appSelectPage = that.$el.find('.app-select-page');
                that.$pathTypeBtn = that.$appSelectPage.find('.pre-deploy-app-search [data-value]');
                that.$pathTypeBtns = [];
                ['serverPath', 'svnUrl'].forEach(function (pathType) {
                    that.$pathTypeBtns[pathType] = that.$appSelectPage.find('li[data-value="' + pathType +'"]');
                });
                that.$appSearchPath = that.$appSelectPage.find('input[data-form-param="path"]');
                that.$appList = that.$appSelectPage.find('.grid-list');

                that.$instanceSelectPage = that.$el.find('.instance-select-page');
                that.$instanceList = that.$instanceSelectPage.find('.grid-list');

                that.$ipSelectPage = that.$el.find('.ip-select-page');
                that.$ipList = that.$ipSelectPage.find('.grid-list');
                that.$validateTimeBtn = that.$ipSelectPage.find('.pre-deploy-app-search [data-value]');
                that.$validateTimeBtns = [];
                ['10', '30', '60', '120'].forEach(function (pathType) {
                    that.$validateTimeBtns[pathType] = that.$ipSelectPage.find('li[data-value="' + pathType +'"]');
                });
                that.$serverPath = that.$el.find('input[data-form-param="path"]');
                
                // Loading Bar setup
                that.subViews['appLoadingBar'] = new LoadingBar();
                that.$appSelectPage.find('.grid-list-section').append(that.subViews['appLoadingBar'].render());
                that.subViews['instanceLoadingBar'] = new LoadingBar();
                that.$instanceSelectPage.find('.grid-list-section').append(that.subViews['instanceLoadingBar'].render());
                that.subViews['ipLoadingBar'] = new LoadingBar();
                that.$ipSelectPage.find('.grid-list-section').append(that.subViews['ipLoadingBar'].render());
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

            loadIpList: function () {
                var that = this;
                that.validateIpList = [];

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ValidateIPService', 'getUsingIPList', 'EmptyOMM'), {
                    beforeSend: function () {
                        that.subViews['ipLoadingBar'].show();
                    },
                    success: function (response) {
                        var renderList = [];
                        response.ValidateIPListOMM.validateIPList.forEach(function (item) {
                            renderList.push(that.ipItem(item));
                        });
                        that.$ipList.html(renderList);
                    },
                    complete: function () {
                        that.subViews['ipLoadingBar'].hide();
                    }
                });
            },

            moveToApplicationTab: function () {
                if (this.currentSubPage === '$appSelectPage') return;
                // 어플리케이션 탭으로는 validation 없이 이동 가능

                this.$applicationBtn.addClass('on');
                this.$instanceBtn.removeClass('on');
                this.$validationBtn.removeClass('on');

                this[this.currentSubPage].hide();
                this.currentSubPage = '$appSelectPage';
                this[this.currentSubPage].show();
            },

            moveToInstanceTab: function () {
                if (this.currentSubPage === '$instanceSelectPage') return;
                // 인스턴스 탭으로는 어플리케이션 탭에서 이동할때는 save/validation 후 이동,
                // 검증 탭에서 backward로 이동 시에는 validation 없이 이동 가능
                if (this.currentSubPage === '$appSelectPage' && this.savePage(this.currentSubPage)) return;

                this.$applicationBtn.addClass('on');
                this.$instanceBtn.addClass('on');
                this.$validationBtn.removeClass('on');

                this[this.currentSubPage].hide();
                this.currentSubPage = '$instanceSelectPage';
                this[this.currentSubPage].show();

                this.loadInstanceList();
            },

            moveToValidationTab: function () {
                if (this.currentSubPage === '$ipSelectPage') return;
                // 인증 탭으로는 인스턴스 탭에서 이동할때는 save/validation 후 이동,
                // 어플리케이션 탭에서는 인스턴스 선택 없이 건너뛸 수 없으므로 얼럿 발생
                if (this.currentSubPage === '$instanceSelectPage' && this.savePage(this.currentSubPage)) return;
                if (this.currentSubPage === '$appSelectPage') {
                    swal({type: 'warning', title: '', text: bxMsg('app-deploy.instance-select-instruction'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.$applicationBtn.addClass('on');
                this.$instanceBtn.addClass('on');
                this.$validationBtn.addClass('on');

                this[this.currentSubPage].hide();
                this.currentSubPage = '$ipSelectPage';
                this[this.currentSubPage].show();

                this.loadIpList();
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
                    case '$ipSelectPage':
                        this.saveSelectedIps();
                        if (this.validateIpList.length) {
                            return 0;
                        } else {
                            swal({type: 'warning', title: '', text: bxMsg('app-deploy.ip-select-instruction'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
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

            saveSelectedIps: function () {
                var that = this,
                    selectedIps = that.$ipList.find('.on');
                that.validateIpList = [];

                selectedIps.each(function (i, eachApp) {
                    var params = commonUtil.makeParamFromForm($(eachApp));
                    that.validateIpList.push(params.validIp);
                })
            },

            toggleItemSelection: function (e) {
                var target = $(e.currentTarget);

                if (this.currentSubPage === '$instanceSelectPage') {
                    var param = commonUtil.makeParamFromForm(target);
                    if (param.predeployCount !== '0') {
                        swal({type: 'error', title: '', text: bxMsg('app-deploy.already-pre-deployed-instance-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        this.moveToApplicationTab();
                        return;
                    }
                }

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

            selectValidateTime: function (e) {
                this.timeout = $(e.currentTarget).attr('data-value');

                this.$validateTimeBtn.removeClass('on');
                this.$validateTimeBtns[this.timeout].addClass('on');
            },

            startPreDeploy: function () {
                var that = this;

                if (that.savePage(that.currentSubPage)) return;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('DeployService', 'predeployApplication', 'DeployApplicationOMM', {
                    validateIpList: that.validateIpList.join('|'),
                    timeout: that.timeout,
                    serverPath: that.serverPath,
                    appNames: that.appNames.join('|'),
                    appFileNames: that.appFileNames.join('|'),
                    frmInstanceId: that.frmInstanceId.join('|')
                }), {
                    beforeSend: function () {
                        that.subViews['ipLoadingBar'].show();
                    },
                    success: function (response) {
                        switch (response.ResponseCode.code) {
                            case 300:
                                swal({
                                    type: 'success',
                                    title: '',
                                    text: bxMsg('app-deploy.pre-deploy-success-msg'),
                                    showCancelButton: true,
                                    customClass: 'sweet-alert-button-resize',
                                    confirmButtonText: bxMsg('app-deploy.move-to-deploy-home'),
                                    cancelButtonText: bxMsg('app-deploy.move-to-deploy-history')
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        commonUtil.redirectRoutePage('#MENU00601/SUB01', {
                                            refresh: true
                                        });
                                    } else {
                                        commonUtil.redirectRoutePage('MENU00602', {
                                            refresh: true
                                        });
                                    }
                                });
                                that.moveToApplicationTab();
//                                that.$appSearchPath.val('');
                                that.$appList.html(null);
                                break;
                            case 301:
                                swal({type: 'error', title: '', text: bxMsg('app-deploy.pre-deploy-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                break;
                            default:
                        }
                    },
                    complete: function () {
                        that.subViews['ipLoadingBar'].hide();
                    }
                });
            }
        });
    }
);
