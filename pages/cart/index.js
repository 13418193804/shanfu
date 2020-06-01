import api from "../../utils/http_request.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: false,
    selectAll: false,
    token: null,
    cartObj:{},
    selectCartList:[]
  },
  submitCart(){
    api.post("/facade/front/cart/cart2Prepare", {}).then(res => {
      console.log('--提交购物车', res)
      let prepareId =  res.data.prepareId
      wx.navigateTo({
        url: `/Trade/confirm/index?prepareId=${prepareId}`,
      })
    }).catch(e => {
      console.log(e)
    })
  },
  getCartList() {
    api.post("/facade/front/cart/queryCartWithStore", {}).then(res => {
      console.log('---查询购物车', res)
      this.setData({
        cartObj:res.data
      })
    }).catch(e => {
      console.log(e)
    })
  },
  doSubmit() {
    wx.navigateTo({
      url: '/Trade/confirm/index',
    })
  },
  onChange(event) {
    console.log(event)
    this.data.selectCartList.push(event.detail[0])
    // for(let i in this.data.cartObj){
    //   if(i==event.detail[0]){

        

    //     let value = !this.data.selectCartObj[event.detail[0]]
        
    //     this.data.cartObj[event.detail[0]].forEach(e=>{
    //        this.data.selectCartObj[e.cartId] = value
    //     })
    //     this.data.selectCartObj[event.detail[0]] =value
    //   }
    // }

    this.setData({
      selectCartList: this.data.selectCartList
    });


  },
  onSelectAllChange(event) {
    this.setData({
      selectAll: event.detail
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

    this.setData({
      token: token
    })
    if (token) {
      this.getCartList()
    }

  },
  goLogin(){
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