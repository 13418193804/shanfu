import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPage: 1,
    total: '',
    orderStatusEnum:{
    WAITING_PAY:'等待支付',

    WAITING_DELIVERY:'等待递送',

    IN_DELIVERY:'配送中',

    ORDER_CANCEL:'订单取消',

    ORDER_FINISH:'订单完成'
    },
    orderList:[],
    loginStatus:true,
    skeleton:true
  },
  goLogin(){
    wx.navigateTo({
      url: '/pages/authorization/index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
    this.setData({
      loginStatus: token
    })
  },
  goDetail(e){
    let orderId = e.currentTarget.dataset.orderid
    wx.navigateTo({
      url: `/Trade/order_detail/index?orderId=${orderId}`,
    })
  },
  getOrderList(){
    api.post("/facade/front/order/queryOrder", {
      // orderStatus :'WAITING_PAY',
      currentPage: this.data.currentPage,
      pageSize:3
    }).then(res => {
      this.setData({
        orderList:this.data.orderList.concat(res.data.list),
        total:res.data.total,
        skeleton:false
      })

    }).catch(e => {
      console.log(e)
    })
  },
  // 监听用户滚动到顶部事件
  scrollTop() {
    this.setData({
      currentPage:1,
      orderList: []
    })
    this.getOrderList()
  },
  // 监听用户滚动到底部事件
  scrollBottom() {
    if(this.data.orderList.length < this.data.total){
      this.setData({
        currentPage:this.data.currentPage++
      })
      this.getOrderList()
    }else{
      console.log('1111')
    }
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
    if (this.data.loginStatus) {
      this.getOrderList()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})