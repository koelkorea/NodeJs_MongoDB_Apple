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


// 게시물 글쓴이를 향한 채팅 걸기(= 채팅방 생성)
//  -> 과정1 : 현재 유저가 게시물 글쓴이면, 생성X 후 이유를 알려줘야 함
//  -> 과정2 : 이미 현재 게시물을 주제로 채팅방이 생성되었으면, 생성X 후 이유를 알려줘야 함
//  -> 과정3 : 1, 2 둘 다 아니면 채팅방 생성 후, REDIRECT
router.get('/request', async (요청, 응답)=>{

    // 리다이렉트할 현재 로그인 유저가 생성한 채팅방 LIST URL
    //  -> 채팅방 생성에 실패시, URL파라미터로 메시지 보낼 예정
    let redirectUrl = '/chat/list';

    // server.js의 API에서 요청.user._id로 접근가능한 있는 현재 로그인 한 유저의 계정정보가 위치한 collection의 objectId 형식의 고유값은 js객체..
    const userId = 요청.user._id;
    const writerId = new ObjectId(요청.query.writerId);

    // ObjectId객체.equals(ObjectId객체)
    //  : server.js에서 JS객체인 ObjectId들이 같은지를 확인할 때, 그들의 힙영역의 포인터가 같은지 여부를 비교하기 위해 사용하는 mongoDB 라이브러리의 함수 (==, === 필요X)
    //     -> (주의) 사용하기 전에 ObjectId라는 객체 타입의 정의가 필요한 관계로... 이를 정의한 mongodb 라이브러리를 import하지 않은 상태에서 사용시 에러가 발생함
    //        (= ejs화면 파일에서 ObjectId라는 무턱대고 사용하면 오류가 발생하는 대부분의 원인을 차지)

    // 현재 유저가 게시물 글쓴이인지를 확인 (= 과정1 조건)
    const isUserSame = writerId.equals(userId);

    console.log(`유저ID : ${userId}`);
    console.log(`글쓴이ID : ${writerId}`);
    console.log(isUserSame);

    // (과정1) 현재 유저id가 글쓴이면, 생성X 후 이유를 알려줘야 함
    if(isUserSame){

        redirectUrl += '?msg=본인과_채팅은_불가능함';

    }else{

        // mongoDB에 CRUD 함수 수행시, server.js에서 해당 형식의 값을 전달하기 위해서는 new ObjectId('BSON 형식 문자열')로 입력해야, DB에서 해당 값을 적합하게 인지하여 기록하거나 쿼리에 파라미터로 사용함

        // 채팅을 건 현재 로그인 유저가 이미 현재 게시글을 소재로 해당 글쓴이에게 채팅을 걸었는지 확인 (= 과정2 조건)
        const search = await db.collection('chatroom').findOne({ member : 요청.user._id }, { boardId : new ObjectId(요청.query.boardId) });

        console.log(search);

        //  (과정3) 과정2 조건인 현재 로그인 유저가 글쓴이에게 채팅을 건 적이 없음을 확인하면 새로운 채팅방 생성 후, REDIRECT
        if ( (search == null) || (search == '') ) {

            // 개설된 채팅방 정보들만 저장하는 chatroom라는 collection에 저장함 (필요한 녀석은 나중에 쿼리로 찾아옴) 
            const result = await db.collection('chatroom').insertOne({
                // 채팅 관련 게시물 id
                boardId : new ObjectId(요청.query.boardId),
                // 채팅 참가자 id
                member : [요청.user._id, new ObjectId(요청.query.writerId)],
                date : new Date()
            });

            console.log(`채팅방 생성 완료 : ${result}`);

        } else { // (과정2) 이미 현재 게시물을 주제로 채팅방이 생성되었으면, 생성X 후 이유를 알려줘야 함

            redirectUrl += '?msg=이미_만들어진_채팅방';
        }
    }

    응답.redirect(redirectUrl);
});

// 현재 로그인한 유저가 생성한 채팅방 리스트
router.get('/list', async (요청, 응답)=>{

    // request에서 리다이렉트 시, 채팅방을 생성못할 이유가 있으면 그 메시지를 URL파라미터로 담은 걸 받을 용도
    const msg = 요청.query.msg;
    console.log(msg);

    // 현재 로그인한 유저가 생성한 채팅방 리스트를 user의 mongoDB 고유값인 object id를 근거로 가져옴
    //  -> (주의) server.js의 API에서 요청.user._id로 접근가능한 현재 로그인 한 유저의 계정정보가 위치한 collection의 objectId 형식의 고유값은 js객체..
    const result = await db.collection('chatroom').find({ member : 요청.user._id }).toArray();
    console.log(result);

    응답.render('chatList.ejs', { 분기메시지 : msg , 채팅방목록 : result })
}) 

// 현재 채팅방에서 진행중인 채팅 내용을 보여주기
router.get('/detail/:id', async (요청, 응답)=>{

    // 현재 로그인한 유저의 채팅방에 해당하는 채팅 내용을 채팅방의 고유값 objectid를 근거로 채팅방의 room명으로 지정하였고, 이를 room이라는 field에 저장하였던걸 기억하여 find함수 수행
    const result = await db.collection('chatMessage').find({ room : new ObjectId(요청.params.id)}).toArray();
    console.log(result);

    // ejs 확장자의 화면 영역에서 ObjectId 형식의 값인 '채팅방ID'를 출력하면
    //  -> JS의 자동 형변환 규칙에 따라서, 자동으로 toString() 함수를 적용하고, BSON 형식 문자열 그 자체로 등장함 명심
    응답.render('chatDetail.ejs', {  채팅정보 : result, 
                                    유저정보 : 요청.user, 
                                    채팅방ID : new ObjectId(요청.params.id) })
}) 

// 모든 채팅방 데이터 삭제
router.delete('/delete/all', async (요청, 응답)=>{

    try{
        // client.db('forum').collection('post').deleteMany( { 조건 넣기 가능 } );
        //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션의 모든 데이터를 삭제
        let result = await db.collection('chatroom').deleteMany({});

        console.log(result);
        
        // 응답parameter명.redirect('/list/paging/ver1/1');
        //  : 도메인 /list/paging/ver1/1 url의 API로 강제로 보내기
        응답.redirect('/board/list/paging/ver1/1');

    } catch (e) {
        console.log(e);
        응답.status(500).send('DB에러남');
    }

});

module.exports = router;