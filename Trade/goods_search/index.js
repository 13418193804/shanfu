import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentGoodsList: [],
    skuModel: false,
    marketPlaceId: '',
    cartList: [],
    cartEnum: {},
    selectSku: null,
  },
  //模糊搜索
  handleGoodsSearch(e){
    api.post("/facade/front/goods/search", {content:e.detail.value,marketPlaceId:this.data.marketPlaceId}).then(res => {
      this.setData({
        currentGoodsList: res.data
      })
    }).catch(e => {
      console.log(e)
    })
  },
  //查阅购物车
  getCartList() {
    api.post("/facade/front/cart/queryCart", {}).then(res => {
      let obj = {}
      res.data.forEach(e => {
        if(obj[e.goodsId]){
          obj[e.goodsId] += e.num
        }else{
          obj[e.goodsId] = e.num
        }
      })
      this.setData({
        cartList: res.data,
        cartEnum: obj
      })
    }).catch(e => {
      console.log(e)
    })
  },
  //减少数量
  subCart(e) {
    let goodsId = e.currentTarget.dataset.id
    let cart = this.data.cartList.filter(e => e.goodsId == goodsId)[0]
    api.post("/facade/front/cart/dec", {
      num: 1,
      cartId: cart.cartId
    }).then(res => {
      this.getCartList()
    }).catch(e => {
      console.log(e)
    })
  },
  //增加数量
  openSkuModel(e) {
    let item = e.currentTarget.dataset.item
    let goodsId = item.goods_id
    api.post("/facade/front/goods/getGoodsDetail", {
      goodsId: goodsId
    }).then(res => {
      this.setData({
        goodsObj: Object.assign(res.data,{storeId:item.store_id,marketplaceId:item.marketplace_id})
      })
      if (item.single_status) {
        this.addCart(goodsId, 
          this.data.goodsObj.skuList[0].skuId,
          this.data.goodsObj.storeId,
          this.data.goodsObj.marketplaceId
        )
        return
      }
      this.setData({
        skuModel: true,
        selectSku: this.data.goodsObj.skuList.length > 0 ? this.data.goodsObj.skuList[0] : null
      })
    }).catch(e => {
      console.log(e)
    })
  },
  //选择商品种类
  checkSkuItem(e) {
    let item = e.currentTarget.dataset.item
    this.setData({
      selectSku: item
    })
  },
  //选好了
  submitSku() {
    this.addCart(
      this.data.goodsObj.goodsId, 
      this.data.selectSku.skuId,
      this.data.goodsObj.storeId,
      this.data.goodsObj.marketplaceId
    )
  },
  // 增加商品进入购物车
  addCart(goodsId,skuId,storeId,marketplaceId) {
    api.post("/facade/front/cart/addCart", {
      goodsId: goodsId,
      num: 1,
      marketPlaceId: marketplaceId,
      skuId: skuId,
      storeId: storeId
    }).then(res => {
      this.setData({
        skuModel: false
      })
      this.getCartList()
    }).catch(e => {
      console.log(e)
    })
  },
  //关闭
  onClose() {
    this.setData({
      skuModel: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      marketPlaceId:options.marketPlaceId
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
      skuModel: null
    })
    const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
    const uid = wx.getStorageSync("uid") ? wx.getStorageSync("uid") : '';
    if(uid && token){
      this.getCartList()
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