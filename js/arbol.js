'use strict'
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
            
            <form class="form_tree">
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
                            ${populateSelect(tablas[defaultOptionTableSelected].campos,defaultOptionField2Selected)}
                        </select>
                    </div>    
                        
                    <div class="controlWrapper">
                        <label for="select_field_2">Elije el segundo nivel</label>
                        <select name="select_field_2" id="select_field_2">
                            ${populateSelect(tablas[defaultOptionTableSelected].campos,defaultOptionField1Selected)}
                        </select>
                    </div>
                </div>  
                <button id="btn_generar">Generar arbol </button>
            </form> 
            
        </div>
    
    `;
    
    //una vez acabado el renderizado inicial de la pagina se agregan listener para cambiar los valores
    //de los selects de manera dinamica
    const selectTable=document.getElementById('select_table');
    const selectField1=document.getElementById('select_field_1');
    const selectField2=document.getElementById('select_field_2');

    //al cambiar de tabla, se vuelven a llenar los selects de los campos
    selectTable.addEventListener('change',(e)=>{
            const newTableSelected=e.target.value;
            optionTableSelected=tablas.map(tbl=>tbl.nombre).indexOf(newTableSelected);
            //se vuelven a llenar los selects con los valores de los campos de la tabla seleccionada
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
//chale lo hubiera hecho en react :'v 