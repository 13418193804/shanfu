import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentGoodsList: [],
    marketPlaceList: [],
    columnId: '',
    marketIndex: 0,
    skuModel: null,
    detailModel: null,
    marketPlaceId: '',
    queryMarketPlaceId:null,
    content: '',
    cartList: [],
    cartEnum: {},
    selectSku: null,
    searchRecordShow: true,
    searchRecordItem: []  //搜索历史
  },
  //模糊搜索
  handleGoodsSearch(){
    let searchRecordList = (wx.getStorageSync('searchRecord') == undefined || wx.getStorageSync('searchRecord') == '') ? [] : wx.getStorageSync('searchRecord')
    if (this.data.content == "") {
      wx.showToast({
        title: '请输入商品名',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    //记录中存在，往前提，没有就头部添加
    if(searchRecordList.indexOf(this.data.content) >= 0) {
      //缓存中已存在，将其提到第一个同时将原来位置的删除
      searchRecordList.splice(searchRecordList.indexOf(this.data.content), 1)
      //如缓存的个数的限制，超出从尾部删除
      if(searchRecordList.unshift(this.data.content) > 20) {
        searchRecordList.pop()
      }
    } else {
      if(searchRecordList.unshift(this.data.content) > 20) {
        searchRecordList.pop()
      }
    }
    //将处理好的数据存入缓存中
    wx.setStorageSync('searchRecord', searchRecordList);
    this.setData({
      searchRecordItem: searchRecordList,
      searchRecordShow: false,
    })
    api.post("/facade/front/goods/search", {
      content:this.data.content,
      marketPlaceId:this.data.marketPlaceList[this.data.marketIndex].marketplaceId
    },{
      loading: true
    }).then(res => {
      this.setData({
        currentGoodsList: res.data
      })
    }).catch(e => {
      console.log(e)
    })
  },
  //选择历史记录搜索
  selectRecord(e){
    this.setData({
      content:e.currentTarget.dataset.item,
      searchRecordShow: false
    })
    this.handleGoodsSearch()
  },
  //清空搜索记录
  clearRecord(){
    let self = this
    wx.showModal({
      title: '提示',
      cancelText:'取消',
      confirmText:'确定',
      content: '是否清空历史记录',
      success(res) {
        if(res.confirm) {
          let searchRecordList = wx.getStorageSync('searchRecord')
          searchRecordList = []
          wx.setStorageSync('searchRecord', searchRecordList)
          self.setData({
            searchRecordItem: searchRecordList
          })
        }else if(res.cancel){
          console.log('用户点击取消')
        }
      }
    })
  },
  //查询栏目列表
  getColumnList(){
    api.post("/facade/front/goods/queryOperationColumn", {
      operationColumnId: this.data.columnId
    },{
      loading: true
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
    if(this.data.content != ''){
      this.handleGoodsSearch()
    }
    
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
    let goodsId = item.goodsId
    api.post("/facade/front/goods/getGoodsDetail", {
      goodsId: goodsId
    }).then(res => {
      this.setData({
        goodsObj: Object.assign(res.data,{storeId:item.storeId,marketplaceId:item.marketplaceId})
      })
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
    let goodsId = item.goodsId
    wx.navigateTo({
      url: `/Trade/goods_detail/index?id=${goodsId}`,
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
    if(e.detail.value == ''){
      this.setData({
        searchRecordShow: true,
        currentGoodsList: []
      })
    }
    this.setData({
      content: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let searchRecordItem = (wx.getStorageSync('searchRecord') == undefined || wx.getStorageSync('searchRecord') == '') ? [] : wx.getStorageSync('searchRecord');
    this.setData({
      queryMarketPlaceId:options.marketPlaceId,
      columnId: options.columnId,
      searchRecordItem: searchRecordItem
    })

    this.setData({
      skuModel: null,
      detailModel: null
    })
    const token = wx.getStorageSync("token") ? wx.getStorageSync("token") : '';
    const uid = wx.getStorageSync("uid") ? wx.getStorageSync("uid") : '';
    if(uid && token){
      this.getCartList()
    }
    if(this.data.columnId == '' || this.data.columnId == undefined){
      this.getMarketPlaceList()
    }else{
      this.getColumnList()
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