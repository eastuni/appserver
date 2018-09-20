// RequireJS 설정
require.config({
    urlArgs: 'v=' + (new XDate()).toString('yyyyMMdd'),
    paths: {
        text: '../libs/require/text-2.0.10.min'
    }
});

// 다국어 처리
Handlebars.registerHelper('bxMsg', function (keyword) {
    return bxMsg(keyword) || keyword;
});

bxMsg.init({
    locale: getLocale(),
    messageRoot: 'scripts/messages',
    messageList: [
        'login'
    ]
});

function getLocale() {
    var browserLocale = navigator.language || navigator.browserLanguage,
        locale = $.cookie('bxm-admin-locale');

    if (!locale || locale === 'null') {
        locale = browserLocale;

        if (locale.indexOf('ko') !== -1) {
            locale = 'ko';
        } else if (locale.indexOf('en') !== -1) {
            locale = 'en';
        }
    }

    return locale;
}

// 로그인 처리
require(
    [
        'common/util',
        'common/component/loading-bar/_loading-bar'
    ],
    function (
        commonUtil,
        LoadingBar
    ) {
        var that = this,
            loginContainerTpl,
            $loginWrap,
            requestParam;

        // 로그인 폼 렌더링
        $loginWrap = $('.login-wrap');
        loginContainerTpl = Handlebars.compile($('#login-container').html());
        $loginWrap.html(loginContainerTpl());

        // 로딩바 추가
        that.loadingBar = new LoadingBar();
        $loginWrap.append(this.loadingBar.render());

        // 다국어 로드
        // 요청 객체 생성
        requestParam = commonUtil.getBxmReqData('AuthorityService', 'getLangCd', 'LoginOMM', {
            lang: getLocale()
        });

        // Ajax 요청
        commonUtil.requestBxmAjax(requestParam, {
            success:  function(response) {
                var langList = response.ComCdListOMM.cdGrpList[0].cdList,
                    optionTagList = [];

                langList.forEach(function(lang) {
                    optionTagList.push('<option value="' + lang.cdVal +'">' + lang.cdDesc + '</option>');
                });

                $loginWrap.find('[name="lang"]').html(optionTagList);
                if (response.ComCdListOMM.localeNoUse) {
                    $loginWrap.find('.language-selection').hide();
                    $loginWrap.find('[name="lang"]').val('ko');
                } else {
                	$loginWrap.find('.login-container').height(480); //resize box cause of domain select box
                }

                $loginWrap.children('.login-container').show();
            }
        }, true);
        
        // Domain Load
        // 요청 객체 생성
        requestParam = commonUtil.getBxmReqData('AuthorityService', 'getDomainList', 'EmptyOMM');

        // Ajax 요청
        commonUtil.requestBxmAjax(requestParam, {
            success:  function(response) {
                var domainList = response.DomainListOMM.domainIdList,
                    optionTagList = [];

                domainList.forEach(function(domain) {
                    optionTagList.push('<option value="' + domain.domainId +'">' + domain.domainId + ' ('+ domain.domainNm +')' + '</option>');
                });

                $loginWrap.find('[name="domain"]').html(optionTagList);
//                $loginWrap.children('.login-container').show();
            }
        }, true);

        // 로그인 이벤트 리스너 처리
        $('#login-btn').on('click', function (e) {
            var $loginForm = $('#login-form'),
                lang = $loginForm.find('select[name=lang]').val(),
                userId = $loginForm.find('input[name=userId]').val().trim(),
                userPwd = $loginForm.find('input[name=userPwd]').val().trim(),
                domain = $loginForm.find('select[name=domain]').val();

            $.cookie('bxm-admin-locale', lang);

            e.preventDefault();

            // 필수값 체크
            if (userId === '') {
                swal({type: 'warning', title: '', text: bxMsg('login.type-id-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                return false;
            } else if (userPwd === '') {
                swal({type: 'warning', title: '', text: bxMsg('login.type-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                return false;
            }

            that.loadingBar.show();
            // 언어 체크
            $.ajax({
                url: './scripts/messages/' + lang + '/common.json',
                async: false,
                dataType: 'json',
                success: function () {
                    // 로그인
                    var requestParam;

                    // 요청 객체 생성
                    requestParam = commonUtil.getBxmReqData(
                        'AuthorityService', 'loginOperation', 'LoginOMM',
                        {
                            userId: userId,
                            userPwd: userPwd,
                            lang: lang,
                            domainId: domain
                        }
                    );

                    // Ajax 요청
                    commonUtil.requestBxmAjax(requestParam, {
                        success:  function(response) {
                            var code = response.ResponseCode.code;

                            if(code === 100){
                                commonUtil.redirectMainPage();
                            }else if(code === 101){
                                that.loadingBar.hide();
                                swal({type: 'error', title: '', text: bxMsg('login.id-not-found'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            }else if(code === 102){
                                that.loadingBar.hide();
                                swal({type: 'error', title: '', text:  bxMsg('login.password-fail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            }
                        }
                    }, true);
                },
                error: function(response) {
                    that.loadingBar.hide();
                    (response.status === 404) && swal({type: 'warning', title: '', text: bxMsg('login.select-lang-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                }
            });
        });
    });



