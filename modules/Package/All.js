

const Url = require('@definejs/url');
const Tasker = require('@definejs/tasker');
const API = require('@definejs/api');
const Query = require('@definejs/query');

const sid = `@definejs/package.load-all.sid`;
let all = null; //加载到的总包信息，是一个 json 对象。

//根据配置项生成 `all.json` 文件最终的 url 地址。
function makeUrl(options) {
    let url = Url.root() + options.url;
    let query = options.query;

    if (typeof query == 'string') {
        query = Query.parse(query);
    }

    if (query) {
        url = Query.add(url, query);
    }

    if (options.random) {
        url = Query.random(url, 4);
    }

    return url;
}

//发起 ajax 请求去加载 all.json 文件。
function load(options, done) {
    let url = makeUrl(options);

    let api = new API({
        'url': url,
        'field': null,
    });

    api.on({
        response(res) { 
            all = res.json || {};
            done && done(all);
        },
    });

    api.get();
    
}



module.exports = {
    /**
    * 用异步的方式加载总包文件。
    * 即 `packages/all.json` 文件。
    * 该方法会优先使用之前加载过的缓存。
    *   options = {
    *       url: '',
    *       query: {},
    *       random: true,
    *   };
    */
    load(options, done) {
        //已加载过了，直接复用。
        if (all) {
            done && done(all);
            return;
        }

        //首次加载，添加到待办列表中。
        Tasker.todo(sid, done, function (finish) {
            load(options, function (all) {
                finish(function (done) {
                    done && done(all);
                });
            });
        });


    },
};