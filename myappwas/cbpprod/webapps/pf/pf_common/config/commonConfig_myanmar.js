/**
 * Created by yanggwi on 14. 12. 4..
 */



(function(global) {

    var mainMenus = [
        {
            elSelector: '.pf-main-menu .menu-item-planner',
            subMenus: [{
                id:'planner-task-management',
                content : 'Task Management'
            }]
        },
        {
            elSelector: '.pf-main-menu .menu-item-designer',
            subMenus: [{
                id: 'designer-product-template',
                content : 'Product Template'
            }, {
                id: 'designer-condition-group-template',
                content : 'Condition Group Template'
            }, {
                id: 'designer-condition-template',
                content : 'Condition Template'
            }]
        },
        {
            elSelector: '.pf-main-menu .menu-item-configuration',
            subMenus: [{
                id: 'configurator-product',
                content : 'Product'
            }]
        },
        {
            elSelector: '.pf-main-menu .menu-item-distributor',
            subMenus: [{
                id: 'distributor-execution-distribution',
                content : 'Execution Distributor'
            }]
        },
        {
            elSelector: '.pf-main-menu .menu-item-ui-sample',
            subMenus: [{
                id: 'panel-tree-button',
                content : 'Panel / Tree / Button '
            }, {
                id: 'message-popup-form',
                content : 'Message / Popup / Form'
            }, {
                id: 'deadly-component',
                content : 'Deadly Component'
            }]
        }
    ];

    var renderedComponentMap = { };

    var userInfo = {
        id: 'user001',
        name: 'Kim',
        department: 'Dev Team'
    };

    global.commonConfig = {
        mainMenus: mainMenus,
        renderedComponentMap: renderedComponentMap,
        userInfo: userInfo,
        currentXDate: XDate()
    };

    global.taskList = {};

    // server service type 설정
    global.g_springService = '01';
    global.g_bxmService = '02';
    global.g_serviceType = g_springService;

    // next 계산 시
    var g_nextDate_dev = 0;
    var g_nextDate_prod = 1;
    global.g_nextDate = g_nextDate_prod;

    //파일다운로드시 사용하는 cosdownload.jsp 파일을 호출할때 root이후에 붙을 추가적인 context 경로를 설정합니다.
    // kbank : '/pfap'
    global.g_cosdownloadContext = '';

    global.g_emergency = '003';     // emergency project type code

})(window);
