import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPage: 1,
    pageSize: 20,
    noThing: false,
    orderStatusEnum: {
      WAITING_PAY: '等待支付',
      WAITING_MERCHANT_CONFIRM: '等待商家确认',
      WAITING_RIDER_CONFIRM: '等待骑手接单',
      WAITING_DELIVERY: '等待递送',
      WAITING_RIDER_TAKE: '等待骑手取货',
      IN_DELIVERY: '配送中',
      USER_CANCEL: '订单取消',
      ORDER_CANCEL: '订单取消',
      
      ORDER_FINISH: '订单完成'
    },

    refundEnum: {
      USER_REQUESTS_REFUND: '退款中',
      REFUSE_REFUND: '拒绝退款',
      REFUND_FINISH: '退款成功'
    },

    orderList: [],
    loginStatus: true,
    skeleton: true,
    orderStatus: "ALL",
    orderEnumList: [{
        title: '全部',
        name: 'ALL'
      },
      {
        title: '待支付',
        name: 'WAITING_PAY'
      },
      {
        title: '待接单',
        name: 'WAITING_MERCHANT_CONFIRM'
      },
      {
        title: '待收货',
        name: 'IN_DELIVERY'
      },
      {
        title: '收货成功',
        name: 'ORDER_FINISH'
      },
      {
        title: '退款订单',
        name: 'REFUND'
      },

    ]
  },
  goLogin() {
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
      loginStatus: token,
      orderStatus: options.orderStatus
    })
  },
  goDetail(e) {
    let orderId = e.currentTarget.dataset.orderid
    wx.navigateTo({
      url: `/Trade/order_detail/index?orderId=${orderId}`,
    })
  },
  nextpay(e) {
    let orderId = e.currentTarget.dataset.id
    api.post("/facade/front/order/continuePay", {
      orderId: orderId
    }).then(res => {
      this.doPayment(res.data.payId)
    }).catch(e => {
      console.log(e)
    })
  },
  //取消支付
  cancelpay(e) {
    wx.showModal({
      title: '提示',
      content: '是否取消订单?',
      success: (res) => {
        if (res.confirm) {
          let orderId = e.currentTarget.dataset.id
          api.post("/facade/front/order/userCancelOrder", {
            orderId: orderId
          }).then(res => {
            wx.showToast({
              title: "取消成功",
              duration: 2000,
            })
            this.getOrderList()
          }).catch(e => {
            console.log(e)
          })
        }
      }
    })
  },
  //删除订单
  delpay(e) {
    wx.showModal({
      title: '提示',
      content: '是否删除订单?',
      success: (res) => {
        if (res.confirm) {
          let orderId = e.currentTarget.dataset.id
          api.post("/facade/front/order/userDeleteOrder", {
            orderId: orderId
          }).then(res => {
            wx.showToast({
              title: "删除成功",
              duration: 2000,
            })
            this.getOrderList()
          }).catch(e => {
            console.log(e)
          })
        }
      }
    })
  },
  onChange(e) {

    this.setData({
      orderStatus: e.detail.name,
      pageSize: 20
    })

    this.getOrderList()



  },
  doPayment(payId) {
    let openId = wx.getStorageSync("openId") ? wx.getStorageSync("openId") : '';

    api.post("/facade/front/wechat/miniPay", {
      "payId": payId,
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
          this.getOrderList()
        },
        fail(res) {
          wx.showToast({
            title: "支付失败",
            icon: 'none',
            duration: 2000,
          })
        },
        complete(e) {


        }
      })
    }).catch(e => {
      console.log(e)
    })

  },
  getOrderList() {
    let params = {
      currentPage: this.data.currentPage,
      pageSize: this.data.pageSize,
      orderStatus: this.data.orderStatus
    }
    console.log(this.data.orderStatus)
    if (this.data.orderStatus == 'ALL') {
      delete params.orderStatus
    }
    let url = "/facade/front/order/queryOrder"
    if (this.data.orderStatus == 'REFUND') {
      url = `/facade/front/order/refund/list`
    }
    api.post(url, params, {
      loading: true
    }).then(res => {
      if (res.data.list.length != this.data.pageSize) {
        this.setData({
          noThing: true
        })
      }
      this.setData({
        orderList: res.data.list
      })
    }).catch(e => {
      console.log(e)
    })
  },
  // 自定义下拉刷新被触发
  scrollTop() {
    this.setData({
      pageSize: 20,
      noThing: false
    })
    this.getOrderList()
  },
  // 监听用户滚动到底部事件
  scrollBottom() {
    if (this.data.noThing) {
      return
    }
    this.setData({
      pageSize: this.data.pageSize += 20
    })
    this.getOrderList()
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
    this.getOrderList()
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