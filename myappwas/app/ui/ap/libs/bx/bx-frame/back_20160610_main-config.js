/***  RequireJS(AMD) Setting  ***/
/*
 * 메인메뉴를 전체 가져 오던것을 상위메뉴를 조회하고 상위메뉴 클릭시 하위메뉴로 가져 오는것으로 변경하기위하여\
 * 이전 버전은 백업 시켜 놓았다.
 * 
 * 관련 수정 파일 목록 
 * 
 */
require.config({
    urlArgs: 'v=' + new Date().getTime(),
    paths: {
        'text': '/libs/bx/bx-vendor/require/text-2.0.10'
        , 'bx': '/libs/bx/bx-frame'
    	, 'bx-component': '/libs/bx/bx-ui/component'
		, 'bx-util': '/libs/bx/bx-util'
		, app: '/scripts'
    },
    baseUrl: ''
});

define(
    function () {
        function boot(initConfig) {
            /***  Handlebars(Template ENgine) Setting  ***/
            Handlebars.registerHelper('bxMsg', function (keyword) {
                return bxMsg(keyword) || keyword;
            });

            /***  Message Setting  ***/
            var messageList = _.union(['main.json'], initConfig.messageList);
            var currentLocale = $.cookie('locale');
            var messageRoot = '/scripts/messages';

            if (currentLocale == undefined) {
                currentLocale = sessionStorage.lngCd.replace(/"/gi, '');
            }

            bxMsg.init({
                locale: currentLocale,
                messageRoot: messageRoot,
                messageList: messageList
            });

            require(
                [
                    'bx/common/config',
                    'bx-component/message/message-alert',
                    'bx-component/message/message-error-log',
                    'bx/views/main',
                    'bx/common/common-info'
                ],
                function (config,
                          alertMessage,
                          errorLog,
                          MainView,
                          commonInfo) {
                    var emptyMsgTpl = Handlebars.compile($('#bxt-empty-msg-tpl').html());
                    var mainView = new MainView();

                    config.pageMap = {};
                    config.pageSrcMap = initConfig.pageSrcMap;
                    config.currentLocale = currentLocale;

//                    $('#main .empty-message-wrap').html(emptyMsgTpl());

                    $(window).resize(function () {
                        $('.manual-resize-component:visible').trigger('resize-component');
                    });

                    bootApp();

                    function bootApp(option) {
                        initBxProxy();
                        extendJQuery();
                        extendXDateParser();
                        startApp(option);
                    }

                    function initMenu() {
                        var param = {};
                        
                        param.header = fn_getHeader('CAPSV0108403');
                        param.LogInSvcGetLoginUserIn = {};

                        bxProxy.post(sUrl, JSON.stringify(param), {
                        	enableLoading: true,
                            success: function (response) {
                            	var rootMenuList = [];
                            	
                            	if(typeof response.CaMenuMgmtSvcGetUserMenuListOut != "undefined") {
                            		rootMenuList = response.CaMenuMgmtSvcGetUserMenuListOut.menuItmList;
                            	}

                                mainView.renderRootMenu(rootMenuList);
                                commonInfo.setMenuMap(rootMenuList);
                                initMenuPageMap(rootMenuList);

                                var renderInfo = {
                                    startPage: config.userInfo.startPage,
                                    menuList: rootMenuList,
                                    custMode: sessionStorage.custMode
                                }

                                mainView.render(renderInfo);

                                $('#bxt-init-loading-wrap').remove();
                                
//                                createMenuListFile(rootMenuList);
                                
                            }
	                        , error : function(response) {
	                        	alert(response);
	                        }
                        });
                    }
                    
                    function createMenuListFile(rootMenuList) {
                    	if(!rootMenuList) {
                    		return;
                    	}
                    	
                    	//메뉴 목록을 로컬 위치에 파일로 넣는다.
                        var ua = navigator.userAgent.toLowerCase();
                        
                        console.log("aaaaaaaaaaaaa");
                        console.log(ua);
                        
                        var filename = "menu-list-"+getCurrentDate("yyyymmdd");
//                        filename = (ua.indexOf('windows') != -1 ? 'C:\\tmp\\cbp\\' : '/tmp/cbp/') + filename+".text";
                        
                        try {
                        	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                        	
                        	if (ua.indexOf('chrome') != -1) {  // Google Chrome
//                        		var fileSysObj=new ActiveXObject('Scripting.FileSystemObject');
//                        		var fsoText=fileSysObj.CreateTextFile(filename, true);
//                        		fsoText.WriteLine(rootMenuList);
//                        		fsoText.Close();
                        		
                        		function errorCallback(e) {
                        			alert('Error: ' + e.code);
                        		}
//                        		
                        		function fsCallback(fs) {
                        			console.log(fs);
                        			console.log(filename);
                        			fs.root.getFile(filename+".txt", {create: true}, function(fileEntry) {
                        				console.log("2222222222222");
                        				console.log(fileEntry);
                        				fileEntry.createWriter(function(fileWriter) {
                        				
                        					fileWriter.onwriteend = function(e) {
                        						alert('성공');
                        					};
                        					
                        					fileWriter.onerror = function(e) {
                        						alert('Failed: ' + e);
                        					};
                        					
                        					var bb = new WebKitBlobBuilder();
                        					console.log("1111");
                        					bb.append(rootMenuList);
                        					console.log("2222");
                        					var output = bb.getBlob('text/plain');
                        					console.log("3333");
                        					fileWriter.write(output);
                        					console.log("4444");
                        				}, errorCallback);
                        			}, errorCallback);
                        		}
                        		
                        		/*  로컬 시스템상에 파일을 생성함 */
                        		function createLocalFile() {
                        		    filesystem.root.getFile('log.txt', {create: true, exclusive: true}, 
                        		       function(fileEntry) {
                        		          //console.log("생성된 파일의 절대경로", fileEntry.fullPath);
                        		          printMsg("생성된 파일의 절대경로" + fileEntry.fullPath);
                        		       }, 
                        			   errorCallback 
                        			);
                        		}

                        		
                        		console.log("start");
                        		// 호출
                        		window.requestFileSystem(webkitStorageInfo.PERSISTENT, 1024*1024, fsCallback, errorCallback);
                        		console.log("end");
                        	}
                        	 
                    		
                        }catch (e) {
                    	    alert('Error: ' + e);
                    	}
                        
                        

//                      try {
//                  	    if (ua.indexOf('firefox') != -1) {  // Firefox
//                  		filename = (ua.indexOf('windows') != -1 ? 'C:\\tmp\\' : '/tmp/') + filename;
//                  		// ローカルファイルにアクセスする権限を取得
//                  		// fileスキームじゃない場合は about:config で
//                  		// signed.applets.codebase_principal_support を true にする必要あり;
//                  		netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
//                  		// ファイルコンポーネントの取得＋ローカルファイル操作用のインターフェイスの取得;
//                  		var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
//                  		file.initWithPath(filename);
//                  		var fileStream = Components
//                  		    .classes['@mozilla.org/network/file-output-stream;1']
//                  		    .createInstance(Components.interfaces.nsIFileOutputStream);
//                  		// ファイルが存在しない場合は664の権限で新規作成して書き込み権限で開く
//                  		// cf. https://developer.mozilla.org/en/NsIFileOutputStream
//                  		//     http://www.oxymoronical.com/experiments/apidocs/interface/nsIFileOutputStream;
//                  		fileStream.init(file,
//                  				0x02 | 0x08,  // 0x01: 読み取り専用, 0x02: 書き込み, 0x03: 読み書き, 0x08: 新規作成, 0x10: 追記
//                  				0664,         // mode
//                  				0             // 第4引数は現在サポートしていないとか
//                  			       );
//                  		// cf. http://www.oxymoronical.com/experiments/apidocs/interface/nsIConverterOutputStream
//                  		var converterStream = Components
//                  		    .classes['@mozilla.org/intl/converter-output-stream;1']
//                  		    .createInstance(Components.interfaces.nsIConverterOutputStream);
//                  		converterStream.init(fileStream, 'UTF-8', content.length,
//                  				     Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
//                  		converterStream.writeString(content);
//                  		converterStream.close();
//                  		fileStream.close();
//                  		alert('書き込みが完了しました！');
//                  	    } else if (ua.indexOf('chrome') != -1) {  // Google Chrome
//                                 // 起動オプションに --unlimited-quota-for-files --allow-file-access-from-files をつける必要あり
//                  	
//                      	function errorCallback(e) {
//                  		    alert('Error: ' + e.code);
//                  		}
//                      
//                  		function fsCallback(fs) {
//                  		    fs.root.getFile(filename, {create: true}, function(fileEntry) {
//	                    			fileEntry.createWriter(function(fileWriter) {
//	                    			    fileWriter.onwriteend = function(e) {
//	                    			    	alert('書き込みが完了しました！');
//	                    			    };
//	                    			    fileWriter.onerror = function(e) {
//	                    			    	alert('Failed: ' + e);
//	                    			    };
//	                    			    var bb = new WebKitBlobBuilder();
//	                    			    	bb.append(content);
//	                    			    var output = bb.getBlob('text/plain');
//	                    			    	fileWriter.write(output);
//	                    			}, errorCallback);
//                  		    }, errorCallback);
//                  		}
//                  		// 現時点ではたぶん第1引数はPERSISTENTもTEMPORARYディレクトリ名が異なるだけだし、
//                  		// 第2引数は極端な話0でもOK
//                  		webkitRequestFileSystem(PERSISTENT, 1024, fsCallback, errorCallback);
//                  	    } else if (ua.indexOf('msie')) {  // MS IE
//                  		filename = 'C:\\tmp\\' + filename;
//                  		// インターネットオプションで「スクリプトを実行しても安全だとマークされていない
//                  		// ActiveX コントロールの初期化とスクリプトの実行（セキュリティで保護されていない）」
//                  		// を有効にする必要あり
//                  		var fso = new ActiveXObject('Scripting.FileSystemObject');
//                  		// ファイルを新規作成して書き込みモードで開く (文字コードはUTF-16)
//                  		// cf. http://msdn.microsoft.com/ja-jp/library/cc428044.aspx
//                  		//     http://msdn.microsoft.com/ja-jp/library/cc428042.aspx
//                  		var file = fso.OpenTextFile(filename,
//                  					    2,     // 1: 読み取り専用, 2: 書き込み, 8: 追記
//                  					    true,  // ファイルが存在しなければ新規作成するかどうか
//                  					    -1     // -2: OSのデフォルト文字コード, -1: UTF-16, 0: ASCII
//                  					   );
//                  		file.Write(content);
//                  		file.Close();
//                  		alert('書き込みが完了しました！');
//                  		/*
//                  		 * ADODB.Stream を使う場合（レジストリをいじっても何故か書き込めない・・・）
//                  		 */
//                  		// var adodbStream = new ActiveXObject('ADODB.Stream');
//                  		// adodbStream.type = 2;  // テキストファイル（バイナリは1）
//                  		// adodbStream.charset = 'UTF-8';
//                  		// adodbStream.open(filename);
//                  		// adodbStream.writeText(content);
//                  		// adodbStream.saveToFile(filename, 2);  // 上書き保存（1だと新規作成のみが対象）
//                  		// adodbStream.close();
//                  	    } else {
//                  		alert('エラー: ローカルファイルへの書き込み方がわかりません・・・');
//                  	    }
//                  	} catch (e) {
//                  	    alert('Error: ' + e);
//                  	}
                        
                    }
                    
                    function initBxProxy() {
                        // bxProxy Setting
                        bxProxy.preSet({
                            commonSuccessHandler: function (response) {
                                var responseObj = typeof response === 'object' || JSON.parse(response),
                                    currentDateTime = '[' + XDate().toString('yyyy-MM-dd hh:mm:ss') + '] ';

                                if (responseObj.header && responseObj.header.returnCode != '0') {
                                    //mainView.printErrorLog(currentDateTime + responseObj.header);
                                    responseObj.header.errorMessages.forEach(function (errorMsg, i) {
                                        mainView.printErrorLog(currentDateTime + errorMsg.messageCode + ",\n" + errorMsg.message + ",\n" + errorMsg.detailMessage);
                                    });
                                }
                            },
                            commonErrorHandler: function (jqXHR) {
                                var currentDateTime = XDate().toString('yyyy-MM-dd hh:mm:ss'),
                                    errorTitle = jqXHR.statusText + ' Status:' + jqXHR.status,
                                    errorDetail = jqXHR.responseText;

                                // When Expired Session
                                //if(jqXHR.status === 444) {
                                //    new LoginPopup().render();
                                //    return;
                                //}
                                mainView.printErrorLog('[' + currentDateTime + '] ' + errorTitle + '-' + errorDetail);
                            }
                        });
                    }

                    function initRouter(Router) {
                        new Router();
                        Backbone.history.start();
                    }

                    function startApp(option) {
                        if (option) {
                            option.Router && initRouter(option.Router);
                        }

                        initUserInfo();
                        initMenu();
                    }

                    function initUserInfo() {
                        var startPage = initConfig.startPageByRole['default'];

                        config.userInfo = {
                            id: sessionStorage.id,
                            name: sessionStorage.name,
                            role: null, // FIXME
                            startPage: startPage,
                            locale: currentLocale
                        };
                    }

                    function initMenuPageMap(menuList) {
                        menuList.forEach(function (menu, i) {
                            var menuKey = menu.scrnNbr,
                                compositionKey = menuKey;

                            if (menuKey) {
                                if (menu.handlerArg) {
                                    compositionKey = menuKey + ':' + menu.handlerArg;
                                }

                                menu.src = initConfig.pageSrcMap[menuKey];
                                menu.name = menu.menuNm;

                                config.pageMap[compositionKey] = menu;
                            }

                            if ($.isArray(menu.children)) {
                                initMenuPageMap(menu.children);
                            }
                        });
                    }

                    function extendJQuery() {
                        $.fn.elementReady = function (afterRenderFn) {
                            checkRendering(this, afterRenderFn);
                        };

                        $.elementReady = function (selector, afterRenderFn) {
                            checkRendering(selector, afterRenderFn);
                        };

                        function checkRendering(element, afterRenderFn) {
                            var findTime = 0, checkInterval = setInterval(function () {
                                if ($(element).length > 0) {
                                    clearInterval(checkInterval);
                                    afterRenderFn();
                                    return;
                                }

                                findTime += 100;

                                if (findTime >= 2000) {
                                    clearInterval(checkInterval);
                                    throw 'DOM Ready Time Out By YG';
                                }

                            }, 100);
                        }
                    }

                    function extendXDateParser() {
                        XDate.parsers.push(function (dateStr) {
                            var targetStr = dateStr.split(' ')[0], resultStr = '';

                            for (var i = 0; i < 8; i++) {
                                resultStr += targetStr[i];

                                if (i === 3 || i === 5) {
                                    resultStr += '-';
                                }
                            }

                            return new XDate(resultStr);
                        });
                    }
                }
            );
        }

        return {boot: boot};
    }
);