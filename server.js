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
// MongoDB 모듈 import에 해당하는 내용
//  - MongoClient : DB접속시 생성된 해당 유저정보를 담는 JS객체에 해당
//  - ObjectId : 사용자가 DB에서 ID기반 검색시 생성된 JS에서 이 ID정보를 인식하고 DB에 검색 명령 내릴때 전달가능하게 하는 JS객체에 해당
const { ObjectId } = require('mongodb')

// MongoDB 서버 접속 결과 및 DB제어 함수를 사용하기 위한 변수
let db;

// new MongoClient(url).connect(),then((client)=>{  }
require('./database.js').then((client)=>{

    console.log('DB연결성공')

    // 간단히 설명하면 님들이 호스팅받은 mongodb에 접속하고 접속 결과를 db라는 변수에 저장
    db = client.db('forum')

    // express().listen(포트, () => console.log('접속 성공 메시지') )
    //  : 해당 포트번호를 통해 통신하는 웹서버를 띄운 뒤, 성공하면 성공메시지를 터미널에 보내라는 명령어
    //    (= 그냥 최초성공시 메시지 보내는 용도로.. 필수는 아님)
    app.listen(process.env.PORT, () => {
        console.log('http://localhost:8080 에서 서버 실행중')
    })

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
const MongoStore = require('connect-mongo')

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

// 채팅 걸기 (공사중)
app.get('/chat/request', async (요청, 응답)=>{
    await db.collection('chatroom').insertOne({
        member : [요청.user._id, new ObjectId(요청.query.writerId)],
        date : new Date()
    })
    응답.redirect('채팅방목록페이지')
});

// 내 채팅 리스트 가져오기(공사중)
app.get('/chat/list', async (요청, 응답)=>{
    let result = await db.collection('chatroom').find({ member : 요청.user._id }).toArray()
    응답.render('chatList.ejs', {글목록 : result})
}) 

// 현재 들어간 채팅내용(공사중)
app.get('/chat/detail/:id', async (요청, 응답)=>{
    let result = await db.collection('chatroom').findOne({ _id : new ObjectId(요청.params.id)})
    응답.render('chatDetail.ejs', {result : result})
}) 

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
app.use('/shop', require('./router/shop.js') );
app.use('/theme', require('./router/theme.js') );

// app.use('/', require('./router/theme.js') );
//  -> url을 이렇게 쓰면 해당 router 파일내부의 API는 모든 url을 대상으로 작동가능성이 존재함