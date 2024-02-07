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