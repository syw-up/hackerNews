const fs=require('fs');
const http =require('http');
const path =require('path');
//第三方包
const mime=require('mime');
const  URL=require('url');
const  querysting=require('querystring');
//第三方包
const  _=require('underscore');

http.createServer(function (req,res) {
    //首页
    if(req.url === '/index'|| req.url === '/'){
       myreadFile(path.join(__dirname,'./data/data.json'),function (data) {  
              ///data.toSring()值把二进制文件转换了,一定要JSON.parse转成数组
              let  list=JSON.parse( data.toString() || '[]')  ;       
              myreadFile(path.join(__dirname,'./views/index.html'),function (data) { 
                  let fn=_.template(data.toString());
                  let html=fn({
                      list:list
                  })               
                  res.end(html);
               })
       })
   
    }
    //img 和 样式 
    else if(req.url.startsWith('/resources')){ 
     myreadFile(path.join(__dirname,req.url),function (data) {      
         res.setHeader('content-type',mime.getType(req.url));     
           res.end(data);
     });   
   }    
    //详情
    else if(req.url.startsWith('/detail')){
            let  urlObj=URL.parse(req.url,true).query;
            myreadFile(path.join(__dirname,'./data/data.json'),function (data) {
            let  list=JSON.parse( data.toString() || '[]'); 
                list.forEach(function (v) {                 
                     if(v.id==urlObj.id){                  
                         myreadFile(path.join(__dirname,'./views/detail.html'),function (data) { 
                            let fn=_.template(data.toString());
                                        let html=fn({
                                            list:v
                                        })
                                        res.end(html);
                          })
                     }        
                 })     
            })
    }
    //提交页面
    else if(req.url ===  '/submit'){
        fs.readFile(path.join(__dirname,'./views/submit.html'),function (err,data) {  
            if(err){
                throw err;
            }
            res.end(data);
        })


    }
    //提交方式是GET并且是/add
    else if(req.method === 'GET' && req.url.startsWith('/add')){
     
     myreadFile(path.join(__dirname,'./data/data.json'),function (data) { 

       
           let  list = JSON.parse(data ||  '[]');
           let  urlObj=URL.parse(req.url,true).query; 
          urlObj.id=list.length;
           list.push(urlObj);
        
     mywriteFile(path.join(__dirname,'./data/data.json'),function () { 
       res.statusCode = '301';
       res.statusMessage = 'Moved Permanently';
       res.setHeader('location','/');
       res.end();
       });
     })
}
    //提交方式是POST 
 else  if(req.method === 'POST' && req.url.startsWith('/add')){
    let  file=path.join(__dirname,'./data/data.json');
    myreadFile(file,function (data) {  
        let list=JSON.parse( data || '[]');
        let  dataArr=[];
        req.on('data',function (chunk) {  
           dataArr.push(chunk);         
        })
        req.on('end',function () { 
            let buffer=Buffer.concat(dataArr).toString();
            let urlObj=querysting.parse(buffer); 
             urlObj.id=list.length; 
           
             
             list.push(urlObj);  
             mywriteFile(file,list,function () { 
                console.log('写入成功');
                
             })  
             res.statusCode = '301';
             res.statusMessage = 'Moved Permanently';
             res.setHeader('location','/');
             res.end();     
         })  
         
     
        
        
    })
        




       






    }
    //如果没找到页面就报404;
    else{
        res.end('404 not page  found');
    }
    

 }).listen(8080,function () {  
     console.log('服务器开启了');
     
 })
 //封装读取文件函数
 let  myreadFile=function (filePath,callback) { 
     fs.readFile(filePath,function (err,data) {
         if(err && err.code == 'ENENT'){
             throw  err;
         }
        callback(data);
    })
}
 //封装写入文件函数
 let  mywriteFile=function (filePath,data,callback) {      
    fs.writeFile(filePath,JSON.stringify(data),function (err) { 
        if(err){
            throw err;
        }
      callback();
     })

}
// 封装一个渲染函数
  let   myRender=function () {


    }