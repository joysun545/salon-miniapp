# 美容院预约微信小程序

可选择护理和时段、提交预约，并在门店确认后刷新状态。当前设备保留最近一笔预约。

1. 用微信开发者工具导入本仓库，使用测试号或在本地设置自己的 AppID。
2. 小程序默认请求 `https://joytest.site/salon/api`。服务器接入步骤见 [后端仓库](https://github.com/joysun545/salon-api/tree/feat/booking-mvp)。
3. 选择护理和时段并提交。用店员接口确认，再回到小程序点击「刷新预约状态」。

联调只使用演示数据。真机和正式发布请在微信公众平台添加 `https://joytest.site` 为合法 request 域名。
