import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prepareId: null,
    addressList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      prepareId: options.prepareId
    })
    console.log(this.data.prepareId)
  },

  selectAddress(e) {
    console.log("11",this.data.prepareId)
    if (!this.data.prepareId) {
      return
    }
    let id = e.currentTarget.dataset.id
  // wx.redirectTo({
  //   url: `/Trade/confirm/index?prepareId=${this.data.prepareId}&addressId=${id}`,
  // })
    this.prepareUpdateAddress(id)
  },

  prepareUpdateAddress(addressId){
    api.post("/facade/front/cart/updateAddress", 
    {
      addressId :addressId,
      prepareId :this.data.prepareId 
    }, {
      loading: true
    }).then(res => {
      if (res.statusCode >= 550) {}
      wx.navigateBack({
        complete: (res) => {},
      })
    })
  },
  doDelete(e) {
    let id = e.currentTarget.dataset.id

    const _self = this
    wx.showModal({
      title: '提示',
      content: '确认删除该收货地址？',
      success: (e) => {
        if (e.confirm) {

          api.post("/facade/front/address/delete", {
            addressId: id,//参数
          }, {
           
          }).then(res => {
            if (res.httpStatus >= 550) {}
            wx.showToast({
              title: '成功',
            })
            _self.getAddressList()
          })
        }
      }

    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  doEdit(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/Contract/address/index?id=${id}`,
    })
  },
  onChange(e) {
    let id = e.currentTarget.dataset.id
    api.post("/facade/front/address/setDefault", {
      addressId: id,
    }, {
    
    }).then(res => {
      if (res.httpStatus >= 550) {}
      wx.showToast({
        title: '成功',
      })
      this.getAddressList()

    })

  },
  doAdd() {
    wx.navigateTo({
      url: '/Contract/address/index',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAddressList()
  },
  getAddressList() {



    api.post("/facade/front/address/list", {
      
    }, {
      header: {
        'content-type': 'application/json'
      }
    }).then(res => {
      
      if (res.httpStatus >= 550) {}

      console.log(res)
      this.setData({
        addressList: res.data
      })

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