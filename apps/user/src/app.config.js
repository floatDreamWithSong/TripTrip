export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/myTravels/myTravels',
    'pages/login/index',
    'pages/addTravel/addTravel',
    'pages/editTravel/editTravel',
    'pages/travelDetail/travelDetail',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#737373',
    selectedColor: '#6ec1e2',
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
        iconPath: 'assets/unselectedAdd.png',
        selectedIconPath: 'assets/selectedAdd.png'
      },
      {
        pagePath: 'pages/myTravels/myTravels',
        text: '我的游记',
        iconPath: 'assets/unselectedMy.png',
        selectedIconPath: 'assets/selectedMy.png'
      }
    ],
    borderStyle: 'black'
  }
});
