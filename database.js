// [MongoDB 연결 보일러플레이트 관련 코드이 독립적으로 모듈로서 작동할 수 있도록 추출한 파일]

// 환경변수들을 상수화된 변수명에 보관하여 전역변수로서 접근가능하게 도와주는 .env 파일을 쉽게 구축하게 돕는 dotenv 라이브러리를 모듈 import에 해당하는 내용
require('dotenv').config();

// MongoDB 모듈 import에 해당하는 내용
//  - MongoClient : DB접속시 생성된 해당 유저정보를 담는 JS객체에 해당
//  - ObjectId : 사용자가 DB에서 ID기반 검색시 생성된 JS에서 이 ID정보를 인식하고 DB에 검색 명령 내릴때 전달가능하게 하는 JS객체에 해당
const { MongoClient } = require('mongodb')

// 내 MongoDB 서버에 접속하기 위한 URL 정보
const url = process.env.MONGO_DB_URL;

let connectDB = new MongoClient(url).connect();

 // module.exports
 //  : 현재 js 파일을 외부에서 모듈처럼 import하여 불러쓰게 하는 JS모듈 관련 객체의 멤버변수
 //     -> 외부에서 해당 JS파일을 모듈로서 불러왔을 때, exports멤버 안에 저장된 값을 return하게 함
 //        (= MongoDB 연결 모듈로서 보일러플레이트 코드를 보관하고 호출하는 용도라면 DB연결 정보를 가진 관련 객체를 리턴해야 함)
module.exports = connectDB;