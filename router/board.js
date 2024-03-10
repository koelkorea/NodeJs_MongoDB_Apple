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


// 게시물 검색 기능 
//  : 특정 데이터에 검색어에 해당하는 문구와 일치하는 녀석을 가져오는 것으로만은 들어가 있는 녀석만 찾는 .find( { 칼럼명1 : '내용'}, ... ,) 로는 완전한 기능 구현이 힘듦
//    (= 다른 관계형 DB에서는 LIKE 연산자를 통해 해당 기능을 구현했던 것과 같음만 기억하자)

//    (구현법 1) 
//     MongoDB에서는 find()함수 내부에 $regex라는'정규식' 문법을 사용한 조건문으로 이를 구현이 가능함
//      -> 하지만 사전에 DB에 정렬된 버전의 DB복사본(= collection)인 index를 구축하지 않고, 그냥 쓰면 느리니 간단한 기능을 제외하면 잘 쓰지 않음 
router.get('/search/ver1/:page', async (요청, 응답) => {

    let original; 

    // 검색어 유무에 따른 null체크 조치
    if(요청.query.val && 요청.query.val.trim() !== '') {

        // $regex : 정규식과 연관된 연산자, 특정한 내용에 대해 정규식을 사용하여 검색함을 의미      
        original = await db.collection('post').find( {title : {$regex : 요청.query.val} } );

    }else{

        original = await db.collection('post').find();
    }

    // original에 저장된 DB 데이터의 포인터 값이 나오면, 순차적으로 갯수와 데이터를 배열화시켜 저장 
    let count = await original.count();
    
    // 해당 페이지에 표시할 데이터들만 뽑음
    let result = await original.skip( (요청.params.page - 1) * 5 ).limit(5).toArray();

    // 검색 결과 스팩 뽑기
    let stats = await original.explain('executionStats');

    console.log(stats);

    // 날짜를 보내주기 위한 목적의 변수
    let date = new Date();

    응답.render('search.ejs', { 글목록 : result, 날짜 : date, 갯수 : count, 페이지 : 요청.params.page, 검색어 : 요청.query.val });
}) 

//    (구현법 2) 
//     post라는 콜랙션에 데이터타입이 text인 index를 생성하고, 이를 바탕으로 검색어의 단어를 완벽히 가지고 있는 document(= data) 검색
//       -> 데이터 타입이 숫자만 사용되는 경우라면... $text : { $search : 내용 }이라는 예약어를 사용하지 않아도 됨
//          (= 이런 경우, 숫자까지 text를 찾는 기준으로 찾아버려, 100% 일치하지 않으면 검색결과에서 배제함)

//   [mongoDB 한정 text index 단점]
//    : 문자(= text)로 정렬한 index는 정확한 단어 검색에 밖에 사용이 불가능 (= 조사가 많이 붙는 언어들은 쓰기가 힘듦)
//       -> index 제작시 데이터들을 띄어쓰기를 기준으로 독립된 단어들로 구분한 뒤, 검색어와 100% 일치하는 단어가 있는지 없는지 여부로 검색을 수행하기 때문
//          -> full text index (= search index) 라는 개념이 필요
router.get('/search/ver2/:page', async (요청, 응답) => {

    let original; 

    // 검색어 유무에 따른 null체크 조치
    if(요청.query.val && 요청.query.val.trim() !== '') {
        
        // $text   : text index와 연관된 연산자로, 해당 collection에서 필드를 text로 정렬한 index를 사용하겠다는 의미로 보통 $search와 같이 쓰임
        // $search : $text와 함께 쓰이는 연산자로, 특정한 내용에 대해 해당 collection에서 필드를 text로 정렬한 index를 사용해 검색함을 의미     
        original = await db.collection('post').find( { $text : { $search :  요청.query.val } } );

    }else{

        original = await db.collection('post').find();
    }

    // original에 저장된 DB 데이터의 포인터 값이 나오면, 순차적으로 갯수와 데이터를 배열화시켜 저장 
    let count = await original.count();
    
    // 해당 페이지에 표시할 데이터들만 뽑음
    let result = await original.skip( (요청.params.page - 1) * 5 ).limit(5).toArray();
    let stats = await original.explain('executionStats');

    console.log(stats);

    // 날짜를 보내주기 위한 목적의 변수
    let date = new Date();

    응답.render('search.ejs', { 글목록 : result, 날짜 : date, 갯수 : count, 페이지 : 요청.params.page, 검색어 : 요청.query.val });
}) 

//    (구현법 3)  <- 사실상 최종 완성본 
//     search index라는 명칭의 full text index를 MongoDB의 collection을 골라 만들어 준 뒤, .aggregate() 함수를 통해 검색어에 대한 부분조건까지 검색 가능하게 구현
//     (= search index를 생성시 어떤 언어를 기반으로 불용어구를 없애고 정렬을 적용했나에 따라서, 100% 같지 않더라도 부분적으로 일치하는 document(데이터)도 검색결과에 포함될 수 있음)
//         -> 만약 검색어의 언어에 따라 다른 search index를 적용하게 하여, 다수의 언어를 대상으로 부분검색 기능을 만들고 싶으면, 조건문을 통해 다른 $search 연산자가 적용되게 만들면 됨

//   [search index (= 타 DB에서 full text index) 개념]
//    : MongoDB에서 문자를 100%가 아니라 부분적으로 포함될 경우라도 검색결과에 포함할 용도로 만들어진 index 
//      (= 일반적으로 생각하는 검색기능에 부합할 수 있도록 제작된 정렬기준으로 제작된 index)
//          -> search index 제작과정 및 동작 원리
//              1. index를 만들 때 document(= 데이터)에 있는 특정 칼럼(= 필드)에 있는 문장들을 가져와서 조사, 부호 등 쓸데없는 불용어들을 다 제거
//              2. 1번의 과정을 거쳐 등장한 단어들을 다 뽑아서 정렬한 목록 제작
//                 (= 해당 단어들을 목록에서 쉽게 빠르게 찾을 수 있으며, 이를 3번과정에서 부분검색기능에 활용하도록 하는 포석)
//              3. 2번의 목록에서 해당 단어들이 어떤 document에 등장했는지와 연관된 필드를 만들고, 해당 단어가 등장한 document id같은걸 함께 단어 옆에 기재
//              4. 검색을 하면 해당 index 목록을 참고하여, 검색어에 따른 document를 찾아서 클라이언트 측에 제공
router.get('/search/ver3/:page', async (요청, 응답) => {

    // aggregate()의 parameter인 검색 파이프라인을 담을 용도의 JS array타입
    let 검색조건 = [];

    // page당 문서 갯수
    let 데이터수 = 5;

    // 배열.push({ $연산자 : 조건내용 }); 을 통해 aggregate()의 parameter로 넣을 객체배열의 내용을 변환 가능
    //  -> 검색어가 있는 경우에만 $search 연산자를 새로운 조건객체로 배열에 추가하도록 함
    //     (= (중요) 검색파이프라인 내부에 존재하는 연산자 조건을 담은 객체 {} 안에 반드시 연산자가 들어가 있어야 함)
    //          -> 3항연산자를 통해서 검색어가 NULL이나 ''인 경우를 [{}]안에서 쓸 수 없음
    if(요청.query.val && 요청.query.val.trim() !== '') {

        검색조건.push({
            $search: { 
                index: 'title_index', 
                text: { 
                    query: 요청.query.val, 
                    path: 'title' 
                } 
            }
        });
        
    }

    // aggregate()에서 쓸 수 있는 대표적 연산자들 (= 찾아보면 더 있다 이런말..)

    // $search : { index : '사용할 인덱스명', text : { query : '검색어', path : '검색할 field명' } }
    //  : search index를 이용해서 주어진 조건들을 활용한 검색을 수행
    //    (= 사용하지 않으면, 검색어 없이 list를 가져오는 것과 같음) 

    // $sort : { field명(= column명) : 숫자 }
    //  : 검색 결과를 field명의 데이터를 기준으로 정렬 
    //     -> 안 쓰면? 기본적으로 score 순으로 정렬됨

    // $limit : 숫자 
    //  : 검색 결과의 데이터 수를 숫자 개수 만큼만 제한 (= cursor객체변수.limit(숫자)) 

    // $skip : 숫자 
    //  : 검색 결과의 데이터 수를 숫자 개수 만큼 지나친 위치에서 받아오기 시작함 (= cursor객체변수.skip(숫자)) 

    // $project : {필드명1 : 0 or 1, ... , 필드명n : 0 or 1}
    //  : 데이터 검색 결과 중에 1번에 해당하는 필드명의 데이터들만 가져오라고 걸러줄 수 있음

    // 조건 연산자들로 이뤄진 JS변수는 엄연히 객체를 가진 '배열' 타입으로 이뤄져 있음
    //  -> skip, limit을 검색조건에서 뺀 이유?
    //      : 검색된 document들의 총 갯수를 온전히 뽑아내야 pagenation 구성이 가능하기 때문...
    //        (= skip, limit등을 통해, 검색결과 자체를 손보면, pagenation 구현에 필요한 타 페이지의 데이터를 알아낼 발법이 없음) 
    검색조건.push(
        { $sort : { _id : 1 } },
        // { $skip : (요청.params.page - 1) * 데이터수 },
        // { $limit : 데이터수 },
        { $project : { _id : 1, title : 1 , content : 1 } }
    );

    // (중요) 만들어진 search index server.js에서 활용하는 코드
    //   : client.db('프로젝트명').collection('컬렉션명').aggregate()
    //     -> .find()와 유사.. BUT! ()안에 여러 조건식을 [{조건1}, {조건2} ... ] 형식으로 적용을 원할 때 사용
    let original = await db.collection('post').aggregate(검색조건);

    // (중요!) AggregationCursor 개념 ( <-> cursor)
    //   : aggregate() 함수가 반환하는 return값으로 cursor와는 호환되지 않는 고유한 타입의 객체
    //     (= 다른 CRUD 함수들이 체이닝할 수 있는 count() 같은 몇몇 함수들이 호환되지 않음!!)

    // original에 저장된 DB 데이터의 포인터 값이 나오면, 순차적으로 갯수와 데이터를 배열화시켜 저장 
    //  -> curson변수.count()를 사용하지 않는 이유?
    //      : aggregate() 함수의 반환값이 AggregationCursor 타입인데, 이는 일반 Cursor 타입과 완전히 호환되는 타입변수가 아니라 count()함수를 체이닝 할 수 없기 때문
    //         -> count 같은 경우는 toArray()를 통해 객체배열로 변환한 뒤, length 멤버 변수를 통해 구함
    let array = await original.toArray();
    let count = await array.length;

    // 해당 페이지에 표시할 데이터들만 뽑음
    let result = await array.slice((요청.params.page - 1) * 5, (요청.params.page - 1) * 5 + 5);

    // 날짜를 보내주기 위한 목적의 변수
    let date = new Date();

    응답.render('search.ejs', { 글목록 : result , 날짜 : date, 갯수 : count, 페이지 : 요청.params.page, 검색어 : 요청.query.val });
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

    // original에 저장된 DB 데이터의 포인터 값이 나오면, 순차적으로 갯수와 데이터를 배열화시켜 저장 
    let count = await original.count();
    // let array = await original.toArray();
    // let count = await array.length;
    
    // 해당 페이지에 표시할 데이터들만 뽑음
    let result = await original.skip( (요청.params.page - 1) * 5 ).limit(5).toArray();

    // 날짜를 보내주기 위한 목적의 변수
    let date = new Date();

    // list.ejs라는 템플릿 파일에 result, date에 담겨있던 자료값이 글목록이라는 변수명으로 옮겨짐
    응답.render('list.ejs', { 글목록 : result, 날짜 : date, 갯수 : count, 페이지 : 요청.params.page });       
})

//    2) db에서 데이터를 가져오되, 가공은 웹서버 js배열 함수를 통해 자르기로 담당
//        -> (장점) db서버에 부담이 줄어들게 됨
//        -> (단점) mongoDB에서 쉽게 지원하는 기능을 굳이 웹서버 선에서 정리하기에, 혼잡하기도 하고 디버깅 같은게 좀 피곤하며.. 결정적으로 API호출때마다 DB를 들쑤시는건 똑같음
router.get('/list/paging/ver2/:page', async (요청, 응답) =>{

    // client.db('forum').collection('post').find()
    //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션의 데이터가 위치한 포인터를 반환해주는 함수(비동기 함수이므로, 동기식으로 짤거면 그에 상응하는 비동기코딩을 해야함)
    let original = await db.collection('post').find();

    // original에 저장된 DB 데이터의 포인터 값이 나오면, 순차적으로 갯수와 데이터를 배열화시켜 저장 
    // let count = await original.count();
    let array = await original.toArray();
    let count = await array.length;

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

// 도메인/write라는 url에 GET 형식의 요청이 들어오면 입력페이지 보여주는 API
router.get('/write/multiIMG', (요청, 응답)=>{
    응답.render('write2.ejs');
}); 


// upload.single()
//  : 단, 1개의 이미지만 업로드 하고 하고 싶을 경우 사용
//     -> url정보는 요청 객체의 file 멤버객체의 location에 저장되어 있음

// 입력페이지인 write.ejs 템플릿에서 도메인/add라는 url에 POST 형식으로 보낸 form 데이터를 서버에서 받아 DB에 입력하는 API 구현
//  -> 한개의 이미지를 S3에 업로드 가능하게 함
router.post('/add', async (요청, 응답)=>{

    // 상단의 보일러 플레이트 코드를 입력했기에, 사용자가 form 요청으로 보낸 input 데이터를 '요청parameter.body' 한 방으로 바로 JSON으로 파싱된 형식으로 볼 수 있음
    console.log(요청.body);

    // 요청.file : 업로드 된 원본의 파일정보 객체
    console.log(요청.file)
    
    // 서버 API를 거치게 될 때, validator 처리를 위한 조건문
    if (요청.body.title == '') {

        응답.send('제목을 적어주시길..')

    } else {

        // 오류처리 방지용 try, catch 구문
        try{
            upload.single('img1')(요청, 응답, async (err)=>{

                if (err) return 응답.send('에러남')

                // if (!요청.file) {
                //     return 응답.status(400).send('파일이 업로드되지 않았습니다.');
                // }

                // client.db('forum').collection('post').insertOne({title : 요청.body.title, content : 요청.body.content});
                //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션에 js객체 형식으로 적힌 {}안의 데이터를 기입
                await db.collection('post').insertOne({
                    title : 요청.body.title,
                    content : 요청.body.content,
                    user : 요청.user._id,
                    username : 요청.user.username,
                    img : !요청.file ? '' : 요청.file.location
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

// upload.array(‘input의 name속성 이름’, '업로드 이미지 최대갯수')
//  : 여러개의 이미지를 업로드 하고 싶을 경우 사용
//     -> 단! 이렇게 여러장의 이미지를 저장할 경우에 그 이미지의 s3 위치 URL 정보는 요청 객체의 file 요소가 아니라 files 요소에 file객체의 배열로서 저장됨 

// 입력페이지인 write.ejs 템플릿에서 도메인/add/multiIMG라는 url에 POST 형식으로 보낸 form 데이터를 서버에서 받아 DB에 입력하는 API 구현
//  -> 최대 10개의 이미지를 저장할 용도의 API
router.post('/add/multiIMG',  upload.array('img1', 10), async (요청, 응답)=>{

    // 상단의 보일러 플레이트 코드를 입력했기에, 사용자가 form 요청으로 보낸 input 데이터를 '요청parameter.body' 한 방으로 바로 JSON으로 파싱된 형식으로 볼 수 있음
    console.log(요청.body);

    // 요청.files : 업로드 된 원본의 파일정보 객체 배열
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
            let result = await db.collection('post').insertOne({
                            title : 요청.body.title,
                            content : 요청.body.content,
                            img : 요청.files.map(file => file.location)          // 나중에 게시글 상세조회시 여기 저장된 이미지 url배열의 요소들을 참고하여 s3에 접근하여 이미지를 가져옴 
                        })

            console.log(result);

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

    let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.id), user : 요청.user._id });
    console.log(result);
    응답.render('edit.ejs', { 기존글 : result });
});

// (과제) 목록화면에서 도메인/revise라는 url에 POST 형식으로 보낸 form 데이터를 서버에서 받아 DB에 입력하는 API 구현
router.post('/revise/:id', async (요청, 응답)=>{

    // 서버 API를 거치게 될 때, validator 처리를 위한 조건문
    if (요청.body.title == '') {

        응답.send('제목을 적어주시길..')

    } else {

        try{

            upload.single('img1')(요청, 응답, async (err)=>{

                if (err) return 응답.send('에러남')

                if (!요청.file) {
                    return 응답.status(400).send('파일이 업로드되지 않았습니다.');
                }

                // client.db('forum').collection('post').updateOne( { _id : 요청.params.id }, { $set: { title : 요청.body.title, content : 요청.body.content } } );
                //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션에 id가 url파라미터의 id와 같은 데이터를 찾은뒤 js객체 형식으로 적힌 {}안의 데이터로 수정
                let result = await db.collection('post').updateOne( 
                                { _id : new ObjectId(요청.params.id), user : 요청.user._id }, 
                                { $set: {   
                                            title : 요청.body.title, 
                                            content : 요청.body.content,
                                            img : 요청.file.location 
                                        } 
                                } 
                            );

                console.log(result);

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

// (과제1) 목록화면에서 도메인/delete라는 url에 AJAX 방식을 사용하고 데이터는 fetch API를 통해 queryString 방식으로 delete라는 문구를 URL에 포함해서 보낸 데이터를 서버에서 받아 DB에 입력하는 API 구현
router.delete('/delete', async (요청, 응답)=>{

    try{
        // queryString 문법을 사용한다면, '요청parameter'.query 통해 url에 전해진 url파라미터 내용을 js객체 형식으로 한번에 보는게 가능함
        console.log(요청.query);

        // client.db('forum').collection('post').updateOne( { _id : new ObjectId(요청.query.id) } );
        //  : MongoDB의 forum이라는 프로젝트의 post라는 컬렉션에 id가 url queryString id라는 데이터명의 값과 같은 데이터를 찾은뒤 이를 삭제
        let result = await db.collection('post').deleteOne({   
                                                                _id  : new ObjectId(요청.query.id) ,
                                                                user : 요청.user._id
                                                            });

        console.log(result);
        응답.send('삭제완료');
    } catch (e) {
        console.log(e);
        응답.status(500).send('DB에러남');
    }

});

module.exports = router;