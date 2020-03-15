# 餐廳清單(配合CRUD功能，並符合RESTful設計)

## 專案說明 (Project Title)：
以Node.js與Express建立的帳本記錄網站，以清單方式呈現，配合mongoose與mongoDB中資料互動。
![image](https://i.imgur.com/2tb1FOG.png)

## 環境建置與需求 (prerequisites)：
* Node Version Manager (nvm) v 1.1.7
* bcryptjs 2.4.3
* body-parser 1.19.0
* connect-flash 0.1.1
* dotenv 8.2.0
* express 4.17.1
* express-handlebars 3.1.0
* express-session 1.17.0
* method-override 3.0.0
* moment 2.24.0
* mongoose 5.9.4
* nodemon 2.0.2
* passport 0.4.1
* passport-facebook 3.0.0
* passport-local 1.0.0

## 安裝與執行步驟 (installation and execution)：
1. 下載Github頁面上內容
```console
git clone https://github.com/coooo77/expense-tracker-advanced
```
2. 啟動Node.js cmd以指令cd移動至expense-tracker-advanced資料夾底下
```console
cd 下載位置/expense-tracker-advanced
```
3. 根據環境建置與需求安裝軟體與套件
```console
npm install
```
4. 輸入種子資料
```console
cd 下載位置/expense-tracker-advanced/models
node seeder.js
```

5. 登入[FB網站](https://developers.facebook.com/)取得API Key，在檔案中新增.env
```console
// .env
FACEBOOK_ID=xxxxxxxx
FACEBOOK_SECRET=xxxxxxxx
FACEBOOK_CALLBACK=http://localhost:3000/auth/facebook/callback
```

6. 啟動專案
```console
cd 下載位置/expense-tracker-advanced
npm run dev
```
7. 開啟瀏覽器，輸入網址
> [localhost:3000/](https://localhost:3000/)

## 功能描述 (features)：
### 清單功能
* 使用者可以新增一筆消費紀錄。
* 使用者可以瀏覽全部所有餐廳。
* 使用者可以修改一筆消費紀錄。
* 使用者可以刪除一筆消費紀錄。
* 使用者可以設定消費紀錄排序。
* 使用者可以篩選特定消費紀錄。

### 登入功能
* 使用者登出、註冊失敗、或登入失敗時會給予訊息提示
* 可以透過 Facebook Login 直接登入


## 測試用帳號 (dummy)：
|Name      |Email               |Password       |
|:--------:|:------------------:|:-------------:|
|使用者01   |user1@example.com   |12345678       |