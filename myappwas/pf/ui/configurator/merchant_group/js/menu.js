/******************************************************************************************************************
 * 트리 관련
 ******************************************************************************************************************/


function makeTreeStore() {
  return new Promise((resolve, reject) => {

    const isBXM = g_serviceType === g_bxmService;

    const config = {
        autoLoad: false,
        url: '/merchant/getListMerchantGroupMaster.json' +
        '?tntInstId=' + tntInstId +
        '&commonHeaderMessage={"loginTntInstId":"' + getLoginTntInstId() + '", "motherTntInstId" : "' + getMotherTntInstId() + '", "lastModifier" : "' + getLoginUserId()+ '"}',
        dataProperty: 'list',
        map: {
          'bottom': 'leaf',
          'merchantGroupName': 'text',
          'merchantGroupCode': 'id',          // 가맹점그룹구분코드
        },
    };

    // bxm
    if (isBXM) {
      const params = {
          header: {
            application: 'PF_Factory',
            service: 'MerchantGroupService',
            operation: 'queryList'
          },
          input: {
            tntInstId: tntInstId,
            commonHeader: {
              loginTntInstId: loginTntInstId,
              motherTntInstId: getMotherTntInstId(),
              lastModifier : getLoginUserId()
            }
          }
      };

      config.url = '/serviceEndpoint/json/request.json';
      config.proxy = {
          method : 'POST',
          ajaxOptions : {
            contentType: 'application/json; charset=UTF-8',
            data:JSON.stringify(params)
          },
          dataType : 'json',
      };
    }

    PFUI.use(['pfui/data'], (Data) => {
      const navTreeStore = new Data.TreeStore(config);

      // click change url params
      // csl='folder' and 'leaf=false' 일 때 호출됨
      navTreeStore.on('beforeload', function (ev) {
        const params = ev.params;
        const node = navTreeStore.findNode(params.id);
        let queryParams;
      });

      navTreeStore.on('beforeprocessload', (ev) => {
        const typeArr = [];
        const data = ev.data;
        const listData = isBXM ? data.ModelMap.responseMessage : data.responseMessage;

        data.list = [];
        (codeArrayObj['merchantGroupTypeCode'] || []).forEach((v, i) => {
          data.list.push({
            cls: 'Folder',
            bottom: false,
            merchantGroupCode: v.code,
            merchantGroupName: v.name,
            children: [],
          });
          typeArr[v.code] = i;

        });

        (listData || []).forEach((dt, i) => {
          if (!dt.relate) {
            dt.cls = 'PT';
          }
          dt.bottom = true;
          data.list[typeArr[dt.merchantGroupTypeCode]].children.push(dt);
        });

        (data.list || []).forEach((v) => {
          if (v.children.length === 0) {
            v.leaf = true;
          }
        });
      });

      navTreeStore.on('load', function() {
        resolve(navTreeStore);
      });

      navTreeStore.load();
    });
  });
}

function renderNavTree(item) {
  return new Promise((resolve, reject) => {
    PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], (Tree, Data, Menu) => {
      // tree store
      makeTreeStore().then((navTreeStore) => {
        /* --------------------------------------
         * navTree 생성
         * -------------------------------------- */

        $('.pf-mg-tree-nav').empty();

        const navTree = new Tree.TreeList({
          render: '.pf-mg-tree-nav',
          showLine: false,
          store: navTreeStore,
          checkType: 'none',
          showRoot: false
        });

        navTree.render();
        
        if (item) {
          traceTree(item, navTree, navTreeStore);
        }
        resolve([navTree, navTreeStore]);
      });
    });
  });
}

function traceTree(item, tree, store) {
  const category = store.findNode('01'); // 가맹점
  console.log(category);

  if (category) {
    tree.expandNode(category);

    const node = store.findNode(item.merchantGroupCode);
    console.log(node);
    if (node) {
      tree.setSelected(node);
    }
  }
  /*if (traceTree.completeTrace) return;

  var currentNode = (store || navTreeStore).findNode(traceTree.traceList[traceTree.depth]);
  console.log(currentNode);

  if (((traceTree.traceList.length - 1) === traceTree.depth)) {
    setTimeout(() => {
      navTree.setSelection(currentNode);
    }, 500)
    traceTree.completeTrace = true;
    return;
  } else {
    navTree.expandNode(currentNode);
  }

  traceTree.depth++;*/
}
