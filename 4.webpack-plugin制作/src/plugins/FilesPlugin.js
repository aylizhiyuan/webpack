//生成一个md文件，里面放着所有的文件名
class FilesPlugin{
   constructor(options){
     this.options = options;
   }
    //1.你在监听哪个事件
  apply(compiler){
    compiler.hooks.emit.tapAsync('EmitPlugin',(compilation,callback)=>{
       // console.log(compilation.assets);
       let content = '## 文件内容列表 \n\n';
       for(let attr in compilation.assets){
         content+=`- ${attr} \n`;
       }
       //输出一个filelist.md文件，即在assets中添加一个输出的键值
       compilation.assets[this.options.filename||'filelist.md'] ={ 
           source(){
               return content;
           },
           size(){
               return Buffer.byteLength(content)
           }
       }
        callback();
    });
  }
}

module.exports = FilesPlugin;