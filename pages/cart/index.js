import api from "../../utils/http_request.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: false,
    selectAll: false,
    token: null,
    cartObj: {},
    cartList: {},
    selectCartObj: {},
    selectStore: {},
    selectAll: false,
    totalAmount:0,
    isLoad:false
  },
  submitCart() {

    let cartList = Object.keys(this.data.selectCartObj).filter(e => this.data.selectCartObj[e])
    if (cartList.length == 0) {
      wx.showToast({
        title: '请选择结算商品',
        icon: 'none'
      })
      return
    }
    let cartListStr = cartList.join(',')
    api.post("/facade/front/cart/cart2Prepare", {
      cartIdList: cartListStr
    },
    {
      loading:true
    }).then(res => {
      let prepareId = res.data.prepareId
      wx.navigateTo({
        url: `/Trade/confirm/index?prepareId=${prepareId}`,
      })
    }).catch(e => {
      console.log(e)
    })
  },
  deleteCart(e){
    // let cart = e.currentTarget.dataset.cart
    // api.post("/facade/front/cart/dec", {
    //   num: cart.num,
    //   cartId: cart.cartId
    // },
    // {
    //   loading:true
    // }).then(res => {
    //   this.getCartList()
    //   this.checkSelectAll()
    // }).catch(e => {
    //   console.log(e)
    // })
  },
  subCart(e) {
    let cart = e.currentTarget.dataset.cart
    api.post("/facade/front/cart/dec", {
      num: 1,
      cartId: cart.cartId
    }).then(res => {
      this.getCartList()
      this.checkSelectAll()
    }).catch(e => {
      console.log(e)
    })
  },


  addCart(e) {
    let cart = e.currentTarget.dataset.cart
    api.post("/facade/front/cart/inc", {
      cartId: cart.cartId,
      num: 1,
    }).then(res => {

      this.getCartList()
    }).catch(e => {
      console.log(e)
    })
  },

  getCartList() {
    api.post("/facade/front/cart/queryCartWithStore", {}).then(res => {
      this.setData({
        cartObj: res.data
      })
    }).catch(e => {
      console.log(e)
    })
    api.post("/facade/front/cart/queryCart", {}).then(res => {
     
      if(!this.data.isLoad){
        this.setData({
          cartList: res.data,
          selectAll:false,
          isLoad:true
        })
      this.onSelectAllChange()
      }
    }).catch(e => {
      console.log(e)
    })

  },
  doSubmit() {
    wx.navigateTo({
      url: '/Trade/confirm/index',
    })
  },

  changeStore(e) {
    let key = e.currentTarget.dataset.key
    let value = !this.data.selectStore[key]
    this.data.cartObj[key].forEach((e) => {
      this.data.selectCartObj[e.cartId] = value //子元素紧跟店铺选择
    })
    this.data.selectStore[key] = value

    this.setData({
      selectCartObj: this.data.selectCartObj,
      selectStore: this.data.selectStore
    });
    this.checkSelectAll()
  },

  changeItem(e) {
    //处理子元素
    let cartid = e.currentTarget.dataset.cartid
    let value = !this.data.selectCartObj[cartid] //本次操作即将赋值的操作  选中  取消
    this.data.selectCartObj[cartid] = value // 先赋值
    //处理店铺级别
    let key = e.currentTarget.dataset.key
    for (let i = 0; i < this.data.cartObj[key].length; i++) {
      let cartId = this.data.cartObj[key][i].cartId
      //当有元素不是当前操作时则跳出
      if (value != this.data.selectCartObj[cartId]) {
        break;
      }
      if (i == this.data.cartObj[key].length - 1) {
        //最后一项都通过了 说明店铺级别需要跟随这个值改变
        this.data.selectStore[key] = value
      }
    }
    this.setData({
      selectStore: this.data.selectStore,
      selectCartObj: this.data.selectCartObj
    });
    this.checkSelectAll()
  },
  removeByValue(arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == val) {
        arr.splice(i, 1);
        break;
      }
    }
  },

  checkSelectAll() {
    let selectNum = 0
    let totalAmount = 0
    this.data.cartList.forEach(e => {
      if (this.data.selectCartObj[e.cartId]) {
        selectNum += 1
        totalAmount += e.salePrice * e.num
      }
    })
    this.setData({
      selectAll: !this.data.selectAll && selectNum == this.data.cartList.length,
      totalAmount:totalAmount*100
    });
  },
  onSelectAllChange() {
    let value = !this.data.selectAll
    this.data.cartList.forEach(e => {
      this.data.selectCartObj[e.cartId] = value
    })
    Object.keys(this.data.cartObj).forEach(e => {
      this.data.selectStore[e] = value
    })
    this.setData({
      selectCartObj: this.data.selectCartObj,
      selectStore: this.data.selectStore
    });
    this.checkSelectAll()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
    this.setData({
      token: token
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

    if (this.data.token) {
      this.getCartList()
    }
  },
  goLogin() {
    wx.navigateTo({
      url: '/pages/authorization/index',
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