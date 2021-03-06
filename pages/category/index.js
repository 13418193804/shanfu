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
    skeleton: true,
    queryMarketPlaceId: null,
    catId: null,
    secCatId: null
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
        goodsObj: Object.assign(res.data, {
          store: item.store
        })
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


  addCart(goodsId, skuId, storeId) {
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

  openDetailModel(e) {
    let item = e.currentTarget.dataset.item
    let goodsId = item.goodsId

    wx.navigateTo({
      url: `/Trade/goods_detail/index?id=${goodsId}`,
    })



  },
  //商品详情增加
  openDetaiSkuModel(e) {
    let item = e.currentTarget.dataset.item
    let goodsId = item.goodsId
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      queryMarketPlaceId: options.marketPlaceId
    })
    this.getMarketPlaceList()

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
    if (uid && token) {
      this.getCartList()
    }
  },
  bindMarketChange(e) {
    this.setData({
      marketIndex: e.detail.value,
    })
    this.getGoodsByCarId()
  },

  getCartList() {
    api.post("/facade/front/cart/queryCart", {}).then(res => {
      let obj = {}
      let cartNum = 0
      res.data.forEach(e => {
        if (obj[e.goodsId]) {
          obj[e.goodsId] += e.num
        } else {
          obj[e.goodsId] = e.num
        }
      })
      this.setData({
        cartList: res.data,
        cartEnum: obj
      })
      for (let i = 0; i < res.data.length; i++) {
        cartNum += res.data[i].num
        console.log("cartNum", cartNum)
      }
      if (cartNum !== 0) {
        wx.setTabBarBadge({
          index: 2,
          text: String(cartNum)
        })
      } else {
        wx.removeTabBarBadge({
          index: 2
        })
      }
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

      if (this.data.queryMarketPlaceId) {
        this.data.marketPlaceList.forEach((e, index) => {
          if (e.marketplaceId == this.data.queryMarketPlaceId) {
            this.setData({
              marketIndex: index,
              queryMarketPlaceId: null
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
      categoryId: this.data.secCatId,
      marketPlaceId: this.data.marketPlaceList[this.data.marketIndex].marketplaceId
    }, {
      loading: true
    }).then(res => {
      this.setData({
        currentGoodsList: res.data,
        skeleton: false
      })
    }).catch(e => {
      console.log(e)
    })

  },
  bindCatIdChange(e) {
    let item = e.currentTarget.dataset.item
    let catId = item.catId
    if (this.data.catId == catId) {
      this.setData({
        catId: null,
        secCatId: null
      })
      return
    }
    let secCatId = catId && item.children[0] ? item.children[0].catId : null
    this.setData({
      catId: catId,
      secCatId: secCatId
    })
    this.getGoodsByCarId()
  },

  bindSecCatIdChange(e) {
    let item = e.currentTarget.dataset.item
    let catId = item.catId
    if (this.data.secCatId == catId) {
      return
    }
    this.setData({
      secCatId: catId
    })
    this.getGoodsByCarId()
  },
  getCategoryByMarket() {
    api.post("/facade/front/category/alltree", {
      marketPlaceId: this.data.marketPlaceList[this.data.marketIndex].marketplaceId
    }).then(res => {
      let list = res.data
      let catId = list[0] ? list[0].catId : null
      let secCatId = catId && list[0].children[0] ? list[0].children[0].catId : null
      this.setData({
        categoryList: list,
        catId: catId,
        secCatId: secCatId
      })
      this.getGoodsByCarId()
    }).catch(e => {
      console.log(e)
    })


  },
  //商品搜索
  handleSearch() {
    let marketPlaceId = this.data.marketPlaceList[this.data.marketIndex].marketplaceId
    wx.navigateTo({
      url: "/Trade/goods_search/index?marketPlaceId=" + marketPlaceId,
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