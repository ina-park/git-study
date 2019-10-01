var today = new Date();
var today_year = today.getFullYear();
var today_month = today.getMonth() + 1;
var today_day = today.getDate();
var today_hours = today.getHours();
var today_min = today.getMinutes();

if (("" + today_month).length == 1) { today_month = "0" + today_month; }
if (("" + today_day).length == 1) { today_day = "0" + today_day; }
if (("" + today_hours).length == 1) { today_hours = "0" + today_hours; }
if (("" + today_min).length == 1) { today_min = "0" + today_min; }

todayYYYYMMDD = today_year + "" + today_month + "" + today_day;
todayYYYYMMDDmmss = todayYYYYMMDD + "" + today_hours + "" + today_min;

ssid = getCookieId("_ssid"); //30분
sbid = getCookieId("_sbid"); //10년 


//BrowgerID 생성 
function createBID() {
    var s = [];
    var strArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < 5; i++) {
        s[i] = strArray.substr(Math.floor(Math.random() * 52), 1);
        var BrowgerStr = s.join("");
    }

    var browgerTempStr = todayYYYYMMDDmmss.substring(2, 12) + "" + BrowgerStr;
    return browgerTempStr;
}

function setCookieId(cookieName, cookieValue, expireMin, expiresCls) {

    if (expiresCls == 1) {

        var date1 = new Date;
        date1.setTime(date1.getTime() + expireMin * 24 * 60 * 60 * 1000);
        var expires = "; expires=" + date1.toGMTString();
        //al-ert("jihyun0803:::sbid:::" + expires)
    }

    if (expiresCls == 2) {
        var date2 = new Date;
        date2.setMinutes(date2.getMinutes() + expireMin);
        var expires = "; expires=" + date2.toGMTString();

        //al-ert("jihyun0803:::ssid:::" + expires)
    }

    document.cookie = cookieName + "=" + escape(cookieValue) + "; path=/" + expires + ";";
    return cookieValue;
}



function getCookieId(cookieName) {

    var search = cookieName + "=";
    var cookie = document.cookie;
    var setData = "";
    var returnData = "";

    if (cookie.length > 0) {
        startIndex = cookie.indexOf(search);

        if (startIndex != -1) {
            startIndex += cookieName.length;
            endIndex = cookie.indexOf(";", startIndex);

            if (endIndex == -1) {
                endIndex = cookie.length;
                setData = unescape(cookie.substring(startIndex + 1, endIndex));

            } else {
                setData = unescape(cookie.substring(startIndex + 1, endIndex));
            }
        } else {
            setData = this.createBID();
        }
    }

    if (cookieName == "_ssid") {
        expireMin = 30;
        expiresCls = 2;
    }

    if (cookieName == "_sbid") {
        expireMin = 3650;
        expiresCls = 1;
    }

    return this.setCookieId(cookieName, setData, expireMin, expiresCls);
}