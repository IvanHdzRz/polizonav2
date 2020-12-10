'use strict'

let loading=true;


const codeEditorContainer=document.getElementById("codeEditor");
codeEditorContainer.innerHTML='cargando';


getData().then(data=>{
    console.log(data)

    const pokeInfo={nombre:data.name,peso:data.weight}
    codeEditorContainer.innerHTML='';
    const codeEditor=CodeMirror(codeEditorContainer,{
        
        value:JSON.stringify(data,null,'\t'),
        
        theme:"monokai",
        lineNumbers:true,
        styleActiveLine:true,
       
    });    
}).catch(e=>alert(e))





async function getData (){
    const req=await fetch('http://polizona.com/mercado/22/php/conexion.php')
    const res=await req.json();
    loading=false;
    return res;
}

