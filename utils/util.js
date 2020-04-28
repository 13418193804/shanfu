/**
 * 时间格式话yyyy-mm-dd hh:mm
 * @param timestamp
 * @returns {string}
 */
function dataFormat(timestamp) {
  try {
    var dateTime = new Date(parseInt(timestamp) * 1000);
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour = dateTime.getHours();
    var minute = dateTime.getMinutes();
    //var second = dateTime.getSeconds();
    const split = "-";
    return year + split + month + split + day + " " + hour + ":" + (minute < 10 ? "0" + minute : minute);
  } catch (e) {
    return "";
  }
}


/**
 * 时间戳剩余样式格式化
 * @param timespan
 * @returns {*}
 */
function formatMsgTime(timespan) {

  timeSpanStr = "";

  try {
    var dateTime = new Date(parseInt(timespan) * 1000);
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour = dateTime.getHours();
    var minute = dateTime.getMinutes();
    var second = dateTime.getSeconds();
    var now = new Date();
    var now_new = Date.parse(new Date()) / 1000;  //typescript转换写法

    var milliseconds = 0;
    var timeSpanStr;

    milliseconds = now_new - timespan;
    //console.log("milliseconds", milliseconds);
    var day = Math.abs(Math.floor(milliseconds / 86400));
    var hour = Math.abs(Math.floor(milliseconds % 86400 / 3600));
    var minute = Math.abs(Math.floor(milliseconds % 86400 % 3600 / 60));


    const prex = milliseconds > 0 ? "前" : "后";

    if (day > 0) {
      timeSpanStr = day + '天' + prex;
    } else if (hour > 0) {
      timeSpanStr = hour + '小时' + prex;
    } else if (minute > 0) {
      timeSpanStr = minute + '分钟' + prex;
    } else {
      timeSpanStr = minute + '分钟' + prex;
    }
  } catch (e) {
  }

  return timeSpanStr;
}

/**
 * 正则表达式匹配
 * @param matchType
 * @param value
 * @returns {Boolean}
 */
function matchFn(matchType, value) {
  let match = {
    // 链接
    url: /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/gi,
    // 固话
    phone: /^((\d{8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/gi,
    // 手机号码
    tel: /^1[345789]\d{9}$/gi,
    // 正整数（不包含0）
    positiveInt: /^[1-9]\d*$/gi,
    // 非负整数（包含0）
    nonnegativeInt: /^[1-9]\d*|0$/gi,
    // 浮点
    float: /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/gi,
    // 小数点后不超过两位
    floatFixedTwo: /^\d+(\.\d{1,2})?$/gi,
    // 邮编
    postcode: /^[1-9]\d{5}(?!\d)$/gi,
    // 邮箱
    email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/gi,
    // 字母或数字
    letterOrNum: /^[a-zA-Z\d]+$/gi,
    // 10位，第一个不能为0
    // 可以输入中文，字母，数字
    room: /^[\u4e00-\u9fa5_a-zA-Z1-9_][\u4e00-\u9fa5_a-zA-Z0-9_]{0,10}$/gi,
    // 身份证
    identity_no: /^\d{15}|\d{18}$/gi
  }
  return match[matchType].test(value);
}

module.exports = {
  formatMsgTime: formatMsgTime,
  dataFormat: dataFormat,
  isBlank: isBlank,
  isPresent: isPresent,
  matchFn: matchFn
}

function isBlank(value) {
  return value === null || value === undefined || value === 'null' || value === 'undefined' || value === '';
}

function isPresent(value) {
  return !isBlank(value);
}





