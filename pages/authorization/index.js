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
  doLogin(code, encryptedData, iv) {

    api.post("/front/user/user/login", {
      "appId": 'wxbb171a4508d8980e',
      "code": code,
      "encryptedData": encryptedData,
      "iv": iv
    }, {
        header: { 'Content-Type': 'application/json;charset=UTF-8' }
    }).then(res => {
      console.log(res)
      wx.setStorageSync('token', res.token)
      wx.setStorageSync('userId', res.userId)
      wx.setStorageSync('loginName', res.loginName)
      this.setData({
        token: res.token
      })
    }).catch(e => {
      console.log(e)
    })



  },

  getPhoneNumber(e) {
    let self = this
    let encryptedData = e.detail.encryptedData
    let iv = e.detail.iv
    // 登录
    wx.login({
      success: loginRes => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        self.doLogin(loginRes.code, encryptedData, iv)
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