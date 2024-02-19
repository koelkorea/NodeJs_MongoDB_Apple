// [게시판 자원 관련 API들을 모아서 따로 정리한 router 용도의 js파일로 server.js와의 연계를 통해 독립적으로 모듈로서 작동할 수 있도록 추출한 파일]
//   -> server.js에만 존재하는 미들웨어 함수를 여기서 그냥 사용하면 에러걸림
//      (= server.js는 아무런 코드나 정보를 보내주지 않고, 해당 js파일의 내용을 받기한 한다는 점 명심)

// require('express').Router()
//  : express 라이브러리를 모듈 import에 불러와서, router() 함수를 통해 얻는 router관련 객체를 리턴하는 함수
const router = require('express').Router();

// s3 연결 보일러플레이트 모듈화
const upload = require('../s3.js');

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

// require('express').Router().use((생략가능) URL명, 미드웨어 함수명 or 무명 미드웨어함수)
//  : express().use((생략가능) URL명, 미드웨어 함수명 or 무명 미드웨어함수) 용도와 같지만, 해당 router용도의 js파일에서 해당 코드 밑에 위치한 모든 express().router().http메서드명()을 사용한 API에서 작동하게 하고 싶을 경우 사용
//     -> 참고사항 정리
//         1. 여기서도 위치에 따라 적용되는 API범위가 달라진다 
//         2. URL영역에 적힌 URL은 전부 server.js에서 작성한 express().http메서드('/머리url', 무명함수)에서 '/머리url'이 앞에 붙은 url이라고 생각해야함
//             ex) 머리url = /head  ,  현재url = /corrent
//                  -> router().use()의 미들웨어 함수가 적용되는 URL은 해당 코드를 기준으로 하단에 /head/corrent 로 시작하는 녀석으로 보면 됨
router.use('/', (요청, 응답, next) => {
    console.log(new Date())
    next()
}) 

// MongoDB를 통해 받은 데이터를 ejs 템플릿 엔진을 통해 받고 난 뒤 SSR 방식으로 웹페이지 동적 제작

// 도메인/list를 들어가게 된다면?
//  -> 1. (비동기 코드 명심!) MongoDB에서 post라는 collenction의 데이터를 읽고, 
//     2. 그걸 list.ejs라는 템플릿 엔진 view 파일에 특정한 변수명으로 대입해서 보내준 뒤, 
//     3. 이를 웹페이지로 렌더링해서 그 결과물을 사용자에게 보내라
router.get('/list', async (요청, 응답) =>{

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
router.get('/time', async (요청, 응답) =>{

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
router.get('/list/paging/ver1/:page', async (요청, 응답) =>{

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
router.get('/list/paging/ver2/:page', async (요청, 응답) =>{

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
router.get('/list/next/ver2/:id', async (요청, 응답) => {
    let result = await db.collection('post').find({_id : {$gt : new ObjectId(요청.params.id) }}).limit(5).toArray();

    // 날짜를 보내주기 위한 목적의 변수
    let date = new Date();

    응답.render('list2.ejs', { 글목록 : result, 날짜 : date });   
}) 

// 이전 페이지 버튼 (페이지네이션 값 이용시 충돌 + sort문제로 사용안할 예정)
router.get('/list/before/ver2/:id', async (요청, 응답) => {
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


// (과제) 도메인/add로 POST요청하면, 그 제목과 내용을 DB에 저장하기

// 도메인/write라는 url에 GET 형식의 요청이 들어오면 입력페이지 보여주는 API
router.get('/write', (요청, 응답)=>{
    응답.render('write.ejs');
}); 

// upload.single()
//  : 단, 1개의 이미지만 업로드 하고 하고 싶을 경우 사용

// 입력페이지인 write.ejs 템플릿에서 도메인/add라는 url에 POST 형식으로 보낸 form 데이터를 서버에서 받아 DB에 입력하는 API 구현
//  -> 한개의 이미지를 S3에 업로드 가능하게 함
router.post('/add', async (요청, 응답)=>{

    // 상단의 보일러 플레이트 코드를 입력했기에, 사용자가 form 요청으로 보낸 input 데이터를 '요청parameter.body' 한 방으로 바로 JSON으로 파싱된 형식으로 볼 수 있음
    console.log(요청.body);
    
    // 서버 API를 거치게 될 때, validator 처리를 위한 조건문
    if (요청.body.title == '') {

        응답.send('제목을 적어주시길..')

        // 요청.file : 업로드 된 원본의 파일명
        console.log(요청.file)

    } else {

        // 오류처리 방지용 try, catch 구문
        try{
            upload.single('img1')(요청, 응답, async (err)=>{

                if (err) return 응답.send('에러남')

                if (!요청.file) {
                    return 응답.status(400).send('파일이 업로드되지 않았습니다.');
                }

                // client.db('forum').collection('post').insertOne({title : 요청.body.title, content : 요청.body.content});
                //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션에 js객체 형식으로 적힌 {}안의 데이터를 기입
                await db.collection('post').insertOne({
                    title : 요청.body.title,
                    content : 요청.body.content,
                    img : 요청.file.location
                })

                // 응답parameter명.redirect('/list/paging/ver1/1');
                //  : 도메인 /list/paging/ver1/1 url의 API로 강제로 보내기
                응답.redirect('/board/list/paging/ver1/1');
            })

        } catch (e) {
            console.log(e);
            응답.status(500).send('DB에러남');
        }
    } 

});

// 도메인/write라는 url에 GET 형식의 요청이 들어오면 입력페이지 보여주는 API
router.get('/write/multiIMG', (요청, 응답)=>{
    응답.render('write2.ejs');
}); 


// upload.array(‘input의 name속성 이름’, '업로드 이미지 최대갯수')
//  : 여러개의 이미지를 업로드 하고 싶을 경우 사용

// 입력페이지인 write.ejs 템플릿에서 도메인/add/multiIMG라는 url에 POST 형식으로 보낸 form 데이터를 서버에서 받아 DB에 입력하는 API 구현
//  -> 최대 10개의 이미지를 저장할 용도의 API
router.post('/add/multiIMG',  upload.array('img1', 10), async (요청, 응답)=>{

    // 상단의 보일러 플레이트 코드를 입력했기에, 사용자가 form 요청으로 보낸 input 데이터를 '요청parameter.body' 한 방으로 바로 JSON으로 파싱된 형식으로 볼 수 있음
    console.log(요청.body);

    // 요청.file : 업로드 된 원본의 파일명
    console.log(요청.file);
    console.log(요청.files);
    
    // 서버 API를 거치게 될 때, validator 처리를 위한 조건문
    if (요청.body.title == '') {

        응답.send('제목을 적어주시길..')

    } else {

        // 오류처리 방지용 try, catch 구문
        try{

            if (!요청.files) {
                return 응답.status(400).send('파일이 업로드되지 않았습니다.');
            }

            // client.db('forum').collection('post').insertOne({title : 요청.body.title, content : 요청.body.content});
            //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션에 js객체 형식으로 적힌 {}안의 데이터를 기입
            await db.collection('post').insertOne({
                title : 요청.body.title,
                content : 요청.body.content,
                img : 요청.files.location         // 나중에 게시글 상세조회시 여기 저장된 이미지 url 정보를 통해 s3에 접근하여 이미지를 가져옴 
            })

            // 응답parameter명.redirect('/list/paging/ver1/1');
            //  : 도메인 /list/paging/ver1/1 url의 API로 강제로 보내기
            응답.redirect('/board/list/paging/ver1/1');

        } catch (e) {
            console.log(e);
            응답.status(500).send('DB에러남');
        }
    } 

});

// (과제) 사용자가 목록 화면에서 도메인/detail/:parameter로 GET방식의 API를 요청하면, detail.ejs 템플릿을 따르는 상세페이지 보여주기
router.get('/detail/:id', async (요청, 응답) => {

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
router.get('/edit/:id', async (요청, 응답) => {

    let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.id)});
    응답.render('edit.ejs', { 기존글 : result });
});

// (과제) 목록화면에서 도메인/revise라는 url에 POST 형식으로 보낸 form 데이터를 서버에서 받아 DB에 입력하는 API 구현
router.post('/revise/:id', async (요청, 응답)=>{

    // 서버 API를 거치게 될 때, validator 처리를 위한 조건문
    if (요청.body.title == '') {

        응답.send('제목을 적어주시길..')

    } else {

        try{
            // client.db('forum').collection('post').updateOne( { _id : 요청.params.id }, { $set: { title : 요청.body.title, content : 요청.body.content } } );
            //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션에 id가 url파라미터의 id와 같은 데이터를 찾은뒤 js객체 형식으로 적힌 {}안의 데이터로 수정
            await db.collection('post').updateOne( { _id : new ObjectId(요청.params.id) }, { $set: { title : 요청.body.title, content : 요청.body.content } } );

            // 응답parameter명.redirect('/list/paging/ver1/1');
            //  : 도메인 /list/paging/ver1/1 url의 API로 강제로 보내기
            응답.redirect('/board/list/paging/ver1/1');

        } catch (e) {
            console.log(e);
            응답.status(500).send('DB에러남');
        }
    } 

});

// (과제1) 목록화면에서 도메인/delete라는 url에 AJAX 방식을 사용하고 데이터는 fetch API를 통해 queryString 방식으로 delete라는 문구를 URL에 포함해서 보낸 데이터를 서버에서 받아 DB에 입력하는 API 구현
router.delete('/delete', async (요청, 응답)=>{

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

module.exports = router;