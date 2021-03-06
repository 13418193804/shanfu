import api from "../../utils/http_request.js"
const app = getApp()

  

Page({
      data: {
        maskModel:true,
        capsuleWidth: 0, //胶囊宽度
        capsuleHeight: 0, //胶囊宽度
        capsuleTop: 0,
        customBar: 0,
        searchWidth: 0,
        windowWidth:0,
        screenHeight: 0,
        windowHeight: 0,
        recommendAddress:'获取定位中...',
        shopList:["中心市场","城东市场","城西市场"],
        catList: ["限时秒杀", "天天特价", "应季果蔬"],
        hotBarList:[],
        marketPlaceList:[],
        // "邀请有奖", "下单减免 "
          invitationNum: 0.00,
          userId: null,
          openId: null,
          netWorkObj: {},
   
          stationModel: false,
          selectCityModel: false,
          stationObjdect: {},
       
          rechargeModel: false,
          stationList: [],
          latitude: null,
          longitude: null,
          motto: 'Hello World',
          userInfo: {},
          hasUserInfo: false,
          canIUse: wx.canIUse('button.open-type.getUserInfo'),
          region: ['广东省', '广州市', '海珠区'],
          latitude: 23.099994,
          longitude: 113.324520,
          polylineList: [],
          city: '--',
          regionName: "--",
          cityList: [
            "新疆", "江苏", "广东", "江西"
          ],
          cityActiveId: 0,
          refuelModel: false,
          loginName: '',
          bindModel: false,
          oilCardId: '',
          currentSwiperIndex: 0,
          rechargeAmount: 100,
          rechargeObj: {},
          oilTypeEnum: {
            GASOLINE: '汽油',
            DIESEL: '柴油'
          },
          statusBarHeight:0,
          bannerList:[]
        },
        replaceStr(str) {
          return str.replace(/(.{4})/g, '$1 ');
        },
   
        removeRechargeAmount(e) {
          if (this.data.rechargeAmount <= 100) {
            wx.showToast({
              title: "不能再少啦！",
              icon: 'none',
              duration: 1500,
            })
            return
          }
          this.setData({
            rechargeAmount: this.data.rechargeAmount -= 100
          })
        },
        inputOilCardId(e) {
          this.setData({
            oilCardId: e.detail.value.replace(/\s+/g, "")
          })
        },

        openBindModel() {
          this.setData({
            bindModel: true,
            inputOilCardId: ''
          })
        },
   
        getPhoneNumber(e) {
          console.log(e)
          if ((e.detail.iv || '') == '' && (e.detail.encryptedData || '') == '') {
            wx.showToast({
              title: "授权失败",
              icon: 'none',
              duration: 1500,
            })
            return
          }
          const _self = this
          wx.login({
            success(res) {
              if (res.code) {
                //发起网络请求
                console.log("code", res.code,
                  "encryptedData", e.detail.encryptedData,
                  "iv", e.detail.iv)
                // return
                api.post("/user/warrant/login", {
                  "code": res.code,
                  "encryptedData": e.detail.encryptedData,
                  "iv": e.detail.iv
                }, {
                  loading: true
                }).then(res => {
                  if (res.status >= 550) {
                    wx.showToast({
                      title: '授权失败',
                      icon: 'none',
                      duration: 1500,
                    })
                    return
                  }

                  wx.showToast({
                    title: '授权成功',
                    duration: 1500,
                  })
                  console.log('授权res', res)
                  wx.setStorageSync('token', res.token)
                  wx.setStorageSync('invitationCode', res.invitationCode) //自己的code
                  wx.setStorageSync('openId', res.openId)
                  wx.setStorageSync('userId', res.userId)
                  wx.setStorageSync('loginName', res.loginName)
                  _self.setData({
                    userId: res.userId,
                    openId: res.openId
                  });
                  _self.getOilCardList();
                  app.invitationBind()


                }).catch(e => {
                  console.log(e)
                })
              } else {
                console.log('登录失败！' + res.errMsg)
              }
            }
          })
        },
        closeBindModel() {
          this.setData({
            bindModel: false,
            oilCardId: ''
          })
        },
        openRefuelModel() {
          this.setData({
            refuelModel: true
          })
        },

        closeRefuelModel() {
          this.setData({
            refuelModel: false
          })
        },

        closeSelectCityModel() {
          this.setData({
            selectCityModel: false
          })
        },
        closeRechargeModel() {
          this.setData({
            rechargeModel: false
          })
        },
    
        selectCity(e) {
          this.setData({
            cityActiveId: e.currentTarget.dataset.activeid
          })
        },
        onReady: function (e) {







        },

        goMarket(e){
          let marketPlaceId  = e.currentTarget.dataset.id
          wx.reLaunch({
            url: `/pages/category/index?marketPlaceId=${marketPlaceId}`,
          })
        },

        onShow: function () {
          if (app.globalData.userInfo) {
            this.setData({
              userInfo: app.globalData.userInfo,
              hasUserInfo: true
            })
          } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
              this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              })
            }
          } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
              success: res => {
                app.globalData.userInfo = res.userInfo
                this.setData({
                  userInfo: res.userInfo,
                  hasUserInfo: true
                })
              }
            })
          }

          app.reverseGeocoder((e) => {
            this.setData({
              recommendAddress: e.formatted_addresses.recommend,
            })
         
          })
          this.getColumnList()
          this.getMainPage()
          this.getCartList()

          this.getBannerList()
        },
        getBannerList(){
          

          api.post("/facade/front/pageComponent/list", {
          }).then(res => {
            this.setData({
              bannerList : res.data
            })

          })
        },
        //栏目
        getColumnList(){
          api.post("/facade/front/operationColumn/list", {
          }).then(res => {
            this.setData({
              hotBarList:res.data
            })
          }).catch(e => {
            console.log(e)
          })
        },
        getMainPage(){
          api.post("/facade/front/portal/mainPage", {
          }).then(res => {
              this.setData({
                marketPlaceList:res.data.marketPlaceList.map(e=>{
                  return {
                    ...e,
                    remarkList:e.remark.split(',')
                  }
                })
              })
              console.log(this.data.remarkList)
          }).catch(e => {
            console.log(e)
          })
        },
        

        getNetWorkList() {
        
        },

     
        doPay() {
          const _self = this
          api.post("/front/depositCard/buy", {
            depositCardId: this.data.rechargeObj.id,
            depositCardPreferencesRulesId: this.data.rechargeObj.rulesId,
            // priceActually: this.rechargeObj.denomination - this.rechargeObj.offerValue,
            priceActually: 1,
          }, {
            loading: true
          }).then(res => {
            if (res.status >= 550) {
              wx.showToast({
                title: res.message,
                icon: 'none',
                duration: 1500,
              })
              return
            }

            let orderId = res.id
            return orderId
          }).then((orderId) => {
            api.post("/front/weChat/miniPay", {
              "body": 'body',
              "openId": this.data.openId,
              orderId: orderId,
              orderType: 'RECHARGE_CARD'
            }).then(res => {
              if (res.status >= 550) {
                wx.showToast({
                  title: res.message,
                  icon: 'none',
                  duration: 1500,
                })
                return
              }
              wx.requestPayment({
                timeStamp: res.timeStamp,
                nonceStr: res.nonceStr,
                package: res.package,
                signType: 'MD5',
                paySign: res.paySign,
                success(res) {
                  wx.showToast({
                    title: "支付成功",
                    duration: 2000,
                  })
                  _self.closeRechargeModel()
                  _self.getOilCardList()
                },
                fail(res) {
                  wx.showToast({
                    title: "支付失败",
                    icon: 'none',
                    duration: 2000,
                  })
                },
                complete(e) {
                  console.log(e)
                }
              })
            }).catch(e => {
              console.log(e)
            })
          })

        },
        onLoad: function () {
          const _self = this
          wx.getSystemInfo({
            success(res) {
              let obj = wx.getMenuButtonBoundingClientRect()
              _self.setData({
                capsuleWidth: obj.width, //胶囊宽度
                capsuleHeight: obj.height, //胶囊宽度
                capsuleTop: obj.top,
                customBar: obj.bottom + obj.top - res.statusBarHeight,
                searchWidth: obj.left - 20,
                windowWidth: res.windowWidth,
                screenHeight: res.screenHeight,
                windowHeight: res.windowHeight
              })
            }
          })

          this.setData({
            userId: wx.getStorageSync("userId") ? wx.getStorageSync("userId") : null,
            openId: wx.getStorageSync("openId") ? wx.getStorageSync("openId") : null,
          })

          wx.showShareMenu({
            withShareTicket: true
          })
          this.getSystemInfoMethods()


        },
        getSystemInfoMethods:function(){
                    let _this = this
                    wx.getSystemInfo({
                      success:function(res){
                        console.log("111111111222222",res)
                        _this.setData({
                          statusBarHeight:res.statusBarHeight
                        })
                      }
                    })
                  },
      
        onShareAppMessage: function (res) {
          let invitationCode = wx.getStorageSync("invitationCode") || '';
          return {
            title: '车陆士',
            path: 'pages/home/index?invitationCode=' + invitationCode
          }
        },
        getUserInfo: function (e) {
          app.getUserInfo();
          app.globalData.userInfo = e.detail.userInfo
          this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
          });
          // this[e.currentTarget.dataset.nextmethodname]();
        },

        goChrage(e) {
          wx.navigateTo({
            url: '/ChrageProcess/station/index',
          })
        },

        goChrage(e) {
          wx.navigateTo({
            url: '/ChrageProcess/station/index',
          })
        },
        chengeSelectCityModel() {
          wx.navigateTo({
            url: '/ChrageProcess/select_city/index',
          })
        },

        goApplyCard() {
          wx.navigateTo({
            url: '/ChrageProcess/apply_card/index',
          })
        },
        goInvite: function () {
          wx.navigateTo({
            url: '/PersonalContract/invite/index'
          })
        },
        //商品搜索
        handleSearch(){
          wx.navigateTo({
            url: '/Trade/goods_search/index',
          })
        },
        //栏目跳转商品搜索
        hotBarSearch(e){
          let columnId = e.currentTarget.dataset.columnid
          wx.navigateTo({
            url: '/Trade/goods_search/index?columnId=' + columnId,
          })
        },
        neverLoad() {
          wx.showToast({
            title: "敬请期待！",
            icon: 'none',
            duration: 1500,
          })
        },
        doBindCard() {


          if ((this.data.oilCardId || '') == '') {
            wx.showModal({
              title: '提示',
              content: '请输入卡号',
              showCancel: false,
            })
            return
          }

          api.post("/front/oilCard/bindUser", {
            "oilCardId": this.data.oilCardId,
          }).then(res => {
            if (res.status == 200) {
              this.closeBindModel()
              this.getOilCardList()
              wx.showToast({
                title: '添加成功',
              })
            } else {
              wx.showToast({
                title: res.message,
                icon: 'none',
                duration: 1500,
              })
            }
          })
        },
        getCartList() {
          api.post("/facade/front/cart/queryCart", {}).then(res => {
            let obj = {}
            let cartNum = 0
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
            for(let i = 0; i < res.data.length;i++){
              cartNum += res.data[i].num
              console.log("cartNum",cartNum)
            }
            if(cartNum !== 0){
              wx.setTabBarBadge({
                index: 2,
                text: String(cartNum)
              })
            } else{
              wx.removeTabBarBadge({
                index: 2
              })
            }
          }).catch(e => {
            console.log(e)
          })
        },

      })