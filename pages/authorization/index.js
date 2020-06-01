// pages/authorization/index.js
const app = getApp()
import api from "../../utils/http_request.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    token: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({
      token: wx.getStorageSync("token") ? wx.getStorageSync("token") : ''
    })



    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

  },
  phoneCreate(){
    wx.navigateTo({
      url: '/pages/login/index',
    })
  },
  goHome() {
    const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
    if ((token || '') !== '') {
      wx.navigateBack({
        data: 1,
        success: function () {
          app.checkToken()
        }
      })
    }else{
      wx.showToast({
        icon:'none',
        title: '未授权用户信息',
      })
    }
  
  },
  goBack(){
      wx.navigateBack({
        complete: (res) => {},
      })
  },
  loadLogin(e) {

    api.post("/facade/front/wechat/requestPhoneNum", {
      "appid": 'wx1369228bfc6534ff',
      "code": app.globalData.code,
      "encryptedData": e.detail.encryptedData,
      "iv": e.detail.iv
    }, {
       
    }).then(res => {
      console.log(res)
      
      wx.setStorageSync('token', res.data.token)
      wx.setStorageSync('uid', res.data.uid)
      wx.showToast({
        title: '登录成功',
        duration:1000
      })
     setTimeout(()=>{
      wx.reLaunch({
        url: '/pages/home/index',
      })
     },1000)

    }).catch(e => {
      console.log(e)
    })



  },

  getPhoneNumber(e) {
    if ((e.detail.iv || '') == '' && (e.detail.encryptedData || '') == '') {
      wx.showToast({
        title: "授权失败",
        icon: 'none',
        duration: 1500,
      })
      return
    }
    let _self = this
    wx.checkSession({
      success() {
        if (app.globalData.code) {
          _self.loadLogin(e)
        } else {
          app.getCode(() => {
            _self.loadLogin(e)
          })
        }
        //session_key 未过期，并且在本生命周期一直有效
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        app.getCode(() => {
          _self.loadLogin(e)
        })
      }
    })

  },
 



  getUserInfo: function(e) {
    app.getUserInfo();
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})