var apidomain = {
  // 基础接口
  base: {
    prod: 'https://apigateway.aisishop.com/shanfu-user-service-dev',
    debug: 'http://120.24.70.202:9000',
    huidu: 'https://gfhapi.zkungfu.com/v29'
  },
  // 基础接口 - 线路2
  line2: {
    prod: 'https://gfhapi.zkungfu.com/v29',
    debug: 'http://120.24.70.202:9000',
    huidu: 'https://gfhapi.zkungfu.com/v29'
  },
  // 图片
  image: {
    prod: 'http://gfhapi.zkungfu.com/image2',
    debug: 'http://gfhapi.zkungfu.com/image3',
    huidu: 'http://gfhapi.zkungfu.com/image3'
  },
  // 静态图片（不需区分测试/灰度/正式）
  staticImage: {
    prod: 'http://gfhapi.zkungfu.com/image2'
  }
}

var api = {
  'login': '/user/wechat/openid',//API授权接口返回用户信息
  'foodlist': '/product/saleproduct',//商品列表
  'foodtype': '/product/category',//商品类型
};
//线路2访问
var api_line2 = {
  'lunched': '/order/Lunched',//用户已出餐订单
};

function getSuffix () {
  if (getApp().globalData.huidu) {
    return 'huidu';
  } else if (getApp().globalData.debug) {
    return 'debug';
  }
  return 'prod';
}

function getUrl(path) {
  return `${apidomain['base'][getSuffix()]}${path}`;
}

function getUrl_image() {
  return `${apidomain['image'][getSuffix()]}`;
}

function getUrl_Static_image() {
  return `${apidomain['staticImage']['prod']}`;
}

module.exports.getUrl = getUrl;
module.exports.getUrl_image = getUrl_image;
module.exports.getUrl_Static_image = getUrl_Static_image;