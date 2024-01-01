// Express 프레임워크
//  : 웹이나 모바일 환경 기반 애플리케이션을 위한 Node.js 기반 웹 애플리케이션 프레임워크

// 모듈 import에 해당하는 내용과 그 결과값을 받는 변수
const express = require('express');

// express 기본 생성자의 결과 객체를 받는 변수 (해당 객체가 추후 API를 포함한 모든 메서드를 담당)
const app = express();

// MongoDB 모듈 import에 해당하는 내용
const { MongoClient } = require('mongodb')

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

app.get('/list', async  (요청, 응답) =>{
    let result = await db.collection('post').find().toArray();
    응답.render('list.ejs', { 글목록 : result });
})

// /time 이라고 접속하면 현재 서버의 시간을 보내주는 기능을 만들어봅시다.

// ejs로 웹페이지를 만들어서 거기 안에 서버의 시간을 박아넣어서 보내주면 될 것 같군요. 

// (팁) 서버의 시간은 server.js 파일 아무데서나 new Date() 라고 쓰면 나옵니다

// express().use(express.static(__dirname, '목표 static 폴더 경로(보통은 /public )'));  
//  : express.static는 특정 폴더안의 파일들을 static 파일로 지정할 수 있으며, use()메서드를 통해 express 객체가 해당 폴더의 내용을 쓸 수 있도록 등록하는 메서드
app.use(express.static(__dirname + '/public'));     // 이를 통해 html파일에 css파일을 <link>태그로 붙여줄 수 있음