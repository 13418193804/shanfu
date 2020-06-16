import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPage: 1,
    total: '',
    refresher: true,
    loading: false,
    loadingBottom: false,
    orderStatusEnum:{
    WAITING_PAY:'等待支付',

    WAITING_DELIVERY:'等待递送',

    IN_DELIVERY:'配送中',

    ORDER_CANCEL:'订单取消',

    ORDER_FINISH:'订单完成'
    },
    orderList:[],
    loginStatus:true,
    skeleton:true,
    orderStatus: "ALL",
    orderEnumList:[
      {
        title:'全部',
        name:'ALL'
      },
      {
        title:'待支付',
        name:'WAITING_PAY'
      },
      {
        title:'待发货',
        name:'WAITING_DELIVERY'
      },
      {
        title:'待收货',
        name:'IN_DELIVERY'
      },
      {
        title:'已完成',
        name:'ORDER_FINISH'
      },
    ]
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
onChange(e){

    this.setData({
      orderStatus:e.detail.name,
      orderList:[],
      
    })

    this.getOrderList()

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
  getOrderList(){
    let params = {
      currentPage: this.data.currentPage,
      pageSize:10,
      orderStatus :this.data.orderStatus
    }
    console.log(this.data.orderStatus)
    if(this.data.orderStatus == 'ALL'){
      delete params.orderStatus
    }
    api.post("/facade/front/order/queryOrder",params).then(res => {
  
  console.log(res)
      this.setData({
        orderList:this.data.orderList.concat(res.data.list),
        total:res.data.total,
      })

    }).catch(e => {
      console.log(e)
    })
  },
  // 监听用户滚动到顶部事件
  scrollTop() {
    setTimeout(()=>{
      this.setData({
        currentPage: 1,
        orderList: [],
        loadingBottom: false,
        refresher: false
      })
      this.getOrderList()
    },1500)
  },
  // 监听用户滚动到底部事件
  scrollBottom() {
    this.setData({
      loading: true,
      loadingBottom: false
    })
    if(this.data.orderList.length < this.data.total){
      setTimeout(()=>{
        this.setData({
          currentPage:this.data.currentPage++
        })
        this.getOrderList()
        this.setData({
          loading:false
        })
      },1500)
    }else{
      setTimeout(()=>{
        this.setData({
          loading:false,
          loadingBottom: true
        })
      },1500)
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