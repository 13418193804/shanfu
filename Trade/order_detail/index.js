import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderStatusEnum:{
      WAITING_PAY:'等待支付',
      
      WAITING_MERCHANT_CONFIRM :'等待商家确认', 
      WAITING_RIDER_CONFIRM :'等待骑手接单', 
      WAITING_DELIVERY:'等待递送',
      WAITING_RIDER_TAKE: '等待骑手取货',
      IN_DELIVERY:'配送中',
      
      ORDER_CANCEL:'订单取消',
  
      ORDER_FINISH:'订单完成'
      },
      refundEnum:{
        USER_REQUESTS_REFUND:'退款中',
        REFUSE_REFUND:'拒绝退款',
        REFUND_FINISH:'退款成功'
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
  nextpay(e){
    let orderId  = e.currentTarget.dataset.id
    api.post("/facade/front/order/continuePay", {
      orderId :orderId 
    }).then(res => {
    this.doPayment(res.data.payId)
    }).catch(e => {
      console.log(e)
    })
  },
  //取消支付
  cancelpay(e){
    wx.showModal({
      title:'提示',
      content:'是否取消订单?',
      success:(res)=>{
        if(res.confirm){
          let orderId  = e.currentTarget.dataset.id
          api.post("/facade/front/order/userCancelOrder", {
            orderId :orderId 
          }).then(res => {
            wx.showToast({
              title: "取消成功",
              duration: 2000,
            })
            wx.redirectTo({
              url:'/Trade/order/index',
            })
          }).catch(e => {
            console.log(e)
          })
        }
      }
    })
  },
  //删除订单
  delpay(e){
    wx.showModal({
      title:'提示',
      content:'是否删除订单?',
      success:(res)=>{
        if(res.confirm){
          let orderId  = e.currentTarget.dataset.id
          api.post("/facade/front/order/userDeleteOrder", {
            orderId :orderId 
          }).then(res => {
            wx.showToast({
              title: "删除成功",
              duration: 2000,
            })
            wx.redirectTo({
              url:'/Trade/order/index',
            })
          }).catch(e => {
            console.log(e)
          })
        }
      }
    })
  },
    
      doPayment(payId){
        let openId =  wx.getStorageSync("openId") ? wx.getStorageSync("openId") : '';
    
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
            this.getOrderDetail()
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
doRefund(e){

  wx.showModal({
    title: '提示',
    content: '是否提交退款申请？',
    success: (res)=> {
      if (res.confirm) {
        let orderId  = e.currentTarget.dataset.id
          
        api.post("/facade/front/user/orderRefund", {
          orderId :orderId 
        }).then(res => {
          wx.showToast({
            title: "提交成功",
            duration: 2000,
          })
            this.getOrderDetail()
        }).catch(e => {
          console.log(e)
        })


      } 
    }
  })

},

  contactStore(){
    wx.makePhoneCall({
      phoneNumber: this.data.orderDetail.storeMobile,
      success:function(){
        console.log('拨打成功')
      },
      fail:function(){
        console.log('已取消')
      }
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