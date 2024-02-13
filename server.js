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

// MongoDB 모듈 import에 해당하는 내용
//  - MongoClient : DB접속시 생성된 해당 유저정보를 담는 JS객체에 해당
//  - ObjectId : 사용자가 DB에서 ID기반 검색시 생성된 JS에서 이 ID정보를 인식하고 DB에 검색 명령 내릴때 전달가능하게 하는 JS객체에 해당
const { MongoClient, ObjectId } = require('mongodb')

// MongoDB 서버 접속 결과 및 DB제어 함수를 사용하기 위한 변수
let db;

// 내 MongoDB 서버에 접속하기 위한 URL 정보
const url = 'mongodb+srv://admin:lsh916@cluster0.tatoixz.mongodb.net/?retryWrites=true&w=majority'

new MongoClient(url).connect().then((client)=>{

    console.log('DB연결성공')

    // 간단히 설명하면 님들이 호스팅받은 mongodb에 접속하고 접속 결과를 db라는 변수에 저장
    db = client.db('forum')

    // express().listen(포트, () => console.log('접속 성공 메시지') )
    //  : 해당 포트번호를 통해 통신하는 웹서버를 띄운 뒤, 성공하면 성공메시지를 터미널에 보내라는 명령어  
    app.listen(8080, () => {
        console.log('http://localhost:8080 에서 서버 실행중')
    })

}).catch((err)=>{
    
    console.log(err)
})

// bcrypt 라이브러리 관련 모듈
const bcrypt = require('bcrypt') 

// passport 라이브러리 관련 모듈
//  -> passport        : 회원인증 도와주는 메인 라이브러리
//  -> passport-local  : 아이디/비번 방식 회원인증쓸 때 쓰는 라이브러리
//  -> express-session : 세션 만드는거 도와주는 라이브러리
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

// connect-mongo 라이브러리 관련 모듈
//  -> 얘를 통해 passport 라이브러리의 session 저장할 DB를 mongoDB로 지정 가능함
const MongoStore = require('connect-mongo')

// passport 라이브러리 관련 변수 초기화
app.use(passport.initialize())

// express-session 라이브러리를 통해 세션을 만드는 과정.. session() 안의 parameter로 넣을 js객체를 통해, session의 속성 지정 가능
app.use(session({
    secret: '암호화에 쓸 비번',
    resave : false, 
    saveUninitialized : false,
    cookie : { maxAge : 60 * 60 * 1000 },
    // store : 세션 저장할 DB를 연결할 정보를 속성값으로 가지는 멤버변수.. connect-mongo 라이브러리를 통해 mongoDB에 연결
    store: MongoStore.create({
        mongoUrl : 'mongodb+srv://admin:lsh916@cluster0.tatoixz.mongodb.net/?retryWrites=true&w=majority',
        dbName: 'forum',
    })
}))

// passport.use(new Strategy(무명 콜백함수 (id, password, 콜백함수) => { 유저 입력정보 검증 코드 }))
//   : 유저가 제출한 아이디 비번이 DB랑 맞는지 검증하는 방식의 Local Strategy에 해당하는 로직 코드를 passport 라이브러리에서 사용하기 위한 보일러플레이트 코드
//     (new LocalStrategy 어쩌구는 아이디/비번이 DB와 일치하는지 검증하는 로직을 담당하는 무명함수를 parameter로 받아 그 결과에 따른 JS객체)
//       -> 추후 웹서버의 API 안에서 passport.authenticate('local', 무명 콜백함수(error, user, info) => { 검증결과에 따른 내용 })를 통해 해당 코드의 호출이 가능함
//           -> 단! passport.use()의 return값은 그것의 paramter인 '콜백함수'로 이를 호출해야  Passport의 인증 메서드 실행이 가능하여, 추가적인 paramter 3개를 입력해야하기에  (요청, 응답, next)라는 paramter를 기입해 즉시실행코드(iife)로 실행

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
//                (= passport.authenticate('local', 무명 콜백함수1(error, user, info))(요청, 응답, next)라는 즉시실행코드(iife) 패턴으로 호출이 되어야 에러가 없는 이유)
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

// (과제) 도메인/shop 라는 url을 express를 사용하여 HTTP get 메서드로 요청할 경우의 API와 그 내용을 '쇼핑페이지입니다~'라고 적어주기 
app.get('/shop', (요청, 응답)=>{
    응답.send('쇼핑페이지입니다');
}) 

//     -> 콜백함수의 내용을 통한 응답내용 메서드
//          2. 응답parameter.sendFile('보내고 싶은 파일경로명')
//              : 해당 GET 메서드의 요청에 대해 파일을 보내고 싶은 경우 사용하는 메서드
//                 (= 주로 HTML 파일을 보냄으로서, 화면을 전환할 때 사용함)

// (과제) 도메인 대문에 들어올 경우의 API는 그 응답으로 HTML을 보내게 짜봐라
app.get('/', (요청, 응답)=>{
    응답.sendFile(__dirname + '/index.html');         // (중요) __dirname : 현재 server.js가 위치한 절대경로를 담는 일종의 static 변수
}) 

// MongoDB를 통해 받은 데이터를 ejs 템플릿 엔진을 통해 받고 난 뒤 SSR 방식으로 웹페이지 동적 제작

// 도메인/list를 들어가게 된다면?
//  -> 1. (비동기 코드 명심!) MongoDB에서 post라는 collenction의 데이터를 읽고, 
//     2. 그걸 list.ejs라는 템플릿 엔진 view 파일에 특정한 변수명으로 대입해서 보내준 뒤, 
//     3. 이를 웹페이지로 렌더링해서 그 결과물을 사용자에게 보내라
app.get('/list', async (요청, 응답) =>{

    // (중요!) MongoDB의 데이터를 읽는 API는 비동기 코드임을 명심 = then() catch() finally()나 async, await을 써서 제어해야함

    // client.db('forum').collection('post').find().toArray();
    //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션의 복수 데이터를 객체배열 형태로 가져오는 메서드
    let result = await db.collection('post').find().toArray();

    // 날짜를 보내주기 위한 목적의 변수
    let date = new Date();

    console.log(result);

    // list.ejs라는 템플릿 파일에 result, date에 담겨있던 자료값이 글목록이라는 변수명으로 옮겨짐
    응답.render('list2.ejs', { 글목록 : result, 날짜 : date });       
})

// (과제) /time 이라고 접속하면 현재 서버의 시간을 보내주는 기능을 만들어봅시다.
app.get('/time', async (요청, 응답) =>{

    // (팁) 서버의 시간은 server.js 파일 아무데서나 new Date() 라고 쓰면 나옵니다
    let result = new Date();
    응답.send(result);
})


// [(동기적) 목록페이지 페이지네이션]

// 1. '페이지네이션 값' 이용
//    -> 이를 통해 다음, 이전 버튼 기능도 현재 페이지 번호를 parameter로 가공하여 응용가능

//    1) db에서 데이터를 직접 가공한 뒤 제공
//        -> (장점) 웹서버의 부담 줄어듬
//        -> (단점) 숫자가 커지면, 그만큼 처리할 데이터 문제로 성능이슈 존재
app.get('/list/paging/ver1/:page', async (요청, 응답) =>{

    // client.db('forum').collection('post').find().skip(숫자).limit(숫자).toArray();
    //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션의 복수 데이터를 'skip의 번호만큼 건너뛰고, limit의 번호만큼' 가져와서 객체배열 형태로 가져오는 메서드
    let original = await db.collection('post').find();
    let count = await original.count();
    let result = await original.skip( (요청.params.page - 1) * 5 ).limit(5).toArray();

    // 날짜를 보내주기 위한 목적의 변수
    let date = new Date();

    // list.ejs라는 템플릿 파일에 result, date에 담겨있던 자료값이 글목록이라는 변수명으로 옮겨짐
    응답.render('list.ejs', { 글목록 : result, 날짜 : date, 갯수 : count, 페이지 : 요청.params.page });       
})

//    2) db에서 데이터를 가져오되, 가공은 웹서버에서 담당
//        -> (장점) db서버에 부담이 줄어들게 됨
//        -> (단점) mongoDB에서 쉽게 지원하는 기능을 굳이 웹서버 선에서 정리하기에, 혼잡하기도 하고 디버깅 같은게 좀 피곤하며.. 결정적으로 API호출때마다 DB를 들쑤시는건 똑같음
app.get('/list/paging/ver2/:page', async (요청, 응답) =>{

    // client.db('forum').collection('post').find()
    //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션의 데이터가 위치한 포인터를 반환해주는 함수(비동기 함수이므로, 동기식으로 짤거면 그에 상응하는 비동기코딩을 해야함)
    let original = await db.collection('post').find();

    // original에 저장된 DB 데이터의 포인터 값이 나오면, 순차적으로 갯수와 데이터를 배열화시켜 저장 
    let count = await original.count();
    let array = await original.toArray();

    // js배열.slice(숫자1, 숫자2)
    //  : 원본 js배열에 변화를 가하지 않는 함수형 프로그래밍 방식의 함수로, 대상 배열의 숫자번째 index부터 숫자2만큼의 요소를 가져와서 결과값 js배열로 반환
    //     -> 함수형 프로그래밍 패러다임 따름 = 함수의 parameter로 들어간 대상에는 영향을 주면 안되며, 함수는 단지 자신의 영역 {}안에서만 영향력을 발휘하여 결과값을 출력하는 것까지만 기능을 담당해야 한다.. 뭐 그런 취지 
    //        (mongoDB의 코드들은 비동기로 작동하도록 설계되었기에, 역시 비동기적 코드처리가 필요함) 
    let result = await array.slice((요청.params.page - 1) * 5, (요청.params.page - 1) * 5 + 5);

    // 날짜를 보내주기 위한 목적의 변수
    let date = new Date();

    // list.ejs라는 템플릿 파일에 result, date에 담겨있던 자료값이 글목록이라는 변수명으로 옮겨짐
    응답.render('list.ejs', { 글목록 : result, 날짜 : date, 갯수 : count, 페이지 : 요청.params.page });         
})

// 2. 'collection 컬럼 데이터 값'을 이용
//    -> 이를 통해 다음, 이전 버튼 기능도 현재 페이지 번호를 parameter로 가공하여 응용가능

//    1) 방금 뜬 화면의 특정 위치의 게시물을 id를 기준으로 전 or 후 db에서 5개의 데이터만 가져오라고 명명
//        -> (장점) id를 기준으로 데이터를 찾으니 빠르다..
//        -> (단점) 1) 현재 페이지의 1번째 id를 기준으로 한 거라, 다음 페이지나 이전 페이지 말고는 쓰기 힘들다...
//                  2) (주의!) 결정적으로 sort, limit 등등의 데이터 가공함수의 베이스는 db포인터라서 limit(5).sort() 하는 체이닝으로 데이터들을 연속 가공해도 관계형 DB의 쿼리결과처럼 안 나옴 
//                  3) 어찌어찌 데이터를 뽑아도 정렬이 개판이고, 정렬방침이 이전, 다음이 호환이 힘들어 결국 개판됨

// 다음 페이지 버튼 (페이지네이션 값 이용시 충돌되어 사용안할 예정)
app.get('/list/next/ver2/:id', async (요청, 응답) => {
    let result = await db.collection('post').find({_id : {$gt : new ObjectId(요청.params.id) }}).limit(5).toArray();

    // 날짜를 보내주기 위한 목적의 변수
    let date = new Date();

    응답.render('list2.ejs', { 글목록 : result, 날짜 : date });   
}) 

// 이전 페이지 버튼 (페이지네이션 값 이용시 충돌 + sort문제로 사용안할 예정)
app.get('/list/before/ver2/:id', async (요청, 응답) => {
    let result = await db.collection('post').find({_id : {$lt : new ObjectId(요청.params.id) }}).sort( {_id : -1} ).limit(5).toArray();

    // 날짜를 보내주기 위한 목적의 변수
    let date = new Date();

    console.log(result);

    응답.render('list2.ejs', { 글목록 : result, 날짜 : date });   
}) 



//    2) collection의 id를 숫자로서 일종의 index로 구분하여, x번째 데이터를 찾은뒤 db에서 5개의 데이터만 가져오라고 명명
//        -> (장점) id를 숫자로 지정하니 직관적이고, 또 빠르다..
//        -> (단점) Mongo DB에는 없는 auto increment기능을 구현하던가, DB에 뭔가 변화가 일어날 때 자동으로 실행되는 코드인 trigger를 사용해서 구현하던가 해야함

//            [직접구현]
//             1) counter 컬렉션에 있던 document 를 찾아와서 count : 에 기재된 값을 출력해봅니다. 
//             2) 그 값에 +1을 한 다음 그걸 _id란에 기입해서 새로운 글을 발행합니다.
//                 -> { _id : 1, title : 어쩌구 } 이런게 발행되겠군요.
//             3) 성공적으로 발행된걸 확인하면 counter 컬렉션의 document에 있던 count : 항목을 +1 해줍니다.
//             4) updateOne 쓰면 되겠군요. 

//            [trigger 사용한 mongoDB의 권장]
//             -> https://www.mongodb.com/basics/mongodb-auto-increment

// 목록페이지에서 페이지네이션 (비동기적) 구축하기

// (추후 도전) 페이지네이션의 번호를 클릭시, 이미 받은 데이터를 기반으로 client 단에서 js를 통해 보여줄 데이터를 처리함
//   -> (장점) db가 할 일 줄어듬  
//             ex) db.collection('post').find({_id : { $gt : 1000 }}).limit(5)
//   -> (단점) 언제나 데이터 전체를 가져오기에, 초기 데이터 전송에 부담이 큼 + 보안상으로 문제도 있을수 있음


// (추후 도전) 이미 받은 데이터를 기반으로 client 단에서 js를 통해 보여줄 데이터를 처리함
//   -> (장점) db가 할 일 줄어듬
//   -> (단점) 언제나 데이터 전체를 가져오기에, 초기 데이터 전송에 부담이 큼 + 보안상으로 문제도 있을수 있음



// (중요) 템플릿 엔진으로부터 API요청이 들어왔을 경우, 그 요청(request)의 body 영역을 파싱(parse)하기 위해 사용되는 미들웨어에 대한 보일러 플레이트 코드를 입력해야 함

// app.use(express.json())
//  : express 라이브러리 환경에서 JSON 형태의 들어온 요청(request)의 body 영역을 파싱(parse)하기 위해 사용되는 미들웨어(middleware)
//   -> 이를 사용하지 않을 경우, 요청이 들어온 데이터의 Json 데이터의 body영역이 인간이 알기 어려운 용어로 전달되거나 예기치 못한 에러가 발생할 수 있음
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

// (과제) 도메인/add로 POST요청하면, 그 제목과 내용을 DB에 저장하기

// 도메인/write라는 url에 GET 형식의 요청이 들어오면 입력페이지 보여주는 API
app.get('/write', (요청, 응답)=>{
    응답.render('write.ejs');
}); 

// 입력페이지인 write.ejs 템플릿에서 도메인/add라는 url에 POST 형식으로 보낸 form 데이터를 서버에서 받아 DB에 입력하는 API 구현
app.post('/add', async (요청, 응답)=>{
    // 상단의 보일러 플레이트 코드를 입력했기에, 사용자가 form 요청으로 보낸 input 데이터를 '요청parameter.body' 한 방으로 바로 JSON으로 파싱된 형식으로 볼 수 있음
    console.log(요청.body);
    
    // 서버 API를 거치게 될 때, validator 처리를 위한 조건문
    if (요청.body.title == '') {

        응답.send('제목을 적어주시길..')

    } else {

        // 오류처리 방지용 try, catch 구문
        try{
            // client.db('forum').collection('post').insertOne({title : 요청.body.title, content : 요청.body.content});
            //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션에 js객체 형식으로 적힌 {}안의 데이터를 기입
            await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content});

            // 응답parameter명.redirect('/list');
            //  : 도메인/list url의 API로 강제로 보내기
            응답.redirect('/list');
        } catch (e) {
            console.log(e);
            응답.status(500).send('DB에러남');
        }
    } 

});

// (과제) 사용자가 목록 화면에서 도메인/detail/:parameter로 GET방식의 API를 요청하면, detail.ejs 템플릿을 따르는 상세페이지 보여주기
app.get('/detail/:id', async (요청, 응답) => {

    // 오류처리 방지용 try, catch 구문
    try{

        // url 파라미터 문법을 사용한다면, '요청parameter'.params를 통해 url에 전해진 url파라미터 내용을 js객체 형식으로 한번에 보는게 가능함
        console.log(요청.params);
        
        // client.db('forum').collection('post').findOne({_id : new ObjectId(요청.params.id)});
        //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션에 _id 내용이 url에 적혀있는것과 일치하는 녀석을 가져올것
        //     -> (주의) _id를 검색대상으로 쓰려면
        //          1. new ObjectId(id번호) 형식으로 내용을 기입
        //          2. const { ObjectId } = require('mongodb') 코드가 기입되어 ObjectId 객체를 쓸수 있어야 함
        let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.id)});
        console.log(result);

        if (result == null) {
            응답.status(400).send('그런 글 없음')
        } else {
            응답.render('detail.ejs', { 상세글 : result })
        }

    } catch (e) {
        console.log(e);
        응답.status(500).send('DB에러남... id에 이상한걸 넣는군..');
    }
});

// (과제) 사용자가 목록 화면에서 도메인/edit/:parameter로 GET방식의 API를 요청하면, edit.ejs 템플릿을 따르는 상세페이지 보여주기
app.get('/edit/:id', async (요청, 응답) => {

    let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.id)});
    응답.render('edit.ejs', { 기존글 : result });
});

// (과제) 목록화면에서 도메인/revise라는 url에 POST 형식으로 보낸 form 데이터를 서버에서 받아 DB에 입력하는 API 구현
app.post('/revise/:id', async (요청, 응답)=>{

    // 서버 API를 거치게 될 때, validator 처리를 위한 조건문
    if (요청.body.title == '') {

        응답.send('제목을 적어주시길..')

    } else {

        try{
            // client.db('forum').collection('post').updateOne( { _id : 요청.params.id }, { $set: { title : 요청.body.title, content : 요청.body.content } } );
            //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션에 id가 url파라미터의 id와 같은 데이터를 찾은뒤 js객체 형식으로 적힌 {}안의 데이터로 수정
            await db.collection('post').updateOne( { _id : new ObjectId(요청.params.id) }, { $set: { title : 요청.body.title, content : 요청.body.content } } );
            응답.redirect('/list');
        } catch (e) {
            console.log(e);
            응답.status(500).send('DB에러남');
        }
    } 

});

// (과제1) 목록화면에서 도메인/delete라는 url에 AJAX 방식을 사용하고 데이터는 fetch API를 통해 queryString 방식으로 delete라는 문구를 URL에 포함해서 보낸 데이터를 서버에서 받아 DB에 입력하는 API 구현
app.delete('/delete', async (요청, 응답)=>{

    try{
        // queryString 문법을 사용한다면, '요청parameter'.query 통해 url에 전해진 url파라미터 내용을 js객체 형식으로 한번에 보는게 가능함
        console.log(요청.query);

        // client.db('forum').collection('post').updateOne( { _id : new ObjectId(요청.query.id) } );
        //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션에 id가 url queryString id라는 데이터명의 값과 같은 데이터를 찾은뒤 이를 삭제
        await db.collection('post').deleteOne( { _id : new ObjectId(요청.query.id) } );
        응답.send('삭제완료');
    } catch (e) {
        console.log(e);
        응답.status(500).send('DB에러남');
    }

});


app.get('/login', (요청, 응답)=>{
    응답.render('login.ejs')
});

app.post('/login', async (요청, 응답, next) => {

    // passport.authenticate('local', 무명 콜백함수(error, user, info) => { 검증결과에 따른 내용 } )(요청, 응답, next)
    //  : 앞서 선언한 로그인 정보 검증 함수 선언부인 passport.use( new Strategy상속객체( 무명콜백함수(id, password, 콜백함수) )를 호출하여, '콜백함수'를 반환받고 거기에 콜백함수(요청, 응답, next)를 paramter를 기입해서 호출
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
    //                (= passport.authenticate('local', 무명 콜백함수1(error, user, info))(요청, 응답, next)라는 즉시실행코드(iife) 패턴으로 호출이 되어야 에러가 없는 이유)
    passport.authenticate('local', (error, user, info) => {

        if (error) {
            return 응답.status(500).json(error)
        }

        if (!user) {
            return 응답.status(401).json(info.message)
        }

        요청.logIn(user, (err) => {

            if (err) {
                return next(err)
            } else {
                응답.redirect('/list/paging/ver1/1')
            }

        })

    })(요청, 응답, next)

});


// (과제2) 로그인 한 양반에 한해서 mypage 화면에 방문가능하게 해주고, 화면에 유저의 id를 표기하게 해줘라
app.get('/mypage', async (요청, 응답) => {
    console.log(요청.user);

    if (!요청.user) {
        return 응답.status(401).send('로그인부터 먼저 하세요..');
    }

    응답.render('mypage.ejs', { 로그인정보 : 요청.user });   
});

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

    if(요청.body.password.length > 10){
        return 응답.status(401).send('비번 10자 이내로 정하세요..');
    }

    // 비밀번호가 조건에 맞으면, 이를 bcrypt 라이브러리의 hashing 메서드를 사용하여 hashing 해줌
    let 해시 = await bcrypt.hash(요청.body.password, 10) 

    await db.collection('user').insertOne({
        username : 요청.body.username,
        password : 해시
    })
    응답.redirect('/list/paging/ver1/1')
})

// 로그아웃시 로직(쿠키의 세션정보 삭제)
app.get('/logout', (요청, 응답) => {

    // 방법1. 클라이언트 브라우저의 세션 쿠키의 유효기간을 0으로 변경 
    응답.cookie('connect.sid', '', { maxAge:0 });

    // 방법2. 클라이언트 브라우저의 세션 쿠키를 전부 삭제
    응답.clearCookie('connect.sid');

    // (중요) fetch api로 호출했을 경우, 해당 url내용이 화면의 fetch 체이닝메서드로 전송되는 response객체의 멤버값 중 하나인 url에 담겨 보내짐
    응답.redirect('/login')
})