// [MongoDB 연결 보일러플레이트 관련 코드이 독립적으로 모듈로서 작동할 수 있도록 추출한 파일]

// 환경변수들을 상수화된 변수명에 보관하여 전역변수로서 접근가능하게 도와주는 .env 파일을 쉽게 구축하게 돕는 dotenv 라이브러리를 모듈 import에 해당하는 내용
require('dotenv').config();

// MongoDB 모듈 import에 해당하는 내용
//  - MongoClient : DB접속시 생성된 해당 유저정보를 담는 JS객체에 해당
//  - ObjectId : 사용자가 DB에서 ID기반 검색시 생성된 JS에서 이 ID정보를 인식하고 DB에 검색 명령 내릴때 전달가능하게 하는 JS객체에 해당
const { MongoClient } = require('mongodb')

// 내 MongoDB 서버에 접속하기 위한 URL 정보
const url = process.env.MONGO_DB_URL;

// MongoDB 객체
//  : 일반적으로 데이터베이스, 컬렉션, 문서 및 변경 스트림과 같은 MongoDB 엔터티를 나타내는 객체
//     -> MongoDB 데이터베이스 및 컬렉션과 상호 작용하고, 쿼리를 실행하고, 데이터 조작 작업을 수행하는 등의 인터페이스와 메서드

//     ex) MongoClient, Db, Collection, Document, ChangeStream 등등을 전부 포괄한 개념

// MongoClient 객체
//  : MongoDB 서버에 대한 연결 관련 기능 및 정보를 담당하면서, MongoDB 데이터베이스 및 컬렉션과 상호 작용하는 등의 기능을 수행하는 메서드을 제공하는 Node.js기반 mongodb 라이브러리에서 제공하는 JS객체
//      -> new MongoClient(url) 생성자를 통해 생성

//    @ MongoClient객체의 주요 기능(= 메서드)
//       1. DB서버와 연결
//           -> MongoClient객체.connect();

//       2. DB 및 Collection 관리 및 생성 (= DDL수행)
//           -> MongoClient객체.db('프로젝트명').collection('컬랙션명');

//       3. DB의 및 Collection CRUD 수행 (= DML수행)
//           ->  MongoClient객체.db('프로젝트명').collection('컬랙션명').CRUD함수 내용 참고

//       4. ChangeStream을 통한 변경된 데이터 서버에 전송
//           -> MongoClient객체.watch(pipeline객체)을 통한 ChangeStream 객체 생성
//               -> ChangeStream.on() 메서드로 이를 받아 가공

//       5. 트랜잭션 및 세션 처리
let connectDB = new MongoClient(url).connect();

 // module.exports
 //  : 현재 js 파일을 외부에서 모듈처럼 import하여 불러쓰게 하는 JS모듈 관련 객체의 멤버변수
 //     -> 외부에서 해당 JS파일을 모듈로서 불러왔을 때, exports멤버 안에 저장된 값을 return하게 함
 //        (= MongoDB 연결 모듈로서 보일러플레이트 코드를 보관하고 호출하는 용도라면 DB연결 정보를 가진 관련 객체를 리턴해야 함)
module.exports = connectDB;