'use strict'
/*---------notas------------*/
/*falta modularizar el codigo para hcerlo mas leible*/
/*cuando se genera un arbol muy grande la pagina se vuelve lenta*/
/*error */
const loader=document.getElementById('loader');
const dashboard=document.getElementById('dashboardData');

//valores de controles por defecto
let defaultOptionTableSelected=0;
let defaultOptionField1Selected=0;
let defaultOptionField2Selected=1;

//valores de controles en ejecucion "estado de la app"
let optionTableSelected=defaultOptionTableSelected;
let optionField1Selected=defaultOptionField1Selected;
let optionField2Selected=defaultOptionField2Selected;

//generacion de la pagina
const generatePage=async ()=>{
    const {tablas}=await getTablesInfo();
   //oculta el loader
    loader.style.display='none';
    
    //render 
    dashboard.innerHTML=`
        <div class="treeWrap">
            
            <form class="form_tree" id="form_tree" >
                <div class="controls">
                    <div class="controlWrapper">
                        <label for="select_table">Elije una tabla</label>
                        <select name="select_table" id="select_table">
                            ${populateSelect(tablas.map(table=>table.nombre))}
                        </select>
                    </div>
                        
                    <div class="controlWrapper">
                        <label for="select_field_1">Elije el primer nivel</label>
                        <select name="select_field_1" id="select_field_1">
                            ${populateSelect(tablas[defaultOptionTableSelected].campos,defaultOptionField1Selected)}
                        </select>
                    </div>    
                        
                    <div class="controlWrapper">
                        <label for="select_field_2">Elije el segundo nivel</label>
                        <select name="select_field_2" id="select_field_2">
                            ${populateSelect(tablas[defaultOptionTableSelected].campos,defaultOptionField2Selected)}
                        </select>
                    </div>
                </div>  
                <button id="btn_generar">Generar arbol </button>
            </form>
            <div id="arbol">
                
            </div>
            <div class="codeContainers">
                <div id="codeSql" class="codeEditor">
                </div>
                <div id="codeJson" class="codeEditor">
                </div>
            </div> 
            
        </div>
    
    `;
    
    //una vez acabado el renderizado inicial de la pagina se agregan listener para cambiar los valores
    //de los selects de manera dinamica
    const selectTable=document.getElementById('select_table');
    const selectField1=document.getElementById('select_field_1');
    const selectField2=document.getElementById('select_field_2');
    const formTree=document.getElementById('form_tree');
    const arbolDiv=document.getElementById('arbol');

    //al cambiar de tabla, se vuelven a llenar los selects de los campos
    selectTable.addEventListener('change',(e)=>{
            const newTableSelected=e.target.value;
            optionTableSelected=tablas.map(tbl=>tbl.nombre).indexOf(newTableSelected);
            //se vuelven a llenar los selects con los valores de los campos de la tabla seleccionada
            optionField1Selected=defaultOptionField1Selected;
            optionField2Selected=defaultOptionField2Selected;
            selectField1.innerHTML=populateSelect(tablas[optionTableSelected].campos,defaultOptionField1Selected);
            selectField2.innerHTML=populateSelect(tablas[optionTableSelected].campos,defaultOptionField2Selected);
            
    });

    //cuando se cambia de valor el select de campo 1 se comprueba que no tenga el mismo valor
    //que el select 2, si es asi se cambia el select 2
    selectField1.addEventListener('change',(e)=>{
        const newField1Selected=e.target.value;
        const {campos}=tablas[optionTableSelected];
        optionField1Selected=campos.indexOf(newField1Selected);
        if(optionField1Selected===optionField2Selected){
            optionField2Selected= changeOption(optionField2Selected,campos.length);
            selectField2.innerHTML=populateSelect(tablas[optionTableSelected].campos,optionField2Selected);
        }

    });

    //aqui repeti codigo que pendejo :'v tengo que refactorizar
    selectField2.addEventListener('change',(e)=>{
        const newField2Selected=e.target.value;
        const {campos}=tablas[optionTableSelected];
        optionField2Selected=campos.indexOf(newField2Selected);
        if(optionField2Selected===optionField1Selected){
            optionField1Selected= changeOption(optionField1Selected,campos.length);
            selectField1.innerHTML=populateSelect(tablas[optionTableSelected].campos,optionField1Selected);
        }

    });
    //cuando se da click en 'generar arbol'
    formTree.addEventListener('submit', async (e)=>{
        e.preventDefault();
        //carga indicador de carga
        arbolDiv.innerHTML=`
            <div id="loaderTree">
                <h3 class="loadingMessage">Generando arbol</h3>
                <div class="spinner">
                    <div class="innerSpinner"></div>
                </div>
            </div>
        `;
        const loader=document.getElementById('loaderTree');
        //enfoca el indicador
        loader.scrollIntoView();
        
        try{
        const table=selectTable.value;
        const field1=selectField1.value;
        const field2=selectField2.value;
        
        //trae la info del servidor
        const req= await fetch(encodeURI(`http://polizona.com/mercado/22/php/tree_generation.php?select_table=${table}&select_field_1=${field1}&select_field_2=${field2}`));
        console.log(`http://polizona.com/mercado/22/php/tree_generation.php?select_table=${table}&select_field_1=${field1}&select_field_2=${field2}`);
        const responce=await req.json();
       
        
        
        
        /*codigo para insertar arbol de vis js*/
        const nodes = new vis.DataSet([
            { id: 'root', label: `${responce.tabla}` },
            ...responce.nivel1.map(n1=>{
                const name=Object.keys(n1)[0];
                return {
                    id:`n1_${n1[name]}`,
                    label:`${name} :${n1[name]} \n P: ${n1.probabilidad} `
                }
            }),
            ...responce.nivel2.map(n2=>{
                const [parent,name]=Object.keys(n2);
                return {
                    id:`n2_${n2[parent]}_${n2[name]}`,
                    label:`${name} :${n2[name]} \n P: ${n2.probabilidad} `
                }
            }),
            
          ]);
          
        
          // create an array with edges
        const edges = new vis.DataSet([
            ...responce.nivel1.map(n1=>{
                const name=Object.keys(n1)[0];
                return {from:`root`,to:`n1_${n1[name]}`}
            }),
            ...responce.nivel2.map(n2=>{
                const [parent,name]=Object.keys(n2);
                return {
                    to:`n2_${n2[parent]}_${n2[name]}`,
                    from:`n1_${n2[parent]}`
                }
            }),  
            
          ]);
          
          // create a network
          const container = arbolDiv;
          const data = {
            nodes: nodes,
            edges: edges
          };
          const options = {
            edges:{ 
                arrows:'to'
            },
            physics:{

            },
            layout: {
              hierarchical: {
                
                direction: "UD",
                sortMethod: "directed"
              }
            }
          };
        //borra todo lo que haya en el div
        arbolDiv.innerHTML='';
          //inserta diagrama de arbol
        
          const network = new vis.Network(container, data, options);
          
        /*termina codigo para insertar arbol*/ 
        /*muestra la respuesta en el editor de codigo*/
        const sqlCodeEditor=document.getElementById('codeSql');
        const jsonCodeEditor=document.getElementById('codeJson');
        generateCodeMirror(
            sqlCodeEditor,
            `${responce.sqlGenerado.query1}
            ${responce.sqlGenerado.query2}`,
            'text/x-mysql'
        );
        generateCodeMirror(
            jsonCodeEditor,
            `${JSON.stringify({tabla:responce.tabla,nivel1:responce.nivel1,nivel2:responce.nivel2},null,'\t')}`,
            'javascript'
        );
        
        }catch(e){
            console.log(e);
            arbolDiv.innerHTML='<h2>Ha ocurrido un error</h2>';
        }
    })

}

generatePage();


//helper functions///////
//trae data de la bd
async function getTablesInfo(){
    try{
        const req= await fetch('http://polizona.com/mercado/22/php/mercado_schema.php');
        const data= await req.json();
        return data;
    }catch(e){alert(e); return e}
    
}
//crea los options para cada select 
function populateSelect(options,optionSelected=null){
    const markupHtml=`
        ${options
            .map((opt,i)=>
                `<option value="${opt}" ${i==optionSelected && 'selected'} >${opt}</option>`
            )}    
    `;
    return markupHtml;
}

//cambia los valores seleccionados de los selects en caso de ser el mismo
function changeOption(option,fieldCount){
    return option+1===fieldCount?0:option+1;
}

function generateCodeMirror(container,value,mode){
        container.innerHTML="";
        const codeEditor=CodeMirror(container,{
        
            value:value,
            mode:mode,
            theme:"seti",
            lineNumbers:true,
            styleActiveLine:true,
           
        });
}
//chale lo hubiera hecho en react :'v 