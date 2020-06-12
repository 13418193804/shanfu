import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentGoodsList: [],
    marketPlaceList: [],
    marketIndex: 0,
    skuModel: null,
    detailModel: null,
    marketPlaceId: '',
    queryMarketPlaceId:null,
    content: '',
    cartList: [],
    cartEnum: {},
    selectSku: null,
  },
  //模糊搜索
  handleGoodsSearch(){
    api.post("/facade/front/goods/search", {
      content:this.data.content,
      marketPlaceId:this.data.marketPlaceList[this.data.marketIndex].marketplaceId
    }).then(res => {
      this.setData({
        currentGoodsList: res.data
      })
    }).catch(e => {
      console.log(e)
    })
  },
  //查询市场
  getMarketPlaceList() {
    api.post("/facade/front/portal/mainPage", {}).then(res => {
      this.setData({
        marketPlaceList: res.data.marketPlaceList
      })
      if(this.data.queryMarketPlaceId){
        this.data.marketPlaceList.forEach((e,index)=>{
          if(e.marketplaceId == this.data.queryMarketPlaceId){
            this.setData({
              marketIndex :index,
              queryMarketPlaceId:null
            })
          }
        })
      }
    }).catch(e => {
      console.log(e)
    })
  },
  //选择市场
  bindMarketChange(e){
    this.setData({
      marketIndex: e.detail.value
    })
    this.handleGoodsSearch()
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
        detailModel: false,
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
  //打开商品详情
  openDetailModel(e){
    let item = e.currentTarget.dataset.item
    let goodsId = item.goods_id
    api.post("/facade/front/goods/getGoodsDetail", {
      goodsId: goodsId
    }).then(res => {
      this.setData({
        goodsObj: Object.assign(res.data,{storeId:item.store_id,marketplaceId:item.marketplace_id,store_name:item.store_name})
      })
      this.setData({
        detailModel: true
      })
    }).catch(e => {
      console.log(e)
    })
  },
  //商品详情增加数量
  openDetaiSkuModel(e) {
    let item = e.currentTarget.dataset.item
    let goodsId = item.goodsId
    if (item.singleStatus) {
      this.addCart(goodsId, 
        this.data.goodsObj.skuList[0].skuId,
        this.data.goodsObj.storeId,
        this.data.goodsObj.marketplaceId
      )
      return
    }
    this.setData({
      skuModel: true,
      detailModel: false,
      selectSku: this.data.goodsObj.skuList.length > 0 ? this.data.goodsObj.skuList[0] : null
    })
  },
  //关闭商品详情
  onDetailClose() {
    this.setData({
      detailModel: false
    })
  },
  //获取输入框的值
  handleInpue(e){
    switch (e.currentTarget.dataset.name) {
      case 'content':
        this.setData({
          content: e.detail.value
        })
        break
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      queryMarketPlaceId:options.marketPlaceId
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
      skuModel: null,
      detailModel: null
    })
    const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
    const uid = wx.getStorageSync("uid") ? wx.getStorageSync("uid") : '';
    if(uid && token){
      this.getCartList()
    }
    this.getMarketPlaceList()
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