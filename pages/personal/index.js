// PersonalContract/index/index.js
import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:'',
    accountBalance:'',
    loginName:'',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: false,
    token: null,
    olist:["待支付","待发货","待收货","已收货",],
    alist:["邀请有奖","我的收藏","下单减免","在线客服"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.initInfo()
    this.setData({
      token: wx.getStorageSync("token") ? wx.getStorageSync("token") : ''
    })
  },
  goOrder(){
    wx.navigateTo({
      url: '/Trade/order/index',
    })
  },
  initInfo(){
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    if (wx.getStorageSync("loginName")) {
      this.setData({
        loginName: wx.getStorageSync("loginName")
      })
    }
    this.setData({
      token: wx.getStorageSync("token") ? wx.getStorageSync("token") : ''
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   
   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
 
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
  goAddressList(){
    wx.navigateTo({
      url: '/Contract/address_list/index',
    })
  },
  clearStore(){
    wx.clearStorage()
    wx.clearStorageSync()
    wx.showToast({
      title: '清除成功',
    })
  },
  getUserInfo: function (e) {
    app.getUserInfo();
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo
    })
    if (e.detail.userInfo){
      this.setData({
        hasUserInfo: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  
  goRechargeList:function(){
    wx.navigateTo({
      url: '/PersonalContract/recharge_list/index'
    })
  },
  goBuyList:function(){
    wx.navigateTo({
      url: '/PersonalContract/buy_list/index'
    })
  },
  goOrderList:function(){
    wx.navigateTo({
      url: '/PersonalContract/order_list/index'
    })
  },
  goRecharge:function(){
    wx.navigateTo({
      url: '/PersonalContract/recharge/index'
    })
  },
  neverLoad() {
    wx.showToast({
      title: "敬请期待！",
      icon: 'none',
      duration: 3000,
    })
  },
  goInvite: function () {
    wx.navigateTo({
      url: '/PersonalContract/invite/index'
    })
  },
  goExchange: function () {
    wx.navigateTo({
      url: '/PersonalContract/exchange/index'
    })
  },

  goStationList: function () {
    wx.navigateTo({
      url: '/PersonalContract/station_list/index'
    })
  },
  
  querybyuserid:function(){
    api.post("/front/user/wallet/query", {}).then(res => {
      this.setData({
        accountBalance: res.accountBalance
      })
    }).catch(e => {
      console.log(e)
    })
  },
  doLogin(code, encryptedData, iv) {
    let parm = {}
    parm.appId = 'wxbb171a4508d8980e';
    parm.code = code;
    parm.encryptedData = encryptedData;
    parm.iv = iv;
    if (app.globalData.userInfo){
      parm.nickName = app.globalData.userInfo.nickName;
      parm.avatarUrl = app.globalData.userInfo.avatarUrl;
      parm.sex = app.globalData.userInfo.gender;
    }
    api.post("/front/user/user/login", parm, {
      header: { 'Content-Type': 'application/json;charset=UTF-8' }
      }).then(res => {
        console.log(res)
        wx.setStorageSync('token', res.token)
        wx.setStorageSync('userId', res.userId)
        wx.setStorageSync('loginName', res.loginName)
        this.initInfo()
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
  goLogin(){
    wx.navigateTo({
      url: '/pages/authorization/index',
    })
  },
})