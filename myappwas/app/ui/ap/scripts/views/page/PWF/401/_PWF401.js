// Generated by Bankware Global CBB Solution Center on 2015-02-04 오전 12:48:27


define(
  [
      'app/views/page/PWF/401/PWF401-tree',
      'app/views/page/PWF/401/PWF401-base',
      'app/views/page/PWF/401/PWF401-list',
      'text!app/views/page/PWF/401/_PWF401-tpl.html'
  ],
  function (
      PWF401Tree,
      PWF401Base,
      PWF401List,
      tpl
  ) {


      var PWF401View = Backbone.View.extend({


          // 태그이름 설정
          tagName: 'section'


          // 클래스이름 설정
          ,className: 'bx-container bxt-sidefilter-layout bxp-PWF401-page'


          // 템플릿 설정
          ,templates: {
              'tpl': tpl
          }


          ,events: { //이벤트 추가
              'click .sidebar-toggler': 'toggleSidebar'
              ,'click .refresh-btn': 'refresh'
          }


          ,initialize: function (initData) {
              var that = this;


              $.extend(that, initData);


              // 페이지 템플릿 설정
              that.$el.html(that.tpl());


              // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
              that.$el.attr('data-page', that.pageHandler);


              //Tree 영역 객체 생성 추가
              that.subViews['PWF401Tree'] = new PWF401Tree();


              // 기본정보영역 객체 생성
              that.subViews['PWF401Base'] = new PWF401Base();


              // 그리드정보영역 객체 생성
              that.subViews['PWF401List'] = new PWF401List();


              // DOM Element Cache 추가
              that.$filterSidebar = that.$el.find('.search-filter-sidebar-wrap'); //tree 영역
              that.$PWF401baseWrap = that.$el.find('.PWF401-base-wrap'); //base 영역
              that.$PWF401listWrap = that.$el.find('.PWF401-list-wrap'); //list 영역


              // tab의 현재 활성화된 그리드 조회
              that.listenTo(that.subViews['PWF401Base'], 'loadData', function(param) {
                  that.subViews['PWF401List'].renderSubPage(param);
              });


              //tree 클릭시 이벤트 발생
              that.subViews['PWF401Tree'].on('select-unit', that.loadList.bind(that));


          } // end of initialize


          ,render: function() {


        	  // tree 영역 render
        	  this.$filterSidebar.html(this.subViews['PWF401Tree'].render());


        	  // 기본정보영역 render
              this.$el.find('.PWF401-base-wrap').html(this.subViews['PWF401Base'].render());


              // 그리드정보영역 render
              this.$el.find('.PWF401-list-wrap').html(this.subViews['PWF401List'].render());


              return this.$el;
          } // end of render


          , loadList: function(param) {
        	  var that = this;


        	  that.subViews['PWF401Base'].setTreeData(param);
          }


          //toggleSidebar, refresh 함수 추가
          , toggleSidebar: function (e) {
        	  var that = this;
              var $target = $(e.currentTarget);
              that.$el.toggleClass('contents-expand');


              if (that.$el.hasClass('contents-expand')) {
            	  //닫기
                  $target.text('>');
              } else {
            	  //열기
                  $target.text('<');
              }


              setTimeout(function () {
                  $('.manual-resize-component:visible').resize();
              }, 600);
          }


          , refresh: function () {
        	  var that = this;
//        	  that.subViews['PCM020List'].refresh();
          }


      });// Backbone.View.extend


      return PWF401View;


  } // end of function
);
