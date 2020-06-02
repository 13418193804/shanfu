import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderStatusEnum:{
      WAITING_PAY:'等待支付',
  
      WAITING_DELIVERY:'等待递送',
  
      IN_DELIVERY:'配送中',
  
      ORDER_CANCEL:'订单取消',
  
      ORDER_FINISH:'订单完成'
      },
    orderId: null,
    orderDetail: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId
    })
  },
  getOrderDetail() {
    api.post("/facade/front/order/getOrderInfo", {
      orderId: this.data.orderId,
    }).then(res => {
      this.setData({
        orderDetail: res.data
      })
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
    this.getOrderDetail()
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