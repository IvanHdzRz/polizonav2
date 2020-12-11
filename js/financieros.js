'use strict'
 
const loader=document.getElementById("loader");
const dashboard=document.getElementById("dashboardData");

const fetchData= async()=>{
    try{
        //consulta datos desde el servidor
        const req=await fetch("http://polizona.com/mercado/22/php/financieros.php");
        const data=await req.json();
        const materiaPrimaTotal=data.insumos.reduce((acc,insumo)=>parseInt(insumo.costo_total)+acc,0);
        const capacidadProduccion=Math.min( ...data.insumos.map(insumo=>parseInt (insumo.unidades)/parseInt( insumo.unidades_requeridas_por_producto)));
        const constoProduccionUnitario =data.insumos
            .reduce((acc,insumo)=>
                parseFloat(insumo.costo_unitario_promedio)*parseFloat(insumo.unidades_requeridas_por_producto)+acc 
            ,0)

        loader.style.display="none";
        
        //render
        dashboard.innerHTML+=`
            <div class="empresaInfo">
                <h3>empresa 22</h3>
                <p class="industriaName"> ${data.industria[0].nbindustria}</p>
            </div>
            <section>
                <h2 class="sectionTitle">
                    Generales
                </h2>
                <div class="cardContainer">
                    ${cardFinantial("materia prima en almacen",`$ ${materiaPrimaTotal}`,"http://polizona.com/mercado/22/assets/tape 1.png")}
                    ${cardFinantial("capacidad de produccion",`${Math.floor (capacidadProduccion)} pzs`,"http://polizona.com/mercado/22/assets/manufacture 1.png")}
                    ${cardFinantial("Costo de materia prima directa por unidad producida",`$ ${Math.round(constoProduccionUnitario)}`,"http://polizona.com/mercado/22/assets/competition 1.png")}
                </div>
                <h2 class="sectionTitle">
                    Raw data
                </h2>
                <div id="codeEditor">

                </div>
            </section>
        `;

        const codeEditorContainer=document.getElementById("codeEditor");
        const codeEditor=CodeMirror(codeEditorContainer,{
        
            value:JSON.stringify(data,null,'\t'),
            
            theme:"seti",
            lineNumbers:true,
            styleActiveLine:true,
           
        });

    }catch(e){alert}
    
}



fetchData();

function cardFinantial (title,value,icon){
    const markup=`
        <div class="cardIndicator">
            <p class="cardTitle">${title}</p>
            <img src="${icon}" class="cardIcon" alt="icon"/>
            <h2 class="cardValue">${value}</h2>
        </div>
    `
    return markup;
}
