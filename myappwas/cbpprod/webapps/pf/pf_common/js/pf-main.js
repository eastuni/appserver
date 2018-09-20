/**
 * @fileOverview It provides the main tab functions and context menu.
 * @author BankwareGlobal ProductFactory Team
 */

var myTaskMenuTpl;

PFUI.use('pfui/tab',function(Tab){

    var tab = new Tab.NavTab({
        render:'.pf-workspace',
        height: '100%',
        listeners: {
            activedchange: function(tab) {
                changeLayout(tab.item.__attrVals.href);
                setTabLayoutCss();
                // OHS 20161129 추가, product-compare화면으로 탭이동하였을때 처리로직 추가
                doSetProductCompareList(tab.item.__attrVals.href);
            },
		    
            closed : function(e) {
		       // OHS20180213 추가 - 상품비교 또는 상품검색 화면을 닫을경우 상품목록 리스트를 초기화시켜준다.
		       if(e.target.__attrVals.href  == '/finder/product_compare/index.htm'
		          && $('.compare-product-list').find('input')
		          && $('.compare-product-list').find('input').length > 0) {
		          $('.compare-product-list').empty();                  
		       }
		    }
        }
    });

    /**
     * The Function is Menu Click Event 
     * @return {void}
     */
    $('.product-factory-main-menu').on('click', '.pf-main-menu-leaf', function(e) {
        var $clickedMenu = $(this),
            targetUrl,
            menuData;

        if($clickedMenu.attr('href') == '/finder/product_search/index.htm'
            && $(parent.document).find('.product-compare-tab')
            && $(parent.document).find('.product-compare-tab').length == 0) {
            menuData = {
                id: $clickedMenu.attr('href'),
                title: $clickedMenu.text().trim(),
                href: $clickedMenu.attr('href')
            };
        }
        else {
            menuData = {
                title: $clickedMenu.text().trim(),
                href: $clickedMenu.attr('href')
            };
        }

        if($clickedMenu.hasClass('objScrn')){
            var parameter = {
                tntInstId: getLoginTntInstId(),
                motherTntInstId: getMotherTntInstId(),
                objectId : $clickedMenu.attr('href')
            }
        
            $(parent.document).find('.hidden-screen-area').find('.SCRN045').attr('parameter', JSON.stringify(parameter));
            $(parent.document).find('.hidden-screen-area').find('.SCRN045').find('li').text(menuData.title); // Tab Menu명은 Object명
            $clickedMenu = $(parent.document).find('.hidden-screen-area').find('.SCRN045');
            targetUrl =  '/setting/eav_model/eav_sub/index.htm';
            menuData.href = '/setting/eav_model/eav_sub/index.htm';
        }else{
            targetUrl = $(e.currentTarget).attr('href');
        }

        e.preventDefault();

        // 상품비교화면이 1개이상열려있을경우 새로운탭을 만들지않고 기존 상품비교화면탭을 open
        if($clickedMenu.attr('href') == '/finder/product_search/index.htm'
            && $(parent.document).find('.product-compare-tab')
            && $(parent.document).find('.product-compare-tab').length == 0) {

            tab.addTab(menuData);

            var menuCompareData = {
                id : '/finder/product_compare/index.htm',
                title : bxMsg('productCompare'),
                href : '/finder/product_compare/index.htm'
            }
            tab.addTab(menuCompareData);

            tab.setActived($clickedMenu.attr('href'));
        }
        else if($clickedMenu.attr('href') == '/finder/product_search/index.htm'
            && $(parent.document).find('.product-compare-tab')
            && $(parent.document).find('.product-compare-tab').length > 0) {

            tab.addTab(menuData);
        }
        else {
            tab.addTab(menuData);
        }
        changeLayout(targetUrl);

    });

    /**
     * Set Tab layout Cascading Style Sheet
     * @return {void}
     */
    function setTabLayoutCss(){
        // 탭 개수가 많아서 화면 width를 넘어갈 경우
    	// 138 -> 160 변경
        if($('.tab-nav-inner').width() - 160 < $('.tab-nav-list').children().length * 160) {
            $('.tab-nav-arrow').show();
            // 20160912 OHS
            $('.pfui-nav-tab .tab-nav-wrapper').css('margin', '0 0px');
        }else{
            $('.tab-nav-arrow').hide();
            $('.pfui-nav-tab .tab-nav-wrapper').css('margin', '0');
        }
    }

    /**
     * View or hide project combo by screen
     * @param {String} href - Screen Url
     * @return {void}
     */
    function changeLayout(href) {

        if(href == '/finder/product_compare/index.htm') {
            $(parent.document).find('.tab-nav-list .tab-nav-actived').addClass('product-compare-tab');
        }

        if(href == '/planner/project/index.htm' ||
            href == '/configurator/product/index.htm' ||
            href == '/configurator/service/index.htm' ||
            href == '/configurator/point/index.htm' ||
            href == '/configurator/common/index.htm' ||
            href == '/configurator/classification/index.htm' ||
            href == '/configurator/base_interest/index.htm' ||
            href == '/designer/product_template/index.htm'||
            href == '/designer/service_template/index.htm'||
            href == '/designer/point_template/index.htm' ||
            href == '/designer/condition_template/index.htm' ||
            href == '/designer/condition_group_template/index.htm' ||
            href == '/finder/product_search/index.htm' ||
            href == '/configurator/product_group/index.htm' ||
            // OHS 2017.02.23 추가 - 화면신규개발
            href == '/configurator/service_group/index.htm' ||
            href == '/configurator/merchant_group/index.htm' ||
            href == '/configurator/fee_discount_integration/index.htm' ||
            href == '/configurator/interest_rate_structure/index.htm' ||
            href == '/marketing/marketing_priority/index.htm' ||
            href == '/configurator/calculator/index.html' ||
            href == '/designer/calculation_compose_template/index.html' ||
            href == '/configurator/calculation_formula/index.html' ||
            href == '/designer/calculation_unit_template/index.html' ||
            href == '/configurator/contents_group/index.htm'
            || href == '/configurator/interest_calculation_section_determine_rule/index.htm'
            || href == '/designer/interest_calculation_section_type/index.htm'
            || href == '/designer/interest_calculation_determine_condition/index.htm'
        ) {
            $('.default-layout-task-menu').show();
        }else{
            $('.default-layout-task-menu').hide();
        }

        setProjectId(href);

    }

    /**
     * Set Project ID stored on each tab
     * @param {String} href - Screen Url
     * @return {void}
     */
    function setProjectId(href){
        // 탭이 열리면서 탭별 task-id 세팅을위해 아래와같이 로직을 처리한다.
        if(href == '/configurator/product/index.htm') {
            // 탭간 이동시에 task-id disabled처리를 위해 yn attribute 세팅
            $(parent.document).find('.tab-nav-list .tab-nav-actived').attr('only-one-task-id-yn', 'Y');
        }
        var projectId = $(parent.document).find('.tab-nav-list .tab-nav-actived').attr('save-tab-project-id'); // 수정권한이있는 task-id
        var projectNm = $(parent.document).find('.tab-nav-list .tab-nav-actived').attr('save-tab-project-nm'); // 수정권한이없는 task-id

        // 수정권한이 있는 task-id일경우
        if(projectId) {
            $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeAttr('data-status');
            $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).addClass('task-hide');
            $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).removeClass('task-hide');
            $($('.default-layout-task-menu .my-task-list option[value="' + projectId + '"]')[0]).prop('selected', true)

            // 20161102 상품화면만 현재 처리, 상품이 이미 task-id와 연결되어있는경우 변경못하도록 disabled처리
            if(href == '/configurator/product/index.htm') {
                $('.default-layout-task-menu .my-task-list').prop('disabled', true);
            }
            else {
                $('.default-layout-task-menu .my-task-list').prop('disabled', false);
            }
        }
        // 수정권한이 없는 task-id일경우
        else if(projectNm) {
            $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status','true');
            $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeClass('task-hide');
            $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).val(projectNm);
            $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).addClass('task-hide');
        }
        // task-id가 없는탭일경우 초기상태로 세팅
        else {
            $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeAttr('data-status');
            $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).addClass('task-hide');
            $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).removeClass('task-hide');

            $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option').eq(0).prop('selected',true);
            $('.default-layout-task-menu .my-task-list').prop('disabled', false);
        }
    }

    /**
     * Delete Product Compare List list when tab selected on Product Compare screen
     * @param {String} href - Screen Url
     * @return {void}
     */
    function doSetProductCompareList(href) {
        if(href == '/finder/product_compare/index.htm') {
            if($('iframe') && $('iframe').length > 0) {
                $('iframe').each(function () {
                    if($(this).attr('src') == '/finder/product_compare/index.htm') {
                        // undefined 일때는 탭을 처음으로 열때이므로 처리하지않음.
                        if($(this).context.contentWindow.renderCompareProductList == undefined) return;
                        // 비교대상 상품목록 탭으로 표현 메소드 호출
                        $(this).context.contentWindow.renderCompareProductList();
                    }
                });
            }
        }
    }
    tab.render();
    $('.tab-nav-arrow.arrow-left').addClass("fa fa-angle-right");
    $('.tab-nav-arrow.arrow-right').addClass("fa fa-angle-left");
});

$('body').on('contextmenu', '.pfui-nav-tab-item', function(e){
    $('.pfui-context-menu').find('li').eq(0).find('.pfui-menu-item-text').text(bxMsg('refresh'));
    $('.pfui-context-menu').find('li').eq(1).find('.pfui-menu-item-text').text(bxMsg('ContextMenu_Close'));
    $('.pfui-context-menu').find('li').eq(2).find('.pfui-menu-item-text').text(bxMsg('etc_close'));
    $('.pfui-context-menu').find('li').eq(3).find('.pfui-menu-item-text').text(bxMsg('all_close'));
});