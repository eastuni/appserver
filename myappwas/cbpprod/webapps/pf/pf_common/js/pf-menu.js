/**
 * @fileOverview It provides to Provides the function to create menus.
 * @author BankwareGlobal ProductFactory Team
 */

(function(global) {
	
	/**
	 * The Recursive function for define Icon Menu
	 * 아이콘 메뉴 정의 recursive function
	 * @param {Object} liHtml - Li HTML jQuery Element Object
	 * @param {Array} data - Menu Data Object List
	 * @param {boolean} subMenuYn - Submenu or not
	 * @return {void}
	 */
	function recursiveMakeAsideMenuHtml(liHtml, data, subMenuYn) {
		if(data && data.length > 0) {
			for(var j = 0; j < data.length; j++) {
				
				// 사용여부가 'N' 이면 스킵
				if(data[j].useYn == 'N') continue;
				
				var menuId = data[j].menuId.replace('MENU', '');
				var scrnId = data[j].scrnId.replace('SCRN', '');
				var menuNm = data[j].menuNm.toLowerCase(); // 소문자변환
				var href = data[j].scrnUrlAddr;
				var scrnNm = data[j].scrnNm;
				var scrnClassNm = '';
				var originalMenuNm = data[j].menuNm;
				var objScrnYn = data[j].objScrnYn;

				if(data[j].scrnUrlAddr) {
					try {
						//scrnClassNm = data[j].scrnUrlAddr.substring(data[j].scrnUrlAddr, data[j].scrnUrlAddr.lastIndexOf('/')).substring(1);
						var splitAddr = data[j].scrnUrlAddr.split('/');
						if(splitAddr.length == 4 ) {
							scrnClassNm = splitAddr[2];
						}
					} catch (e) {
					}
				}
				
				// 하위자식이 존재 (중간메뉴)
				if(data[j].leaf == 'N') {
					var liChildMenuHtml = $('<li></li>');
					liChildMenuHtml.addClass(menuId + scrnId);
					liChildMenuHtml.addClass('child-menu child-menu-title');
					//liChildMenuHtml.addClass(scrnClassNm);
					
					liChildMenuHtml.css('border-bottom', '1px solid white');
					liChildMenuHtml.css('cursor', 'default');
					liChildMenuHtml.append('<span>' + originalMenuNm + '</span>');
					
					liHtml.find('ul.product-factory-nav-template').last().append(liChildMenuHtml);
					
					var subMenuUlHtml = $('<ul class="product-submenu-area"></ul>');
					subMenuUlHtml.css('margin-top', '-10px');
					liHtml.find('ul.product-factory-nav-template').last().append(subMenuUlHtml);
					
					if(data[j].children && data[j].children.length > 0) {
						recursiveMakeAsideMenuHtml(liHtml, data[j].children, true);
					}
					
					// 자식이 하나도 없을경우 product-submenu-area element 및 child-menu element 제거
					if(!liHtml.find('ul.product-submenu-area').last().children() || liHtml.find('ul.product-submenu-area').last().children().length < 1) {
						liHtml.find('ul.product-submenu-area').last().prev().remove();
						liHtml.find('ul.product-submenu-area').last().remove();
					}
				}
				// 화면
				else {
					// 서브메뉴의 화면
					if(subMenuYn) {
						var leafLiHtml = $('<li></li>');
						leafLiHtml.addClass(menuId + scrnId);
						leafLiHtml.addClass('child-menu');
						leafLiHtml.css('text-indent', '13px');
						
						// padding-bottom:35px : (메뉴영역) product-submenu-area의 항목이 가장 마지막에 올경우 정의해주어야함
						if(j == (data.length -1)) {
							leafLiHtml.css('padding-bottom', '35px');
						}
						leafLiHtml.append($('<i class="ico_mbox"></i>'));
						leafLiHtml.append('<span style="margin-left:3px;">' + scrnNm + '</span>');

						
						var aHtml = $('<a></a>');
						aHtml.addClass('pf-main-menu-leaf');
						aHtml.addClass(scrnClassNm);
						aHtml.attr('href', href);
						
						aHtml.append(leafLiHtml);
						
						liHtml.find('ul.product-submenu-area').last().append(aHtml);
					}
					else {
						var leafLiHtml = $('<li></li>');
						leafLiHtml.addClass(menuId + scrnId);
						leafLiHtml.addClass('child-menu');
						leafLiHtml.append('<span style="margin-left:3px;">' + scrnNm + '</span>');
						
						var aHtml = $('<a></a>');
						aHtml.addClass('pf-main-menu-leaf');

						if(objScrnYn === 'Y'){
							aHtml.addClass('objScrn');
						}
						
						aHtml.addClass(scrnClassNm);
						aHtml.css('margin-bottom', '-10px');
						aHtml.attr('href', href);

						aHtml.append(leafLiHtml);
						
						liHtml.find('ul.product-factory-nav-template').last().append(aHtml);
					}
				}
			}
		}
	}
	
	/**
	 * The Recursive function for define Accordion Menu
	 * Accordion 메뉴 정의 recursive function
	 * @param {Object} liHtml - Li HTML jQuery Element Object
	 * @param {Array} data - Menu Data Object List
	 * @param {boolean} subMenuYn - Submenu or not
	 * @return {void}
	 */
	function recursiveMakeAccordionMenuHtml(liHtml, data, subMenuYn) {
		if(data && data.length > 0) {
			for(var j = 0; j < data.length; j++) {
				
				// 사용여부가 'N' 이면 스킵
				if(data[j].useYn == 'N') continue;
				
				var menuId = data[j].menuId.replace('MENU', '');
				var scrnId = data[j].scrnId.replace('SCRN', '');
				var menuNm = data[j].menuNm.toLowerCase(); // 소문자변환
				var href = data[j].scrnUrlAddr;
				var scrnNm = data[j].scrnNm;
				var scrnClassNm = '';
				
				if(data[j].scrnUrlAddr) {
					try {
						scrnClassNm = data[j].scrnUrlAddr.substring(data[j].scrnUrlAddr, data[j].scrnUrlAddr.lastIndexOf('/')).substring(1);
					} catch (e) {
					}
				}
				
				// 하위자식이 존재 (중간메뉴)
				if(data[j].leaf == 'N') {
					if(data[j].children && data[j].children.length > 0) {
						recursiveMakeAccordionMenuHtml(liHtml, data[j].children);
					}
				}
				// 화면일때만 처리
				else {
					// 서브메뉴의 화면
					if(subMenuYn) {
					}
					else {
						var leafLiHtml = $('<li></li>');
						leafLiHtml.addClass(menuId + scrnId);
						leafLiHtml.addClass('child-menu');
						leafLiHtml.text(scrnNm);
						
						var aHtml = $('<a></a>');
						aHtml.addClass('pf-main-menu-leaf');
						aHtml.attr('href', href);
						
						aHtml.append(leafLiHtml);
						liHtml.find('ul.product-factory-nav-template').last().append(aHtml);
					}
				}
			}
		}
	}
	
	/**
	 * The function for define icon Menu
	 * 아이콘 메뉴 조립
	 * @param {Array} data - Menu Data Object List
	 * @return {void}
	 */
	function assemblyAsideMenuHtml(data) {
		if(data.useYn == 'N') return;
		var liHtml = $('<li class="bw-btn parent-menu"></li>');
		
		var menuId = data.menuId.replace('MENU', '');
		var scrnId = data.scrnId.replace('SCRN', '');
		var menuNm = data.menuNm.toLowerCase(); // 소문자변환
		
		// 하위자식이 존재
		if(data.leaf == 'N') {
			$(liHtml).addClass(menuNm); // 화면명을 클래스에 추가
			$(liHtml).addClass(menuId + scrnId); // 메뉴ID + 화면ID를 클래스에 추가
			
			var iHtml = $('<i></i>');
			if(data.menuImg) {
				$(liHtml).append(iHtml.addClass(data.menuImg));
			}
			else {
				console.log('## there is no menu image');
				$(liHtml).append(iHtml.addClass('bw-icon i-30 default-menu-img'));
			}
			
			$(liHtml).append('<div class="sub-menu hover-effect"></div>');
			$(liHtml).find('.sub-menu').append('<ul class="product-factory-nav-template"></ul>');
			
			if(data.children && data.children.length > 0) {
				recursiveMakeAsideMenuHtml(liHtml, data.children);
				
				// padding-bottom:35px : (메뉴영역) product-submenu-area의 항목이 가장 마지막에 올경우 정의해주어야함
				if($(liHtml).find('ul.product-factory-nav-template').children().last() && $(liHtml).find('ul.product-factory-nav-template').children().last().length > 0) {
					$(liHtml).find('ul.product-factory-nav-template').children().last().children().last().find('li').css('padding-bottom', '35px');
				}
			}
		}
		else {
			
			$(liHtml).addClass(menuNm); // 화면명을 클래스에 추가
			$(liHtml).addClass(menuId + scrnId); // 메뉴ID + 화면ID를 클래스에 추가
			
			var iHtml = $('<i></i>');
			if(data.menuImg) {
				$(liHtml).append(iHtml.addClass(data.menuImg));
			}
			else {
				console.log('## there is no menu image');
				$(liHtml).append(iHtml.addClass('default-menu-img'));
			}
		}
		
		$(asideMenuHtml).find('ul.fav').append(liHtml);
	}
	
	/**
	 * The function for define accordion Menu
	 * accordion 메뉴 조립
	 * @param {Array} data - Menu Data Object List
	 * @return {void}
	 */
	function assemblyAccordionMenuHtml(data) {
		if(data.useYn == 'N') return;
		var liHtml = $('<li class="parent-menu"></li>');
		
		var menuId = data.menuId.replace('MENU', '');
		var scrnId = data.scrnId.replace('SCRN', '');
		var menuNm = data.menuNm.toLowerCase(); // 소문자변환
		var originalMenuNm = data.menuNm;
		
		// 하위자식이 존재
		if(data.leaf == 'N') {
			$(liHtml).addClass(menuNm); // 화면명을 클래스에 추가
			$(liHtml).addClass(menuId + scrnId); // 메뉴ID + 화면ID를 클래스에 추가
			
			var h3Html = $('<h3></h3>');
			
			var iHtml = $('<i></i>');
			if(data.menuImg) {
				h3Html.append(iHtml.addClass(data.menuImg));
			}
			else {
				console.log('## there is no menu image');
				h3Html.append(iHtml.addClass('default-menu-img'));
			}
			h3Html.append('<span>' + originalMenuNm + '</span>');
			$(liHtml).append(h3Html);
			$(liHtml).append('<ul class="bw-sub product-factory-nav-template"></ul>');
			
			if(data.children && data.children.length > 0) {
				recursiveMakeAccordionMenuHtml(liHtml, data.children);
			}
		}
		// 하위자식이 미존재 ( level == 0 이 하위자식이 미존재할 수 없음)
		else {
			$(liHtml).addClass(menuNm); // 화면명을 클래스에 추가
			$(liHtml).addClass(menuId + scrnId); // 메뉴ID + 화면ID를 클래스에 추가
			
			var iHtml = $('<i></i>');
			if(data.menuImg) {
				$(liHtml).append(iHtml.addClass(data.menuImg));
			}
			else {
				console.log('## there is no menu image');
				$(liHtml).append(iHtml.addClass('default-menu-img'));
			}
		}
		
		$(accordionMenuHtml).find('div#accordion').append(liHtml);
	}
	
	// 역할별권한정보별로 메뉴 조립
	if(parent.g_menu_data && parent.g_menu_data.menuAllInfoList && parent.g_menu_data.menuAllInfoList.length > 0) {
		
		// 아이콘 메뉴
		var asideMenuHtml 
		= $('<aside class="aside add-shadow">'
		+  		'<ul class="fav">'
		+		'</ul>'
		+ 		'<button type="button" class="bw-btn-fold fix-btm open-menu-btn" id="menu_open" ><i class="fa i-25 fa-angle-double-right"></i></button>'
		+'</aside>');
		
		// accordion 메뉴
		var accordionMenuHtml
		= $('<nav id="side_menu" class="side-nav add-shadow">'
		+ 		'<section id="main-menu" class="main-menu">'
		+			'<div id="accordion" class="bw-accordion">'
		+			'</div>'
		+		'</section>'
		+ 		'<button type="button" class="bw-btn-fold fix-btm close-menu-btn" id="menu_close"><i class="fa i-30 fa-angle-double-left"></i></button>');
		
		//////////////////////////////////////////////////////////////////////////////////////
		for(var i = 0; i < parent.g_menu_data.menuAllInfoList.length; i++) {
			// 아이콘 메뉴 조립
			assemblyAsideMenuHtml(parent.g_menu_data.menuAllInfoList[i]);
			// accordion 메뉴 조립
			assemblyAccordionMenuHtml(parent.g_menu_data.menuAllInfoList[i]);
		}
	}
	
	/**
	 * The function for define hidden Menu
	 * 숨겨야되는 메뉴 별도 조립
	 * @param {Array} data - Menu Data Object List
	 * @return {void}
	 */
	function assemblyHiddenScreen(data) {
		var scrnId = data.scrnId;
		var href = data.scrnUrlAddr;
		
		var aHtml = $('<a></a>');
		aHtml.addClass(scrnId);
		aHtml.addClass('pf-main-menu-leaf');
		aHtml.attr('href', href);
		
		var leafLiHtml = $('<li></li>');
		leafLiHtml.addClass('child-menu');
		aHtml.append(leafLiHtml);
		hiddenDiv.append(aHtml);
	}
	
	// Hidden Screen 조립
	if(parent.g_hidden_data && parent.g_hidden_data.length > 0) {
		var hiddenDiv 
		= $('<div class="hidden-screen-area" style="display:none;"></div>');
		for(var j = 0; j < parent.g_hidden_data.length; j++) {
			assemblyHiddenScreen(parent.g_hidden_data[j]);
		}		
	}
	
	$('.product-factory-main-menu').html(asideMenuHtml).append(accordionMenuHtml).append(hiddenDiv);
	
    // 좌측메뉴 숨김 / 펼처짐 버튼 클릭 처리
    $('#menu_open').click(function(){
        $('#side_menu').animate({left:'0'}, 10);
        $('.pf-workspace').css('padding-left', '200px');
        $('.side-nav').css('display', 'block');
        $('.tab-nav-bar').css('left', '200px');
    });
    $('#menu_close').click(function(){
        $('#side_menu').animate({left:'-100%'}, 10);
        $('.pf-workspace').css('padding-left', '35px');
        $('.side-nav').css('display', 'none');
        $('.tab-nav-bar').css('left', '35px');
        $('.tab-nav-arrow.arrow-left').css('right', '35px');
        $('.tab-nav-arrow.arrow-right').css('right', '50px');
    });

    // 메뉴 accordion 처리
    $( "#accordion" ).accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });
})(window);