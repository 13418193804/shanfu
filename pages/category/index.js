import api from "../../utils/http_request.js"
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marketPlaceList: [],
    currentGoodsList: [],
    marketPlaceId: '',
    mainActiveIndex: 0,
    marketIndex: 0,
    categoryList: [],
    skuModel: null,
    detailModel: null,
    goodsObj: {},
    selectSku: null,
    cartList: [],
    cartEnum: {},
    skeleton:true,
    queryMarketPlaceId:null
  },
  checkSkuItem(e) {
    let item = e.currentTarget.dataset.item
    this.setData({
      selectSku: item
    })
  },
  submitSku() {

    this.addCart(
      this.data.goodsObj.goodsId, 
      this.data.selectSku.skuId,
      this.data.goodsObj.store.storeId
      )
  },
  openSkuModel(e) {
    console.log(e)
    let item = e.currentTarget.dataset.item
    let goodsId = item.goodsId
    // singleStatus 单品状态
    api.post("/facade/front/goods/getGoodsDetail", {
      goodsId: goodsId
    }).then(res => {
      this.setData({
        goodsObj: Object.assign(res.data,{store:item.store})
      })

      if (item.singleStatus) {
        this.addCart(goodsId, 
          this.data.goodsObj.skuList[0].skuId,
          this.data.goodsObj.store.storeId
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


  addCart(goodsId, skuId,storeId) {
app.checkToken()
    api.post("/facade/front/cart/addCart", {
      goodsId: goodsId,
      num: 1,
      marketPlaceId: this.data.marketPlaceList[this.data.marketIndex].marketplaceId,
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
  onClose() {
    this.setData({
      skuModel: false
    })
  },
  onClickNav({
    detail = {}
  }) {
    console.log(detail)
  },

  onClickItem({
    detail = {}
  }) {
    console.log(detail)

  },
  openDetailModel(e){
    let item = e.currentTarget.dataset.item
    let goodsId = item.goodsId
    api.post("/facade/front/goods/getGoodsDetail", {
      goodsId: goodsId
    }).then(res => {
      this.setData({
        goodsObj: Object.assign(res.data,{store:item.store})
      })
      // if (item.singleStatus) {
      //   this.addCart(goodsId, 
      //     this.data.goodsObj.skuList[0].skuId,
      //     this.data.goodsObj.store.storeId
      //     )
      //   return
      // }
      this.setData({
        detailModel: true
      })
    }).catch(e => {
      console.log(e)
    })
  },
  onDetailClose() {
    this.setData({
      detailModel: false
    })
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
    const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
    const uid = wx.getStorageSync("uid") ? wx.getStorageSync("uid") : '';
    if(uid && token){
    this.getCartList()
    }
    this.getMarketPlaceList()

  },
  bindMarketChange(e){
    this.setData({
      marketIndex: e.detail.value
    })
    this.getCategoryByMarket()
    
  },
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
  bindPickerChange(e) {
    this.setData({
      marketIndex: e.detail.value
    })
  },
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

      this.getCategoryByMarket()
    }).catch(e => {
      console.log(e)
    })
  },
  onClickNav(e) {
    this.setData({
      mainActiveIndex: e.detail.index
    })
    this.getGoodsByCarId()
  },
  getGoodsByCarId() {
    api.post("/facade/front/goods/queryGoodsByMarket", {
      categoryId: this.data.categoryList[this.data.mainActiveIndex].catId,
      marketPlaceId: this.data.marketPlaceList[this.data.marketIndex].marketplaceId
    }).then(res => {
      this.setData({
        currentGoodsList: res.data,
        skeleton:false
      })
    }).catch(e => {
      console.log(e)
    })

  },
  getCategoryByMarket() {
    api.post("/facade/front/goods/queryCategoryPortal", {
      marketPlaceId: this.data.marketPlaceList[this.data.marketIndex].marketplaceId
    }).then(res => {
      this.setData({
        categoryList: res.data.categoryList.map(e => {
          return {
            ...e,
            text: e.catName
          }
        })
      })
      this.getGoodsByCarId()
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