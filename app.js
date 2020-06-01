//app.js
import api from "./utils/http_request.js"
// let livePlayer = requirePlugin('live-player-plugin')

// 引入SDK核心类
var QQMapWX = require('./libs/qqmap-wx-jssdk.min.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'QKUBZ-MDHLF-DOVJU-N4ERM-6JSGE-P3BKQ' // 必填
});


App({





  getUserInfo() {

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              let iv = res.iv
              let encryptedData = res.encryptedData
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }




            }
          })
        }
      }
    })

  },

  onShow: function(options) {
    console.log('onshow', options)
    wx.setTabBarBadge({
      index: 2,
      text: '4'
    })
    // wx.setStorageSync('invitationCode', "123")
    let reUserCode = options.query.invitationCode
    if (reUserCode) {
      wx.setStorageSync('reUserCode', reUserCode)
      this.invitationBind()
    }
  },
  getServerUserInfo(callback){
    
    api.get("/user/info", {
    }).then(res => {
      callback(res)
      console.log('用户信息', res)
    })
  },

 //登录code获取
 getCode(callback) {
  let _self = this
  wx.login({
    success(res) {
      if (res.code) {
        _self.globalData.code = res.code
        console.log("更新Code", res.code)
        callback()
      }
    }
  })
},
  onLaunch: function(options) {
    
    const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
    this.getUserInfo();
    this.getCode(()=>{})

  },

  checkToken(callback){
    const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
    const uid = wx.getStorageSync("uid") ? wx.getStorageSync("uid") : '';
    if(!uid && !token){
      wx.showModal({
        title:'提示',
        content:'还未授权登录，是否马上授权登录?',
        confirmText:'马上授权',
        success:(e)=>{
          if(e.confirm){
            wx.navigateTo({
              url: '/pages/authorization/index',
            })
          }
        }
      })
      return
    }else{
      if(callback){
        callback()
      }
    }
  
  },
  reverseGeocoder(callback) {
    qqmapsdk.reverseGeocoder({
      //位置坐标，默认获取当前位置，非必须参数
      /**
       * 
       //Object格式
        location: {
          latitude: 39.984060,
          longitude: 116.307520
        },
      */
      /**
       *
       //String格式
        location: '39.984060,116.307520',
      */
      location: '', //获取表单传入的位置坐标,不填默认当前位置,示例为string格式
      //get_poi: 1, //是否返回周边POI列表：1.返回；0不返回(默认),非必须参数
      success: (res) => { //成功后的回调
        
        var result = res.result;
        this.globalData.lat = result.location.lat
        this.globalData.lng = result.location.lng
        callback(res.result)
       
      },
      fail: (error) => {
        console.error(error);
      },

    })
  },


  globalData: {
    code:null,
    token: null,
    userId: null,
    userInfo: null
  }
})