const app = getApp()
import api from "../../utils/http_request.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNumFocus:false,
    phoneNum:'',
    code:''
  },
  doSubmit(){
    console.log(this.data.phoneNum)
    console.log(this.data.code)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  doSubmit(){
    if((this.data.phoneNum||'')==''){
      wx.showToast({
        title: '请输入手机号',
        icon:'none'
      })
      return
    }

    if((this.data.code||'')==''){
      wx.showToast({
        title: '请输入验证码',
        icon:'none'
      })
      return
    }
    api.post("/facade/front/user/loginWithSmsCode", {
      code :this.data.code,
      phoneNum :this.data.phoneNum
    }, {
       loading:true
    }).then(res => {
      if(res.statusCode != 200){
        wx.showToast({
          title: res.data.message,
          icon:'none'
        })
        return
      }
      wx.setStorageSync('uid', res.data.uid)
      wx.setStorageSync('token', res.data.token)
      wx.setStorageSync('openId', res.data.openId)
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      phoneNumFocus:true
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})