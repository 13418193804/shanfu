import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: null,
    prepareId:null,
    cartList:[],
    goodsNum:0,
    totalAmmount:0,
    totalAmmountStr:0,
    remark:''
  },
  inputRemark(e){
    this.setData({
      remark:e.detail.value
    })
  },
  doSubmit(){
    if(!this.data.address){
        wx.showToast({
          title: '请选择配送地址',
          icon:'none'
        })
      return
    }
    if(this.data.payId){
      this.doPayment()
    }else{
    api.post("/facade/front/order/submitOrder", {
      prepareId:this.data.prepareId,
      remark:this.data.remark
    }).then(res => {
        let payId = res.data.payId
        this.setData({
          payId
        })
      this.doPayment()
    }).catch(e => {
      console.log(e)
    })
  }
  },

  doPayment(){
    let openId =  wx.getStorageSync("openId") ? wx.getStorageSync("openId") : '';
    const _self = this
    api.post("/facade/front/wechat/miniPay", {
      "payId": this.data.payId,
      "openId": openId,
    }).then(res => {
      wx.requestPayment({
        timeStamp: res.data.timeStamp,
        nonceStr: res.data.nonceStr,
        package: res.data.package,
        signType: 'MD5',
        paySign: res.data.paySign,
        success(res) {
          wx.showToast({
            title: "支付成功",
            duration: 2000,
          })
          _self.setData({
            prepareId:null
          })
          wx.redirectTo({
            url:'/Trade/order/index?orderStatus=WAITING_DELIVERY',
          })
        },
        fail(res) {
          wx.showToast({
            title: "支付失败",
            icon: 'none',
            duration: 2000,
          })
          _self.setData({
            prepareId:null
          })
          wx.redirectTo({
            url:'/Trade/order/index?orderStatus=WAITING_PAY',
          })
        },
        // complete(e) {
        //   _self.setData({
        //       prepareId:null
        //     })
        //     wx.redirectTo({
        //       url:'/Trade/order/index?orderStatus=WAITING_PAY',
        //     })
        // }
      })
    }).catch(e => {
      console.log(e)
    })

  },
  changAddress(){
    wx.navigateTo({
      url: `/Contract/address_list/index?prepareId=${this.data.prepareId}`,
    })
  },
  getPrepareInfo(){
    if(!this.data.prepareId)
{
  return
}
    api.post("/facade/front/cart/prepare", {
      prepareId :this.data.prepareId
    }).then(res => {
        this.setData({
          address:res.data.address,
          cartList:res.data.cartList,
          goodsNum:res.data.num,
          totalAmmount:res.data.totalAmmount,
          totalAmmountStr:res.data.totalAmmount * 100
        })
    }).catch(e => {
      console.log(e)
    })
  },
  goAddAddress() {
    wx.navigateTo({
      url: `/Contract/address/index?prepareId=${this.data.prepareId}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      prepareId:  options.prepareId
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

    this.getPrepareInfo()
    
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