// 환경변수들을 상수화된 변수명에 보관하여 전역변수로서 접근가능하게 도와주는 .env 파일을 쉽게 구축하게 돕는 dotenv 라이브러리를 모듈 import에 해당하는 내용
require('dotenv').config();

// Express 프레임워크
//  : 웹이나 모바일 환경 기반 애플리케이션을 위한 Node.js 기반 웹 애플리케이션 프레임워크

// 모듈 import에 해당하는 내용과 그 결과값을 받는 변수
const express = require('express');

// express 기본 생성자의 결과 객체를 받는 변수 (해당 객체가 추후 API를 포함한 모든 메서드를 담당)
const app = express();

// express().set('view engine', '템플릿 엔진명');
//  : express 라이브러리 환경에서 '템플릿 엔진'을 쓸 수 있게 하는 코드 (ejs를 써보도록 하겠음)
app.set('view engine', 'ejs');

// express().use(express.static(__dirname, '목표 static 폴더 경로(보통은 /public )'));  
//  : express.static는 특정 폴더안의 파일들을 static 파일로 지정할 수 있으며, use()메서드를 통해 express 객체가 해당 폴더의 내용을 쓸 수 있도록 등록하는 메서드
app.use(express.static(__dirname + '/public'));     // 이를 통해 html파일에 css파일을 <link>태그로 붙여줄 수 있음


// (중요) 템플릿 엔진으로부터 API요청이 들어왔을 경우, 그 요청(request)의 body 영역을 파싱(parse)하기 위해 사용되는 미들웨어에 대한 보일러 플레이트 코드를 입력해야 함

// app.use(express.json())
//  : express 라이브러리 환경에서 JSON 형태의 들어온 요청(request)의 body 영역을 파싱(parse)하기 위해 사용되는 미들웨어(middleware)
//     -> 이를 사용하지 않을 경우, 요청이 들어온 데이터의 Json 데이터의 body영역이 인간이 알기 어려운 용어로 전달되거나 예기치 못한 에러가 발생할 수 있음
app.use(express.json());

// app.use(express.urlencoded())
//  : express 라이브러리 환경에서 form태그나 멀티파트 등 JSON 형태가 아닌 URL에 데이터가 포함되어 들어오는 형태로 들어온 요청(request)의 body 영역을 파싱(parse)하기 위해 사용되는 URL 인코딩 관련 미들웨어(middleware)
//     -> 이를 사용하지 않을 경우, 템플릿 엔진으로부터 API요청이 들어온 JSON 이외 데이터의 body영역과 URL에서 얻은 데이터가 인간이 알기 어려운 용어로 전달되거나 예기치 못한 에러가 발생할 수 있음

//  app.use(express.urlencoded( {extended:boolean} ) )
//   : urlencoded 미들웨어에서 전달된 url 쿼리 스트링을 보안 이슈가 있는 중첩 객체를 통해 파싱할건지를 결정하는 설정값
//     (= 결과적으로 true, false에 따라 파싱에 사용하는 query String 라이브러리가 달라짐)
//         -> true (기본)  : 객체 형태로 전달된 데이터 내에서 또 다른 중첩된 객체를 허용함 (= body-parser 모듈을 사용가능하게 하는 초석 )
//                            -> url 쿼리 스트링을 파싱하는데, 따로 설치가 필요하지만 추가적인 보안 확장이 가능한 npm qs 라이브러리 사용함
//            false        : 객체 형태로 전달된 데이터 내에서 또 다른 중첩된 객체를 허용 X
//                            -> url 쿼리 스트링을 파싱하는데, node.js에 기본으로 내장된 queryString 라이브러리 사용함
app.use(express.urlencoded({extended:true})) ;

//---------------------------------------------------------------------------
// 웹소켓 socket.io 모듈 import에 해당하는 내용

// (중요) socket.io의 작동순서
//   : 쉽게 말해, 클라이언트의 요청 선빵으로 시작하고...
//      -> emit()으로 서버던 클라이언트건 '채널명'과 'room명'을 URL처럼 입력해서 원하는 클라이언트에 원하는 반응을하고 데이터를 보내주고
//      -> on()으로 다른 측이 보낸 data를 받고 data 파라미터로 받은걸 가공하고, 후속작업을 침

//       0) 상단의 설치 부분을 다 완료한걸 가정함
//       1) 클라이언트 측에서 웹소켓 기능을 사용하는 화면에서 socket.io를 통해 서버에 웹소켓 요청을 보내는 기능 io().emit()을 사용
//           -> (클라이언트 to 서버) 특정 '채널명'으로 데이터를 보냄
//       2) 서버 측에서 socket.io를 통한 웹소켓을 사용하는 new Server(server).on('connection') 코드를 찾아서 연결한 뒤에, socket객체를 parameter로 쓰는 콜백함수를 통해 클라이언트가 보낸 '채널명'을 찾음
//       3) 클라이언트가 보낸 '채널명'에 해당하는 socket.on()을 실행하여 클라이언트가 보낸 데이터를 받음
//           -> 서버 측에서 클라이언트가 보낸 '채널명'을 URL처럼 보고, 그에 대응하는 API를 찾는 것과 유사한 행위 수행
//       4) (생략가능) 서버측에서 클라이언트가 보낸 데이터를 가공하고 싶으면, data 객체를 parameter로 쓰는 콜백함수를 통해 이를 가공         
//       5) 서버에서 클라이언트 측에 socket.io를 통해 웹소켓 요청을 보내는 기능을 new Server(server).emit()를 사용하여 수행
//           -> (서버 to 클라이언트) 특정 '채널명'으로 데이터를 보냄 
//              (= url없는 API없듯, 채널명 없는 웹소켓 요청은 존재해도 서버의 대응이 유의미하지 않음)

// http 모듈 import
const { createServer } = require('http');
// (중요) socket.io가 사용가능한 형식의 createServer(require('express'))으로 express 기반의 서버 생성
const server = createServer(app);

// socket.io 모듈 import
const { Server } = require('socket.io');
// socket.io가 사용가능한 형식의 express 기반으로 한 websocket 객체를 생성하고 변수인 io에 줌
// (= server.js에서 사용되는 변수 = 서버가 소통의 시작(= 서버 -> 클라이언트)이라는 의미를 암시)
const io = new Server(server);

// io.on('connection', 무명콜백함수 ( socket ) => { 내용 } )
//  : 어떤 클라이언트라도 서버에 웹소켓 요청한게 감지되면 작동하며, 서버에서 특정 코드를 실행하고 싶은 경우의 내용을 무명콜백함수에 넣어 사용
//     -> 쉽게 말해, 서버를 향한 웹소켓 요청 감지하면 io.on('connection') 발동 후, 무명콜백함수 ( socket ) => { 내용 }을 실행하게 되며, 클라이언트의 '채널명'에 따라 API 실행하듯 socket.on을 분기처리 실행
io.on('connection' , (socket) => {

    //  socket.io 관련 주의사항
    //   1. server.js와 화면.ejs에서 웹소켓을 연결하는 키워드는 io라고 보면 되며, 
    //       -> server.js : new Server(createServer(express()))로 웹소켓에 연결하고 초기화한 결과를 io라는 js변수가 받음
    //                       -> (중요) 클라이언트의 요청에 대응하기 위해, 콜백함수(socket){ 내용 }을 paramter로 가지고, socket.on()을 통해 내용을 적음
    //       -> 화면.ejs  : io() 함수로 웹소켓에 연결하고 초기화한 결과를 server라는 js변수가 받음

    //   2. server, 화면 둘 다 웹소켓 함수는 크게 2가지라고 보면 되며, 공통된 parameter로 URL역할의 '채널명'이 들어감
    //       -> emit() : 상대 쪽에 데이터를 전송할 떄 사용하는 함수
    //       -> on()   : 상대 쪽에서 보낸 데이터를 수산할 떄 사용하는 함수
    //                    -> (중요) 상대편의 데이터를 받고 가공하기 위해, 콜백함수(data){ 내용 }을 paramter로 가짐

    // ---------------------------------------------[클라이언트 측의 웹소켓을 통한 서버 요청시 공통적 사용]--------------------------------------------------

    // (중요!) 무명콜백함수의 parameter socket ( <-> (중요) 화면.ejs에서 사용하는 io()를 받는 변수 socket)
    //   : socket.io에 내장된 블랙박스인 클라이언트로부터 데이터 수신시에 이를 받고 처리할 목적으로 실행되는 'websocket 객체' 그 자체
    //      -> 클라이언트와의 실시간 데이터 수신 자체는 무명콜백함수를 통해 paramter로 삽입된 해당 socket를 매개로 socket의 메서드들을 실행하여 이뤄짐
    const socketInfo = socket;
    console.log(`socket 정보 : ${socketInfo}`);
    console.log(`어떤 클라이언트에서 socket.io를 통한 웹소켓으로 서버에 연결/요청하였습니다.`);

    // 모든 클라이언트들에게 전송 (클라측의 수신은 .on()의 '채널명' paramter로)
    // io.emit('서버가 붙인 채널명', '서버가 보낸 메세지') 
    //  : ('서버 -> 모든 클라이언트') 서버에 모든 연결된 '모든' 클라이언트들에게로 어떤 데이터를 웹소켓으로 전송하고 싶을때 사용
    //      -> (중요) 전송결과에 대한 반환값은 boolean 값 (= 전송 성공결과에 따라 true/false로 분기)
    let result1 = io.emit('allSend', '클라이언트에서 socket.io를 통해 서버에 요청함');
    console.log(result1);

    // 새로운 클라이언트를 매 연결마다 무작위 생성되는 socket.id를 이름으로 하는 전용 룸에 추가하여, 서버와 클라간 1:1로 연결성공 메시지 보내기
    //  -> socket.id : 매 연결에 대해 무작위로 생성, 이를 통해 각각의 연결을 구별할 수 있음
    const roomName = `room_${socket.id}`;
    socket.join(roomName);

    // 웹소켓 요청한 해당 클라이언트의 room멤버에게만 환영 메시지 전송 (클라측의 수신은 .on()의 '채널명' paramter로)
    // io.to('room명').emit('서버가 붙인 채널명', data.msg or '메시지 내용 입력') 
    //   : ('서버 -> 특정 room의 클라이언트') 클라이언트가 요청한 data.room안의 '특정 room'의 클라이언트들에게로 data.msg 데이터를 웹소켓으로 전송하고 싶을때 사용                         
    //       -> (중요) 전송결과에 대한 반환값은 boolean 값 (= 전송 성공결과에 따라 true/false로 분기)
    let result2 = io.to(roomName).emit('oneSend', '환영합니다! 서버와의 연결이 성공적으로 설정되었습니다.');
    console.log(result2);

    //----------------------------------------------------------------------------------------------------------------------------------------------------

    // socket.on('클라이언트가 붙인 채널명', (클라이언트로부터 받은 data 객체 parameter) => { 내용 }
    //  : 클라이언트에게서 서버가 '채널명'이란 이름으로 보내진 내용의 데이터를 '수신'하게 되면, 그 수신한 data를 parameter로 받아 가공한 무명콜백함수 ( 클라이언트로부터 받은 data 객체 parameter ) => { 내용 } 를 실행해 주는 API에 해당
    //    (= io.on() 안에 여러가지의 채널명을 받을떄를 대비한 API에 해당하는 socket.on() 기입은 자유로히 가능함)
    //       -> (중요) 서버의 io.on('connection', (socket) => { 내용 } )안에는 클라이언트가 기입한 '채널명'들에 따라 어떻게 반응할지에 대한 경우의 수만큼 socket.on('채널명', (data) => { 내용 }이 작성됨

    // ex1) 클라이언트 측에서 socket.io의 io()을 사용해 join-room-request라는 '채널명'으로 서버에 데이터를 보낸 경우, 서버는 그 data를 다음과 같이 받고 가공함
    socket.on('join-room-request' , (data) => {

        // socket.join('대상 room이름') 
        //   : 클라이언트가 서버가 socket.on() 에 상정한 특정 '채널명'(개발자 마음대로 지어도 됨)으로 요청을 먼저 보낸다면 
        //       -> 서버는 그 클라이언트를 '대상 room이름'으로 되어있는 'room의 멤버로 해당 클라이언트를 끼워줌'
        //          (= 서버는 room에 있는 클라이언트들을 구분하여, 데이터를 보낼 수 있음)
        //       -> (중요) 클라측에서 요구한 room 생성 및 참가에 대한 new Server(server).join()의 반환값은 존재하지 않음
        let result = socket.join(data.room);
        console.log(`(중요) room 생성 및 참가에 대한 new Server(server).join()의 반환값은 존재하지 않음 : ${result}`); // undefined
        console.log(`클라이언트 ${data.userid} 측에서 요청한 ${data.room}라는 room 생성과 참여가 완료되었습니다`);
    });

    // ex2) (연습용으로 작성) 클라이언트 측에서 socket.io의 io()을 사용해 age라는 '채널명'으로 서버에 데이터를 보낸 경우, 서버는 그 data를 다음과 같이 받고 가공함
    socket.on('age' , (data) => {

        console.log('유저가 보낸 데이터 : ', data);

        // (중요) 클라측에서 보내달라고 요구한 데이터를 요구한 room에 보냈는지 여부는 true/false
        let result = io.emit('name', 'kim');
        console.log(`age 채널로 메시지 전송(${result}) : 유저를 향해 name : kim이라는 내용의 데이터를 보냈습니다.`);
    });

    // ex3) (연습용으로 작성) 클라이언트 측에서 socket.io의 io()을 사용해 message라는 '채널명'으로 서버에 데이터를 보낸 경우, 서버는 그 data를 다음과 같이 받고 가공함
    socket.on('message' , (data) => {

        console.log('유저가 보낸 데이터 : ', data);

        // socket.request.session
        //   : passport 라이브러리 사용시 socket.io와 연계하여 로그인 정보에 해당하는 쿠키를 전송하는 미들웨어를 실행하여 서버에 보내면, 서버가 쉽게 클라이언트의 로그인 정보를 출력가능하게 되는 객체 속성
        //     (= 메세지 보내는 유저가 누구인지 확인하고 그걸 웹소켓 기능에 응용할 수 있다는 것)
        //         -> https://socket.io/how-to/use-with-express-session 참고하여 실행하면 사용 가능
        let userInfo = socket.request.session;
        console.log(`유저의 정보 : ${userInfo}`);

        //  해당 함수는 io.on('connection', ( socket ) => { socket.on('채널명', ( data ) => { 내용 } ) } ) 과정에서 마지막 내용으로 들어가기에
        //   -> data 객체는 socket.on()의 무명콜백함수의 paramter로 들어간 클라이언트가 보낸 정보에 해당하는 객체라고 보면 됨
        let result = io.to(data.room).emit('broadcast', data.msg);

        // data.멤버변수 
        //  : 클라이언트 측에서 보낸 데이터를 2개 이상의 멤버변수들이 존재하는 js객체 타입으로 서버에 보냈으면, 구체적인 멤버변수를 지정해서 무명콜백함수의 내용을 작성해야함
        //    (= 1개의 데이터를 개별로 보냈으면, 그냥 data로 참고 및 접근이 가능함)
        console.log(`message 채널로 메시지 전송(${result}) : `);
        console.log(` -> ${data.room}라는 room에 속해있는 클라이언트 들에게 ${data.msg}라는 메시지를 보냈습니다.`);
        console.log(` -> 클라이언트 측의 broadcast라는 채널명에 해당하는 io.on함수 처리에 따라, 브라우저 console 창에 ${data.msg} 메시지가 떠 있음`);
    });

    // ex4) (채팅갱신3) 클라이언트 측에서 socket.io의 io()을 사용해 message-send라는 '채널명'으로 서버에 데이터(= 채팅내용)를 보낸 경우,
    //       -> 서버는 그 data를 다음과 같이 받고 가공한 뒤, 지정된 room에 포함된 클라이언트들에게만 message-broadcast라는 채널명으로 새로운 채팅 데이터를 보냄
    socket.on('message-send', async (data) => {

        console.log('유저가 보낸거 : ', data);

        // 새로운 채팅 내용을 채팅내용들을 저장하는 chatMessage라는 collection에 저장함 (필요한 녀석은 나중에 쿼리로 찾아옴) 
        let result1 = await db.collection('chatMessage').insertOne({

            // (중요) ObjectId 개념
            //   : BSON(Binary JSON) 형식으로 RDBMS에서 Primary Key와 같은 고유한 키 역할을 수행하기 위해 만들어진 특별한 유형의 데이터 타입
            //      -> mongoDB db에서 document에 저장된 _id라는 field를 보면 저장된 내용을 확인 가능하며, 직접적인 BSON 형식으로 저장되어 있진 않고 new ObjectID('BSON 제조용 parameter문자열')라는 JS생성자 형식으로 저장됨

            // (중요) BSON
            //  : JSON과 유사하지만 추가적인 데이터 타입과 기능을 제공하여 MongoDB와 같은 NoSQL 데이터베이스에서 사용

            // new ObjectID('BSON 제조용 parameter문자열')
            //  : 파라미터로 전달된 문자열에 따라 BSON 형식의 ObjectID를 생성하는 JavaScript의 생성자 함수
            
            // server.js에서 new ObjectId 형식의 값은 mongodb 라이브러리에서 정의한 ObjectId라는 형식의 js객체로서 인식됨
            //   -> server.js에서 new ObjectId 형식의 값 비교를 위해서, ObjectId객체.equals(ObjectId객체) 함수를 사용
            //       -> 단! mongodb 라이브러리의 import는 반드시 해야 ObjectId 타입의 메서드인 equals() 함수 사용 가능
            //          (= ejs화면 파일에서 equals를 무턱대고 사용하면 오류가 발생하는 대부분의 원인을 차지)
            room : new ObjectId(data.room),
            content : data.msg,
            when : new Date(),
            who : new ObjectId(data.who)
            // who : new ObjectId(socket.request.session.passport.user.id)
        });

        console.log(`chatMessage 컬랙션 입력결과(${result1}) : `);
        console.log(` -> 유저${data.who}가 보낸 room명인 ${data.room}을 FK로 한 채팅 내용을 chatMessage라는 컬랙션에 기록하는데 성공하였습니다`);

        //{ room : ~~, msg : ~~~ }
        let result2 = io.to(data.room).emit('message-broadcast', { content: data.msg, who : new ObjectId(data.who) });

        console.log(`message-send 채널로 메시지 전송(${result2}) : `);
        console.log(` -> ${data.room}라는 room에 속해있는 클라이언트 들에게 ${data.msg}라는 메시지와 ${data.who}라는 유저정보를 보냈습니다.`);
    }) 

});

//---------------------------------------------------------------------------
// MongoDB 모듈 import에 해당하는 내용
const { ObjectId } = require('mongodb')

// MongoDB 서버 접속 결과 및 DB제어 함수를 사용하기 위한 변수
let db;

// changeStream 객체를 받고 그 기능을 수행하기 위한 변수
let changeStream

// new MongoClient(url).connect(),then((client)=>{  }
require('./database.js').then((client)=>{

    console.log('DB연결성공')

    // 간단히 설명하면 님들이 호스팅받은 mongodb에 접속하고 접속 결과를 db라는 변수에 저장
    db = client.db('forum')

    // express().listen(포트, () => console.log('접속 성공 메시지') )
    //  : 해당 포트번호를 통해 통신하는 웹서버를 띄운 뒤, 성공하면 성공메시지를 터미널에 보내라는 명령어
    //    (= 그냥 최초성공시 메시지 보내는 용도로.. 필수는 아님)

    // createServer(require('express')).listen(포트, () => console.log('접속 성공 메시지') )
    //  : 상단의 socket.io가 사용가능한 서버 형식 버전
    server.listen(process.env.PORT, () => {
        console.log('http://localhost:8080 에서 서버 실행중')
    })

    // MongoClient객체.watch(pipeline객체)도 결국 함수이기에, 특별한 목적이 없으면 최소한만 호출되는게 성능에 유리함
    //    (= 특정 컬랙션에 대한 영원한 변동사항 감시를 원한다면? 특정 API가 아니라, DB서버 연결할 때 1번만 사용해도 충분함)
    changeStream = db.collection('post').watch([
        { $match: { operationType: 'insert' } }
    ])

}).catch((err)=>{
    
    console.log(err)
})

//--------------------------------------------------------------------------
// passport 라이브러리 관련 모듈
//  -> passport        : 회원인증 도와주는 메인 라이브러리
//  -> passport-local  : 아이디/비번 방식 회원인증쓸 때 쓰는 라이브러리
//  -> express-session : 세션 만드는거 도와주는 라이브러리
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

// bcrypt 라이브러리 관련 모듈
const bcrypt = require('bcrypt') 

// connect-mongo 라이브러리 관련 모듈
//  -> 얘를 통해 passport 라이브러리의 session 저장할 DB를 mongoDB로 지정 가능함
const MongoStore = require('connect-mongo');
const { Socket } = require('dgram');

// passport 라이브러리 관련 변수 초기화
app.use(passport.initialize())

// express-session 라이브러리를 통해 세션을 만드는 과정.. session() 안의 parameter로 넣을 js객체를 통해, session의 속성 지정 가능
app.use(session({
    secret: process.env.SECRET_WORD,
    resave : false, 
    saveUninitialized : false,
    cookie : { maxAge : 60 * 60 * 1000 },
    // store : 세션 저장할 DB를 연결할 정보를 속성값으로 가지는 멤버변수.. connect-mongo 라이브러리를 통해 mongoDB에 연결
    store: MongoStore.create({
        // process.env.환경변수명
        //  : dotenv 라이브러리를 통해 만든 .env 파일에 있는 전역화된 환경변수를 쓸어옴 
        mongoUrl : process.env.MONGO_DB_URL,
        dbName: 'forum',
    })
}))

// passport.use(new Strategy(무명 콜백함수 (id, password, 콜백함수) => { 유저 입력정보 검증 코드 }))
//   : 유저가 제출한 아이디 비번이 DB랑 맞는지 검증하는 방식의 Strategy에 해당하는 passport 라이브러리의 로직 코드를 사용하기 위한 보일러플레이트 코드
//     (new Strategy 어쩌구는 아이디/비번이 DB와 일치하는지 검증하는 로직을 담당하는 무명함수를 parameter로 받아 그 결과에 따른 JS객체)
//       -> 추후 웹서버의 API 안에서 passport.authenticate('local', 무명 콜백함수(error, user, info) => { 검증결과에 따른 내용 })를 통해 해당 코드의 호출이 가능함
//           -> 단! passport.use()의 return값은 그것의 paramter인 '콜백함수'로 이를 호출해야  Passport의 인증 메서드 실행이 가능하여, 추가적인 paramter 3개를 입력해야하는데..
//               -> (중요!) 이를 또 본 API코드 실행전에 미들웨어 함수로 실행해야 하므로... (요청, 응답, next)라는 paramter를 기입해 Passport의 인증 메서드를 즉시실행코드(iife) 형식으로 실행

//  # (중요) 관련 확장 개념 정리
//     1) passport.authenticate('local', 무명 콜백함수1(error, user, info) ) = passport.use(new Strategy( 무명 콜백함수2(id, password, 콜백함수) ) 을 호출
//         -> (주의) 각자의 무명 콜백함수는 다른 내용을 가지는 함수
//         -> (무명 콜백함수1의 paramter들)
//              - error : 뭔가 에러시 에러의 내용에 대한 객체가 들어옴
//              - user  : 아이디/비번 검증 완료된 유저정보가 들어옴
//              - info  : 아이디/비번 검증 실패시 에러메세지가 들어옴

//      2) 1번의 결과인 무명 콜백함수2의 parameter인 '콜백함수'의 parameter는 2~3개..
//         (= 이는 라이브러리 검증 함수 use를 호출한 API쪽에서 자신의 parameter인 (요청, 응답, next)라는 parameter를 제공하여야 실행이 가능함)
//             -> (중요!) 이를 통해 Passport의 인증 메서드는 요청(request), 응답(response) 관련 내용과, 다음 미들웨어(next)에 접근할 수 있고 실행이 완료됨
//                (= passport.authenticate('local', 무명 콜백함수1(error, user, info))(요청, 응답, next)라는 최종적으로는 즉시실행코드(iife) 패턴 형식으로 작동하는 미들웨어 함수기에 (요청, 응답, next) parameter가 꼭 있어야 에러가 없음)

//      3)  미들웨어(middleware)
//           : 웹서버의 API가 클라이언트의 요청으로 호출될 시, 응답되기 전에 실행되는 함수를 큰 틀에서 통칭하여 의미
//              ex) API를 실행하기 전에, 현재 요청한 유저가 login을 한 상태인지 API를 응답하기 전에 실행하는 코드 및 함수 내용
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, 콜백함수) => {

    let result = await db.collection('user').findOne({ username : 입력한아이디});

    if (!result) {
        return 콜백함수(null, false, { message: '아이디 DB에 없음' })
    }

    // bcrypt.compare(문자열1, 문자열2)
    //  : bcrypt 라이브러리에서 지원하는 사용자가 입력한 비밀번호와 DB에 저장되어 있는 hashing 적용된 비밀번호를 공평하게 hashing이 적용된 뒤 일치하는지를 비교해주는 함수
    //    -> 비동기로 동작하도록 설계된 코드라는거 주의해야 함
    if (await bcrypt.compare(입력한비번, result.password)) {
        return 콜백함수(null, result)
    } else {
        return 콜백함수(null, false, { message: '비번불일치' });
    }

}))

// passport.serializeUser( 무명콜백함수(로그인 정보 객체, 콜백함수) => { 세션 정보 생성 코드 }))
//  : 유저가 로그인시에, 세션 객체를 생성하고 그 중 세션 id를 암호화해서 유저의 브라우저 쿠키에 저장하는 기능을 passport 라이브러리에서 담당하는 함수
//    (= 웹서버의 로그인 기능 관련 API의 코드 중 요청.login() 함수가 호출되어 실행되면 자동으로 실행됨.. )
//        -> 만들어진 세션정보는 유저가 API를 호출할 때마다 자동으로 passport.deserializeUser() 함수를 통해, 웹서버 API의 paramter 무명함수의 paramter인 '요청' 객체에 포함되어 웹서버로 전송되기에 API {}안에서 요청.user로 참고 가능
//        -> (무명 콜백함수1의 paramter들)
//             - 로그인 정보 객체  : 유저의 로그인 정보
//             - 무명 콜백함수 : parameter로 주어진 정보(주로 세션 id와 유저 id)를 이용해 세션 객체를 만들고 입력해주는 함수

//                ex) done(null, { id: user._id, username: user.username })
//                     -> (참고) 세션의 유효기간 같은건 알아서 기록해 줌.. 그러니 가장 중요한 id들을 넣자
//                     -> (주의) 단! DB를 연결하지 않으면, 메모리에 세션정보들이 저장됨
passport.serializeUser((유저정보, 콜백함수) => {

    // process.nextTick(무명함수)
    //  : Node.js 환경에서 작업시간이 오래걸리는 사이드이펙트 코드들을 나중에 주요 작업들이 끝난뒤 실행시키고 싶을 때, parameter인 무명함수 {}안에 내용으로 해당 코드들을 입력함
    process.nextTick(() => {
        콜백함수(null, { id: 유저정보._id, username: 유저정보.username })
    })
}) 

// passport.deserializeUser(async 무명콜백함수(로그인 정보 객체, 콜백함수) => { API요청 세션 검증 및 세션정보 API측의 요청정보에 포함 내용 }))
//  : 유저가 웹서버에 API로 요청을 할 때마다, 쿠키에 위치한 유저의 세션 데이터를 서버가 확인하여 검증하고 문제없으면 데이터를 보내주는 passport 라이브러리에서 담당하는 함수
//     -> 검증이 끝났다면, 웹서버는 API 호출시 paramter로 보내는 무명함수의 paramter인 요청객체에 그 로그인 된 데이터를 user라는 멤버변수에 담아줌..)
//        (= 각 API의 {} 안에서 '요청.user' 코드를 통해 그 정보에 접근가능하게 함 )

//           -> 무명 콜백함수의 1번째 파라미터 '로그인 정보 객체'
//               : 유저의 로그인 정보

//           -> 무명 콜백함수의 2번째 파라미터 '콜백함수'
//               : 무명 콜백함수의 콜백함수로서, parameter로 주어진 정보(주로 세션 id와 유저 id)를 API에서 사용할 수 있도록 요청객체에 보내주는 함수

//                  ex) done(null, result)

//  # (주의) 세션이 만들어진 시기에 따라.. 적힌 유저의 정보와 실제 유저의 정보가 다를 수 있다는 걸 염두에 두고 deserializeUser를 설계해야 함
//     1. 세션에 적힌 유저 로그인 정보를 가져오면
//     2. 그 로그인 정보를 이용해 최신 회원 정보를 DB에서 가져오고
//     3. 그걸 요청.user에 집어넣는 식으로 코드짜는게 좋음
passport.deserializeUser(async (유저정보, 콜백함수) => {

    // 유저의 로그인 ID를 이용해 진짜 최신화된 유저정보를 찾음
    let result = await db.collection('user').findOne({_id : new ObjectId(유저정보.id) });

    // 찾은 유저 최신 정보 중 필요없어 보이는 password 멤버변수 삭제
    delete result.password;

    process.nextTick(() => {
        return 콜백함수(null, result)
    })
})

// passport 라이브러리의 session을 만드는 코드 (express-session를 통해 지정한 세션의 속성 사용)
app.use(passport.session()) 

//-------------------------------------------------------------------------------------------------------------------------
// s3 연결 보일러플레이트 모듈화
require('./s3.js');

//--------------------------------------------- [웹서버 API]-----------------------------------------------------------------

// express().get('url', (요청parameter, 응답parameter) => { 내용 } )
//  : express 기반으로 만들어진 서버 객체에 HTTP GET 메서드로 해당 URL을 요청하면, 그에 해당하는 내용을 응답하도록 API를 구성하는 메서드
//     -> 콜백함수의 내용을 통한 응답내용 메서드
//          1. 응답parameter.send('보내고 싶은 내용')
//              : 해당 GET 메서드의 요청에 대해 화면에 메시지를 보내고 싶은 경우 사용하는 메서드

// 도메인/news라는 url을 express를 사용하여 HTTP get 메서드로 요청할 경우의 API와 그 내용
app.get('/news', (요청, 응답)=>{
    응답.send('오늘 비옴');
}) 

//     -> 콜백함수의 내용을 통한 응답내용 메서드
//          2. 응답parameter.sendFile('보내고 싶은 파일경로명')
//              : 해당 GET 메서드의 요청에 대해 파일을 보내고 싶은 경우 사용하는 메서드
//                 (= 주로 HTML 파일을 보냄으로서, 화면을 전환할 때 사용함)

// (과제) 도메인 대문에 들어올 경우의 API는 그 응답으로 HTML을 보내게 짜봐라
app.get('/', (요청, 응답)=>{
    응답.sendFile(__dirname + '/index.html');         // (중요) __dirname : 현재 server.js가 위치한 절대경로를 담는 일종의 static 변수
}) 

// 회원가입 페이지 진입
app.get('/register', (요청, 응답)=>{
    응답.render('register.ejs')
})

// 회원가입시 DB입력 로직
app.post('/register', async (요청, 응답) => {

    if(!요청.body.username || !요청.body.password){
        return 응답.status(401).send('id나 비번 입력이 안 되어서 빠꾸시킴 ㅇㅇ..');
    }

    if(요청.body.username.lastIndexOf(' ') != -1 || 요청.body.password.lastIndexOf(' ') != -1){
        return 응답.status(401).send('id나 비번에 띄어쓰기 넣지 마라..');
    }

    if(요청.body.password.length > 10 || 요청.body.password.length < 5){
        return 응답.status(401).send('비번 5~10자 이내로 정하세요..');
    }

    // 비밀번호가 조건에 맞으면, 이를 bcrypt 라이브러리의 hashing 메서드를 사용하여 hashing 해줌
    let 해시 = await bcrypt.hash(요청.body.password, 10) 

    await db.collection('user').insertOne({
        username : 요청.body.username,
        password : 해시
    })
    응답.redirect('/board/list/paging/ver1/1')
})

// 로그인 페이지 진입
app.get('/login', (요청, 응답)=>{
    응답.render('login.ejs')
});

// 미들웨어(middleware)
//  : 웹서버의 API가 클라이언트의 요청으로 호출될 시, 응답되기 전에 실행되는 함수를 큰 틀에서 통칭하여 의미
//     ex) API를 실행하기 전에, 현재 요청한 유저가 login을 한 상태인지 API를 응답하기 전에 실행하는 코드 및 함수 내용

// 과제) 로그인 로직 수행시, id 비번이 비는지 체크하는 로직을 가지는 함수를 미들웨어로 수행하는 express프레임워크의 http메서드 함수를 쓰는 API를 만들어라
function checkIdPw (요청, 응답, next) {
    if (요청.body.username == '' || 요청.body.password == '') {
        응답.send('그러지마세요')
    } else {
        next();
    }
};

// checkIdPw를 미들웨어 함수로 사용하는 로그인 로직 구현
app.post('/login', checkIdPw, async (요청, 응답, next) => {

    // passport.authenticate('local', 무명 콜백함수(error, user, info) => { 검증결과에 따른 내용 } )(요청, 응답, next)
    //  : 앞서 선언한 로그인 정보 검증 함수 선언부인 passport.use( new Strategy상속객체( 무명콜백함수(id, password, 콜백함수) )를 호출하여 '콜백함수'를 반환받고, 거기에 콜백함수(요청, 응답, next)로 paramter를 기입해서 미드웨어 함수로서 '콜백함수'를 호출하는 코드
    //     -> (주의!) IIFE(즉시호출 함수) 패턴 구조가 사용된 코드

    //  # (중요) 로직흐름 정리
    //     1) passport.authenticate('local', 무명 콜백함수1(error, user, info) ) = passport.use(new Strategy( 무명 콜백함수2(id, password, 콜백함수) ) 을 호출
    //         -> (주의) 각자의 무명 콜백함수는 다른 내용을 가지는 함수
    //         -> (무명 콜백함수1의 paramter들)
    //              - error : 뭔가 에러시 에러의 내용에 대한 객체가 들어옴
    //              - user  : 아이디/비번 검증 완료된 유저정보가 들어옴
    //              - info  : 아이디/비번 검증 실패시 에러메세지가 들어옴

    //      2) 1번의 결과인 무명 콜백함수2의 parameter인 '콜백함수'의 parameter는 2~3개..
    //         (= 이는 라이브러리 검증 함수 use를 호출한 API쪽에서 자신의 parameter인 (요청, 응답, next)라는 parameter를 제공하여야 실행이 가능함)
    //             -> (중요!) 이를 통해 Passport의 인증 메서드는 요청(request), 응답(response) 관련 내용과, 다음 미들웨어(next)에 접근할 수 있고 실행이 완료됨
    //                (= passport.authenticate('local', 무명 콜백함수1(error, user, info))(요청, 응답, next)라는 최종적으로는 즉시실행코드(iife) 패턴 형식으로 작동하는 미들웨어 함수기에 (요청, 응답, next) parameter가 꼭 있어야 에러가 없음)
    passport.authenticate('local', (error, user, info) => {

        if (error) {
            return 응답.status(500).json(error)
        }

        if (!user) {
            return 응답.status(401).json(info.message)
        }

        요청.logIn(user, (err) => {

            if (err) {
                
                // next()
                //  : 미들웨어 함수의 3번째 파라미터로 들어가는 콜백함수로서, 미드웨어의 실행이 완료되었으니, 본 API를 실행시키라는 내용을 가지고 있음
                //    (= 미들웨어의 2번째 파라미터인 API 응답 객체가 실행되면, 이 next() 함수를 실행할 방법이 사라져 버리니.. 본 API코드는 작동하지 않음) 

                // passport.authenticate()가 미들웨어 함수로서 실행된다는 사실과 의도를 보여주고, 이를 통해 본 API 내용이 실행되게 넘겨줌
                return next(err)
            } else {
                응답.redirect('/board/list/paging/ver1/1')
            }

        })

    })(요청, 응답, next)

});

// 로그인 여부를 체크하기 위한 용도의 함수로 광역 미들웨어로 설정 예정
function checkLogin(요청, 응답, next){
    if(요청.user){
        next()
    } else {
        응답.status(401).send('로그인부터 먼저 하세요..');
    }
};

// express().use((생략가능) URL명, 미드웨어 함수명 or 무명 미드웨어함수)
//  : 특정 함수내용을 미들웨어로서 그 밑에 위치한 모든 express().http메서드명()을 사용한 API에서 작동하게 하고 싶을 경우 사용
//     -> 해당 코드 하단의 모든 express().http메서드명()을 사용한 API(JS모듈로 불러온 API 포함)들은 use()안의 미드웨어 함수 내용을 미드웨어로서 실행함
//        (= (중요!) 위치에 따라 적용범위가 달라진다 ...이 말씀)

//     ex) express().use('/어쩌구', checkLogin)   
//           -> 해당 코드 하단의 express().http메서드명() 중 URL이 '/어쩌구'로 시작되는 API들은 미들웨어로 checkLogin을 사용...
app.use(checkLogin);

// (과제2) 로그인 한 양반에 한해서 mypage 화면에 방문가능하게 해주고, 화면에 유저의 id를 표기하게 해줘라
app.get('/mypage', async (요청, 응답) => {
    console.log(요청.user);

    // 같은 내용의 코드가 상단의 checkLogin에 존재하며, express().use() 함수를 통해 미들웨어 함수로 기능하게 조정 
    // if (!요청.user) {
    //     return 응답.status(401).send('로그인부터 먼저 하세요..');
    // }

    응답.render('mypage.ejs', { 로그인정보 : 요청.user });   
});

// 로그아웃시 로직(쿠키의 세션정보 삭제)
app.get('/logout', (요청, 응답) => {

    // 방법1. 클라이언트 브라우저의 세션 쿠키의 유효기간을 0으로 변경 
    응답.cookie('connect.sid', '', { maxAge:0 });

    // 방법2. 클라이언트 브라우저의 세션 쿠키를 전부 삭제
    응답.clearCookie('connect.sid');

    // (중요) fetch api로 호출했을 경우, 해당 url내용이 화면의 fetch 체이닝메서드로 전송되는 response객체의 멤버값 중 하나인 url에 담겨 보내짐
    응답.redirect('/login')
})

// Server Sent event와 mongoDB 라이브러리의 changeStream 기능을 이용해, 실시간으로 새 글이 등장하면 업데이트
//  -> Server Sent event로 클라이언트와 연결을 유지한뒤, express의 http메서드 호출을 통한 response.write()와 changeStream객체.on() 메서드를 이용해 클라이언트에 데이터를 보냄
app.get('/stream/list', (요청, 응답) => {

    // Server sent events (서버가 일방적 전달)
    //  : 서버에 한번 연결해두면 그 연결을 유지하여, 서버가 원할 때 실시간으로 라디오 같이 데이터를 마음배로 유저에게 보내줄 수 있는 서버 to 클라이언트 일방향 통신법
    //     -> 가벼운 데이터를 일정한 간격으로 클라이언트 측에 전달해야 할 때 유용함 
    //        (= 유저는 그냥 라디오 듣듯이 일방적으로 서버가 주는걸 받기만 할 수 있다..)

    // # Express 환경에서 Server sent events 사용하기
    //    : server sent events 쓰겠다고 서버에 HTTP요청을 날리면, 서버에서 server sent events로 업그레이드해주는 식으로 사용
    //      (= 정확히는 화면의 script 영역에서 Server sent events 관련 함수를 통해 API를 호출하면, 서버는 header영역을 keep-alive로 하여 상호 간 연결을 유지하고, 서버는 클라이언트 측에 계속 응답을 보내주는 개념)

    //   1) Server.js에서 Server sent events를 사용하길 원하는 API를 찾음
    //   2) 원하는 지점에서 응답.writeHead() 함수를 사용하여, response header 정보의 영역을 "Connection": "keep-alive"을 포함하여 입력하자
    //       -> "Connection": "keep-alive" 를 쓰는 이유는 클라이언트 측에 해당 연결이 계속되어 한다는걸 말해주는 의미

    //   3) 응답.writeHead() 함수 밑에, 응답.write() 함수를 통해 보내고 싶은 이벤트명(event)과 내용(data)을 작성
    //       -> 응답.write() 내의 문자열들을 통해 서버가 지속적으로 클라이언트 측에 문자열을 계속 유저에게 전송
    //          (= 문자열 전송 가능하다? == 응답.write()을 통해 JS객체를 JSON으로 보낼 수도 있다는 말)

    //           @ 응답.writeHead() 함수 작성시 주의사항
    //              a. event는 일종의 채널명을 적는 영역으로서, 클라이언트 측은 SSE함수로 API를 호출한 후 서버에서 보낸 데이터 중 자신이 설정한 event명에 해당하는 데이터만 받을 수 있음
    //              b. string 입력처럼, 한줄 끝나면 줄바꿈을 의미하는 문자열 \n을 넣어야 함
    //              c. 주기적으로 뭘 보내는 명령어를 쓰려면, WEB API의 setInterval()함수와 연계
    //              d. 객체헤더와 내용을 분별하는 부호 : 왼쪽에 띄어쓰기를 쓰지 마라

    //                 ex) 응답.write('event: msg\n');   <- O
    //                     응답.write('event : msg\n');  <- X

    //   4) SSE를 사용한 API가 완성되면, 해당 API 사용을 원하는 화면(html, jsx, ejs 등)의 스크립트 영역에서 new EventSource('URL 입력')
    //   5) 4)에 이어 스크립트 영역에 EventSource객체.addEventListener('event명', function (e){ e.data로 서버데이터를 이용한 내용 }) 메서드를 사용하여 HTTP요청을 날림

    응답.writeHead(200, {
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
    });

     // (중요) SSE건 웹서버건 주기적으로 뭘 보내는 데에는 setInterval()함수와 연계
    setInterval( () =>{
        응답.write('event: msg\n');
        응답.write('data: {"head" : "contents"}\n');
        응답.write('data:  -> JSON 보내기 쌉가능! \n\n');
    }, 2000)


    // MongoClient에서 changeStream 코드를 작성하는 절차 및 순서
    //  1. 원하는 위치 어디에서라도 client.db().collection().watch(pipeline객체) 쓰면, changeStream객체를 생성 + 특정 컬렉션 감시를 시작
    //      -> 모든 document 생성/수정/삭제를 감시하기 싫으면, pipeline객체에 원하는 방식의 조건식을 적어두자... 'pipeline객체' 참고

    //  2. MongoClient객체.watch()메서드의 반환값인 changeStream객체로부터 changeStream객체.on('변경event명', 무명콜백함수) 메서드 체이닝을 작성
    //      -> 변경 event명 : DB내 컬랙션에 변경이 일어났을때, 키워드(CUD관련)에 맞는 방식으로 변경된 문서들에 한해서만 서버에 전송해 줌   
    //         무명콜백함수  : parameter에 해당하는 변수를 통해, MongoDB측에서 보낸 변경된 document들에 대한 정보를 받고 이를 가공함

    // MongoClient객체.watch(pipeline객체)
    //  : 'MongoClient객체에 메서드'로 특정 '프로젝트' 내에 존재하는 '컬랙션'의 데이터 변동(= CUD 중 하나) 여부를 감시하는 역할을 하고 관련 정보를 담는 changeStream객체를 생성하는 메서드 
    //    (= MongoClient Nodejs 라이브러리의 changeStream 기능 사용을 사용할 초석)

    //    # MongoClient객체.watch(pipeline객체) 메서드 사용시 참고사항
    //       1. (중요!) MongoClient객체에 소속된 메서드지만, changeStream객체를 리턴한다는 사실을 기억해야 함
    //       2. changeStream객체를 리턴하기에, changeStream객체의 메서드인 changeStream객체.on()를 메서드 체이닝으로 사용 가능
    //           -> changeStream객체.on()을 통해 웹서버에 감시 중 인지한 DB의 변동사항에 대해 알려주고, 무명콜백함수로 가공 가능

    //               ex) MongoClient객체.db('프로젝트명').collection('컬랙션명').watch(pipeline객체).on('change', 무명콜백함수 ); 로 일반적으로 사용가능

    //       3. ()안에 pipeline객체를 parameter로 가질 수 있음
    //            -> parameter를 여러 조건식을 [{조건1}, {조건2} ... ] 형식으로 넣으면, 원하는 형식의 변동사항만 체크도 가능
    //                -> pipeline객체 관련 내용 정리 참고

    //       4. 이 녀석도 결국 함수이기에, 특별한 목적이 없으면 최소한만 호출되는게 성능에 유리함
    //          (= 특정 컬랙션에 대한 영원한 변동사항 감시를 원한다면? 특정 API가 아니라, DB서버 연결할 때 1번만 사용해도 충분함)

    //     # $match : { ChangeStream객체 필드명 : 필터링할 필드값 }
    //        : DB가 변경을 감지한 데이터들을 보낸 ChangeStream 객체에서 가져온 문서들 중, 원하는 ChangeStream 객체 필드에서 정확히 필터링할 값과 일치하는 document만 필터링하여 서버가 수신하게 함 
    //           -> ChangeStream 객체가 대상 = ChangeStream 객체를 반환하는 .watch(pineline객체) 메서드의 pineline 객체에만 사용가능한 연산자
    //               -> (중요!) 사실 그래봐야... 결국 대부분의 사용자가 원하는 변동 정보는 결국 db에서 보낸 document들의 필드값이니.. fullDocument 객체를 만지게끔 되어있음

    // const 찾을문서 = [
    //     { $match: { operationType: 'insert' } }
    // ];

    // let changeStream = db.collection('post').watch(찾을문서);


    // changeStream객체.on('변경event명', 무명콜백함수 )
    //  : 'changeStream객체 메서드'로 MongoClient객체.watch(pipeline객체)가 감시한 변동된 데이터를 DB로부터 웹서버가 수신하게 하고 + 이를 가공하게 하는 역할의 메서드 

    //      -> changeStream객체.on('변경event명', 무명콜백함수 )의 parameter 설명
    //          1. 변경event명
    //              : CUD 중 어떤 방식으로 변경된 document들만 서버에서 수신받을지 결정하는 키워드에 해당 
    //                 -> change : CUD에 상관없이 모든 방식으로 변경된 document를 DB로부터 웹서버에 수신받게 함
    //                 -> insert : Create 방식으로 변경된 document를 DB로부터 웹서버에 수신받게 함
    //                 -> update : Update 방식으로 변경된 document를 DB로부터 웹서버에 수신받게 함
    //                 -> delete : Delete 방식으로 변경된 document를 DB로부터 웹서버에 수신받게 함

    //          2. 무명콜백함수
    //              : 해당 콜백함수의 parameter 변수를 통해 DB가 보낸 변경된 document의 대한 데이터를 수신받고, 이를 이용해서 웹서버에서 원하는 방식으로 가공하는 역할을 맡음

    // 앞선 부분에서 MongoClient객체.watch(pipeline객체)로 생성된 changeStream객체를 통해 감시중인 컬랙션에 변동된 데이터가 어떤식으로던 감지되면?
    //  -> 그 데이터를 받은 뒤, 그 DOCUMENT의 데이터 영역인 fullDocument를 통해 DOCUMENT의 모든 필드값을 JSON형식으로 변환해서 클라이언트에 SSE형식으로 보내줌
    changeStream.on('change', (result) => {

        console.log('DB변동생김')

        // SSE를 통해 msg라는 채널명으로 데이터를 보냄
        //  -> 유저도 채널명이 같아야 추후 보낼 변동된 document 데이터를 받을 수 있음
        응답.write('event: msg\n')

        // Change Stream 객체 내부구조
        //  : .watch()메서드의 파이브라인 객체 작성중 $match : { ChangeStream객체 필드명: 필터링할 필드값 }에 필요한 개념
        //     1. _id           : 해당 Change Stream 객체의 고유값에 해당하는 정보를 지닌 객체로.. _data라는 내부 멤버변수를 가짐
        //     2. operationType : 해당 변동사항이 CUD중 어떤 것인지를 의미 (insert, update, delete)
        //     3. fullDocument  : (중요) 변동되서 DB로부터 서버로 전송된 document의 필드 정보를 객체멤버 형식으로 모두 가진 JS객체...
        //         -> 주로 이 객체를 사용하여, 받은 데이터를 서버에서 가공하는 과정을 거칠거라 예상

        // 그 DOCUMENT의 데이터 영역인 fullDocument를 통해 DOCUMENT의 모든 필드값을 JSON형식으로 변환해서 클라이언트에 SSE형식으로 보내줌
        응답.write(`data: ${JSON.stringify(result.fullDocument)}\n\n`)
    })
});

// routes(라우트)
//  : 웹서버의 API가 호출되었을때, 어떤 화면을 응답으로서 보내는 역할을 하는 경우 그 API를 route(노선)라고 부름
//     -> router : 호출되는 API에 따라 응답되는 화면을 전문적으로 중계해주는 역할을 하는 파일이나 역할을 통칭하는 개념

// express().use((생략가능) URL명, require('router JS 주소'))
//  : URL이 '/어쩌구'로 시작되는 API들이, 특정한 공통점을 주제로 제작된 router용도의 JS 파일의 express().http메서드명()기반의 API들을 호출하게 해주는 용도의 함수
//    (= 특정 URL을 기점으로 API들이 작동되도록, 어떤 JS 파일을 모듈로서 불러주는 require() 함수를 미들웨어함수로서 사용하여 그 결과값인 router 객체르 바탕으로 작동하는 본 로직이 router파일의 API를 호출 가능)
//        -> 얘들도 결국 근본적으로는 express().http메서드명()기반으로 작동하는 코드를 모아둔 JS파일에 불과함
//           (= (중요) express().use(미드웨어 함수명 or 무명 미드웨어함수) 코드 밑에 존재한다면, 그 함수들을 전부 미드웨어 함수로 작동시킴)
app.use('/board', require('./router/board.js') );
app.use('/comment', require('./router/comment.js') );
app.use('/chat', require('./router/chat.js') );
app.use('/shop', require('./router/shop.js') );
app.use('/theme', require('./router/theme.js') );

// app.use('/', require('./router/theme.js') );
//  -> url을 이렇게 쓰면 해당 router 파일내부의 API는 모든 url을 대상으로 작동가능성이 존재함