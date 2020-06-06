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
    storeCartList: [],
    cartList: {},
    selectCartObj: {},
    selectStore: {},
    selectAll: false,
    totalAmount: 0,
    isLoad: false
  },
  submitCart() {  

    let submitList =[]
    this.data.storeCartList.forEach(e=>{
      submitList=submitList.concat(e.children.filter(es=>es.selected).map(es=>es.cartId))
    })

    if (submitList.length == 0) {
      wx.showToast({
        title: '请选择结算商品',
        icon: 'none'
      })
      return
    }
    let cartListStr = submitList.join(',')

    api.post("/facade/front/cart/cart2Prepare", {
      cartIdList: cartListStr
    }, {
      loading: true
    }).then(res => {
      let prepareId = res.data.prepareId
      wx.navigateTo({
        url: `/Trade/confirm/index?prepareId=${prepareId}`,
      })
    }).catch(e => {
      console.log(e)
    })
  },
  deleteCart(e) {
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
      let storeCartList = Object.keys(res.data).map(e => {
        return {
          storeId: res.data[e][0].storeId,
          storeName: e,
          selected: true,
          children: res.data[e].map(es => {
            return {
              ...es,
              selected: true
            }
          })
        }
      })

      this.setData({
        storeCartList: storeCartList
      })
    this.exSumTotal()

    }).catch(e => {
      console.log(e)
    })
    api.post("/facade/front/cart/queryCart", {}).then(res => {
      this.setData({
        cartList: res.data,
      })

      // if (!this.data.isLoad) {
      //   this.setData({
      //     selectAll: false,
      //     isLoad: true
      //   })
      //   this.onSelectAllChange()
      // }
   
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
    let store = e.currentTarget.dataset.store
    let value = !store.selected
    this.data.storeCartList.forEach(e => {
      if (e.storeId == store.storeId) {
        e.selected = value
        e.children.forEach(es => {
          es.selected = value
        })
      }
    })
    this.setData({
      storeCartList: this.data.storeCartList
    });
    this.exSumTotal()
  },

  changeItem(e) {
    //处理子元素
    let cart = e.currentTarget.dataset.cart
    let value = !cart.selected //本次操作即将赋值的操作  选中  取消
    let store = e.currentTarget.dataset.store
    // this.changeItemWidthCartId(cartid, value, key)

    let list = this.data.storeCartList
    list.forEach(e => {
      if (e.storeId == store.storeId) {
        e.children.forEach(es => {
          if (es.cartId == cart.cartId) {
            es.selected = value
            let selectLen = e.children.filter(ca => ca.selected).length
            e.selected = selectLen == e.children.length
          }
        })
      }
    })
    this.setData({
      storeCartList: this.data.storeCartList
    })
    this.exSumTotal()
  },

  // changeItemWidthCartId(cartid, value, key) {
  //     this.data.selectCartObj[cartid] = value // 先赋值
  //   //处理店铺级别
  //   for (let i = 0; i < this.data.cartObj[key].length; i++) {
  //     let cartId = this.data.cartObj[key][i].cartId
  //     //当有元素不是当前操作时则跳出
  //     if (value != this.data.selectCartObj[cartId]) {
  //       break;
  //     }
  //     if (i == this.data.cartObj[key].length - 1) {
  //       //最后一项都通过了 说明店铺级别需要跟随这个值改变
  //       this.data.selectStore[key] = value
  //     }
  //   }
  //   this.setData({
  //     selectStore: this.data.selectStore,
  //     selectCartObj: this.data.selectCartObj
  //   });
  //   this.checkSelectAll()
  // },
  removeByValue(arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == val) {
        arr.splice(i, 1);
        break;
      }
    }
  },




  exSumTotal() {
    let totalAmount = 0
    let storeSelectLen = this.data.storeCartList.filter(e => e.selected).length
    this.data.storeCartList.forEach(e => {
      if (e.selected) {
        e.children.forEach(es => {
          if (es.selected) {
            totalAmount += es.salePrice * es.num
          }
        })
      }
    })

    this.setData({
      totalAmount: totalAmount * 100,
      selectAll: storeSelectLen == this.data.storeCartList.length
    })

  },
  onSelectAllChange() {
    let value = !this.data.selectAll
    let totalAmount = 0
    this.data.storeCartList.forEach(e => {
      e.selected = value
      e.children.forEach(es => {
        es.selected = value
          totalAmount += es.salePrice * es.num * 100
      })
    })

    this.setData({
      totalAmount:value? totalAmount:0,
      storeCartList: this.data.storeCartList,
      selectAll: value
    });
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
  onShow: function (e) {
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