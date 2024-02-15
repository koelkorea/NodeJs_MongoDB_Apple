// require('express').Router()
//  : express 라이브러리를 모듈 import에 불러와서, router() 함수를 통해 얻는 router관련 객체를 리턴하는 함수
const router = require('express').Router();

//------------------------------------------------------------------------------------------------------------------------------------
// server.js의 express().use('/shop', require('./router/shop.js') )를 통해, 해당 파일 하단에 존재하는 API들에 연결하고 응답할 수 있도록 함
//  -> 하단의 API들은 전부 express().http메서드('/shop + /원래url', 무명함수) 형식으로 작성된 API나 다름없음  
//  -> (주의) router용도의 js 파일에 작성된 API들은 'express().http메서드' ->  'require('express').Router().http메서드'로 작성되어야 함
//       -> 이렇게 함으로서, url을 단서로 server.js에서 해당 router.js를 찾아내고, 해당 js파일에서 적합한 API를 연결해주기 때문

// require('express').Router().http메서드('/shop + /원래url', 무명함수)
//  : express().http메서드명()과 같은 내용이지만, 해당 router용도의 js파일에서 작동하도록 설계된 API설계 함수

// (과제) 도메인/shop 라는 url을 express를 사용하여 HTTP get 메서드로 요청할 경우의 API와 그 내용을 '쇼핑페이지입니다~'라고 적어주기 
router.get('/', (요청, 응답)=>{
    응답.send('쇼핑페이지입니다');
}) 

// router.get('/shop/shirts', (요청, 응답) => {
//    응답.send('셔츠 파는 페이지입니다')
// })

// router.get('/shop/pants', (요청, 응답) => {
//    응답.send('바지 파는 페이지입니다')
// })

router.get('/shirts', (요청, 응답) => {
    응답.send('셔츠 파는 페이지입니다')
 })
 
 router.get('/pants', (요청, 응답) => {
    응답.send('바지 파는 페이지입니다')
 })

 // module.exports
 //  : 현재 js 파일을 외부에서 모듈처럼 import하여 불러쓰게 하는 JS모듈 관련 객체의 멤버변수
 //     -> 외부에서 해당 JS파일을 모듈로서 불러왔을 때, exports멤버 안에 저장된 값을 return하게 함
 //        (= express의 router용도라면 router 관련 객체를 리턴해야 함)
module.exports = router;