/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */




const angular = require('angular');

const md = require('./common.module');

md.service('$commonConfig', __service);

function __service($http, $q, $rootScope) {

    return {
        restful: {
            grid: {
                url: 'app/common/stub/bxGrid.json',
                method: 'GET'
            },
            tree: {
                url: 'app/common/stub/bxTree.json',
                method: 'GET'
            },
            sUrl: {
                url: 'http://' + location.hostname + '/serviceEndpoint/json'
            },
            baseUrl : {
            	url : 'http://' + location.hostname+ "/"
            }
        }
    }
}

