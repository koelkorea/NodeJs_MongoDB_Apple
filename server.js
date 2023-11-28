// Express 프레임워크
//  : 웹이나 모바일 환경 기반 애플리케이션을 위한 Node.js 기반 웹 애플리케이션 프레임워크

// 모듈 import에 해당하는 내용과 그 결과값을 받는 변수
const express = require('express');

// express 기본 생성자의 결과 객체를 받는 변수 (해당 객체가 추후 API를 포함한 모든 메서드를 담당)
const app = express();

const { MongoClient } = require('mongodb')
const url = 'mongodb+srv://admin:<lsh916>@cluster0.tatoixz.mongodb.net/?retryWrites=true&w=majority'

new MongoClient(url).connect().then((client)=>{

    console.log('DB연결성공')
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
    응답.send('오늘 비옴')
}) 

// (과제) 도메인/shop 라는 url을 express를 사용하여 HTTP get 메서드로 요청할 경우의 API와 그 내용을 '쇼핑페이지입니다~'라고 적어주기 
app.get('/shop', (요청, 응답)=>{
    응답.send('쇼핑페이지입니다')
}) 

//     -> 콜백함수의 내용을 통한 응답내용 메서드
//          2. 응답parameter.sendFile('보내고 싶은 파일경로명')
//              : 해당 GET 메서드의 요청에 대해 파일을 보내고 싶은 경우 사용하는 메서드
//                 (= 주로 HTML 파일을 보냄으로서, 화면을 전환할 때 사용함)

// (과제) 도메인 대문에 들어올 경우의 API는 그 응답으로 HTML을 보내게 짜봐라
app.get('/', (요청, 응답)=>{
    응답.sendFile(__dirname + '/index.html')         // (중요) __dirname : 현재 server.js가 위치한 절대경로를 담는 일종의 static 변수
}) 

// express().use(express.static(__dirname, '목표 static 폴더 경로(보통은 /public )'));  
//  : express.static는 특정 폴더안의 파일들을 static 파일로 지정할 수 있으며, use()메서드를 통해 express 객체가 해당 폴더의 내용을 쓸 수 있도록 등록하는 메서드
app.use(express.static(__dirname + '/public'));     // 이를 통해 html파일에 css파일을 <link>태그로 붙여줄 수 있음