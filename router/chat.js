// [게시판 자원 관련 API들을 모아서 따로 정리한 router 용도의 js파일로 server.js와의 연계를 통해 독립적으로 모듈로서 작동할 수 있도록 추출한 파일]
//   -> server.js에만 존재하는 미들웨어 함수를 여기서 그냥 사용하면 에러걸림
//      (= server.js는 아무런 코드나 정보를 보내주지 않고, 해당 js파일의 내용을 받기한 한다는 점 명심)

// require('express').Router()
//  : express 라이브러리를 모듈 import에 불러와서, router() 함수를 통해 얻는 router관련 객체를 리턴하는 함수
const router = require('express').Router();

// MongoDB 모듈 import에 해당하는 내용
//  - MongoClient : DB접속시 생성된 해당 유저정보를 담는 JS객체에 해당
//  - ObjectId : 사용자가 DB에서 ID기반 검색시 생성된 JS에서 이 ID정보를 인식하고 DB에 검색 명령 내릴때 전달가능하게 하는 JS객체에 해당
const { ObjectId } = require('mongodb')

// MongoDB 서버 접속 결과 및 DB제어 함수를 사용하기 위한 변수
let db;

// new MongoClient(url).connect(),then((client)=>{  }
require('../database.js').then((client)=>{

    console.log('DB연결성공')
    
    // 간단히 설명하면 님들이 호스팅받은 mongodb에 접속하고 접속 결과를 db라는 변수에 저장
    db = client.db('forum')

}).catch((err)=>{
    
    console.log(err)
})

//------------------------------------------------------------------------------------------------------------------------------------
// server.js의 express().use('/shop', require('./router/shop.js') )를 통해, 해당 파일 하단에 존재하는 API들에 연결하고 응답할 수 있도록 함
//  -> 하단의 API들은 전부 express().http메서드('/shop + /원래url', 무명함수) 형식으로 작성된 API나 다름없음  
//  -> (주의) router용도의 js 파일에 작성된 API들은 'express().http메서드' ->  'require('express').Router().http메서드'로 작성되어야 함
//       -> 이렇게 함으로서, url을 단서로 server.js에서 해당 router.js를 찾아내고, 해당 js파일에서 적합한 API를 연결해주기 때문


// 글쓴이에게 채팅 걸기(userid에 따른 조건에 따른 분기 작성 필요)
router.get('/request', async (요청, 응답)=>{

    let result = await db.collection('chatroom').insertOne({
        member : [요청.user._id, new ObjectId(요청.query.writerId)],
        date : new Date()
    });

    console.log(result);

    응답.redirect('/chat/list')
});

// 내 채팅 리스트 가져오기(userid에 따른 조건에 따른 분기 작성 필요)
router.get('/list', async (요청, 응답)=>{
    let result = await db.collection('chatroom').find({ member : 요청.user._id }).toArray();
    console.log(result);
    응답.render('chatList.ejs', {채팅방목록 : result , 유저id : 요청.user.username})
}) 

// 현재 들어간 채팅내용
router.get('/detail/:id', async (요청, 응답)=>{
    let result = await db.collection('chatroom').findOne({ _id : new ObjectId(요청.params.id)});
    console.log(result);
    응답.render('chatDetail.ejs', {채팅정보 : result, 유저id : 요청.user.username})
}) 

module.exports = router;