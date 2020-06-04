import api from "../../utils/http_request.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prepareId: null,
    isDefault: false,
    country: '',
    contractName: '',
    contractMobile: '',
    city: '',
    province: '',
    street: '',
    addressId: null,
    location: {}
  },
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },

  saveAddress() {
    let params = {
      address: this.data.address,
      city: this.data.city,
      country: this.data.country,
      isDefault: this.data.isDefault,
      contractMobile: this.data.contractMobile,
      contractName: this.data.contractName,
      lat: this.data.location.latitude,
      lng: this.data.location.longitude,
      province: this.data.province,
      street: this.data.street
    }
    if (this.data.addressId) {
      params.addressId = this.data.addressId
      api.post("/facade/front/address/update", params, {
        loading: true
      }).then(res => {
        if (res.statusCode >= 550) {}
        wx.showToast({
          title: '修改成功',
        })
        wx.navigateBack({
          complete: (res) => {},
        })
      })
      return
    }
    api.post("/facade/front/address/add", params, {
      loading: true
    }).then(res => {
      if (res.statusCode >= 550) {}
      wx.showToast({
        title: '添加成功',
      })

      if (this.data.prepareId) {
        this.prepareUpdateAddress(res.data.addressId)
      } else {
        wx.navigateBack({
          complete: (res) => {},
        })
      }
    })
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      addressId: options.id,
      prepareId: options.prepareId
    })

    if (options.id) {
      this.getAddress()
    } else {
      this.doGetStreet(null)
    }
  },
  getAddress() {

    api.post("/facade/front/address/info", {
      addressId: this.data.addressId,

    }, {

    }).then(res => {
      console.log(res.data)
      this.setData({
        address: res.data.address,
        city: res.data.city,
        country: res.data.country,
        isDefault:res.data.isDefault,
        contractMobile: res.data.contractMobile,
        contractName: res.data.contractName,
        lat :res.data.lat,
        lng :res.data.lng,
        province: res.data.province,
        street: res.data.street,

      })
 
    })
  },


  chooseAddress() {
    let _self = this
    wx.chooseLocation({
      success: (e) => {
        console.log(e)
        let location = {
          latitude: e.latitude,
          longitude: e.longitude
        }
        _self.setData({
          location: location,
          street: e.name
        })
        _self.doGetStreet(location)
      }
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

  },
  doGetStreet(location) {
    app.reverseGeocoder((e) => {
      this.setData({
        country: e.address_component.district,
        city: e.address_component.city,
        province: e.address_component.province,
        location: {
          latitude: e.location.lat,
          longitude: e.location.lng
        }
      })
      if (!location) {
        this.setData({
          street: e.address_component.street,
        })
      }
      console.log(e)
    }, location)
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