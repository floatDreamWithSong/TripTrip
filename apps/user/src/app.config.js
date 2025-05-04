export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/myTravels/myTravels',
    'pages/login/index',
    'pages/addTravel/addTravel'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#333',
    selectedColor: '#ea0000',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/unselectedHome.png',
        selectedIconPath: 'assets/selectedHome.png'
      },
      {
        pagePath: 'pages/addTravel/addTravel',
        text: '游记发布',
        // iconPath: 'images/icon3.png',
        // selectedIconPath: 'images/icon3_active.png'
      },
      {
        pagePath: 'pages/myTravels/myTravels',
        text: '我的游记',
        // iconPath: 'images/icon2.png',
        // selectedIconPath: 'images/icon2_active.png'
      }
    ],
    borderStyle: 'black'
  }
});
