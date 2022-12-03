function injectTCCC({ token, sdkAppId, userId, sdkUrl }) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.setAttribute("crossorigin", "anonymous");
    script.dataset.token = token;
    script.dataset.sdkAppId = sdkAppId;
    script.dataset.userid = userId;
    script.src = sdkUrl;
    document.body.appendChild(script);
    script.addEventListener("load", function () {
      // 加载JS SDK文件成功，此时可使用全局变量"tccc"
      tccc.on(tccc.events.ready, function () {
        /**
         * Tccc SDK初始化成功，此时可调用外呼等功能。
         * 注意⚠️：请确保只初始化一次SDK
         * */
        console.log('初始化成功"');
        resolve(true);
      });
    });
  });
}
export function initCloudCall(userId = "") {
  return new Promise((resolve, reject) => {
    // 此处替换为服务端地址，用于获取登录腾讯云呼叫中心的token
    fetch("https://localhost:3000/release/getToken?userId=" + userId)
      .then((res) => res.json())
      .then((res) => {
        if (res.code) {
          reject(res.code);
        } else {
          injectTCCC({
            token: res.token,
            userId: res.userId,
            sdkUrl: res.sdkUrl,
            sdkAppId: res.sdkAppId,
          }).then(() => {
            resolve(true);
          });
        }
      });
  });
}
export function PhoneCall({ phoneNumber, recordId, sheetId }) {
  return new Promise((resolve, reject) => {
    tccc.Call.startOutboundCall({
      phoneNumber,
      uui: `${sheetId}/${recordId}`,
      //   phoneDesc: `${sheetId}/${recordId}`, //名称，将显示在坐席界面
    })
      .then(function (res) {
        if (res.status !== "success") {
          throw res;
        }
        // const sessionId = res.data.sessionId;
        // 外呼成功，执行您的业务逻辑
        resolve(true);
      })
      .catch(function (err) {
        // 对错误进行处理
        console.error(err.errorMsg);
        reject(err.errorMsg);
      });
  });
}
