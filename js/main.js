let stocks=["苹果","黄金","石油","比特币"]
let tmp=[];
let f=30;
for (let i = 0; i < stocks.length; i++) {
    tmp.push(0);
}
let player = {
        money: 1000,
        stocks: tmp,
        stocksPrice: tmp,
        totalTime: 0,
};

//重置
function hardReset1(a) {
    if (a) {
        let tmp=[];
        for (let i = 0; i < stocks.length; i++) {
            tmp.push(0);
    }
    player = {
        money: 1000,
        stocks: tmp,
        stocksPrice: tmp,
        totalTime: 0,
    };
    };
    save();
}
//套壳
function hardReset() {
    var xhr = new XMLHttpRequest();
    xhr.open("get", "https://v1.jinrishici.com/all.txt", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var responseText = xhr.responseText;
                console.log(responseText);
                let c1 = prompt(`您确定要硬重置吗？\n输入“${responseText}”确定`) == responseText;
                hardReset1(c1);
            } else {
                let c2 = prompt(`请求失败:${xhr.status}\n请输入“我确定我要对我的存档进行一次硬重置”确定`) == "我确定我要对我的存档进行一次硬重置";
                hardReset1(c2);
            }
        }
    };
    // 发送请求
    xhr.send();

}
//隐藏原页面
function noneBefore() {
    document.getElementById(nowLookAt).style.display = "none";
}
//切换至pagek
function switchTo(k) {
    noneBefore();
    nowLookAt = 'page' + k;
    document.getElementById(nowLookAt).style.display = "block";
}
// 显示通知框
function showNotify(str) {//+1
    notify.classList.remove('hide');
    notify.innerHTML = str
}
// 隐藏通知框
function hideNotify() {//+1
    notify.classList.add('hide');
}
function addNotify(str) {//+1
    showNotify(str)
    setTimeout(function () {
        hideNotify()
    }, 1000)
}
let nowLookAt = "pageStocks";
function getRainbow(period = Math.sqrt(760)) {
    let t = new Date().getTime()
    let a = Math.sin(t / 1e3 / period * 2 * Math.PI + 0)
    let b = Math.sin(t / 1e3 / period * 2 * Math.PI + 2)
    let c = Math.sin(t / 1e3 / period * 2 * Math.PI + 4)
    a = convertToB16(Math.floor(a * 128) + 128)
    b = convertToB16(Math.floor(b * 128) + 128)
    c = convertToB16(Math.floor(c * 128) + 128)
    return "#" + String(a) + String(b) + String(c)
}
function convertToB16(n) {
    let codes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
    let x = n % 16
    return codes[(n - x) / 16] + codes[x]
}

//===================================================
function refreshDisplay(){
    document.getElementById("moneyDisplay").innerHTML=player.money;
}

setInterval(refreshDisplay,1000/f);