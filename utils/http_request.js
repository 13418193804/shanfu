var urlapi = require('urlapi.js')
var util = require('util.js')
let Promise = require('../libs/es6-promise.min.js').Promise
import {
  request
} from '../libs/wxrequest.js';




class API {
  constructor(args) {
    this.get = this.init("GET")
    this.post = this.init("POST")
    this.debug = this.init("POST", true) //测试地址
  }

  init(method, debug = false, test = false, line2 = false) {
    let _ = this
    return (url, params, options = {}) => {
      const header = options.header || {
        'content-type': 'application/x-www-form-urlencoded'
      }
      const loading = options.loading

      if (loading) {
        wx.showLoading({
          mask: true,
          title: '加载中',
        })
      }

      return new Promise((resolve, reject) => {

        const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
        const uid = wx.getStorageSync("uid") ? wx.getStorageSync("uid") : '';
        
        params['token'] = token;
        params['uid'] = uid;
        var rUrl = urlapi.getUrl(url);
        // 校验参数（不可传undefined和null），过滤空格
        for (let index in params) {
          if (util.isBlank(params[index])) {
            params[index] = '';
          } else if (typeof params[index] === 'string') {
            params[index] = params[index].replace(/(^[\s\n\t]+|[\s\n\t]+$)/g, "");
          }
        }

        request({
            url: rUrl,
            data: params,
            method: method,
            header: Object.assign(header, {
              token: token,
              uid: uid,
            })
          })
          .then(res => {
            console.log(`######MINA_AISI_CONSOLE:${rUrl}返回结果,Params:${JSON.stringify(params)} response:`, res);

            if (loading) {
              wx.hideLoading()
            }
            switch (res.statusCode) {
              case 200:

                resolve(res);
                break;
              case 401:
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  duration: 3000,
                })
                wx.reLaunch({
                  url: '/pages/home/index',
                })
                break;
              case 500:
                wx.showToast({
                  title: '错误代码 500',
                  icon:'none'
                })
                break;
              default:
                console.log(`######MINA_AISI_CONSOLE:${rUrl}错误,Params:${JSON.stringify(params)} response:`, res);

                resolve(res);
                break;
            }
          })
          .catch(error => {
            console.log('-2', error)

            console.log(`######MINA_AISI_CONSOLE:${rUrl}错误,Params:${JSON.stringify(params)} response:`, error);
            if (loading) {
              wx.hideLoading()
            }
            reject(error)

          })



      })
    }
  }

}

export default new API