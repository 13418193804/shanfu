// Trade/goods_detail/index.js
import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    skuModel: null,

    goodsId: null,
    cartNum: 0,
    goodsObj:{},
    store:{},
    marketplaceId:null
  },
  openSkuModel(e) {
    console.log(e)

   

      if (this.data.goodsObj.singleStatus) {
        this.addCart(
          this.data.goodsObj.skuList[0].skuId
        )
        return
      }

      this.setData({
        skuModel: true,
        selectSku: this.data.goodsObj.skuList.length > 0 ? this.data.goodsObj.skuList[0] : null
      })
   

  },
  goHome() {
    wx.reLaunch({
      url: '/pages/home/index',
    })
  },
  goCart() {
    wx.switchTab({
      url: '/pages/cart/index',
    })
  },
  queryCart() {

    api.post("/facade/front/cart/queryCart", {}).then(res => {
      let cartNum = 0
      for (let i = 0; i < res.data.length; i++) {
        cartNum += res.data[i].num
      }
      console.log(cartNum)
      this.setData({
        cartNum
      })
    }).catch(e => {
      console.log(e)
    })
  },
  checkSkuItem(e) {
    let item = e.currentTarget.dataset.item
    this.setData({
      selectSku: item
    })
  },
  onClose() {
    this.setData({
      skuModel: false
    })
  },
  submitSku() {

    this.addCart(
      this.data.selectSku.skuId
    )
  },

  addCart( skuId) {
    app.checkToken()
    api.post("/facade/front/cart/addCart", {
      goodsId: this.data.goodsObj.goodsId,
      num: 1,
      marketPlaceId: this.data.marketplaceId,
      skuId: skuId,
      storeId: this.data.store.storeId
    }).then(res => {
      this.setData({
        skuModel: false
      })
      this.queryCart()
      wx.showToast({
        title: '成功',
      })
    }).catch(e => {
      console.log(e)
    })
  },

  getGoodsDetail() {
    api.post("/facade/front/goods/getGoodsDetail", {
      goodsId: this.data.goodsId
    }).then(res => {
      this.setData({
        goodsObj: res.data
      })
  
    }).catch(e => {
      console.log(e)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      goodsId: options.id
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
    this.getGoodsDetail()
    const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
    const uid = wx.getStorageSync("uid") ? wx.getStorageSync("uid") : '';
    if (uid && token) {
      this.queryCart()
    }
    this.getStoreByGoodsId()
  },
  getStoreByGoodsId(){
    api.post("/facade/front/store/getStoreByGoodsId", {
      goodsId: this.data.goodsId
    }).then(res => {
    
      console.log(res)
      this.setData({
        store:res.data.store,
        marketplaceId:res.data.marketplaceId
      })
    }).catch(e => {
      console.log(e)
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